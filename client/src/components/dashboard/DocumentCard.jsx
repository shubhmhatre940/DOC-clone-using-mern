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
          className={`group flex items-center justify-between px-4 py-3 rounded-lg transition border-b border-gray-100 ${
            isTrash ? 'opacity-80 bg-gray-50/50' : 'hover:bg-[#e8f0fe] cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {!isTrash && (
              <button
                type="button"
                onClick={handleStarClick}
                className="p-1 rounded hover:bg-gray-200 transition text-gray-400 shrink-0"
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

            <div className="text-[#1a73e8] shrink-0">
              <FileText className="w-5 h-5" />
            </div>

            <div className="flex items-center gap-2 truncate">
              <span className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-700">
                {doc.title || 'Untitled document'}
              </span>
              {doc.folderId?.name && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-normal">
                  {doc.folderId.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-8 text-xs text-gray-500">
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
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-8 w-48 rounded-xl bg-white p-1.5 shadow-lg border border-gray-200 z-30">
                  {isTrash ? (
                    <>
                      <button
                        onClick={handleRestore}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg text-left"
                      >
                        <RotateCcw className="w-4 h-4 text-emerald-600" />
                        Restore document
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowPermanentConfirm(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
                      >
                        <AlertOctagon className="w-4 h-4 text-red-500" />
                        Delete forever
                      </button>
                    </>
                  ) : (
                    <>
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
                            setShowMoveModal(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg text-left"
                        >
                          <FolderInput className="w-4 h-4 text-gray-500" />
                          Move to folder
                        </button>
                      )}
                      {!isShared && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            setShowConfirm(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-base font-semibold text-gray-900">Move to trash?</h3>
              <p className="mt-2 text-xs text-gray-600">
                "{doc.title || 'Untitled document'}" will be moved to the Trash. You can restore it anytime from the Trash tab.
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
                  onClick={handleSoftDelete}
                  disabled={deleting}
                  className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition disabled:opacity-60"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-base font-semibold text-gray-900">Delete forever?</h3>
              <p className="mt-2 text-xs text-gray-600">
                "{doc.title || 'Untitled document'}" will be permanently erased from the database. This action cannot be undone.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPermanentConfirm(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePermanentDelete}
                  disabled={deleting}
                  className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition disabled:opacity-60"
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
        className={`group flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden transition relative ${
          isTrash
            ? 'opacity-80'
            : 'hover:border-[#1a73e8] hover:shadow-md cursor-pointer'
        }`}
      >
        {/* Document Preview Area (Paper visual simulation) */}
        <div className="relative h-44 bg-[#f8f9fa] border-b border-gray-100 flex items-center justify-center overflow-hidden p-4">
          {/* Top Left: Star Button & Shared Badge */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
            {!isTrash && (
              <button
                type="button"
                onClick={handleStarClick}
                className="p-1 rounded-full bg-white/90 shadow-xs hover:bg-white text-gray-400 hover:text-amber-500 transition"
                title={doc.isStarred ? 'Starred' : 'Star'}
              >
                <Star
                  className={`w-3.5 h-3.5 transition ${
                    doc.isStarred
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            )}
            {isShared && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium shadow-xs">
                <Users className="w-3 h-3" />
                <span className="truncate max-w-[80px]">{doc.owner?.name || 'Shared'}</span>
              </div>
            )}
          </div>

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
              <h3
                className="text-xs font-medium text-gray-900 truncate group-hover:text-blue-700"
                title={doc.title}
              >
                {doc.title || 'Untitled document'}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5 truncate">
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
              className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 bottom-8 w-48 rounded-xl bg-white p-1.5 shadow-lg border border-gray-200 z-30">
                {isTrash ? (
                  <>
                    <button
                      onClick={handleRestore}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg text-left"
                    >
                      <RotateCcw className="w-4 h-4 text-emerald-600" />
                      Restore document
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setShowPermanentConfirm(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
                    >
                      <AlertOctagon className="w-4 h-4 text-red-500" />
                      Delete forever
                    </button>
                  </>
                ) : (
                  <>
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
                          setShowMoveModal(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg text-left"
                      >
                        <FolderInput className="w-4 h-4 text-gray-500" />
                        Move to folder
                      </button>
                    )}
                    {!isShared && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowConfirm(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900">Move to trash?</h3>
            <p className="mt-2 text-xs text-gray-600">
              "{doc.title || 'Untitled document'}" will be moved to the Trash. You can restore it anytime from the Trash tab.
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
                onClick={handleSoftDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition disabled:opacity-60"
              >
                {deleting ? 'Moving...' : 'Move to trash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPermanentConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900">Delete forever?</h3>
            <p className="mt-2 text-xs text-gray-600">
              "{doc.title || 'Untitled document'}" will be permanently erased from the database. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPermanentConfirm(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePermanentDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition disabled:opacity-60"
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
