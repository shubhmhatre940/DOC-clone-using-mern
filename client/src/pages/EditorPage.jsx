import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useAuth } from '../context/AuthContext';
import EditorNavbar from '../components/editor/EditorNavbar';
import TiptapEditor from '../components/editor/TiptapEditor';
import ShareModal from '../components/editor/ShareModal';
import DocumentDetailsModal from '../components/editor/DocumentDetailsModal';
import ShortcutsModal from '../components/editor/ShortcutsModal';
import { useAutosave } from '../hooks/useAutosave';
import { getDocumentById, createDocument, updateDocument, deleteDocument, exportDocument } from '../api/documents';
import { getComments, createComment, addReply, updateComment, deleteComment as apiDeleteComment } from '../api/comments';
import CommentSidebar from '../components/comments/CommentSidebar';
import TableOfContentsSidebar from '../components/editor/TableOfContentsSidebar';
import ErrorBoundary from '../components/common/ErrorBoundary';
import VersionHistoryModal from '../components/history/VersionHistoryModal';
import ActivityLogModal from '../components/activity/ActivityLogModal';
import WordCountModal, { computeStats } from '../components/tools/WordCountModal';
import PreferencesModal from '../components/tools/PreferencesModal';
import VoiceTypingWidget from '../components/tools/VoiceTypingWidget';
import GrammarCheckWidget from '../components/tools/GrammarCheckWidget';
import AiAssistantWidget from '../components/tools/AiAssistantWidget';
import CompareModal from '../components/tools/CompareModal';
import CitationsModal from '../components/tools/CitationsModal';
import LinkModal from '../components/insert/LinkModal';
import SymbolsModal from '../components/insert/SymbolsModal';
import TableModal from '../components/insert/TableModal';
import ImageModal from '../components/insert/ImageModal';
import AudioModal from '../components/insert/AudioModal';
import ChartModal from '../components/insert/ChartModal';
import BookmarksModal from '../components/insert/BookmarksModal';
import BuildingBlocksModal from '../components/insert/BuildingBlocksModal';
import { getUserPreferences } from '../api/preferences';
import * as decoding from 'lib0/decoding';
import { Loader2, ArrowLeft, FileText } from 'lucide-react';

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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Menu bar and view states
  const [editor, setEditor] = useState(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [exportLoadingFormat, setExportLoadingFormat] = useState(null);

  // New features: TOC, Focus mode, Reading mode, Activity log, Grammar check
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [isGrammarCheckOpen, setIsGrammarCheckOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  // Phase 5: Comments state
  const [comments, setComments] = useState([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newCommentDraft, setNewCommentDraft] = useState(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState(null);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Tools & Insert menu states
  const [isWordCountOpen, setIsWordCountOpen] = useState(false);
  const [showLiveWordCount, setShowLiveWordCount] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferencesInitialTab, setPreferencesInitialTab] = useState('preferences');
  const [isVoiceTyping, setIsVoiceTyping] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCitationsOpen, setIsCitationsOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isSymbolsModalOpen, setIsSymbolsModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isBookmarksModalOpen, setIsBookmarksModalOpen] = useState(false);
  const [isBuildingBlocksOpen, setIsBuildingBlocksOpen] = useState(false);
  const [liveStats, setLiveStats] = useState({ words: 0, characters: 0, pages: 0 });

  // Page layout state (Pageless vs Paginated, Orientation, Headers/Footers, Page Numbers)
  const [pageSettings, setPageSettings] = useState({
    isPageless: false,
    orientation: 'portrait',
    headerText: '',
    footerText: '',
    showPageNumbers: false,
    pageNumberPosition: 'footer-right',
    showHeaderFooter: false
  });
  const [isEditingHeaderFooter, setIsEditingHeaderFooter] = useState(false);

  // Load user preferences on mount
  useEffect(() => {
    getUserPreferences()
      .then((res) => {
        if (res?.preferences) {
          if (typeof res.preferences.showLineNumbers === 'boolean') {
            setShowLineNumbers(res.preferences.showLineNumbers);
          }
          if (res.preferences.theme === 'high-contrast') {
            document.body.classList.add('theme-high-contrast');
          } else {
            document.body.classList.remove('theme-high-contrast');
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load user preferences:', err);
      });
  }, []);

  // Update live stats when editor content changes
  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
      if (showLiveWordCount) {
        setLiveStats(computeStats(editor.getText()));
      }
    };
    editor.on('update', handleUpdate);
    if (showLiveWordCount) {
      setLiveStats(computeStats(editor.getText()));
    }
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, showLiveWordCount]);

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

  // Document collaborators list for @mentions in comments (Phase 4 reuse)
  const documentCollaborators = useMemo(() => {
    const list = [];
    if (documentData?.owner) {
      list.push({
        _id: documentData.owner._id || documentData.owner,
        name: documentData.owner.name || 'Document Owner',
        email: documentData.owner.email || '',
        role: 'owner'
      });
    }
    if (Array.isArray(documentData?.collaborators)) {
      documentData.collaborators.forEach((c) => {
        const u = c.userId;
        if (u) {
          list.push({
            _id: u._id || u,
            name: u.name || 'Collaborator',
            email: u.email || '',
            role: c.role || 'viewer'
          });
        }
      });
    }
    const seen = new Set();
    return list.filter((item) => {
      const idStr = item._id?.toString();
      if (!idStr || seen.has(idStr)) return false;
      seen.add(idStr);
      return true;
    });
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
      if (data.pageSettings) {
        setPageSettings((prev) => ({ ...prev, ...data.pageSettings }));
      }

      // Phase 5: Load document comments
      try {
        const docComments = await getComments(id);
        setComments(docComments || []);
      } catch (commentErr) {
        console.warn('Failed to fetch initial comments:', commentErr);
      }
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

    // Phase 5: Listen for real-time comment broadcast (messageCustom = 3)
    wsProvider.messageHandlers[3] = (encoder, decoder) => {
      try {
        const raw = decoding.readVarString(decoder);
        const event = JSON.parse(raw);
        if (!event || !event.type) return;

        if (event.type === 'comment:new') {
          setComments((prev) => {
            if (prev.some((c) => c._id === event.comment._id)) return prev;
            return [event.comment, ...prev];
          });
        } else if (event.type === 'comment:reply' || event.type === 'comment:update') {
          setComments((prev) =>
            prev.map((c) => (c._id === event.comment._id ? event.comment : c))
          );
        } else if (event.type === 'comment:delete') {
          setComments((prev) => prev.filter((c) => c._id !== event.commentId));
        } else if (event.type === 'version:restored') {
          if (event.documentId === id) {
            setTitle(event.title || 'Untitled document');
            setContent(event.content || '');
            if (editor) {
              editor.commands.setContent(event.content || '');
            }
          }
        }
      } catch (err) {
        console.error('[Yjs Provider Custom Message Error]:', err);
      }
    };

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

  // Phase 5: Comment action handlers
  const handleCreateComment = async (data) => {
    try {
      const created = await createComment(id, data);
      setComments((prev) => {
        if (prev.some((c) => c._id === created._id)) return prev;
        return [created, ...prev];
      });
      setNewCommentDraft(null);
    } catch (err) {
      console.error('Failed to post comment:', err);
      alert(err.response?.data?.message || 'Failed to post comment');
    }
  };

  const handleReplyComment = async (commentId, replyData) => {
    try {
      const updated = await addReply(commentId, replyData);
      setComments((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (err) {
      console.error('Failed to add reply:', err);
      alert(err.response?.data?.message || 'Failed to add reply');
    }
  };

  const handleResolveComment = async (commentId) => {
    try {
      const updated = await updateComment(commentId, { resolved: true });
      setComments((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (err) {
      console.error('Failed to resolve comment:', err);
      alert(err.response?.data?.message || 'Failed to resolve comment');
    }
  };

  const handleReopenComment = async (commentId) => {
    try {
      const updated = await updateComment(commentId, { resolved: false });
      setComments((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (err) {
      console.error('Failed to reopen comment:', err);
      alert(err.response?.data?.message || 'Failed to reopen comment');
    }
  };

  const handleEditComment = async (commentId, text) => {
    try {
      const updated = await updateComment(commentId, { text });
      setComments((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (err) {
      console.error('Failed to edit comment:', err);
      alert(err.response?.data?.message || 'Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await apiDeleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleStartComment = ({ selectedText, selectionRange }) => {
    setNewCommentDraft({ selectedText, selectionRange });
    setIsCommentsOpen(true);
  };

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

  // Global keyboard shortcuts listener: Ctrl+S (Save), Ctrl+P (Print), Ctrl+/ (Shortcuts), Ctrl+Shift+C (Word Count), Ctrl+Shift+S (Voice Typing), Ctrl+K (Link)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Word count: Ctrl + Shift + C
      if (isCtrl && e.shiftKey && key === 'c') {
        e.preventDefault();
        setIsWordCountOpen((prev) => !prev);
      }
      // Focus mode: Ctrl + Shift + F
      else if (isCtrl && e.shiftKey && key === 'f') {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      }
      // Voice typing: Ctrl + Shift + S
      else if (isCtrl && e.shiftKey && key === 's') {
        e.preventDefault();
        setIsVoiceTyping((prev) => !prev);
      }
      // Manual save: Ctrl + S / Cmd + S (without shift)
      else if (isCtrl && !e.shiftKey && key === 's') {
        e.preventDefault();
        saveNow();
      }
      // Hyperlink: Ctrl + K / Cmd + K
      else if (isCtrl && !e.shiftKey && key === 'k') {
        e.preventDefault();
        setIsLinkModalOpen(true);
      }
      // Print: Ctrl + P / Cmd + P
      else if (isCtrl && !e.shiftKey && key === 'p') {
        e.preventDefault();
        window.print();
      }
      // Shortcuts help: Ctrl + / / Cmd + /
      else if (isCtrl && e.key === '/') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveNow]);

  const handleInsertHorizontalLine = () => {
    editor?.chain().focus().setHorizontalRule().run();
  };

  const handleInsertPageBreak = () => {
    editor?.chain().focus().insertContent('<div class="page-break" data-break="page"></div><p></p>').run();
  };

  const handleUpdatePageSettings = useCallback(
    (newSettings) => {
      setPageSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        updateDocument(id, { pageSettings: updated }).catch((err) => {
          console.error('Failed to save page settings:', err);
        });
        return updated;
      });
    },
    [id]
  );

  const handleTogglePrintLayout = useCallback(() => {
    handleUpdatePageSettings({ isPageless: !pageSettings.isPageless });
  }, [pageSettings.isPageless, handleUpdatePageSettings]);

  const handleSetOrientation = useCallback(
    (orientation) => {
      handleUpdatePageSettings({ orientation, isPageless: false });
    },
    [handleUpdatePageSettings]
  );

  const handleSetPageNumbers = useCallback(
    (showPageNumbers, position) => {
      handleUpdatePageSettings({ showPageNumbers, pageNumberPosition: position });
    },
    [handleUpdatePageSettings]
  );

  const handleEditHeaderFooter = useCallback(() => {
    if (pageSettings.isPageless) {
      handleUpdatePageSettings({ isPageless: false });
    }
    // Show header/footer bands when user explicitly opens editing via Format menu
    if (!pageSettings.showHeaderFooter) {
      handleUpdatePageSettings({ showHeaderFooter: true });
    }
    setIsEditingHeaderFooter(true);
  }, [pageSettings.isPageless, pageSettings.showHeaderFooter, handleUpdatePageSettings]);

  const handleInsertColumnBreak = useCallback(() => {
    editor?.chain().focus().insertColumnBreak().run();
  }, [editor]);

  const handleProofread = () => {
    if (!editor) return;
    editor.chain().focus().run();
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2';
    toast.innerHTML = '<span>✓ Spellcheck active — misspelled words are underlined in red</span>';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  };

  const handleOpenAccessibility = () => {
    setPreferencesInitialTab('preferences');
    setIsPreferencesOpen(true);
  };

  const handlePreferencesUpdated = (data) => {
    if (data?.preferences) {
      if (typeof data.preferences.showLineNumbers === 'boolean') {
        setShowLineNumbers(data.preferences.showLineNumbers);
      }
      if (data.preferences.theme === 'high-contrast') {
        document.body.classList.add('theme-high-contrast');
      } else {
        document.body.classList.remove('theme-high-contrast');
      }
    }
  };

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
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
    }
  };

  const handleExport = async (format) => {
    try {
      setExportLoadingFormat(format);
      const response = await exportDocument(id, format, {
        orientation: pageSettings.orientation,
        headerText: pageSettings.headerText,
        footerText: pageSettings.footerText,
        showPageNumbers: pageSettings.showPageNumbers,
        pageNumberPosition: pageSettings.pageNumberPosition
      });

      const mimeTypeMap = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        txt: 'text/plain;charset=utf-8',
        html: 'text/html;charset=utf-8'
      };
      const expectedType = mimeTypeMap[format] || 'application/octet-stream';

      let blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: expectedType });

      // If server returned a JSON error blob
      if (blob.type === 'application/json' || blob.type.includes('json')) {
        const errorText = await blob.text();
        try {
          const parsed = JSON.parse(errorText);
          alert(parsed.message || `Export to ${format.toUpperCase()} failed.`);
        } catch {
          alert(`Export to ${format.toUpperCase()} failed.`);
        }
        return;
      }

      // Re-wrap blob with exact expected MIME type if needed
      blob = new Blob([blob], { type: expectedType });

      const safeTitle = (title || 'Untitled document').trim().replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `${safeTitle}.${format}`;

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
      let errMsg = `Export to ${format.toUpperCase()} failed. Please try again.`;
      if (err.response?.data instanceof Blob && err.response.data.type.includes('json')) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed.message) errMsg = parsed.message;
        } catch (_) { }
      }
      alert(errMsg);
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
      {/* Floating Exit Focus Mode Pill */}
      {isFocusMode && (
        <div className="fixed top-3 right-4 z-50 flex items-center gap-2 bg-gray-900/90 hover:bg-gray-900 text-white text-xs px-3.5 py-1.5 rounded-full shadow-xl backdrop-blur-xs border border-gray-700/50 select-none animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium">Focus mode</span>
          <span className="text-gray-500">|</span>
          <button
            type="button"
            onClick={() => setIsFocusMode(false)}
            className="text-blue-300 hover:text-white font-medium underline transition cursor-pointer"
            title="Exit focus mode (Ctrl+Shift+F)"
          >
            Exit (Ctrl+Shift+F)
          </button>
        </div>
      )}

      {/* Top Navbar with functional File, Edit, View menus (hidden in Focus Mode) */}
      {!isFocusMode && (
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
          editor={editor}
          // Phase 5: Comments toggle & badge
          commentsCount={comments.filter((c) => !c.resolved).length}
          isCommentsOpen={isCommentsOpen}
          onToggleComments={() => setIsCommentsOpen((prev) => !prev)}
          // New View Mode toggles
          showToc={isTocOpen}
          onToggleToc={() => setIsTocOpen((prev) => !prev)}
          isFocusMode={isFocusMode}
          onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
          isReadingMode={isReadingMode}
          onToggleReadingMode={() => setIsReadingMode((prev) => !prev)}
          onOpenActivityLog={() => setIsActivityLogOpen(true)}
          onOpenGrammarCheck={() => setIsGrammarCheckOpen((prev) => !prev)}
          onOpenAiAssistant={() => setIsAiAssistantOpen((prev) => !prev)}
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
          onOpenDetails={() => setIsDetailsModalOpen(true)}
          onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
          onPrint={() => window.print()}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          // Insert actions
          onInsertLink={() => setIsLinkModalOpen(true)}
          onInsertSymbol={() => setIsSymbolsModalOpen(true)}
          onInsertHorizontalLine={handleInsertHorizontalLine}
          onInsertImage={() => setIsImageModalOpen(true)}
          onInsertTable={() => setIsTableModalOpen(true)}
          onInsertAudio={() => setIsAudioModalOpen(true)}
          onInsertChart={() => setIsChartModalOpen(true)}
          onInsertBookmark={() => setIsBookmarksModalOpen(true)}
          onInsertPageBreak={handleInsertPageBreak}
          onInsertBuildingBlock={() => setIsBuildingBlocksOpen(true)}
          // Tools actions
          onOpenWordCount={() => setIsWordCountOpen(true)}
          showLineNumbers={showLineNumbers}
          onToggleLineNumbers={() => setShowLineNumbers((prev) => !prev)}
          onProofread={handleProofread}
          isVoiceTyping={isVoiceTyping}
          onToggleVoiceTyping={() => setIsVoiceTyping((prev) => !prev)}
          onOpenCompare={() => setIsCompareOpen(true)}
          onOpenCitations={() => setIsCitationsOpen(true)}
          onOpenPreferences={() => {
            setPreferencesInitialTab('preferences');
            setIsPreferencesOpen(true);
          }}
          onOpenAccessibility={handleOpenAccessibility}
          // Page layout features
          pageSettings={pageSettings}
          onTogglePrintLayout={handleTogglePrintLayout}
          onSetOrientation={handleSetOrientation}
          onEditHeaderFooter={handleEditHeaderFooter}
          onSetPageNumbers={handleSetPageNumbers}
          onInsertColumnBreak={handleInsertColumnBreak}
        />
      )}

      {/* Main Workspace Area with Table of Contents, Editor & Comments Sidebar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Document Outline / Table of Contents */}
        <TableOfContentsSidebar
          editor={editor}
          isOpen={isTocOpen && !isFocusMode}
          onClose={() => setIsTocOpen(false)}
        />

        <TiptapEditor
          initialContent={documentData?.content || ''}
          onContentChange={handleContentChange}
          ydoc={ydoc}
          provider={provider}
          currentUser={currentUser}
          isEditable={isEditable}
          onEditorReady={setEditor}
          showToolbar={showToolbar && !isFocusMode}
          zoomLevel={zoomLevel}
          showLineNumbers={showLineNumbers}
          onStartComment={handleStartComment}
          isReadingMode={isReadingMode}
          onExitReadingMode={() => setIsReadingMode(false)}
          // Page layout & ribbon action handlers
          pageSettings={{
            ...pageSettings,
            onOpenGrammarCheck: () => setIsGrammarCheckOpen(true),
            onOpenWordCount: () => setIsWordCountOpen(true),
            onOpenTableModal: () => setIsTableModalOpen(true),
            onOpenImageModal: () => setIsImageModalOpen(true)
          }}
          onUpdatePageSettings={handleUpdatePageSettings}
          isEditingHeaderFooter={isEditingHeaderFooter}
          onCloseHeaderFooter={() => setIsEditingHeaderFooter(false)}
        />

        {/* Floating Live Word Count Badge */}
        {showLiveWordCount && !isFocusMode && (
          <div
            onClick={() => setIsWordCountOpen(true)}
            className="absolute bottom-4 left-6 z-20 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-md rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:shadow-lg transition cursor-pointer select-none"
            title="Click to view full word count statistics"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>{liveStats.words.toLocaleString()} words</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">{liveStats.characters.toLocaleString()} chars</span>
          </div>
        )}

        {/* Voice Typing Widget Floating Pill */}
        <VoiceTypingWidget
          isOpen={isVoiceTyping && !isFocusMode}
          onClose={() => setIsVoiceTyping(false)}
          editor={editor}
        />

        <ErrorBoundary compact title="Comments Sidebar">
          <CommentSidebar
            isOpen={isCommentsOpen && !isFocusMode}
            onClose={() => setIsCommentsOpen(false)}
            comments={comments}
            collaborators={documentCollaborators}
            currentUserId={user?._id}
            currentUserName={user?.name}
            userRole={documentData?.currentUserRole || 'owner'}
            onResolve={handleResolveComment}
            onReopen={handleReopenComment}
            onReply={handleReplyComment}
            onDelete={handleDeleteComment}
            onEdit={handleEditComment}
            newCommentDraft={newCommentDraft}
            onCancelNewComment={() => setNewCommentDraft(null)}
            onCreateComment={handleCreateComment}
            highlightedCommentId={highlightedCommentId}
            onSelectComment={setHighlightedCommentId}
          />
        </ErrorBoundary>
      </div>

      {/* Version History Modal (Phase 5 Feature 2) */}
      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        docId={id}
        currentTitle={title}
        currentContent={content}
        canRestore={isEditable}
        onRestoreSuccess={(restoredDoc) => {
          setTitle(restoredDoc.title || 'Untitled document');
          setContent(restoredDoc.content || '');
          if (editor) {
            editor.commands.setContent(restoredDoc.content || '');
          }
          saveNow();
        }}
      />

      {/* Activity Log / Audit Trail Modal (Feature 3) */}
      <ActivityLogModal
        isOpen={isActivityLogOpen}
        onClose={() => setIsActivityLogOpen(false)}
        docId={id}
        currentUserId={user?._id}
      />

      {/* Spelling & Grammar Check Widget (Feature 6 - LanguageTool) */}
      <GrammarCheckWidget
        editor={editor}
        isOpen={isGrammarCheckOpen && !isFocusMode}
        onClose={() => setIsGrammarCheckOpen(false)}
      />

      {/* Gemini Smart AI Writing Assistant */}
      <AiAssistantWidget
        editor={editor}
        isOpen={isAiAssistantOpen && !isFocusMode}
        onClose={() => setIsAiAssistantOpen(false)}
      />

      {/* Google Docs Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        docId={id}
        docTitle={title}
        isOwner={!documentData?.currentUserRole || documentData?.currentUserRole === 'owner'}
      />

      {/* Document Details Modal (Feature 1) */}
      <DocumentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        documentData={documentData}
        title={title}
        content={content}
      />

      {/* Keyboard Shortcuts Modal (Feature 3) */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Tools Modals */}
      <WordCountModal
        isOpen={isWordCountOpen}
        onClose={() => setIsWordCountOpen(false)}
        editor={editor}
        showLiveCounter={showLiveWordCount}
        onToggleLiveCounter={() => setShowLiveWordCount((prev) => !prev)}
      />

      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        initialTab={preferencesInitialTab}
        onPreferencesUpdated={handlePreferencesUpdated}
      />

      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        currentDocId={id}
        currentDocTitle={title}
        currentContent={content}
      />

      <CitationsModal
        isOpen={isCitationsOpen}
        onClose={() => setIsCitationsOpen(false)}
        editor={editor}
      />

      {/* Insert Modals */}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        editor={editor}
      />

      <SymbolsModal
        isOpen={isSymbolsModalOpen}
        onClose={() => setIsSymbolsModalOpen(false)}
        editor={editor}
      />

      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        editor={editor}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        editor={editor}
      />

      <AudioModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        editor={editor}
      />

      <ChartModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        editor={editor}
      />

      <BookmarksModal
        isOpen={isBookmarksModalOpen}
        onClose={() => setIsBookmarksModalOpen(false)}
        editor={editor}
      />

      <BuildingBlocksModal
        isOpen={isBuildingBlocksOpen}
        onClose={() => setIsBuildingBlocksOpen(false)}
        editor={editor}
      />
    </div>
  );
};

export default EditorPage;
