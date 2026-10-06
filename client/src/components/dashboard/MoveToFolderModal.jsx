import React, { useState, useEffect } from 'react';
import { Folder, FolderPlus, X, Check, Loader2 } from 'lucide-react';
import { getFolders, createFolder } from '../../api/folders';
import { moveDocumentToFolder } from '../../api/documents';

const MoveToFolderModal = ({ isOpen, onClose, doc, onMoved }) => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState(doc?.folderId?._id || doc?.folderId || null);
  const [moving, setMoving] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedFolderId(doc?.folderId?._id || doc?.folderId || null);

    const loadFolders = async () => {
      try {
        setLoading(true);
        const data = await getFolders();
        setFolders(data);
      } catch (err) {
        console.error('Failed to load folders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFolders();
  }, [isOpen, doc]);

  if (!isOpen || !doc) return null;

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      setCreating(true);
      const created = await createFolder({ name: newFolderName.trim() });
      setFolders((prev) => [...prev, created]);
      setSelectedFolderId(created._id);
      setNewFolderName('');
      setShowCreateInput(false);
    } catch (err) {
      console.error('Failed to create folder:', err);
      alert(err.response?.data?.message || 'Failed to create folder');
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmMove = async () => {
    try {
      setMoving(true);
      await moveDocumentToFolder(doc._id, selectedFolderId);
      if (onMoved) {
        onMoved(doc._id, selectedFolderId);
      }
      onClose();
    } catch (err) {
      console.error('Failed to move document:', err);
      alert(err.response?.data?.message || 'Failed to move document');
    } finally {
      setMoving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1c1e22] p-5 shadow-2xl border border-gray-200 dark:border-neutral-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Move to folder</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 my-2 truncate">
          Select destination for <strong className="text-gray-700 dark:text-gray-200 font-medium">"{doc.title || 'Untitled document'}"</strong>
        </p>

        {/* Folder List */}
        <div className="max-h-56 overflow-y-auto space-y-1 my-2 pr-1">
          {/* Root / No folder */}
          <div
            onClick={() => setSelectedFolderId(null)}
            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition text-xs ${
              selectedFolderId === null
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800'
                : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span>My Documents (Root)</span>
            </div>
            {selectedFolderId === null && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          ) : (
            folders.map((folder) => {
              const isSelected = selectedFolderId === folder._id;
              return (
                <div
                  key={folder._id}
                  onClick={() => setSelectedFolderId(folder._id)}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition text-xs ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-amber-500'}`} />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                </div>
              );
            })
          )}
        </div>

        {/* Create new folder inside modal */}
        {showCreateInput ? (
          <form onSubmit={handleCreateFolder} className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              autoFocus
              className="flex-1 text-xs border border-gray-300 dark:border-neutral-700 bg-white dark:bg-[#25282e] text-gray-900 dark:text-white placeholder-gray-400 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={creating || !newFolderName.trim()}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
            >
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateInput(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowCreateInput(true)}
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium mt-2 pt-2 border-t border-gray-100 dark:border-neutral-800 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New folder</span>
          </button>
        )}

        {/* Modal Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmMove}
            disabled={moving}
            className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {moving ? 'Moving...' : 'Move here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveToFolderModal;
