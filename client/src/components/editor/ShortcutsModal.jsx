import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

const SHORTCUT_GROUPS = [
  {
    title: 'Text formatting',
    shortcuts: [
      { label: 'Bold', keys: ['Ctrl', 'B'] },
      { label: 'Italic', keys: ['Ctrl', 'I'] },
      { label: 'Underline', keys: ['Ctrl', 'U'] },
      { label: 'Strikethrough', keys: ['Alt', 'Shift', '5'] }
    ]
  },
  {
    title: 'Editing',
    shortcuts: [
      { label: 'Undo', keys: ['Ctrl', 'Z'] },
      { label: 'Redo', keys: ['Ctrl', 'Y'] },
      { label: 'Cut', keys: ['Ctrl', 'X'] },
      { label: 'Copy', keys: ['Ctrl', 'C'] },
      { label: 'Paste', keys: ['Ctrl', 'V'] },
      { label: 'Select all', keys: ['Ctrl', 'A'] }
    ]
  },
  {
    title: 'Document & Application',
    shortcuts: [
      { label: 'Save', keys: ['Ctrl', 'S'] },
      { label: 'Print', keys: ['Ctrl', 'P'] },
      { label: 'Keyboard shortcuts', keys: ['Ctrl', '/'] }
    ]
  }
];

const ShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-2 text-gray-800 font-semibold text-base">
            <Keyboard className="w-5 h-5 text-blue-600" />
            <span>Keyboard shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                {group.title}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((sc) => (
                  <div
                    key={sc.label}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-50 transition text-sm"
                  >
                    <span className="text-gray-700">{sc.label}</span>
                    <div className="flex items-center gap-1">
                      {sc.keys.map((k, idx) => (
                        <React.Fragment key={k}>
                          <kbd className="min-w-[24px] h-6 px-1.5 flex items-center justify-center rounded bg-gray-100 border border-gray-300 text-xs font-mono font-medium text-gray-700 shadow-xs">
                            {k}
                          </kbd>
                          {idx < sc.keys.length - 1 && <span className="text-gray-400 text-xs">+</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
          <span>Press <kbd className="font-mono bg-gray-200 px-1 py-0.5 rounded text-[11px]">Esc</kbd> to close</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-white border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
