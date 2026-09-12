import React, { useState } from 'react';
import { X, Table as TableIcon } from 'lucide-react';

const TableModal = ({ isOpen, onClose, editor }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [withHeader, setWithHeader] = useState(true);
  const [hoverGrid, setHoverGrid] = useState({ r: 0, c: 0 });

  if (!isOpen) return null;

  const handleInsert = (r = rows, c = cols) => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({ rows: r, cols: c, withHeaderRow: withHeader })
        .run();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="table-modal-title"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-blue-600" />
            <h2 id="table-modal-title" className="text-sm font-semibold text-gray-900">
              Insert Table
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

        <div className="p-4 space-y-4 text-xs">
          {/* Visual Grid Picker (up to 8x8) */}
          <div>
            <div className="flex justify-between text-gray-600 mb-1.5 font-medium">
              <span>Quick select grid:</span>
              <span className="text-blue-600 font-semibold">
                {hoverGrid.r > 0 ? `${hoverGrid.r} × ${hoverGrid.c}` : `${rows} × ${cols}`}
              </span>
            </div>
            <div
              className="grid grid-cols-6 gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-xl"
              onMouseLeave={() => setHoverGrid({ r: 0, c: 0 })}
            >
              {Array.from({ length: 36 }).map((_, i) => {
                const rIndex = Math.floor(i / 6) + 1;
                const cIndex = (i % 6) + 1;
                const isHighlighted =
                  hoverGrid.r > 0
                    ? rIndex <= hoverGrid.r && cIndex <= hoverGrid.c
                    : rIndex <= rows && cIndex <= cols;

                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHoverGrid({ r: rIndex, c: cIndex })}
                    onClick={() => handleInsert(rIndex, cIndex)}
                    className={`h-5 rounded-xs transition-colors cursor-pointer border ${
                      isHighlighted
                        ? 'bg-blue-200 border-blue-400'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Explicit Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Rows</label>
              <input
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Columns</label>
              <input
                type="number"
                min="1"
                max="12"
                value={cols}
                onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={withHeader}
              onChange={(e) => setWithHeader(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-blue-600 border-gray-300"
            />
            <span className="text-gray-700">Include header row</span>
          </label>

          <div className="pt-2 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleInsert(rows, cols)}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs"
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableModal;
