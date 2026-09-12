import React, { useState, useEffect } from 'react';
import { X, Bookmark as BookmarkIcon, Plus, ArrowRight, Trash2 } from 'lucide-react';

const BookmarksModal = ({ isOpen, onClose, editor }) => {
  const [bookmarkName, setBookmarkName] = useState('');
  const [existingBookmarks, setExistingBookmarks] = useState([]);

  useEffect(() => {
    if (!isOpen || !editor) return;

    // Scan current editor content for bookmarks
    const html = editor.getHTML();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const anchors = doc.querySelectorAll('.bookmark-anchor');
    const list = [];
    anchors.forEach((a) => {
      const name = a.getAttribute('data-bookmark') || a.id.replace('bm-', '');
      if (name && !list.includes(name)) {
        list.push(name);
      }
    });
    setExistingBookmarks(list);
  }, [isOpen, editor]);

  if (!isOpen) return null;

  const handleAddBookmark = (e) => {
    e.preventDefault();
    const name = bookmarkName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!name) return;

    if (editor) {
      const anchorHtml = `<span id="bm-${name}" class="bookmark-anchor bg-amber-100 text-amber-900 border-b-2 border-amber-400 font-semibold px-1 py-0.5 rounded text-xs" data-bookmark="${name}">🚩 ${name}</span>&nbsp;`;
      editor.chain().focus().insertContent(anchorHtml).run();
    }

    setExistingBookmarks((prev) => [...prev, name]);
    setBookmarkName('');
  };

  const handleJumpToBookmark = (name) => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById(`bm-${name}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-amber-300', 'transition');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-amber-300');
        }, 1500);
      }
    }, 100);
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
        aria-labelledby="bookmarks-modal-title"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkIcon className="w-4 h-4 text-blue-600" />
            <h2 id="bookmarks-modal-title" className="text-sm font-semibold text-gray-900">
              Document bookmarks
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

        <div className="p-4 space-y-4 text-xs">
          {/* Add Bookmark form */}
          <form onSubmit={handleAddBookmark} className="space-y-2">
            <label className="block text-gray-600 font-medium">Create bookmark at cursor</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={bookmarkName}
                onChange={(e) => setBookmarkName(e.target.value)}
                placeholder="e.g. Chapter_2, Summary..."
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!bookmarkName.trim()}
                className="px-3 py-1.5 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 shadow-xs disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </form>

          {/* Existing Bookmarks List */}
          <div className="pt-2 border-t border-gray-100">
            <span className="font-medium text-gray-600 block mb-2">
              Bookmarks in this document ({existingBookmarks.length}):
            </span>

            {existingBookmarks.length === 0 ? (
              <p className="text-gray-400 italic py-3 text-center">
                No bookmarks found in document.
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5">
                {existingBookmarks.map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-blue-50/60 border border-gray-100 transition"
                  >
                    <span className="font-semibold text-gray-800 truncate">🚩 {name}</span>
                    <button
                      type="button"
                      onClick={() => handleJumpToBookmark(name)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-[11px] font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition"
                    >
                      Jump to <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarksModal;
