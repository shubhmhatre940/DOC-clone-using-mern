import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Clock,
  User,
  Plus,
  Check,
  X,
  Loader2,
  Calendar,
  FileText
} from 'lucide-react';
import { getVersions, getVersion, createVersion, restoreVersion } from '../../api/versions';

function formatVersionDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (isToday) {
    return `Today, ${timeStr}`;
  }
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}, ${timeStr}`;
}

const VersionHistoryModal = ({
  isOpen,
  onClose,
  docId,
  currentTitle,
  currentContent,
  canRestore = true,
  onRestoreSuccess
}) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [selectedVersionData, setSelectedVersionData] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [namingOpen, setNamingOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [namingLoading, setNamingLoading] = useState(false);

  // Load versions on open
  useEffect(() => {
    if (!isOpen || !docId) return;

    const loadVersionsList = async () => {
      try {
        setLoading(true);
        const list = await getVersions(docId);
        setVersions(list || []);
        if (list && list.length > 0) {
          setSelectedVersionId(list[0]._id);
          setSelectedVersionData(list[0]);
        }
      } catch (err) {
        console.error('Failed to load version history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVersionsList();
  }, [isOpen, docId]);

  // When selected version changes, fetch full version details if content is missing
  useEffect(() => {
    if (!selectedVersionId || !docId) return;

    const loadDetails = async () => {
      // If already has content loaded in state
      const cached = versions.find((v) => v._id === selectedVersionId);
      if (cached && cached.content !== undefined) {
        setSelectedVersionData(cached);
        return;
      }

      try {
        setFetchingDetails(true);
        const data = await getVersion(docId, selectedVersionId);
        setSelectedVersionData(data);
        // update local list cache
        setVersions((prev) =>
          prev.map((v) => (v._id === selectedVersionId ? { ...v, content: data.content } : v))
        );
      } catch (err) {
        console.error('Failed to load version details:', err);
      } finally {
        setFetchingDetails(false);
      }
    };

    loadDetails();
  }, [selectedVersionId, docId, versions]);

  if (!isOpen) return null;

  const isLatestVersion = versions.length > 0 && versions[0]._id === selectedVersionId;

  const handleRestore = async () => {
    if (!selectedVersionId) return;
    const confirmMsg = `Restore this version from ${formatVersionDate(selectedVersionData?.createdAt)}?\nYour current document content will be replaced.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setRestoring(true);
      const res = await restoreVersion(docId, selectedVersionId);
      if (onRestoreSuccess) {
        onRestoreSuccess(res.document);
      }
      onClose();
    } catch (err) {
      console.error('Restore failed:', err);
      alert(err.response?.data?.message || 'Failed to restore this version');
    } finally {
      setRestoring(false);
    }
  };

  const handleSaveNamedVersion = async (e) => {
    e.preventDefault();
    if (!customName.trim()) return;

    try {
      setNamingLoading(true);
      const newVer = await createVersion(docId, {
        versionName: customName.trim(),
        title: currentTitle,
        content: currentContent
      });
      setVersions((prev) => [newVer, ...prev]);
      setSelectedVersionId(newVer._id);
      setSelectedVersionData(newVer);
      setCustomName('');
      setNamingOpen(false);
    } catch (err) {
      console.error('Failed to name version:', err);
      alert(err.response?.data?.message || 'Failed to name version');
    } finally {
      setNamingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8f9fa] flex flex-col text-gray-800 animate-in fade-in duration-150">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer"
            title="Back to editor"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-tight">
              {currentTitle || 'Untitled document'}
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              Version history
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {!isLatestVersion && canRestore && (
            <button
              type="button"
              onClick={handleRestore}
              disabled={restoring}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              {restoring ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Restore this version
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left/Center: Document Snapshot Preview */}
        <div className="flex-1 flex flex-col bg-[#f8f9fa] overflow-y-auto">
          {/* Version banner */}
          {selectedVersionData && (
            <div className="bg-blue-50 border-b border-blue-100 px-6 py-2.5 flex items-center justify-between text-xs text-blue-900">
              <span className="font-medium">
                {isLatestVersion ? 'Current version' : 'Past snapshot'}:{' '}
                {formatVersionDate(selectedVersionData.createdAt)}
                {selectedVersionData.createdBy?.name && ` • by ${selectedVersionData.createdBy.name}`}
              </span>
              {selectedVersionData.versionName && (
                <span className="bg-blue-200/70 text-blue-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                  {selectedVersionData.versionName}
                </span>
              )}
            </div>
          )}

          {/* Paper Canvas */}
          <div className="flex-1 p-8 flex justify-center">
            <div className="w-full max-w-[816px] min-h-[1056px] bg-white rounded-xs shadow-[0_1px_3px_1px_rgba(60,64,67,0.15)] border border-gray-200 px-12 sm:px-16 py-16">
              {fetchingDetails ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                  <p className="text-sm">Loading version content...</p>
                </div>
              ) : selectedVersionData?.content ? (
                <div
                  className="prose max-w-none text-gray-900 focus:outline-none leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedVersionData.content }}
                />
              ) : (
                <div className="text-center py-24 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 stroke-[1.5]" />
                  <p className="text-sm">This version had no text content.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Version List */}
        <aside className="w-80 shrink-0 bg-white border-l border-gray-200 flex flex-col h-full z-10 shadow-xs">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <h2 className="text-sm font-semibold text-gray-900">Version history</h2>
            <button
              type="button"
              onClick={() => setNamingOpen((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              title="Name current version"
            >
              <Plus className="w-3.5 h-3.5" />
              Name current version
            </button>
          </div>

          {/* Name current version input modal/dropdown */}
          {namingOpen && (
            <form
              onSubmit={handleSaveNamedVersion}
              className="p-3 bg-blue-50/60 border-b border-blue-100 flex flex-col gap-2"
            >
              <p className="text-xs font-medium text-gray-700">Name current document version:</p>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Draft 1, Final version..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNamingOpen(false)}
                  className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200/60 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customName.trim() || namingLoading}
                  className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {namingLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          )}

          {/* Version List Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                <p className="text-xs">Loading versions...</p>
              </div>
            ) : versions.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs">
                <Calendar className="w-8 h-8 mx-auto mb-2 stroke-[1.5]" />
                No version history recorded yet.
              </div>
            ) : (
              versions.map((ver, idx) => {
                const isSelected = ver._id === selectedVersionId;
                const isCurrent = idx === 0;

                return (
                  <button
                    key={ver._id}
                    type="button"
                    onClick={() => setSelectedVersionId(ver._id)}
                    className={`w-full text-left p-3.5 transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    {/* Author Initial Circle */}
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-medium text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {ver.createdBy?.name ? ver.createdBy.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-semibold text-gray-900 truncate">
                          {formatVersionDate(ver.createdAt)}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-green-100 text-green-800 font-semibold px-1.5 py-0.2 rounded">
                            Current
                          </span>
                        )}
                      </div>

                      {ver.versionName && (
                        <p className="text-xs text-blue-700 font-medium truncate mb-0.5">
                          {ver.versionName}
                        </p>
                      )}

                      <p className="text-[11px] text-gray-500 truncate">
                        {ver.createdBy?.name || 'Anonymous user'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default VersionHistoryModal;
