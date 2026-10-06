import React, { useState } from 'react';
import DocumentCard from './DocumentCard';
import {
  LayoutGrid,
  List,
  FileText,
  SearchX,
  Users,
  Search,
  Loader2,
  Star,
  Trash2,
  Folder,
  FolderPlus,
  X,
  AlertCircle
} from 'lucide-react';

const DocumentList = ({
  ownedDocs = [],
  sharedDocs = [],
  starredDocs = [],
  trashDocs = [],
  folders = [],
  selectedFolderId = null,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  onDeleteDocument,
  onRestoreDocument,
  onPermanentDeleteDocument,
  onToggleStar,
  onMovedToFolder,
  searchQuery,
  searchResults = null,
  isSearching = false,
  onClearSearch,
  activeTab = 'owned',
  setActiveTab
}) => {
  const [isListView, setIsListView] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  const isSearchActive = searchResults !== null;

  // Determine current active docs
  let currentDocs = [];
  if (isSearchActive) {
    currentDocs = searchResults;
  } else if (activeTab === 'shared') {
    currentDocs = sharedDocs;
  } else if (activeTab === 'starred') {
    currentDocs = starredDocs;
  } else if (activeTab === 'trash') {
    currentDocs = trashDocs;
  } else {
    // 'owned': filter by selected folder if any
    if (selectedFolderId) {
      currentDocs = ownedDocs.filter(
        (d) => (d.folderId?._id || d.folderId) === selectedFolderId
      );
    } else {
      currentDocs = ownedDocs;
    }
  }

  // Filter documents by local search query if backend search is not active
  const filteredDocs = isSearchActive
    ? searchResults
    : currentDocs.filter((doc) =>
        (doc.title || 'Untitled document')
          .toLowerCase()
          .includes((searchQuery || '').toLowerCase().trim())
      );

  const handleCreateFolderSubmit = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      setCreatingFolder(true);
      await onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowFolderModal(false);
    } catch (err) {
      console.error('Create folder error:', err);
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
      {/* Subheader: Tabs & View toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 dark:border-neutral-800 gap-4 mb-6">
        {/* Tab switchers or Search banner */}
        {isSearchActive ? (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 text-xs font-medium border border-blue-200 dark:border-blue-800">
              <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                Search results for <strong className="font-semibold">"{searchQuery}"</strong> ({filteredDocs.length})
              </span>
              {isSearching && <Loader2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin ml-1" />}
            </div>
            {onClearSearch && (
              <button
                onClick={onClearSearch}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-1 cursor-pointer font-medium"
              >
                Back to all documents
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                setActiveTab('owned');
                if (onSelectFolder) onSelectFolder(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                activeTab === 'owned'
                  ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
              }`}
            >
              My documents ({ownedDocs.length})
            </button>

            <button
              onClick={() => setActiveTab('shared')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                activeTab === 'shared'
                  ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Shared with me ({sharedDocs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('starred')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                activeTab === 'starred'
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Starred ({starredDocs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('trash')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                activeTab === 'trash'
                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Trash ({trashDocs.length})</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Grid / List view toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-neutral-800 rounded-lg p-0.5 border border-transparent dark:border-neutral-700">
            <button
              onClick={() => setIsListView(false)}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                !isListView
                  ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsListView(true)}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                isListView
                  ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Folders Bar (shown when viewing 'owned' tab and not searching) */}
      {!isSearchActive && activeTab === 'owned' && (
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => onSelectFolder && onSelectFolder(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              selectedFolderId === null
                ? 'bg-gray-900 dark:bg-neutral-200 text-white dark:text-gray-900 shadow-xs'
                : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>All folders</span>
          </button>

          {folders.map((folder) => {
            const isSelected = selectedFolderId === folder._id;
            return (
              <div
                key={folder._id}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                }`}
                onClick={() => onSelectFolder && onSelectFolder(folder._id)}
              >
                <Folder className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-500'}`} />
                <span>{folder.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-gray-300'}`}>
                  {folder.docCount ?? 0}
                </span>

                {onDeleteFolder && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete folder "${folder.name}"? Contained documents will return to root.`)) {
                        onDeleteFolder(folder._id);
                      }
                    }}
                    className={`ml-1 opacity-0 group-hover:opacity-100 transition p-0.5 rounded ${
                      isSelected ? 'text-blue-200 hover:text-white' : 'text-gray-400 hover:text-rose-500'
                    }`}
                    title="Delete folder"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={() => setShowFolderModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-medium transition cursor-pointer whitespace-nowrap"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>New folder</span>
          </button>
        </div>
      )}

      {/* Trash notice banner */}
      {!isSearchActive && activeTab === 'trash' && (
        <div className="mb-6 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Items in trash will remain here until permanently deleted or restored.</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {searchQuery ? (
            <>
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-400 mb-3">
                <SearchX className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No documents match your search</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try a different title or keyword</p>
            </>
          ) : activeTab === 'trash' ? (
            <>
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-400 mb-3">
                <Trash2 className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Trash is empty</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Deleted documents will be kept here for recovery
              </p>
            </>
          ) : activeTab === 'starred' ? (
            <>
              <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 mb-3">
                <Star className="w-7 h-7 fill-amber-400" />
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">No starred documents</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                Star important documents from the menu or star icon to quickly access them here.
              </p>
            </>
          ) : activeTab === 'shared' ? (
            <>
              <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
                <Users className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">No shared documents</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                Documents shared with you by other collaborators will appear here.
              </p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {selectedFolderId ? 'This folder is empty' : 'No documents yet'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Click "+ Blank document" above to create your first document
              </p>
            </>
          )}
        </div>
      ) : isListView ? (
        /* List View */
        <div className="space-y-1">
          <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <span>Name</span>
            <div className="flex items-center gap-10">
              <span className="hidden sm:inline">Owner</span>
              <span className="w-24 text-right">
                {activeTab === 'trash' ? 'Deleted' : 'Last opened'}
              </span>
              <span className="w-6"></span>
            </div>
          </div>
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc._id}
              doc={doc}
              onDelete={onDeleteDocument}
              onRestore={onRestoreDocument}
              onPermanentDelete={onPermanentDeleteDocument}
              onToggleStar={onToggleStar}
              onMovedToFolder={onMovedToFolder}
              isListView={true}
              isShared={activeTab === 'shared'}
              isTrash={activeTab === 'trash'}
            />
          ))}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc._id}
              doc={doc}
              onDelete={onDeleteDocument}
              onRestore={onRestoreDocument}
              onPermanentDelete={onPermanentDeleteDocument}
              onToggleStar={onToggleStar}
              onMovedToFolder={onMovedToFolder}
              isListView={false}
              isShared={activeTab === 'shared'}
              isTrash={activeTab === 'trash'}
            />
          ))}
        </div>
      )}

      {/* New Folder Modal */}
      {showFolderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setShowFolderModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1c1e22] p-5 shadow-2xl border border-gray-200 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">New folder</h3>
              </div>
              <button
                onClick={() => setShowFolderModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolderSubmit} className="mt-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                autoFocus
                className="w-full text-sm border border-gray-300 dark:border-neutral-700 bg-white dark:bg-[#25282e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3.5 py-2 outline-none focus:border-blue-500 shadow-xs"
              />

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingFolder || !newFolderName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {creatingFolder ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
