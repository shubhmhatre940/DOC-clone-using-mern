import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import TiptapImage from '@tiptap/extension-image';
import TiptapLink from '@tiptap/extension-link';
import { Table as TiptapTable } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import EditorToolbar from './EditorToolbar';
import CommentBubble from '../comments/CommentBubble';

const TiptapEditor = ({
  initialContent,
  onContentChange,
  ydoc,
  provider,
  currentUser,
  isEditable = true,
  onEditorReady,
  showToolbar = true,
  zoomLevel = 100,
  showLineNumbers = false,
  onStartComment
}) => {
  // Build extension list dynamically based on collaboration availability
  const extensions = [
    StarterKit.configure({
      // Disable built-in history if Yjs is handling undo/redo
      history: !ydoc,
      heading: {
        levels: [1, 2, 3]
      }
    }),
    TextStyle,
    FontFamily,
    FontSize,
    Color,
    Highlight.configure({
      multicolor: true
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    Placeholder.configure({
      placeholder: isEditable ? "Type '@' to insert, or start writing..." : 'Read only document'
    }),
    TiptapImage.configure({
      inline: true,
      allowBase64: true
    }),
    TiptapLink.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 underline cursor-pointer'
      }
    }),
    TiptapTable.configure({
      resizable: true
    }),
    TableRow,
    TableHeader,
    TableCell
  ];

  // Attach Yjs collaboration if ydoc is provided
  if (ydoc) {
    extensions.push(
      Collaboration.configure({
        document: ydoc
      })
    );
  }

  // Attach real-time collaborative cursor presence if provider is provided
  if (provider && currentUser) {
    extensions.push(
      CollaborationCursor.configure({
        provider,
        user: {
          name: currentUser.name || 'Anonymous',
          color: currentUser.color || '#1a73e8'
        }
      })
    );
  }

  const editor = useEditor(
    {
      editable: isEditable,
      extensions,
      content: !ydoc ? initialContent || '' : undefined,
      editorProps: {
        attributes: {
          class: `focus:outline-none min-h-[850px] text-gray-800 ${
            !isEditable ? 'cursor-default select-text' : ''
          }`,
          spellcheck: 'true'
        },
        handleKeyDown: (view, event) => {
          if (event.key === 'Tab') {
            event.preventDefault();
            view.dispatch(view.state.tr.insertText('\u00A0\u00A0\u00A0\u00A0'));
            return true;
          }
          return false;
        }
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        queueMicrotask(() => {
          onContentChange(html);
        });
      }
    },
    [ydoc, provider, isEditable]
  );

  const hasSeededRef = useRef(false);

  // Seed initial content into editor and Yjs document (runs for templates, docx upload, etc.)
  useEffect(() => {
    if (!editor || !initialContent || initialContent === '<p></p>' || hasSeededRef.current) return;

    const seedContent = () => {
      if (hasSeededRef.current) return;

      const xmlFragment = ydoc?.getXmlFragment('default');
      const isFragmentEmpty = !xmlFragment || xmlFragment.length === 0;
      const currentHtml = editor.getHTML();
      const isEditorEmpty = editor.isEmpty || currentHtml === '<p></p>' || currentHtml.trim() === '';

      if (isFragmentEmpty || isEditorEmpty) {
        hasSeededRef.current = true;
        editor.commands.setContent(initialContent, { emitUpdate: true });
      }
    };

    if (!ydoc) {
      seedContent();
      return;
    }

    if (provider) {
      if (provider.synced) {
        seedContent();
      } else {
        const handleSynced = (isSynced) => {
          if (isSynced) {
            seedContent();
          }
        };

        provider.on('synced', handleSynced);
        provider.on('sync', handleSynced);

        // Fallback: When socket connects and fragment is still empty, seed content
        const fallbackTimer = setTimeout(() => {
          if (provider.wsconnected && !hasSeededRef.current) {
            seedContent();
          }
        }, 300);

        return () => {
          provider.off('synced', handleSynced);
          provider.off('sync', handleSynced);
          clearTimeout(fallbackTimer);
        };
      }
    }
  }, [initialContent, editor, ydoc, provider]);

  // Synchronize editable property if permissions change dynamically
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

  // Expose editor instance to parent (for Edit menu bar commands)
  useEffect(() => {
    if (editor && onEditorReady) {
      const timer = setTimeout(() => {
        onEditorReady(editor);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [editor, onEditorReady]);

  // Track selection to display floating comment bubble
  const [bubblePos, setBubblePos] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ from: 0, to: 0 });

  useEffect(() => {
    if (!editor) return;

    const handleSelection = () => {
      const { from, to, empty } = editor.state.selection;
      if (empty || from === to) {
        setBubblePos(null);
        return;
      }

      const text = editor.state.doc.textBetween(from, to, ' ');
      if (!text || !text.trim()) {
        setBubblePos(null);
        return;
      }

      setSelectedText(text);
      setSelectionRange({ from, to });

      try {
        const view = editor.view;
        const coords = view.coordsAtPos(from);
        const endCoords = view.coordsAtPos(to);
        const midX = (coords.left + endCoords.right) / 2;
        const topY = Math.min(coords.top, endCoords.top);

        setBubblePos({
          left: midX,
          top: topY
        });
      } catch {
        setBubblePos(null);
      }
    };

    editor.on('selectionUpdate', handleSelection);
    return () => {
      editor.off('selectionUpdate', handleSelection);
    };
  }, [editor]);

  const handleStartComment = () => {
    if (onStartComment && selectedText) {
      onStartComment({
        selectedText,
        selectionRange
      });
      setBubblePos(null);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#f8f9fa] overflow-y-auto relative">
      {/* Floating Add Comment Trigger */}
      <CommentBubble
        visible={!!bubblePos}
        position={bubblePos}
        onClick={handleStartComment}
      />

      {/* Google Docs Formatting Toolbar (Toggleable from View menu) */}
      {showToolbar && <EditorToolbar editor={editor} editable={isEditable} />}

      {/* Editor Canvas Area */}
      <div
        className="flex-1 overflow-auto py-8 px-4 flex justify-center cursor-text"
        onClick={() => isEditable && editor?.commands.focus()}
      >
        {/* Paper Sheet (Standard US Letter 8.5" x 11" feel) with Zoom scaling */}
        <div
          className={`w-full max-w-[816px] min-h-[1056px] bg-white rounded-xs shadow-[0_1px_3px_1px_rgba(60,64,67,0.15)] border border-gray-200 px-12 sm:px-16 py-16 transition-transform duration-150 ${
            showLineNumbers ? 'show-line-numbers' : ''
          }`}
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default TiptapEditor;
