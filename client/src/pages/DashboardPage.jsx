import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/dashboard/Sidebar';
import TemplateHeader from '../components/dashboard/TemplateHeader';
import DocumentList from '../components/dashboard/DocumentList';
import { ToastContainer } from '../components/ui/Toast';
import { DocumentListSkeleton } from '../components/ui/Skeleton';
import {
  getDocuments,
  deleteDocument,
  restoreDocument,
  permanentDeleteDocument,
  toggleStarDocument,
  searchDocuments
} from '../api/documents';
import { getFolders, createFolder, deleteFolder } from '../api/folders';

const DashboardPage = () => {
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [starredDocs, setStarredDocs] = useState([]);
  const [trashDocs, setTrashDocs] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  const [activeTab, setActiveTab] = useState('owned');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllDocs = useCallback(async () => {
    try {
      setLoading(true);
      const [owned, shared, starred, trash, folderList] = await Promise.all([
        getDocuments({ type: 'owned' }),
        getDocuments({ type: 'shared' }),
        getDocuments({ type: 'starred' }),
        getDocuments({ type: 'trash' }),
        getFolders()
      ]);
      setOwnedDocs(owned);
      setSharedDocs(shared);
      setStarredDocs(starred);
      setTrashDocs(trash);
      setFolders(folderList);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load documents. Please check your network or login session.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDocs();
  }, [fetchAllDocs]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchDocuments(searchQuery.trim());
        setSearchResults(results);
      } catch (err) {
        console.error('Backend search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDeleteDocument = async (id) => {
    await deleteDocument(id);
    const deletedDoc = ownedDocs.find((d) => d._id === id);
    setOwnedDocs((prev) => prev.filter((d) => d._id !== id));
    setStarredDocs((prev) => prev.filter((d) => d._id !== id));
    if (deletedDoc) {
      setTrashDocs((prev) => [{ ...deletedDoc, isDeleted: true, deletedAt: new Date() }, ...prev]);
    }
    if (searchResults) {
      setSearchResults((prev) => prev.filter((d) => d._id !== id));
    }
  };

  const handleRestoreDocument = async (id) => {
    await restoreDocument(id);
    const restoredDoc = trashDocs.find((d) => d._id === id);
    setTrashDocs((prev) => prev.filter((d) => d._id !== id));
    if (restoredDoc) {
      const activeDoc = { ...restoredDoc, isDeleted: false, deletedAt: null };
      setOwnedDocs((prev) => [activeDoc, ...prev]);
      if (activeDoc.isStarred) {
        setStarredDocs((prev) => [activeDoc, ...prev]);
      }
    }
  };

  const handlePermanentDeleteDocument = async (id) => {
    await permanentDeleteDocument(id);
    setTrashDocs((prev) => prev.filter((d) => d._id !== id));
  };

  const handleToggleStar = async (id) => {
    const res = await toggleStarDocument(id);
    const isNowStarred = res.isStarred;

    const updateStarInList = (list) =>
      list.map((d) => (d._id === id ? { ...d, isStarred: isNowStarred } : d));

    setOwnedDocs((prev) => updateStarInList(prev));
    setSharedDocs((prev) => updateStarInList(prev));
    if (searchResults) {
      setSearchResults((prev) => updateStarInList(prev));
    }

    if (isNowStarred) {
      const docToAdd =
        ownedDocs.find((d) => d._id === id) ||
        sharedDocs.find((d) => d._id === id) ||
        searchResults?.find((d) => d._id === id);
      if (docToAdd) {
        setStarredDocs((prev) => [{ ...docToAdd, isStarred: true }, ...prev]);
      }
    } else {
      setStarredDocs((prev) => prev.filter((d) => d._id !== id));
    }
  };

  const handleMovedToFolder = (docId, newFolderId) => {
    setOwnedDocs((prev) =>
      prev.map((d) =>
        d._id === docId
          ? {
              ...d,
              folderId: newFolderId ? folders.find((f) => f._id === newFolderId) || newFolderId : null
            }
          : d
      )
    );
    getFolders().then((f) => setFolders(f)).catch(console.error);
  };

  const handleCreateFolder = async (name) => {
    const created = await createFolder({ name });
    setFolders((prev) => [...prev, { ...created, docCount: 0 }]);
    return created;
  };

  const handleDeleteFolder = async (folderId) => {
    await deleteFolder(folderId);
    setFolders((prev) => prev.filter((f) => f._id !== folderId));
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
    const updated = await getDocuments({ type: 'owned' });
    setOwnedDocs(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#121316] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <ToastContainer />

      {/* Header Bar with Sidebar Trigger */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Collapsible Sidebar Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ownedDocsCount={ownedDocs.length}
        sharedDocsCount={sharedDocs.length}
        starredDocsCount={starredDocs.length}
        trashDocsCount={trashDocs.length}
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
      />

      {/* Template Bar */}
      {!searchQuery && activeTab !== 'trash' && <TemplateHeader />}

      {/* Main Document Grid */}
      <main className="flex-1 bg-slate-50 dark:bg-[#121316] transition-colors duration-200">
        {loading ? (
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
            <DocumentListSkeleton count={5} />
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto my-12 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium text-center border border-rose-200 dark:border-rose-900/60">
            {error}
          </div>
        ) : (
          <DocumentList
            ownedDocs={ownedDocs}
            sharedDocs={sharedDocs}
            starredDocs={starredDocs}
            trashDocs={trashDocs}
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            onCreateFolder={handleCreateFolder}
            onDeleteFolder={handleDeleteFolder}
            onDeleteDocument={handleDeleteDocument}
            onRestoreDocument={handleRestoreDocument}
            onPermanentDeleteDocument={handlePermanentDeleteDocument}
            onToggleStar={handleToggleStar}
            onMovedToFolder={handleMovedToFolder}
            searchQuery={searchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            onClearSearch={() => setSearchQuery('')}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
