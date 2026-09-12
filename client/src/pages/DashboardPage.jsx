import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import TemplateHeader from '../components/dashboard/TemplateHeader';
import DocumentList from '../components/dashboard/DocumentList';
import { getDocuments, deleteDocument } from '../api/documents';
import { Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [activeTab, setActiveTab] = useState('owned'); // 'owned' | 'shared'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const [owned, shared] = await Promise.all([
        getDocuments({ type: 'owned' }),
        getDocuments({ type: 'shared' })
      ]);
      setOwnedDocs(owned);
      setSharedDocs(shared);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError('Failed to load documents. Please check your network or login session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDeleteDocument = async (id) => {
    await deleteDocument(id);
    setOwnedDocs((prev) => prev.filter((d) => d._id !== id));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Search & User Bar */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Start a new document section */}
      <TemplateHeader />

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
            onDeleteDocument={handleDeleteDocument}
            searchQuery={searchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
