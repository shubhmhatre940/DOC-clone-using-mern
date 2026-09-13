import React, { useState, useRef } from 'react';
import { Check, RotateCcw, Trash2, MessageSquare, Send, MoreVertical, Edit2, X } from 'lucide-react';
import MentionDropdown from './MentionDropdown';

function renderContentWithMentions(text, currentUserName = '') {
  if (!text) return null;
  const parts = text.split(/(@[A-Za-z0-9_.-]+(?:\s+[A-Za-z0-9_.-]+)?)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const mentionName = part.slice(1).trim();
      const isSelfMention =
        currentUserName &&
        mentionName.toLowerCase() === currentUserName.toLowerCase();

      return (
        <span
          key={i}
          className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-xs select-none mx-0.5 transition ${
            isSelfMention
              ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300 font-bold'
              : 'bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200'
          }`}
          title={isSelfMention ? 'You were mentioned' : undefined}
        >
          @{mentionName}
        </span>
      );
    }
    return part;
  });
}

function formatTimestamp(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getInitials(name = '') {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
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

const CommentCard = ({
  comment,
  collaborators = [],
  currentUserId,
  currentUserName,
  userRole = 'viewer',
  onResolve,
  onReopen,
  onReply,
  onDelete,
  onEdit,
  isHighlighted = false,
  onCardClick
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyMentionQuery, setReplyMentionQuery] = useState(null);
  const [replyMentionedIds, setReplyMentionedIds] = useState(new Set());
  const replyInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const authorId = comment.authorId?._id || comment.authorId;
  const isAuthor = currentUserId && authorId?.toString() === currentUserId.toString();
  const isDocOwnerOrEditor = userRole === 'owner' || userRole === 'editor';
  const canDelete = isAuthor || userRole === 'owner';
  const canResolve = isDocOwnerOrEditor;

  const handleReplyTextChange = (e) => {
    const val = e.target.value;
    const cursorPos = e.target.selectionStart;
    setReplyText(val);

    const textBefore = val.slice(0, cursorPos);
    const match = textBefore.match(/@([a-zA-Z0-9_\s]*)$/);
    if (match) {
      setReplyMentionQuery(match[1]);
    } else {
      setReplyMentionQuery(null);
    }
  };

  const handleSelectReplyMention = (user) => {
    if (!replyInputRef.current) return;
    const cursorPos = replyInputRef.current.selectionStart;
    const textBefore = replyText.slice(0, cursorPos);
    const textAfter = replyText.slice(cursorPos);

    const replaced = textBefore.replace(/@([a-zA-Z0-9_\s]*)$/, `@${user.name} `);
    setReplyText(replaced + textAfter);
    setReplyMentionedIds((prev) => new Set(prev).add(user._id));
    setReplyMentionQuery(null);

    setTimeout(() => {
      if (replyInputRef.current) {
        replyInputRef.current.focus();
        const nextPos = replaced.length;
        replyInputRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 10);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmittingReply) return;
    try {
      setIsSubmittingReply(true);
      await onReply(comment._id, {
        text: replyText.trim(),
        mentionedUserIds: Array.from(replyMentionedIds)
      });
      setReplyText('');
      setReplyMentionedIds(new Set());
      setReplyMentionQuery(null);
      setIsReplying(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    await onEdit(comment._id, editText.trim());
    setIsEditing(false);
  };

  const authorName = comment.authorId?.name || 'Anonymous';
  const authorColor = getUserColor(authorName);

  return (
    <div
      onClick={onCardClick}
      className={`p-3.5 rounded-xl border transition-all duration-150 bg-white shadow-xs ${
        isHighlighted
          ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
          : 'border-gray-200 hover:border-gray-300'
      } ${comment.resolved ? 'opacity-75 bg-gray-50/60' : ''}`}
    >
      {/* Header: Author + Timestamp + Actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs"
            style={{ backgroundColor: authorColor }}
          >
            {getInitials(authorName)}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-gray-800 truncate block">
              {authorName}
              {isAuthor && <span className="text-[10px] text-gray-400 font-normal ml-1">(you)</span>}
            </span>
            <span className="text-[10px] text-gray-400 block -mt-0.5">
              {formatTimestamp(comment.createdAt)}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {canResolve && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                comment.resolved ? onReopen(comment._id) : onResolve(comment._id);
              }}
              className={`p-1 rounded-md transition ${
                comment.resolved
                  ? 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
              }`}
              title={comment.resolved ? 'Re-open thread' : 'Mark as resolved'}
            >
              {comment.resolved ? <RotateCcw className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Delete this comment thread?')) {
                  onDelete(comment._id);
                }
              }}
              className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
              title="Delete thread"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Selected quote snippet if text was selected */}
      {comment.selectedText && (
        <div className="mb-2 pl-2.5 py-1 border-l-2 border-amber-400 bg-amber-50/50 rounded-r text-[11px] text-gray-600 italic line-clamp-2">
          "{comment.selectedText}"
        </div>
      )}

      {/* Main Comment Text (or edit mode) */}
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="mb-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full text-xs p-2 border border-blue-400 rounded-md focus:outline-none resize-none"
            rows={2}
            autoFocus
          />
          <div className="flex items-center justify-end gap-1 mt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2.5 py-0.5 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="text-xs text-gray-800 leading-relaxed break-words whitespace-pre-wrap mb-2">
          {renderContentWithMentions(comment.text, currentUserName)}
        </div>
      )}

      {/* Threaded Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2 mt-2 pt-2 border-t border-gray-100 pl-2">
          {comment.replies.map((reply) => {
            const rAuthorName = reply.authorId?.name || 'Anonymous';
            const rAuthorColor = getUserColor(rAuthorName);
            return (
              <div key={reply._id} className="text-xs">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                    style={{ backgroundColor: rAuthorColor }}
                  >
                    {getInitials(rAuthorName)}
                  </div>
                  <span className="font-semibold text-gray-800 text-[11px] truncate">
                    {rAuthorName}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {formatTimestamp(reply.createdAt)}
                  </span>
                </div>
                <div className="text-[11px] text-gray-700 pl-5 whitespace-pre-wrap break-words">
                  {renderContentWithMentions(reply.text, currentUserName)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Button / Inline Form */}
      {!comment.resolved && (
        <div className="mt-2.5 pt-2 border-t border-gray-100">
          {isReplying ? (
            <form onSubmit={handleReplySubmit} className="space-y-1.5 relative">
              {replyMentionQuery !== null && (
                <MentionDropdown
                  collaborators={collaborators}
                  query={replyMentionQuery}
                  onSelect={handleSelectReplyMention}
                  onClose={() => setReplyMentionQuery(null)}
                  position="top"
                />
              )}
              <input
                ref={replyInputRef}
                type="text"
                placeholder="Reply... (Type '@' to mention)"
                value={replyText}
                onChange={handleReplyTextChange}
                className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText('');
                    setReplyMentionQuery(null);
                  }}
                  className="px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSubmittingReply}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  Reply
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsReplying(true);
              }}
              className="text-[11px] text-gray-500 hover:text-blue-600 font-medium inline-flex items-center gap-1 transition cursor-pointer"
            >
              <MessageSquare className="w-3 h-3" />
              Reply
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentCard;
