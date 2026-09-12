import React, { useState } from 'react';
import DocumentCard from './DocumentCard';
import { LayoutGrid, List, FileText, SearchX, Users } from 'lucide-react';

const DocumentList = ({
  ownedDocs = [],
  sharedDocs = [],
  onDeleteDocument,
  searchQuery,
  activeTab = 'owned',
  setActiveTab
}) => {
  const [isListView, setIsListView] = useState(false);

  // Active documents to display based on selected tab
  const currentDocs = activeTab === 'shared' ? sharedDocs : ownedDocs;

  // Filter documents by title
  const filteredDocs = currentDocs.filter((doc) =>
    (doc.title || 'Untitled document')
      .toLowerCase()
      .includes((searchQuery || '').toLowerCase().trim())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
      {/* Subheader: Tabs & View toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4 mb-6">
        {/* Tab switchers: Owned by me vs Shared with me */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('owned')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
              activeTab === 'owned'
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            My documents ({ownedDocs.length})
          </button>

          <button
            onClick={() => setActiveTab('shared')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
              activeTab === 'shared'
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Shared with me ({sharedDocs.length})</span>
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          {searchQuery && (
            <span className="text-xs text-gray-500">
              Results for "{searchQuery}"
            </span>
          )}

          {/* Grid / List view toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setIsListView(false)}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                !isListView
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsListView(true)}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                isListView
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {searchQuery ? (
            <>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                <SearchX className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-700">No documents match your search</p>
              <p className="text-xs text-gray-500 mt-1">Try a different title or keyword</p>
            </>
          ) : activeTab === 'shared' ? (
            <>
              <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-3">
                <Users className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-gray-800">No shared documents</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Documents shared with you by other collaborators will appear here.
              </p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-[#1a73e8] mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-gray-800">No documents yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Click "+ Blank document" above to create your first document
              </p>
            </>
          )}
        </div>
      ) : isListView ? (
        /* List View */
        <div className="space-y-1">
          <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Name</span>
            <div className="flex items-center gap-10">
              <span className="hidden sm:inline">Owner</span>
              <span className="w-24 text-right">Last opened</span>
              <span className="w-6"></span>
            </div>
          </div>
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc._id}
              doc={doc}
              onDelete={onDeleteDocument}
              isListView={true}
              isShared={activeTab === 'shared'}
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
              isListView={false}
              isShared={activeTab === 'shared'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
