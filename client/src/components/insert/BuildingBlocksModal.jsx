import React from 'react';
import { X, LayoutGrid, Users, CheckSquare, PenTool, ListOrdered, Code2 } from 'lucide-react';

const BUILDING_BLOCKS = [
  {
    id: 'meeting-notes',
    title: 'Meeting Notes Block',
    description: 'Formatted agenda, attendee list, discussion notes, and action items',
    icon: Users,
    content: `
      <h2>📝 Meeting Notes: [Meeting Title]</h2>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })} | <strong>Time:</strong> 10:00 AM</p>
      <p><strong>Attendees:</strong> [Names of participants]</p>
      <hr />
      <h3>Agenda</h3>
      <ul>
        <li>Item 1: Project review and milestones</li>
        <li>Item 2: Challenges and blockers</li>
        <li>Item 3: Next sprint priorities</li>
      </ul>
      <h3>Action Items</h3>
      <ul>
        <li>[ ] Action item 1 (Assigned to: @Person)</li>
        <li>[ ] Action item 2 (Assigned to: @Person)</li>
      </ul>
    `
  },
  {
    id: 'project-status',
    title: 'Project Status Tracker',
    description: 'Executive summary with status banner, key metrics, and risks',
    icon: CheckSquare,
    content: `
      <h2>🚀 Project Status: [Project Name]</h2>
      <p><strong>Status:</strong> <span style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: bold;">ON TRACK</span> | <strong>Target Launch:</strong> Q4 2026</p>
      <hr />
      <h3>Summary</h3>
      <p>Brief summary of progress made during this milestone and upcoming deliverables.</p>
      <h3>Blockers & Risks</h3>
      <p>None at this time.</p>
    `
  },
  {
    id: 'signature-block',
    title: 'Formal Signature Block',
    description: 'Standard sign-off with lines for printed name, title, and date',
    icon: PenTool,
    content: `
      <br /><br />
      <p>Sincerely,</p>
      <br /><br />
      <p>_____________________________________</p>
      <p><strong>[Signatory Full Name]</strong><br />
      [Job Title or Position]<br />
      [Company or Organization Name]<br />
      Date: ________________________</p>
    `
  },
  {
    id: 'table-of-contents',
    title: 'Table of Contents Placeholder',
    description: 'Pre-formatted outline structure with chapter and section links',
    icon: ListOrdered,
    content: `
      <h2>Table of Contents</h2>
      <ol>
        <li><strong>1. Introduction</strong> ................................................................ Page 1</li>
        <li><strong>2. Background & Objectives</strong> .................................... Page 2</li>
        <li><strong>3. Methodology & Architecture</strong> .............................. Page 4</li>
        <li><strong>4. Findings & Analysis</strong> ............................................ Page 7</li>
        <li><strong>5. Conclusion & Next Steps</strong> ................................... Page 10</li>
      </ol>
      <hr />
    `
  }
];

const BuildingBlocksModal = ({ isOpen, onClose, editor }) => {
  if (!isOpen) return null;

  const handleInsertBlock = (snippet) => {
    if (editor) {
      editor.chain().focus().insertContent(snippet).run();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="building-blocks-modal-title"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-blue-600" />
            <h2 id="building-blocks-modal-title" className="text-base font-semibold text-gray-900">
              Building blocks
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[75vh] overflow-y-auto">
          {BUILDING_BLOCKS.map((block) => {
            const Icon = block.icon;
            return (
              <button
                key={block.id}
                type="button"
                onClick={() => handleInsertBlock(block.content)}
                className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 text-left transition flex flex-col justify-between cursor-pointer group shadow-2xs active:scale-[0.98]"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
                    {block.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    {block.description}
                  </p>
                </div>
                <span className="mt-3 text-[11px] font-semibold text-blue-600 group-hover:underline inline-block">
                  Click to insert snippet →
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BuildingBlocksModal;
