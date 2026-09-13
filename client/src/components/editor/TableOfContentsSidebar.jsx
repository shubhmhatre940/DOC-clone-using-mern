import React, { useState, useEffect, useCallback } from 'react';
import { ListTree, X, ChevronRight, Hash } from 'lucide-react';

const TableOfContentsSidebar = ({ editor, isOpen, onClose }) => {
  const [headings, setHeadings] = useState([]);

  // Scan document for H1, H2, H3 headings
  const updateHeadings = useCallback(() => {
    if (!editor || !editor.state) return;

    const items = [];
    const { doc } = editor.state;

    doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        const level = node.attrs?.level || 1;
        const text = node.textContent;
        if (text && text.trim()) {
          items.push({
            id: `heading-${pos}`,
            pos,
            level,
            text: text.trim()
          });
        }
      }
    });

    setHeadings(items);
  }, [editor]);

  // Debounced listener on editor update
  useEffect(() => {
    if (!editor) return;

    // Initial scan
    updateHeadings();

    let timer = null;
    const handleUpdate = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        updateHeadings();
      }, 350);
    };

    editor.on('update', handleUpdate);
    return () => {
      clearTimeout(timer);
      editor.off('update', handleUpdate);
    };
  }, [editor, updateHeadings]);

  if (!isOpen) return null;

  const handleHeadingClick = (pos) => {
    if (!editor) return;

    try {
      editor.commands.focus();
      editor.commands.setTextSelection(pos + 1);

      const domNode = editor.view.nodeDOM(pos);
      const targetElement =
        domNode instanceof HTMLElement
          ? domNode
          : editor.view.domAtPos(pos)?.node?.parentElement || domNode?.parentElement;

      if (targetElement && typeof targetElement.scrollIntoView === 'function') {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      console.warn('Scroll to heading error:', err);
    }
  };

  return (
    <aside
      className="w-64 sm:w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-xs select-none animate-in slide-in-from-left-4 duration-200"
      aria-label="Document outline"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
        <div className="flex items-center gap-2">
          <ListTree className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
            Document Outline
          </h2>
          {headings.length > 0 && (
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
              {headings.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer"
          title="Close outline"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Headings list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {headings.length === 0 ? (
          <div className="text-center py-8 px-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 text-gray-400">
              <Hash className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-gray-600 mb-1">No headings yet</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Add headings (Heading 1, 2, or 3) to your document to generate an outline automatically.
            </p>
          </div>
        ) : (
          headings.map((heading) => {
            const indentClass =
              heading.level === 1
                ? 'pl-2 font-medium text-gray-800'
                : heading.level === 2
                ? 'pl-5 text-gray-700 font-normal'
                : 'pl-8 text-gray-600 text-[11px] font-normal';

            return (
              <button
                key={heading.id}
                type="button"
                onClick={() => handleHeadingClick(heading.pos)}
                className={`w-full text-left py-1.5 pr-2 rounded-md hover:bg-blue-50 hover:text-blue-700 transition flex items-center gap-1.5 group cursor-pointer text-xs truncate ${indentClass}`}
                title={`Jump to "${heading.text}"`}
              >
                <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-500 shrink-0 transition-transform group-hover:translate-x-0.5" />
                <span className="truncate">{heading.text}</span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default TableOfContentsSidebar;
