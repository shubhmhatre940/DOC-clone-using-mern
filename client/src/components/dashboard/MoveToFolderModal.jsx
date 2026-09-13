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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-800">Move to folder</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-500 my-2 truncate">
          Select destination for <strong className="text-gray-700 font-medium">"{doc.title || 'Untitled document'}"</strong>
        </p>

        {/* Folder List */}
        <div className="max-h-56 overflow-y-auto space-y-1 my-2 pr-1">
          {/* Root / No folder */}
          <div
            onClick={() => setSelectedFolderId(null)}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
              selectedFolderId === null
                ? 'bg-blue-50 text-blue-800 font-medium border border-blue-200'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-gray-400" />
              <span>My Documents (Root)</span>
            </div>
            {selectedFolderId === null && <Check className="w-4 h-4 text-blue-600" />}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          ) : (
            folders.map((folder) => {
              const isSelected = selectedFolderId === folder._id;
              return (
                <div
                  key={folder._id}
                  onClick={() => setSelectedFolderId(folder._id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                    isSelected
                      ? 'bg-blue-50 text-blue-800 font-medium border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-amber-500'}`} />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </div>
              );
            })
          )}
        </div>

        {/* Create new folder inside modal */}
        {showCreateInput ? (
          <form onSubmit={handleCreateFolder} className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              autoFocus
              className="flex-1 text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={creating || !newFolderName.trim()}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateInput(false)}
              className="p-1 text-gray-400 hover:text-gray-600 text-xs"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowCreateInput(true)}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 pt-2 border-t border-gray-100"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New folder</span>
          </button>
        )}

        {/* Modal Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmMove}
            disabled={moving}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition shadow-xs disabled:opacity-60"
          >
            {moving ? 'Moving...' : 'Move here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveToFolderModal;
