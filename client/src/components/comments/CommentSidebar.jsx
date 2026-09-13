import React, { useState, useRef } from 'react';
import CommentCard from './CommentCard';
import MentionDropdown from './MentionDropdown';
import { MessageSquare, X, CheckCircle2, MessageCircle, Send } from 'lucide-react';

const CommentSidebar = ({
  isOpen,
  onClose,
  comments = [],
  collaborators = [],
  currentUserId,
  currentUserName,
  userRole = 'viewer',
  onResolve,
  onReopen,
  onReply,
  onDelete,
  onEdit,
  newCommentDraft,
  onCancelNewComment,
  onCreateComment,
  highlightedCommentId,
  onSelectComment
}) => {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'resolved'
  const [draftText, setDraftText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionedUserIds, setMentionedUserIds] = useState(new Set());
  const textareaRef = useRef(null);

  if (!isOpen) return null;

  const activeComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);
  const displayedComments = activeTab === 'active' ? activeComments : resolvedComments;

  const handleTextChange = (e) => {
    const val = e.target.value;
    const cursorPos = e.target.selectionStart;
    setDraftText(val);

    const textBefore = val.slice(0, cursorPos);
    const match = textBefore.match(/@([a-zA-Z0-9_\s]*)$/);
    if (match) {
      setMentionQuery(match[1]);
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (user) => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart;
    const textBefore = draftText.slice(0, cursorPos);
    const textAfter = draftText.slice(cursorPos);

    const replaced = textBefore.replace(/@([a-zA-Z0-9_\s]*)$/, `@${user.name} `);
    setDraftText(replaced + textAfter);
    setMentionedUserIds((prev) => new Set(prev).add(user._id));
    setMentionQuery(null);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const nextPos = replaced.length;
        textareaRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 10);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!draftText.trim() || submitting) return;
    try {
      setSubmitting(true);
      await onCreateComment({
        text: draftText.trim(),
        selectedText: newCommentDraft?.selectedText || '',
        selectionRange: newCommentDraft?.selectionRange || { from: 0, to: 0 },
        mentionedUserIds: Array.from(mentionedUserIds)
      });
      setDraftText('');
      setMentionedUserIds(new Set());
      setMentionQuery(null);
      onCancelNewComment();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="w-80 md:w-88 shrink-0 bg-gray-50 border-l border-gray-200 flex flex-col h-full z-20 shadow-xs animate-in slide-in-from-right-4 duration-200">
      {/* Sidebar Header */}
      <div className="p-3.5 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-800">Comments</h2>
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-full">
            {comments.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          title="Close comments"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs: Active vs Resolved */}
      <div className="flex items-center border-b border-gray-200 bg-white px-3 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`py-2 px-3 border-b-2 transition cursor-pointer ${
            activeTab === 'active'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Active ({activeComments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('resolved')}
          className={`py-2 px-3 border-b-2 transition cursor-pointer ${
            activeTab === 'resolved'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Resolved ({resolvedComments.length})
        </button>
      </div>

      {/* Main Comment Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* New Comment Draft Box (triggered by selecting text in document) */}
        {newCommentDraft && (
          <div className="p-3 bg-white rounded-xl border-2 border-blue-400 shadow-sm animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                New Comment
              </span>
              <button
                type="button"
                onClick={onCancelNewComment}
                className="text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {newCommentDraft.selectedText && (
              <div className="mb-2.5 pl-2 py-1 border-l-2 border-amber-400 bg-amber-50/50 rounded-r text-[11px] text-gray-600 italic line-clamp-2">
                "{newCommentDraft.selectedText}"
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-2 relative">
              {mentionQuery !== null && (
                <MentionDropdown
                  collaborators={collaborators}
                  query={mentionQuery}
                  onSelect={handleSelectMention}
                  onClose={() => setMentionQuery(null)}
                  position="bottom"
                />
              )}
              <textarea
                ref={textareaRef}
                value={draftText}
                onChange={handleTextChange}
                placeholder="Type your comment... (Type '@' to mention)"
                rows={3}
                className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                autoFocus
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={onCancelNewComment}
                  className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!draftText.trim() || submitting}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  <Send className="w-3 h-3" />
                  Comment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of comments */}
        {displayedComments.length > 0 ? (
          displayedComments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              collaborators={collaborators}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              userRole={userRole}
              onResolve={onResolve}
              onReopen={onReopen}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              isHighlighted={highlightedCommentId === comment._id}
              onCardClick={() => onSelectComment?.(comment)}
            />
          ))
        ) : (
          !newCommentDraft && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 px-4">
              {activeTab === 'active' ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">No active comments</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Select any text in the document and click the comment icon to start a discussion.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">No resolved comments</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Resolved comment threads will be archived here.
                  </p>
                </>
              )}
            </div>
          )
        )}
      </div>
    </aside>
  );
};

export default CommentSidebar;
