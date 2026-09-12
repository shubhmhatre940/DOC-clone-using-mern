import React from 'react';

/**
 * Clean wireframe CSS-rendered previews of document templates mimicking Google Docs layout
 */
const TemplatePreviewCard = ({ type }) => {
  switch (type) {
    case 'resume':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-start bg-white select-none overflow-hidden text-[6px]">
          {/* Header */}
          <div className="w-16 h-1.5 bg-blue-600 rounded-xs mb-1"></div>
          <div className="w-24 h-1 bg-gray-300 rounded-xs mb-2"></div>
          <div className="w-full h-[0.5px] bg-gray-200 mb-1.5"></div>

          {/* Section 1 */}
          <div className="w-10 h-1 bg-gray-600 rounded-xs mb-1"></div>
          <div className="w-full h-0.5 bg-gray-200 rounded-xs mb-0.5"></div>
          <div className="w-5/6 h-0.5 bg-gray-200 rounded-xs mb-1.5"></div>

          {/* Section 2 */}
          <div className="w-12 h-1 bg-gray-600 rounded-xs mb-1"></div>
          <div className="w-full h-0.5 bg-gray-200 rounded-xs mb-0.5"></div>
          <div className="w-4/5 h-0.5 bg-gray-200 rounded-xs mb-0.5"></div>
          <div className="w-3/4 h-0.5 bg-gray-200 rounded-xs mb-1.5"></div>

          {/* Section 3 */}
          <div className="w-9 h-1 bg-gray-600 rounded-xs mb-1"></div>
          <div className="w-full h-0.5 bg-gray-200 rounded-xs mb-0.5"></div>
          <div className="w-2/3 h-0.5 bg-gray-200 rounded-xs"></div>
        </div>
      );

    case 'report':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-start bg-white select-none overflow-hidden">
          {/* Title banner */}
          <div className="w-20 h-2 bg-indigo-600 rounded-xs mb-1"></div>
          <div className="w-14 h-1 bg-gray-400 rounded-xs mb-2"></div>

          {/* Table of contents block */}
          <div className="bg-gray-50 border border-gray-100 p-1 rounded-xs mb-2">
            <div className="w-10 h-0.5 bg-gray-400 rounded-xs mb-0.5"></div>
            <div className="w-16 h-0.5 bg-gray-300 rounded-xs mb-0.5"></div>
            <div className="w-14 h-0.5 bg-gray-300 rounded-xs"></div>
          </div>

          {/* Body paragraphs */}
          <div className="w-12 h-1 bg-gray-700 rounded-xs mb-1"></div>
          <div className="w-full h-0.5 bg-gray-200 rounded-xs mb-0.5"></div>
          <div className="w-full h-0.5 bg-gray-200 rounded-xs mb-0.5"></div>
          <div className="w-4/5 h-0.5 bg-gray-200 rounded-xs mb-1"></div>
          <div className="w-full h-0.5 bg-gray-200 rounded-xs mb-0.5"></div>
          <div className="w-3/4 h-0.5 bg-gray-200 rounded-xs"></div>
        </div>
      );

    case 'proposal':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-start bg-white select-none overflow-hidden">
          <div className="w-18 h-2 bg-emerald-600 rounded-xs mb-1"></div>
          <div className="w-12 h-1 bg-gray-300 rounded-xs mb-2"></div>
          <div className="w-10 h-1 bg-gray-700 rounded-xs mb-1"></div>
          <div className="w-full h-0.5 bg-gray-200 rounded-xs mb-0.5"></div>
          <div className="w-5/6 h-0.5 bg-gray-200 rounded-xs mb-1.5"></div>

          {/* Grid / Timeline representation */}
          <div className="grid grid-cols-2 gap-1 mb-1.5">
            <div className="h-4 bg-emerald-50 border border-emerald-100 rounded-xs p-0.5">
              <div className="w-6 h-0.5 bg-emerald-500 mb-0.5"></div>
              <div className="w-full h-0.5 bg-gray-200"></div>
            </div>
            <div className="h-4 bg-emerald-50 border border-emerald-100 rounded-xs p-0.5">
              <div className="w-6 h-0.5 bg-emerald-500 mb-0.5"></div>
              <div className="w-full h-0.5 bg-gray-200"></div>
            </div>
          </div>
          <div className="w-full h-0.5 bg-gray-200 rounded-xs"></div>
        </div>
      );

    case 'brochure':
      return (
        <div className="w-full h-full p-1.5 flex flex-col justify-start bg-white select-none overflow-hidden">
          <div className="w-full h-2 bg-amber-500 rounded-xs mb-1.5"></div>
          <div className="flex-1 grid grid-cols-3 gap-1">
            <div className="bg-amber-50/50 border border-amber-100/50 p-0.5 rounded-xs flex flex-col">
              <div className="w-full h-3 bg-amber-200/60 rounded-xs mb-0.5"></div>
              <div className="w-full h-0.5 bg-gray-300 mb-0.5"></div>
              <div className="w-3/4 h-0.5 bg-gray-200"></div>
            </div>
            <div className="bg-amber-50/50 border border-amber-100/50 p-0.5 rounded-xs flex flex-col">
              <div className="w-full h-3 bg-amber-200/60 rounded-xs mb-0.5"></div>
              <div className="w-full h-0.5 bg-gray-300 mb-0.5"></div>
              <div className="w-3/4 h-0.5 bg-gray-200"></div>
            </div>
            <div className="bg-amber-50/50 border border-amber-100/50 p-0.5 rounded-xs flex flex-col">
              <div className="w-full h-3 bg-amber-200/60 rounded-xs mb-0.5"></div>
              <div className="w-full h-0.5 bg-gray-300 mb-0.5"></div>
              <div className="w-3/4 h-0.5 bg-gray-200"></div>
            </div>
          </div>
        </div>
      );

    case 'meeting':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-start bg-white select-none overflow-hidden">
          <div className="w-16 h-1.5 bg-rose-600 rounded-xs mb-1"></div>
          <div className="w-20 h-1 bg-gray-300 rounded-xs mb-2"></div>
          {/* Attendees bullet list */}
          <div className="space-y-0.5 mb-1.5">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-rose-400"></div>
              <div className="w-14 h-0.5 bg-gray-300"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-rose-400"></div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
            </div>
          </div>
          <div className="w-10 h-1 bg-gray-700 rounded-xs mb-1"></div>
          <div className="w-full h-0.5 bg-gray-200 mb-0.5"></div>
          <div className="w-5/6 h-0.5 bg-gray-200"></div>
        </div>
      );

    case 'letter':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-start bg-white select-none overflow-hidden">
          <div className="w-12 h-1 bg-gray-400 rounded-xs mb-1"></div>
          <div className="w-16 h-0.5 bg-gray-300 rounded-xs mb-2"></div>
          <div className="w-10 h-0.5 bg-gray-300 rounded-xs mb-2"></div>
          <div className="w-8 h-1 bg-gray-600 rounded-xs mb-1.5"></div>
          <div className="w-full h-0.5 bg-gray-200 rounded-xs mb-0.5"></div>
          <div className="w-full h-0.5 bg-gray-200 rounded-xs mb-0.5"></div>
          <div className="w-4/5 h-0.5 bg-gray-200 rounded-xs mb-2"></div>
          <div className="w-full h-0.5 bg-gray-200 rounded-xs mb-0.5"></div>
          <div className="w-3/4 h-0.5 bg-gray-200 rounded-xs mb-3"></div>
          <div className="w-8 h-1 bg-gray-400 rounded-xs"></div>
        </div>
      );

    default:
      return (
        <div className="w-full h-full p-2 flex flex-col justify-start bg-white select-none overflow-hidden">
          <div className="w-14 h-1.5 bg-gray-500 rounded-xs mb-2"></div>
          <div className="w-full h-0.5 bg-gray-200 rounded-xs mb-1"></div>
          <div className="w-5/6 h-0.5 bg-gray-200 rounded-xs mb-1"></div>
          <div className="w-4/6 h-0.5 bg-gray-200 rounded-xs"></div>
        </div>
      );
  }
};

export default TemplatePreviewCard;
