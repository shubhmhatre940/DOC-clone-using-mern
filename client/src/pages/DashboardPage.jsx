import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import TemplateHeader from '../components/dashboard/TemplateHeader';
import DocumentList from '../components/dashboard/DocumentList';
import {
  getDocuments,
  deleteDocument,
  restoreDocument,
  permanentDeleteDocument,
  toggleStarDocument,
  searchDocuments
} from '../api/documents';
import { getFolders, createFolder, deleteFolder } from '../api/folders';
import { Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [starredDocs, setStarredDocs] = useState([]);
  const [trashDocs, setTrashDocs] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null); // null = all, or folder ID

  const [activeTab, setActiveTab] = useState('owned'); // 'owned' | 'shared' | 'starred' | 'trash'
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

  // Debounced backend search across document titles & content
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

  // Soft delete: move to trash
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

  // Restore soft-deleted document from trash
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

  // Permanent delete from trash
  const handlePermanentDeleteDocument = async (id) => {
    await permanentDeleteDocument(id);
    setTrashDocs((prev) => prev.filter((d) => d._id !== id));
  };

  // Toggle star
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

  // Move document to folder
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
    // Refresh folder counts
    getFolders().then((f) => setFolders(f)).catch(console.error);
  };

  // Create new folder
  const handleCreateFolder = async (name) => {
    const created = await createFolder({ name });
    setFolders((prev) => [...prev, { ...created, docCount: 0 }]);
    return created;
  };

  // Delete folder
  const handleDeleteFolder = async (folderId) => {
    await deleteFolder(folderId);
    setFolders((prev) => prev.filter((f) => f._id !== folderId));
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
    // Refresh owned docs as their folderId is now cleared to null
    const updated = await getDocuments({ type: 'owned' });
    setOwnedDocs(updated);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Search & User Bar */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Start a new document section (hidden when searching or viewing trash) */}
      {!searchQuery && activeTab !== 'trash' && <TemplateHeader />}

      {/* Main Recent Documents List */}
      <main className="flex-1 bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
            <p className="text-xs text-gray-500 font-medium">Loading documents...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto my-12 p-4 rounded-xl bg-red-50 text-red-700 text-sm text-center border border-red-200">
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
