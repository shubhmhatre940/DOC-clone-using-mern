import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Trash2 } from 'lucide-react';

const LinkModal = ({ isOpen, onClose, editor }) => {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [isExistingLink, setIsExistingLink] = useState(false);

  useEffect(() => {
    if (!isOpen || !editor) return;

    const { from, to } = editor.state.selection;
    const selected = editor.state.doc.textBetween(from, to, ' ');
    const previousUrl = editor.getAttributes('link').href || '';

    setText(selected);
    setUrl(previousUrl);
    setIsExistingLink(!!previousUrl);
  }, [isOpen, editor]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) {
      handleRemove();
      return;
    }

    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    if (editor) {
      if (text && (!editor.state.selection || editor.state.selection.empty)) {
        editor.chain().focus().insertContent(`<a href="${finalUrl}">${text}</a>`).run();
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
      }
    }

    onClose();
  };

  const handleRemove = () => {
    if (editor) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-modal-title"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-blue-600" />
            <h2 id="link-modal-title" className="text-sm font-semibold text-gray-900">
              {isExistingLink ? 'Edit link' : 'Insert link'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Display text"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Link URL</label>
            <input
              type="text"
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            {isExistingLink ? (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove link
              </button>
            ) : <span />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-xs"
              >
                Apply
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkModal;
