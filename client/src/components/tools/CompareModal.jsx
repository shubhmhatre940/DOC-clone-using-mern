import React, { useState, useEffect } from 'react';
import { X, GitCompare, Loader2, ArrowRight, Eye } from 'lucide-react';
import DiffMatchPatch from 'diff-match-patch';
import { getDocuments, getDocumentById } from '../../api/documents';

function stripHtml(html = '') {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

const CompareModal = ({ isOpen, onClose, currentDocId, currentDocTitle, currentContent }) => {
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [targetDoc, setTargetDoc] = useState(null);
  const [fetchingTarget, setFetchingTarget] = useState(false);
  const [diffSegments, setDiffSegments] = useState(null);
  const [viewMode, setViewMode] = useState('inline'); // 'inline' | 'sideBySide'

  useEffect(() => {
    if (!isOpen) return;

    const loadDocs = async () => {
      try {
        setLoadingDocs(true);
        const docs = await getDocuments();
        // Filter out current document
        const others = (docs || []).filter((d) => d._id !== currentDocId);
        setDocuments(others);
        if (others.length > 0) {
          setSelectedDocId(others[0]._id);
        }
      } catch (err) {
        console.error('Failed to load documents list for comparison:', err);
      } finally {
        setLoadingDocs(false);
      }
    };

    loadDocs();
  }, [isOpen, currentDocId]);

  if (!isOpen) return null;

  const handleCompare = async () => {
    if (!selectedDocId) return;

    try {
      setFetchingTarget(true);
      const target = await getDocumentById(selectedDocId);
      setTargetDoc(target);

      const textA = stripHtml(target.content || ''); // Base doc
      const textB = stripHtml(currentContent || ''); // Current doc

      const dmp = new DiffMatchPatch();
      const diffs = dmp.diff_main(textA, textB);
      dmp.diff_cleanupSemantic(diffs);
      setDiffSegments(diffs);
    } catch (err) {
      console.error('Failed to compare documents:', err);
      alert('Failed to load target document for comparison.');
    } finally {
      setFetchingTarget(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-modal-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-600" />
            <div>
              <h2 id="compare-modal-title" className="text-base font-semibold text-gray-900 leading-tight">
                Compare documents
              </h2>
              <p className="text-xs text-gray-500">
                Compare this document against another version or copy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <span className="font-semibold text-gray-700 whitespace-nowrap">Compare:</span>
            <span className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-800 font-medium truncate max-w-[180px]">
              {currentDocTitle || 'Current document'}
            </span>
            <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                setDiffSegments(null);
              }}
              disabled={loadingDocs || documents.length === 0}
              className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {documents.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.title || 'Untitled document'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {diffSegments && (
              <div className="flex bg-gray-200 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('inline')}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    viewMode === 'inline' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Inline diff
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('sideBySide')}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    viewMode === 'sideBySide' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Side by side
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleCompare}
              disabled={fetchingTarget || !selectedDocId}
              className="px-4 py-1.5 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {fetchingTarget && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {diffSegments ? 'Re-compare' : 'Compare'}
            </button>
          </div>
        </div>

        {/* Comparison Result Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white text-sm">
          {!diffSegments ? (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center">
              <GitCompare className="w-12 h-12 stroke-[1.5] text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-600">No comparison generated yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Select a document above and click "Compare" to view visual differences.
              </p>
            </div>
          ) : viewMode === 'inline' ? (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center gap-4 text-xs font-medium pb-2 border-b border-gray-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
                  <span className="text-emerald-800">Added in current document</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300 inline-block" />
                  <span className="text-rose-800">Removed from base document</span>
                </span>
              </div>

              <div className="font-mono text-xs leading-relaxed whitespace-pre-wrap p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                {diffSegments.map(([operation, text], idx) => {
                  if (operation === 1) {
                    // Added
                    return (
                      <span
                        key={idx}
                        className="bg-emerald-100 text-emerald-900 border-b border-emerald-400 font-medium px-0.5 rounded-xs"
                      >
                        {text}
                      </span>
                    );
                  }
                  if (operation === -1) {
                    // Deleted
                    return (
                      <span
                        key={idx}
                        className="bg-rose-100 text-rose-800 line-through decoration-rose-500 px-0.5 rounded-xs"
                      >
                        {text}
                      </span>
                    );
                  }
                  return <span key={idx}>{text}</span>;
                })}
              </div>
            </div>
          ) : (
            /* Side by Side view */
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-2.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700">
                  Base: {targetDoc?.title || 'Selected document'}
                </div>
                <div className="p-4 overflow-y-auto text-xs font-mono leading-relaxed whitespace-pre-wrap flex-1 bg-white">
                  {diffSegments.map(([op, text], idx) => {
                    if (op === -1) {
                      return (
                        <span key={idx} className="bg-rose-100 text-rose-800 line-through px-0.5">
                          {text}
                        </span>
                      );
                    }
                    if (op === 0) return <span key={idx}>{text}</span>;
                    return null;
                  })}
                </div>
              </div>

              <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-2.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700">
                  Current: {currentDocTitle || 'Current document'}
                </div>
                <div className="p-4 overflow-y-auto text-xs font-mono leading-relaxed whitespace-pre-wrap flex-1 bg-white">
                  {diffSegments.map(([op, text], idx) => {
                    if (op === 1) {
                      return (
                        <span key={idx} className="bg-emerald-100 text-emerald-900 font-medium px-0.5">
                          {text}
                        </span>
                      );
                    }
                    if (op === 0) return <span key={idx}>{text}</span>;
                    return null;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
