import React, { useState } from 'react';
import { X, Quote, Plus, BookOpen } from 'lucide-react';
import { formatInTextCitation, formatBibliographyEntry } from '../../utils/citationFormatter';

const CitationsModal = ({ isOpen, onClose, editor }) => {
  const [style, setStyle] = useState('APA'); // 'APA' | 'MLA' | 'Chicago'
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState('');
  const [url, setUrl] = useState('');

  const [savedCitations, setSavedCitations] = useState([]);

  if (!isOpen) return null;

  const handleInsertInText = (e) => {
    e.preventDefault();
    if (!author.trim() && !title.trim()) {
      alert('Please enter at least an author or title.');
      return;
    }

    const citationText = formatInTextCitation({ author, year, page, style });
    if (editor) {
      editor.chain().focus().insertContent(` ${citationText} `).run();
    }

    // Save to list
    const newEntry = { author, title, year, source, url, style };
    setSavedCitations((prev) => [...prev, newEntry]);
  };

  const handleInsertBibliography = () => {
    if (!editor) return;

    const heading = style === 'MLA' ? 'Works Cited' : style === 'Chicago' ? 'Bibliography' : 'References';
    let html = `<h2>${heading}</h2><ul>`;

    if (savedCitations.length === 0) {
      // Use current input
      const entry = formatBibliographyEntry({ author, title, year, source, url, style });
      html += `<li>${entry}</li>`;
    } else {
      savedCitations.forEach((c) => {
        const entry = formatBibliographyEntry(c);
        html += `<li>${entry}</li>`;
      });
    }
    html += '</ul>';

    editor.chain().focus().insertContent(html).run();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="citations-modal-title"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-blue-600" />
            <h2 id="citations-modal-title" className="text-base font-semibold text-gray-900">
              Citations & Bibliography
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

        <div className="p-5 space-y-3.5 text-xs">
          {/* Style Selector */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">Citation style:</span>
            {['APA', 'MLA', 'Chicago'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  style === s
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={handleInsertInText} className="space-y-2.5 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Author</label>
                <input
                  type="text"
                  placeholder="e.g. Smith, John"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2024"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">Title</label>
              <input
                type="text"
                placeholder="Title of book, paper, or article"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Publisher / Source</label>
                <input
                  type="text"
                  placeholder="e.g. Oxford Press"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Page number (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 42"
                  value={page}
                  onChange={(e) => setPage(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">URL (optional)</label>
              <input
                type="text"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-gray-100">
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer shadow-xs"
              >
                Insert in-text citation
              </button>

              <button
                type="button"
                onClick={handleInsertBibliography}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Insert {style === 'MLA' ? 'Works Cited' : 'Bibliography'}
              </button>
            </div>
          </form>

          {/* Session Citations List */}
          {savedCitations.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                Document citations in this session ({savedCitations.length}):
              </span>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {savedCitations.map((c, i) => (
                  <div key={i} className="text-[11px] text-gray-600 bg-gray-50 p-1.5 rounded truncate">
                    {c.author} ({c.year}) - {c.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitationsModal;
