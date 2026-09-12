import React, { useMemo } from 'react';
import { X, FileText, User, Calendar, Clock, Hash, Users, Shield } from 'lucide-react';

const DocumentDetailsModal = ({
  isOpen,
  onClose,
  documentData,
  title,
  content = ''
}) => {
  if (!isOpen) return null;

  // Compute word and character counts from HTML/editor content
  const { wordCount, charCount } = useMemo(() => {
    if (!content) return { wordCount: 0, charCount: 0 };
    // Strip HTML tags and extract clean text
    const text = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim();

    const charCount = text.length;
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    return { wordCount, charCount };
  }, [content]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const owner = documentData?.owner;
  const ownerName = owner?.name || (typeof owner === 'string' ? 'Owner' : 'Unknown');
  const ownerEmail = owner?.email || '';
  const collaborators = documentData?.collaborators || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-800 font-semibold text-base">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Document details</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 text-sm text-gray-700 max-h-[75vh] overflow-y-auto">
          {/* Document Title */}
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Title
            </span>
            <p className="font-medium text-gray-900 break-words">
              {title || documentData?.title || 'Untitled document'}
            </p>
          </div>

          {/* Owner */}
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Owner
            </span>
            <div className="flex items-center gap-2 text-gray-800">
              <User className="w-4 h-4 text-gray-500 shrink-0" />
              <span>
                {ownerName} {ownerEmail ? `(${ownerEmail})` : ''}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            {/* Created At */}
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Created
              </span>
              <div className="flex items-start gap-1.5 text-xs text-gray-800">
                <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                <span>{formatDate(documentData?.createdAt)}</span>
              </div>
            </div>

            {/* Last Modified */}
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Modified
              </span>
              <div className="flex items-start gap-1.5 text-xs text-gray-800">
                <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                <span>{formatDate(documentData?.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Content Statistics (Word & Character count) */}
          <div className="pt-2 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Content Statistics
            </span>
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500">Words</div>
                  <div className="text-base font-semibold text-gray-800">{wordCount.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-emerald-500" />
                <div>
                  <div className="text-xs text-gray-500">Characters</div>
                  <div className="text-base font-semibold text-gray-800">{charCount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Collaborators List & Roles */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                Collaborators ({collaborators.length})
              </span>
            </div>

            {collaborators.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No collaborators added yet.</p>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {collaborators.map((c, index) => {
                  const collabUser = c.userId;
                  const name = collabUser?.name || 'User';
                  const email = collabUser?.email || '';
                  const role = c.role || 'viewer';

                  return (
                    <div
                      key={c._id || index}
                      className="flex items-center justify-between p-2 rounded bg-gray-50 text-xs border border-gray-100"
                    >
                      <div className="truncate pr-2">
                        <span className="font-medium text-gray-800 block truncate">{name}</span>
                        {email && <span className="text-gray-500 block truncate">{email}</span>}
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize bg-blue-50 text-blue-700 shrink-0">
                        <Shield className="w-3 h-3" />
                        {role}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-white border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailsModal;
