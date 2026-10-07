import React from 'react';
import {
  FileText,
  Users,
  Star,
  Trash2,
  FolderOpen,
  Plus
} from 'lucide-react';

const icons = {
  owned: FileText,
  shared: Users,
  starred: Star,
  trash: Trash2,
  folder: FolderOpen
};

export const EmptyState = ({ type = 'owned', title, description, actionLabel, onAction }) => {
  const IconComponent = icons[type] || FileText;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-sm mx-auto animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-neutral-800/80 border border-slate-200/80 dark:border-neutral-700/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-sm">
        <IconComponent className="w-8 h-8 stroke-[1.5]" />
      </div>

      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
        {title || 'No documents found'}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
        {description || 'There are no documents to display right now.'}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
