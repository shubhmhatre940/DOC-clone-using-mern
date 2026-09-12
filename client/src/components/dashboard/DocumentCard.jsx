import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MoreVertical, Trash2, ExternalLink, Users } from 'lucide-react';

const DocumentCard = ({ doc, onDelete, isListView = false, isShared = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCardClick = () => {
    navigate(`/document/${doc._id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      setDeleting(true);
      await onDelete(doc._id);
      setShowConfirm(false);
      setMenuOpen(false);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (isListView) {
    return (
      <>
        <div
          onClick={handleCardClick}
          className="group flex items-center justify-between px-4 py-3 hover:bg-[#e8f0fe] rounded-lg cursor-pointer transition border-b border-gray-100"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="text-[#1a73e8] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-700">
              {doc.title || 'Untitled document'}
            </span>
          </div>

          <div className="flex items-center gap-8 text-xs text-gray-500">
            <span className="hidden sm:inline">
              {isShared ? doc.owner?.name || 'Collaborator' : 'me'}
            </span>
            <span className="w-24 text-right">{formatDate(doc.updatedAt)}</span>

            <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-8 w-44 rounded-xl bg-white p-1.5 shadow-lg border border-gray-200 z-30">
                  <button
                    onClick={handleCardClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg text-left"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    Open in editor
                  </button>
                  {!isShared && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setShowConfirm(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      Delete document
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-base font-semibold text-gray-900">Delete document?</h3>
              <p className="mt-2 text-xs text-gray-600">
                "{doc.title || 'Untitled document'}" will be deleted permanently. This action cannot be undone.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition disabled:opacity-60"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Grid View (Default Google Docs layout)
  return (
    <>
      <div
        onClick={handleCardClick}
        className="group flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden hover:border-[#1a73e8] hover:shadow-md transition cursor-pointer"
      >
        {/* Document Preview Area (Paper visual simulation) */}
        <div className="relative h-44 bg-[#f8f9fa] border-b border-gray-100 flex items-center justify-center overflow-hidden p-4">
          {isShared && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium shadow-xs">
              <Users className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{doc.owner?.name || 'Shared'}</span>
            </div>
          )}

          <div className="w-28 h-36 bg-white rounded shadow-xs border border-gray-200 p-2.5 flex flex-col gap-1.5 transition-transform group-hover:scale-105">
            <div className="h-2 w-3/4 bg-gray-300 rounded-xs"></div>
            <div className="h-1.5 w-full bg-gray-200 rounded-xs"></div>
            <div className="h-1.5 w-5/6 bg-gray-200 rounded-xs"></div>
            <div className="h-1.5 w-4/5 bg-gray-200 rounded-xs"></div>
            <div className="h-1.5 w-full bg-gray-200 rounded-xs"></div>
            <div className="h-1.5 w-2/3 bg-gray-200 rounded-xs"></div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-3 bg-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="text-[#1a73e8] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-medium text-gray-900 truncate group-hover:text-blue-700" title={doc.title}>
                {doc.title || 'Untitled document'}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Opened {formatDate(doc.updatedAt)}
              </p>
            </div>
          </div>

          <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 bottom-8 w-44 rounded-xl bg-white p-1.5 shadow-lg border border-gray-200 z-30">
                <button
                  onClick={handleCardClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg text-left"
                >
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                  Open in editor
                </button>
                {!isShared && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setShowConfirm(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Delete document
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900">Delete document?</h3>
            <p className="mt-2 text-xs text-gray-600">
              "{doc.title || 'Untitled document'}" will be deleted permanently. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentCard;
