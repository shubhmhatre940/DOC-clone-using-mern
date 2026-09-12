import React, { useState, useEffect } from 'react';
import { X, FileText, Check } from 'lucide-react';

export function computeStats(text = '') {
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s+/g, '').length;
  const pages = words === 0 ? 0 : Math.max(1, Math.ceil(words / 500));

  return { words, characters, charactersNoSpaces, pages };
}

const WordCountModal = ({
  isOpen,
  onClose,
  editor,
  showLiveCounter,
  onToggleLiveCounter
}) => {
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    pages: 0
  });

  useEffect(() => {
    if (!isOpen || !editor) return;

    const updateCounts = () => {
      const text = editor.getText();
      setStats(computeStats(text));
    };

    updateCounts();

    editor.on('update', updateCounts);
    return () => {
      editor.off('update', updateCounts);
    };
  }, [isOpen, editor]);

  if (!isOpen) return null;

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
        aria-labelledby="word-count-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 id="word-count-title" className="text-base font-semibold text-gray-900">
              Word count
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Table */}
        <div className="p-5 space-y-3.5 text-sm">
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-gray-600">Pages (estimated)</span>
            <span className="font-semibold text-gray-900">{stats.pages}</span>
          </div>
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-gray-600">Words</span>
            <span className="font-semibold text-gray-900">{stats.words}</span>
          </div>
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-gray-600">Characters</span>
            <span className="font-semibold text-gray-900">{stats.characters}</span>
          </div>
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-gray-600">Characters (no spaces)</span>
            <span className="font-semibold text-gray-900">{stats.charactersNoSpaces}</span>
          </div>

          <hr className="border-gray-100 my-2" />

          {/* Live Counter Option */}
          <label className="flex items-center gap-3 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={showLiveCounter}
              onChange={(e) => onToggleLiveCounter && onToggleLiveCounter(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs text-gray-700">Display word count while typing</span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer shadow-xs"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordCountModal;
