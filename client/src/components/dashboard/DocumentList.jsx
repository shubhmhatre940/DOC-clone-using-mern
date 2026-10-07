import React, { useState } from 'react';
import DocumentCard from './DocumentCard';
import { EmptyState } from '../ui/EmptyState';
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
  AlertCircle,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { showToast } from '../ui/Toast';

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
  const [sortBy, setSortBy] = useState('updatedAt'); // 'updatedAt' | 'title' | 'createdAt'

  const isSearchActive = searchResults !== null;

  // Determine current active docs list
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
    if (selectedFolderId) {
      currentDocs = ownedDocs.filter(
        (d) => (d.folderId?._id || d.folderId) === selectedFolderId
      );
    } else {
      currentDocs = ownedDocs;
    }
  }

  // Filter documents by local query if backend search not active
  let filteredDocs = isSearchActive
    ? searchResults
    : currentDocs.filter((doc) =>
        (doc.title || 'Untitled document')
          .toLowerCase()
          .includes((searchQuery || '').toLowerCase().trim())
      );

  // Apply sorting
  filteredDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    } else if (sortBy === 'createdAt') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  });

  const handleCreateFolderSubmit = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      setCreatingFolder(true);
      await onCreateFolder(newFolderName.trim());
      showToast(`Folder "${newFolderName.trim()}" created`, 'success');
      setNewFolderName('');
      setShowFolderModal(false);
    } catch (err) {
      console.error('Create folder error:', err);
      showToast('Could not create folder', 'error');
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
      {/* Segmented Tab Bar & View Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-neutral-800 gap-4 mb-6">
        {isSearchActive ? (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800">
              <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                Search results for <strong className="font-bold">"{searchQuery}"</strong> ({filteredDocs.length})
              </span>
              {isSearching && <Loader2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin ml-1" />}
            </div>
            {onClearSearch && (
              <button
                onClick={onClearSearch}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium ml-1"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          /* Segmented Tab Bar */
          <div className="flex items-center bg-slate-100 dark:bg-[#1e2024] p-1 rounded-2xl border border-slate-200/60 dark:border-neutral-800 overflow-x-auto scrollbar-none">
            <button
              onClick={() => {
                setActiveTab('owned');
                if (onSelectFolder) onSelectFolder(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'owned'
                  ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>My documents</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'owned' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'bg-slate-200 dark:bg-neutral-700 text-slate-600 dark:text-slate-400'}`}>
                {ownedDocs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('shared')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'shared'
                  ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Shared</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'shared' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'bg-slate-200 dark:bg-neutral-700 text-slate-600 dark:text-slate-400'}`}>
                {sharedDocs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('starred')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'starred'
                  ? 'bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Starred</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'starred' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-slate-200 dark:bg-neutral-700 text-slate-600 dark:text-slate-400'}`}>
                {starredDocs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('trash')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'trash'
                  ? 'bg-white dark:bg-neutral-800 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Trash</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'trash' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' : 'bg-slate-200 dark:bg-neutral-700 text-slate-600 dark:text-slate-400'}`}>
                {trashDocs.length}
              </span>
            </button>
          </div>
        )}

        {/* View Controls & Sort Dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Sort Menu */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#1e2024] px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-neutral-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="updatedAt" className="dark:bg-[#1e2024]">Last modified</option>
              <option value="title" className="dark:bg-[#1e2024]">Name (A-Z)</option>
              <option value="createdAt" className="dark:bg-[#1e2024]">Date created</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-[#1e2024] rounded-xl p-1 border border-slate-200/60 dark:border-neutral-800">
            <button
              onClick={() => setIsListView(false)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                !isListView
                  ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsListView(true)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isListView
                  ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Folders Bar */}
      {!isSearchActive && activeTab === 'owned' && (
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => onSelectFolder && onSelectFolder(null)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              selectedFolderId === null
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-[#1e2024] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800 border border-slate-200/60 dark:border-neutral-800'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>All documents</span>
          </button>

          {folders.map((folder) => {
            const isSelected = selectedFolderId === folder._id;
            return (
              <div
                key={folder._id}
                className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-[#1e2024] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800 border border-slate-200/60 dark:border-neutral-800'
                }`}
                onClick={() => onSelectFolder && onSelectFolder(folder._id)}
              >
                <Folder className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-500'}`} />
                <span>{folder.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-neutral-700 text-slate-600 dark:text-slate-300'}`}>
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
                      isSelected ? 'text-blue-200 hover:text-white' : 'text-slate-400 hover:text-rose-500'
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-neutral-700 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>+ New folder</span>
          </button>
        </div>
      )}

      {/* Trash Notice Banner */}
      {!isSearchActive && activeTab === 'trash' && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs font-medium text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Documents in trash will remain accessible for recovery until permanently deleted.</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          type={searchQuery ? 'owned' : activeTab}
          title={
            searchQuery
              ? 'No matching documents'
              : activeTab === 'trash'
              ? 'Trash is empty'
              : activeTab === 'starred'
              ? 'No starred documents yet'
              : activeTab === 'shared'
              ? 'No shared documents'
              : 'No documents created yet'
          }
          description={
            searchQuery
              ? `We couldn't find any documents matching "${searchQuery}".`
              : activeTab === 'starred'
              ? 'Click the star icon on any document card to pin it here for quick access.'
              : activeTab === 'shared'
              ? 'Documents shared with you by teammates will automatically appear here.'
              : activeTab === 'trash'
              ? 'Deleted documents will be saved here before permanent removal.'
              : 'Create your first document using the "Blank document" template above.'
          }
        />
      ) : isListView ? (
        /* List View */
        <div className="space-y-1">
          <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>Document Name</span>
            <div className="flex items-center gap-6">
              <span className="hidden sm:inline w-28">Owner</span>
              <span className="w-28 text-right">
                {activeTab === 'trash' ? 'Deleted Date' : 'Last Modified'}
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
        /* Responsive Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setShowFolderModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1e2024] p-6 shadow-2xl border border-slate-200 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Create folder</h3>
              </div>
              <button
                onClick={() => setShowFolderModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolderSubmit} className="mt-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder title"
                autoFocus
                className="w-full text-xs font-medium border border-slate-300 dark:border-neutral-700 bg-white dark:bg-[#25282e] text-slate-900 dark:text-white placeholder-slate-400 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 shadow-xs"
              />

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingFolder || !newFolderName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-xs disabled:opacity-60 cursor-pointer"
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
