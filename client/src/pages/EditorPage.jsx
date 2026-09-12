import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useAuth } from '../context/AuthContext';
import EditorNavbar from '../components/editor/EditorNavbar';
import TiptapEditor from '../components/editor/TiptapEditor';
import ShareModal from '../components/editor/ShareModal';
import { useAutosave } from '../hooks/useAutosave';
import { getDocumentById, createDocument, deleteDocument, exportDocument } from '../api/documents';
import { Loader2, ArrowLeft } from 'lucide-react';

// Google-inspired pastel colors for collaborator cursors
const USER_COLORS = [
  '#ea4335', '#4285f4', '#34a853', '#fbbc05',
  '#9333ea', '#ec4899', '#f97316', '#06b6d4',
  '#10b981', '#6366f1'
];

function getUserColor(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

const EditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [documentData, setDocumentData] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time collaboration state
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
  const [activeUsers, setActiveUsers] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Menu bar and view states
  const [editor, setEditor] = useState(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [exportLoadingFormat, setExportLoadingFormat] = useState(null);

  // Keep Y.Doc stable per docId and clean up only on doc change or unmount
  const ydoc = useMemo(() => new Y.Doc(), [id]);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    return () => {
      ydoc.destroy();
    };
  }, [ydoc]);

  // Keep ref of latest state to prevent stale closures in shortcut handlers
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  titleRef.current = title;
  contentRef.current = content;

  const currentUser = useMemo(() => {
    return {
      name: user?.name || 'Anonymous',
      email: user?.email || '',
      color: getUserColor(user?._id || user?.email || 'user')
    };
  }, [user]);

  // Determine user edit permissions (Phase 4 integration)
  const isEditable = useMemo(() => {
    if (!documentData) return true;
    const role = documentData.currentUserRole;
    return !role || role === 'owner' || role === 'editor';
  }, [documentData]);

  // Phase 2: Debounced auto-save hook (persists title & content to MongoDB after 1.5s inactivity)
  const { saveStatus, saveNow } = useAutosave(
    id,
    title,
    content,
    isEditable,
    1500
  );

  // Fetch document details on mount
  const fetchDoc = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDocumentById(id);
      setDocumentData(data);
      setTitle(data.title || 'Untitled document');
      setContent(data.content || '');
    } catch (err) {
      console.error('Error fetching document:', err);
      setError(err.response?.data?.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  // Setup WebSocket provider for real-time collaboration (tied strictly to document id and ydoc)
  useEffect(() => {
    if (!id) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsPort = '5000';
    const serverUrl = `${wsProtocol}//${wsHost}:${wsPort}/yjs`;

    console.log(`[Yjs] Connecting provider to ${serverUrl} for doc ${id}`);

    const wsProvider = new WebsocketProvider(
      serverUrl,
      id,
      ydoc,
      { params: { docId: id } }
    );

    setProvider(wsProvider);

    // Track connection status & error events
    wsProvider.on('status', (event) => {
      console.log('[Yjs Provider Status]:', event.status);
      setConnectionStatus(event.status); // 'connected' | 'connecting' | 'disconnected'
    });

    wsProvider.on('connection-error', (event) => {
      console.error('[Yjs Provider Connection Error]:', event);
    });

    wsProvider.on('connection-close', (event) => {
      console.warn('[Yjs Provider Connection Closed]:', event);
    });

    wsProvider.on('synced', (isSynced) => {
      console.log('[Yjs Provider Synced]:', isSynced);
    });

    // Listen to changes in awareness to track other active users
    const handleAwarenessChange = () => {
      const states = wsProvider.awareness.getStates();
      const currentClientId = wsProvider.awareness.clientID;
      const otherUsers = [];

      states.forEach((state, clientId) => {
        if (clientId !== currentClientId && state.user) {
          otherUsers.push({
            clientId,
            name: state.user.name,
            email: state.user.email,
            color: state.user.color
          });
        }
      });

      setActiveUsers(otherUsers);
    };

    wsProvider.awareness.on('change', handleAwarenessChange);

    return () => {
      wsProvider.awareness.off('change', handleAwarenessChange);
      wsProvider.destroy();
    };
  }, [id, ydoc]);

  // Synchronize local awareness user info whenever provider or user details change
  useEffect(() => {
    if (provider && user) {
      provider.awareness.setLocalStateField('user', {
        name: user.name || 'Anonymous',
        email: user.email || '',
        color: currentUser.color
      });
    }
  }, [provider, user, currentUser]);

  // Content change callback from editor (triggers debounced auto-save)
  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  // Title update on enter/blur (updates state and immediately commits to auto-save)
  const handleTitleSave = (newTitle) => {
    if (!isEditable) return;
    setTitle(newTitle);
    saveNow();
  };

  // Keyboard shortcut listener: Ctrl + S / Cmd + S (optional manual save trigger)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveNow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveNow]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Menu action handlers
  const handleMakeCopy = async () => {
    try {
      const copyTitle = `Copy of ${title || 'Untitled document'}`;
      const newDoc = await createDocument({
        title: copyTitle,
        content: contentRef.current || ''
      });
      navigate(`/document/${newDoc._id}`);
    } catch (err) {
      console.error('Failed to make copy:', err);
      alert('Failed to duplicate document. Please try again.');
    }
  };

  const userRole = documentData?.currentUserRole;
  const canDelete = !userRole || userRole === 'owner' || userRole === 'editor';

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to move this document to trash?')) {
      return;
    }
    try {
      await deleteDocument(id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleUndo = () => editor?.chain().focus().undo().run();
  const handleRedo = () => editor?.chain().focus().redo().run();
  const handleSelectAll = () => editor?.chain().focus().selectAll().run();

  const handleCut = async () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText);
        editor.chain().focus().deleteSelection().run();
      } catch {
        document.execCommand('cut');
      }
    }
  };

  const handleCopyText = async () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText);
      } catch {
        document.execCommand('copy');
      }
    }
  };

  const handlePaste = async () => {
    if (!editor) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        editor.chain().focus().insertContent(text).run();
      }
    } catch (err) {
      console.warn('Clipboard read error or permission denied:', err);
      alert('To paste, please use Ctrl+V / Cmd+V.');
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleExport = async (format) => {
    try {
      setExportLoadingFormat(format);
      const response = await exportDocument(id, format);

      const safeTitle = (title || 'Untitled document').trim().replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `${safeTitle}.${format}`;

      const mimeTypeMap = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        txt: 'text/plain;charset=utf-8',
        html: 'text/html;charset=utf-8'
      };
      const expectedType = mimeTypeMap[format] || 'application/octet-stream';

      // Axios returns a Blob when responseType is 'blob'
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: expectedType });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);
    } catch (err) {
      console.error(`Export failed for format ${format}:`, err);
      alert(`Export to ${format.toUpperCase()} failed. Please try again.`);
    } finally {
      setExportLoadingFormat(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-gray-600">Opening document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Unable to open document</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Top Navbar with functional File, Edit, View menus */}
      <EditorNavbar
        title={title}
        setTitle={setTitle}
        onSaveTitle={handleTitleSave}
        saveStatus={saveStatus}
        onManualSave={() => saveNow()}
        activeUsers={activeUsers}
        connectionStatus={connectionStatus}
        onOpenShare={() => setIsShareModalOpen(true)}
        isEditable={isEditable}
        // Menu bar props
        onMakeCopy={handleMakeCopy}
        onDelete={handleDelete}
        onExport={handleExport}
        exportLoadingFormat={exportLoadingFormat}
        canDelete={canDelete}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCut={handleCut}
        onCopyText={handleCopyText}
        onPaste={handlePaste}
        onSelectAll={handleSelectAll}
        showToolbar={showToolbar}
        onToggleToolbar={() => setShowToolbar((prev) => !prev)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        zoomLevel={zoomLevel}
        onSetZoom={setZoomLevel}
      />

      {/* Editor Body with Yjs Collaboration & Presence Cursors */}
      <TiptapEditor
        initialContent={documentData?.content || ''}
        onContentChange={handleContentChange}
        ydoc={ydoc}
        provider={provider}
        currentUser={currentUser}
        isEditable={isEditable}
        onEditorReady={setEditor}
        showToolbar={showToolbar}
        zoomLevel={zoomLevel}
      />

      {/* Google Docs Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        docId={id}
        docTitle={title}
        isOwner={!documentData?.currentUserRole || documentData?.currentUserRole === 'owner'}
      />
    </div>
  );
};

export default EditorPage;
