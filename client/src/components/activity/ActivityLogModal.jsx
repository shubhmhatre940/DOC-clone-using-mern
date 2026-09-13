import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  X,
  FilePlus,
  Edit3,
  Share2,
  MessageSquare,
  RotateCcw,
  Globe,
  UserX,
  UserCheck,
  Clock,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { getActivityLog } from '../../api/activity';

function formatTimestamp(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const USER_COLORS = [
  '#ea4335', '#4285f4', '#34a853', '#fbbc05',
  '#9333ea', '#ec4899', '#f97316', '#06b6d4'
];

function getUserColor(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

function getInitials(name = '') {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
}

function getActionBadge(action) {
  switch (action) {
    case 'created':
      return {
        icon: FilePlus,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        label: 'Created'
      };
    case 'renamed':
      return {
        icon: Edit3,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        label: 'Renamed'
      };
    case 'shared':
      return {
        icon: Share2,
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        label: 'Shared'
      };
    case 'role_changed':
      return {
        icon: UserCheck,
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        label: 'Role Changed'
      };
    case 'removed_collaborator':
      return {
        icon: UserX,
        color: 'text-rose-600 bg-rose-50 border-rose-200',
        label: 'Removed Access'
      };
    case 'visibility_changed':
      return {
        icon: Globe,
        color: 'text-teal-600 bg-teal-50 border-teal-200',
        label: 'Visibility'
      };
    case 'commented':
      return {
        icon: MessageSquare,
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        label: 'Comment'
      };
    case 'restored_version':
      return {
        icon: RotateCcw,
        color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
        label: 'Restored Version'
      };
    default:
      return {
        icon: Clock,
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        label: 'Activity'
      };
  }
}

const ActivityLogModal = ({ isOpen, onClose, docId, currentUserId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchActivities = useCallback(
    async (targetPage = 1, append = false) => {
      if (!docId) return;
      try {
        if (targetPage === 1) setLoading(true);
        else setLoadingMore(true);

        const data = await getActivityLog(docId, targetPage, 25);
        if (append) {
          setActivities((prev) => [...prev, ...(data.activities || [])]);
        } else {
          setActivities(data.activities || []);
        }
        setPage(data.page || 1);
        setTotalPages(data.pages || 1);
      } catch (err) {
        console.error('Failed to fetch activity log:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [docId]
  );

  useEffect(() => {
    if (isOpen && docId) {
      fetchActivities(1, false);
    }
  }, [isOpen, docId, fetchActivities]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-none">Activity Log</h2>
              <p className="text-[11px] text-gray-500 mt-1">Audit trail of changes, comments, and sharing</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fetchActivities(1, false)}
              disabled={loading}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer"
              title="Refresh log"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-7 h-7 text-blue-600 animate-spin mb-2" />
              <span className="text-xs font-medium text-gray-500">Loading activity trail...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">No activities logged yet</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Actions like renaming, sharing, commenting, and restoring versions will be recorded here.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 space-y-4">
              {activities.map((item) => {
                const uName = item.userId?.name || 'Anonymous';
                const isCurrent = currentUserId && item.userId?._id?.toString() === currentUserId.toString();
                const badge = getActionBadge(item.action);
                const ActionIcon = badge.icon;
                const uColor = getUserColor(uName);

                return (
                  <div key={item._id} className="relative flex items-start gap-3 group">
                    {/* Timeline bullet icon */}
                    <div
                      className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center text-[10px] text-blue-600 shadow-2xs group-hover:scale-110 transition-transform"
                    >
                      <ActionIcon className="w-2.5 h-2.5" />
                    </div>

                    {/* Card box */}
                    <div className="flex-1 bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-3 shadow-2xs transition-all">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                            style={{ backgroundColor: uColor }}
                          >
                            {getInitials(uName)}
                          </div>
                          <span className="text-xs font-semibold text-gray-800 truncate">
                            {uName}
                            {isCurrent && <span className="text-[10px] text-gray-400 font-normal ml-1">(you)</span>}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.color}`}
                        >
                          <ActionIcon className="w-2.5 h-2.5" />
                          {badge.label}
                        </span>
                        <p className="text-xs text-gray-700 break-words leading-relaxed">
                          {item.details || badge.label}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load more button */}
          {!loading && page < totalPages && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => fetchActivities(page + 1, true)}
                disabled={loadingMore}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {loadingMore ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> : null}
                Load earlier activities
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
          <span>Audit trail updates automatically on actions</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogModal;
