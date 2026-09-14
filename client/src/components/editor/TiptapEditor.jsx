import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
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
import PageLayoutContainer from './PageLayoutContainer';
import { ColumnBlock, ColumnBreak } from './ColumnExtension';

// Custom extension to attach block-level formatting (text direction dir="rtl|ltr" and CSS styles)
const BlockFormatting = Extension.create({
  name: 'blockFormatting',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote'],
        attributes: {
          dir: {
            default: null,
            parseHTML: (element) => element.getAttribute('dir') || null,
            renderHTML: (attributes) => (attributes.dir ? { dir: attributes.dir } : {})
          },
          blockStyle: {
            default: null,
            parseHTML: (element) => element.getAttribute('style') || null,
            renderHTML: (attributes) => (attributes.blockStyle ? { style: attributes.blockStyle } : {})
          }
        }
      }
    ];
  }
});

// Enhanced TableCell supporting custom background color
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {};
          return { style: `background-color: ${attributes.backgroundColor};` };
        }
      }
    };
  }
});

// Enhanced Image supporting sizing (25%, 50%, 75%, 100%) and text wrap / alignment
const CustomImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('width') || element.style.width || null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width, style: `width: ${attributes.width}; max-width: 100%; height: auto;` };
        }
      },
      alignment: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-align') || null,
        renderHTML: (attributes) => {
          if (attributes.alignment === 'center') {
            return { 'data-align': 'center', style: 'display: block; margin: 12px auto;' };
          }
          if (attributes.alignment === 'left') {
            return { 'data-align': 'left', style: 'float: left; margin: 0 16px 12px 0;' };
          }
          if (attributes.alignment === 'right') {
            return { 'data-align': 'right', style: 'float: right; margin: 0 0 12px 16px;' };
          }
          if (attributes.alignment === 'inline') {
            return { 'data-align': 'inline', style: 'display: inline-block; vertical-align: middle; margin: 4px;' };
          }
          return {};
        }
      }
    };
  }
});

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
  onStartComment,
  isReadingMode = false,
  onExitReadingMode,
  pageSettings = {},
  onUpdatePageSettings,
  isEditingHeaderFooter = false,
  onCloseHeaderFooter
}) => {
  const effectiveEditable = isEditable && !isReadingMode;
  // Build extension list dynamically based on collaboration availability
  const extensions = [
    StarterKit.configure({
      // Disable built-in history if Yjs is handling undo/redo
      history: !ydoc,
      heading: {
        levels: [1, 2, 3, 4, 5, 6]
      }
    }),
    Underline,
    BlockFormatting,
    ColumnBlock,
    ColumnBreak,
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
    CustomImage.configure({
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
    CustomTableCell
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
          if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
            event.preventDefault();
            editor?.chain().focus().unsetAllMarks().clearNodes().run();
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

  // Synchronize editable property if permissions or reading mode change dynamically
  useEffect(() => {
    if (editor) {
      editor.setEditable(effectiveEditable);
    }
  }, [effectiveEditable, editor]);

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
    <div className="flex flex-col flex-1 bg-[#f8f9fa] dark:bg-[#18191b] overflow-y-auto relative transition-colors">
      {/* Reading Mode Floating Status Banner */}
      {isReadingMode && (
        <div className="bg-amber-50/95 backdrop-blur-xs border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900 z-20 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="font-semibold">Reading mode</span>
            <span className="text-amber-700 hidden sm:inline">— Non-editable clean view. Live collaborative edits will still appear in real time.</span>
          </div>
          {onExitReadingMode && (
            <button
              type="button"
              onClick={onExitReadingMode}
              className="px-2.5 py-1 rounded bg-white border border-amber-300 hover:bg-amber-100 font-medium text-amber-800 transition cursor-pointer shadow-2xs text-xs"
            >
              Exit reading mode
            </button>
          )}
        </div>
      )}

      {/* Floating Add Comment Trigger */}
      {!isReadingMode && (
        <CommentBubble
          visible={!!bubblePos}
          position={bubblePos}
          onClick={handleStartComment}
        />
      )}

      {/* Google Docs Formatting Toolbar (Toggleable from View menu) */}
      {showToolbar && !isReadingMode && <EditorToolbar editor={editor} editable={isEditable} />}

      {/* Editor Canvas Area with Page Layout (Pageless vs Paginated, Orientation, Headers/Footers, Page Numbers) */}
      <PageLayoutContainer
        isPageless={pageSettings.isPageless}
        orientation={pageSettings.orientation}
        headerText={pageSettings.headerText}
        footerText={pageSettings.footerText}
        showPageNumbers={pageSettings.showPageNumbers}
        pageNumberPosition={pageSettings.pageNumberPosition}
        onUpdatePageSettings={onUpdatePageSettings}
        isEditable={effectiveEditable}
        zoomLevel={zoomLevel}
        showLineNumbers={showLineNumbers}
        isReadingMode={isReadingMode}
        editor={editor}
        isEditingHeaderFooter={isEditingHeaderFooter}
        onCloseHeaderFooter={onCloseHeaderFooter}
      >
        <EditorContent editor={editor} />
      </PageLayoutContainer>
    </div>
  );
};

export default TiptapEditor;
