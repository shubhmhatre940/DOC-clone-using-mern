import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MoreVertical,
  Trash2,
  ExternalLink,
  Users,
  Star,
  FolderInput,
  RotateCcw,
  AlertOctagon
} from 'lucide-react';
import MoveToFolderModal from './MoveToFolderModal';

const DocumentCard = ({
  doc,
  onDelete,
  onRestore,
  onPermanentDelete,
  onToggleStar,
  onMovedToFolder,
  isListView = false,
  isShared = false,
  isTrash = false
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPermanentConfirm, setShowPermanentConfirm] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
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
    if (isTrash) {
      // In trash view, don't open directly
      return;
    }
    navigate(`/document/${doc._id}`);
  };

  const handleSoftDelete = async (e) => {
    e.stopPropagation();
    try {
      setDeleting(true);
      await onDelete(doc._id);
      setShowConfirm(false);
      setMenuOpen(false);
    } catch (err) {
      console.error('Move to trash failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handlePermanentDelete = async (e) => {
    e.stopPropagation();
    try {
      setDeleting(true);
      if (onPermanentDelete) {
        await onPermanentDelete(doc._id);
      }
      setShowPermanentConfirm(false);
      setMenuOpen(false);
    } catch (err) {
      console.error('Permanent delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (e) => {
    e.stopPropagation();
    try {
      if (onRestore) {
        await onRestore(doc._id);
      }
      setMenuOpen(false);
    } catch (err) {
      console.error('Restore failed:', err);
    }
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    if (onToggleStar) {
      onToggleStar(doc._id);
    }
  };

  // List View
  if (isListView) {
    return (
      <>
        <div
          onClick={handleCardClick}
          className={`group flex items-center justify-between px-4 py-3 rounded-xl transition border-b border-gray-100 dark:border-neutral-800 ${
            isTrash ? 'opacity-80 bg-gray-50/50 dark:bg-neutral-900/40' : 'hover:bg-blue-50/60 dark:hover:bg-neutral-800/80 cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {!isTrash && (
              <button
                type="button"
                onClick={handleStarClick}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition text-gray-400 shrink-0"
                title={doc.isStarred ? 'Unstar document' : 'Star document'}
              >
                <Star
                  className={`w-4 h-4 transition ${
                    doc.isStarred
                      ? 'fill-amber-400 text-amber-500'
                      : 'hover:text-amber-500'
                  }`}
                />
              </button>
            )}

            <div className="text-blue-600 dark:text-blue-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>

            <div className="flex items-center gap-2 truncate">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {doc.title || 'Untitled document'}
              </span>
              {doc.folderId?.name && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 font-normal">
                  {doc.folderId.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-8 text-xs text-gray-500 dark:text-gray-400">
            <span className="hidden sm:inline">
              {isShared ? doc.owner?.name || 'Collaborator' : 'me'}
            </span>
            <span className="w-24 text-right">
              {isTrash ? `Deleted ${formatDate(doc.deletedAt)}` : formatDate(doc.updatedAt)}
            </span>

            <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-300 transition cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-8 w-48 rounded-xl bg-white dark:bg-[#1e2024] p-1.5 shadow-xl border border-gray-200 dark:border-neutral-800 z-30">
                  {isTrash ? (
                    <>
                      <button
                        onClick={handleRestore}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg text-left cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Restore document
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowPermanentConfirm(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left cursor-pointer"
                      >
                        <AlertOctagon className="w-4 h-4 text-rose-500" />
                        Delete forever
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleCardClick}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-left cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        Open in editor
                      </button>
                      {!isShared && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            setShowMoveModal(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-left cursor-pointer"
                        >
                          <FolderInput className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          Move to folder
                        </button>
                      )}
                      {!isShared && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            setShowConfirm(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                          Move to trash
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Soft Delete Modal */}
        {showConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1c1e22] p-6 shadow-2xl border border-gray-200 dark:border-neutral-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Move to trash?</h3>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                "{doc.title || 'Untitled document'}" will be moved to the Trash. You can restore it anytime from the Trash tab.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="rounded-xl px-3.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSoftDelete}
                  disabled={deleting}
                  className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition disabled:opacity-60 cursor-pointer"
                >
                  {deleting ? 'Moving...' : 'Move to trash'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Permanent Delete Modal */}
        {showPermanentConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1c1e22] p-6 shadow-2xl border border-gray-200 dark:border-neutral-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Delete forever?</h3>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                "{doc.title || 'Untitled document'}" will be permanently erased from the database. This action cannot be undone.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPermanentConfirm(false)}
                  className="rounded-xl px-3.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePermanentDelete}
                  disabled={deleting}
                  className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition disabled:opacity-60 cursor-pointer"
                >
                  {deleting ? 'Deleting...' : 'Delete forever'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Move to folder modal */}
        <MoveToFolderModal
          isOpen={showMoveModal}
          onClose={() => setShowMoveModal(false)}
          doc={doc}
          onMoved={onMovedToFolder}
        />
      </>
    );
  }

  // Grid View (Default Google Docs layout)
  return (
    <>
      <div
        onClick={handleCardClick}
        className={`group flex flex-col rounded-2xl border border-gray-200/90 dark:border-neutral-800 bg-white dark:bg-[#1e2024] overflow-hidden transition-all duration-200 relative ${
          isTrash
            ? 'opacity-80'
            : 'hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-md cursor-pointer'
        }`}
      >
        {/* Document Preview Area (Paper visual simulation) */}
        <div className="relative h-44 bg-[#f8f9fa] dark:bg-[#18191c] border-b border-gray-100 dark:border-neutral-800 flex items-center justify-center overflow-hidden p-4">
          {/* Top Left: Star Button & Shared Badge */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
            {!isTrash && (
              <button
                type="button"
                onClick={handleStarClick}
                className="p-1 rounded-full bg-white/90 dark:bg-neutral-800/90 shadow-xs hover:bg-white dark:hover:bg-neutral-800 text-gray-400 hover:text-amber-500 transition cursor-pointer"
                title={doc.isStarred ? 'Starred' : 'Star'}
              >
                <Star
                  className={`w-3.5 h-3.5 transition ${
                    doc.isStarred
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
              </button>
            )}
            {isShared && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-medium shadow-xs">
                <Users className="w-3 h-3" />
                <span className="truncate max-w-[80px]">{doc.owner?.name || 'Shared'}</span>
              </div>
            )}
          </div>

          <div className="w-28 h-36 bg-white dark:bg-[#25272b] rounded shadow-xs border border-gray-200 dark:border-neutral-700 p-2.5 flex flex-col gap-1.5 transition-transform duration-200 group-hover:scale-105">
            <div className="h-2 w-3/4 bg-gray-300 dark:bg-neutral-600 rounded-xs"></div>
            <div className="h-1.5 w-full bg-gray-200 dark:bg-neutral-700 rounded-xs"></div>
            <div className="h-1.5 w-5/6 bg-gray-200 dark:bg-neutral-700 rounded-xs"></div>
            <div className="h-1.5 w-4/5 bg-gray-200 dark:bg-neutral-700 rounded-xs"></div>
            <div className="h-1.5 w-full bg-gray-200 dark:bg-neutral-700 rounded-xs"></div>
            <div className="h-1.5 w-2/3 bg-gray-200 dark:bg-neutral-700 rounded-xs"></div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-3.5 bg-white dark:bg-[#1e2024] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="text-blue-600 dark:text-blue-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400"
                title={doc.title}
              >
                {doc.title || 'Untitled document'}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {isTrash
                  ? `Deleted ${formatDate(doc.deletedAt)}`
                  : `Opened ${formatDate(doc.updatedAt)}`}
              </p>
            </div>
          </div>

          <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 transition cursor-pointer"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 bottom-8 w-48 rounded-xl bg-white dark:bg-[#1e2024] p-1.5 shadow-xl border border-gray-200 dark:border-neutral-800 z-30">
                {isTrash ? (
                  <>
                    <button
                      onClick={handleRestore}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg text-left cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Restore document
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setShowPermanentConfirm(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left cursor-pointer"
                    >
                      <AlertOctagon className="w-4 h-4 text-rose-500" />
                      Delete forever
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCardClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-left cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      Open in editor
                    </button>
                    {!isShared && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowMoveModal(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-left cursor-pointer"
                      >
                        <FolderInput className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        Move to folder
                      </button>
                    )}
                    {!isShared && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowConfirm(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        Move to trash
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1c1e22] p-6 shadow-2xl border border-gray-200 dark:border-neutral-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Move to trash?</h3>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
              "{doc.title || 'Untitled document'}" will be moved to the Trash. You can restore it anytime from the Trash tab.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-xl px-3.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSoftDelete}
                disabled={deleting}
                className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition disabled:opacity-60 cursor-pointer"
              >
                {deleting ? 'Moving...' : 'Move to trash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPermanentConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1c1e22] p-6 shadow-2xl border border-gray-200 dark:border-neutral-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Delete forever?</h3>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
              "{doc.title || 'Untitled document'}" will be permanently erased from the database. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPermanentConfirm(false)}
                className="rounded-xl px-3.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePermanentDelete}
                disabled={deleting}
                className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition disabled:opacity-60 cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move to folder modal */}
      <MoveToFolderModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        doc={doc}
        onMoved={onMovedToFolder}
      />
    </>
  );
};

export default DocumentCard;
