import React from 'react';

export const DocumentCardSkeleton = () => {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-[#1e2024] overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-100 dark:bg-[#161719] flex items-center justify-center p-4">
        <div className="w-28 h-36 bg-slate-200 dark:bg-neutral-800 rounded shadow-xs p-2.5 flex flex-col gap-2">
          <div className="h-2 w-3/4 bg-slate-300 dark:bg-neutral-700 rounded"></div>
          <div className="h-1.5 w-full bg-slate-300 dark:bg-neutral-700 rounded"></div>
          <div className="h-1.5 w-5/6 bg-slate-300 dark:bg-neutral-700 rounded"></div>
          <div className="h-1.5 w-2/3 bg-slate-300 dark:bg-neutral-700 rounded"></div>
        </div>
      </div>
      <div className="p-3.5 flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-neutral-800 shrink-0"></div>
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-3/4 bg-slate-200 dark:bg-neutral-800 rounded"></div>
          <div className="h-2.5 w-1/2 bg-slate-150 dark:bg-neutral-850 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const DocumentListSkeleton = ({ count = 5 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <DocumentCardSkeleton key={i} />
      ))}
    </div>
  );
};
