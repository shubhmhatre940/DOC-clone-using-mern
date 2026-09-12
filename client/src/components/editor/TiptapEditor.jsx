import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import EditorToolbar from './EditorToolbar';

const TiptapEditor = ({
  initialContent,
  onContentChange,
  ydoc,
  provider,
  currentUser,
  isEditable = true,
  onEditorReady,
  showToolbar = true,
  zoomLevel = 100
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
    })
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
          }`
        }
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onContentChange(html);
      }
    },
    [ydoc, provider, isEditable]
  );

  // Update editor content when initialContent is loaded (if not using Yjs)
  useEffect(() => {
    if (!ydoc && editor && initialContent !== undefined && initialContent !== editor.getHTML()) {
      if (editor.isEmpty && initialContent !== '') {
        editor.commands.setContent(initialContent);
      }
    }
  }, [initialContent, editor, ydoc]);

  // Synchronize editable property if permissions change dynamically
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

  // Expose editor instance to parent (for Edit menu bar commands)
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  return (
    <div className="flex flex-col flex-1 bg-[#f8f9fa] overflow-y-auto">
      {/* Google Docs Formatting Toolbar (Toggleable from View menu) */}
      {showToolbar && <EditorToolbar editor={editor} editable={isEditable} />}

      {/* Editor Canvas Area */}
      <div
        className="flex-1 overflow-auto py-8 px-4 flex justify-center cursor-text"
        onClick={() => isEditable && editor?.commands.focus()}
      >
        {/* Paper Sheet (Standard US Letter 8.5" x 11" feel) with Zoom scaling */}
        <div
          className="w-full max-w-[816px] min-h-[1056px] bg-white rounded-xs shadow-[0_1px_3px_1px_rgba(60,64,67,0.15)] border border-gray-200 px-12 sm:px-16 py-16 transition-transform duration-150"
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
