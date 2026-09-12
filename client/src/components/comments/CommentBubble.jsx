import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

const CommentBubble = ({ position, onClick, visible = false }) => {
  if (!visible || !position) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%) translateY(-8px)'
      }}
      className="z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-full shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all cursor-pointer text-xs font-medium group"
        title="Add comment"
      >
        <MessageSquarePlus className="w-3.5 h-3.5 text-blue-400 group-hover:text-white transition-colors" />
        <span>Comment</span>
      </button>
    </div>
  );
};

export default CommentBubble;
