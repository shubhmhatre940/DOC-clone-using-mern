import React, { useState } from 'react';
import { X, FileCode } from 'lucide-react';

const SYMBOL_CATEGORIES = [
  {
    name: 'Currency',
    symbols: ['$', '€', '£', '¥', '₹', '₽', '₩', '¢', '₿', '₫', '₱', '₴']
  },
  {
    name: 'Math',
    symbols: ['±', '×', '÷', '≠', '≤', '≥', '≈', '√', '∞', '∑', '∫', 'π', '°', '‰', '∂', '∆', '∈', '∩', '∪']
  },
  {
    name: 'Arrows',
    symbols: ['←', '→', '↑', '↓', '↔', '↕', '⇐', '⇒', '⇔', '➔', '➤', '↩', '↪']
  },
  {
    name: 'Punctuation & Misc',
    symbols: ['©', '®', '™', '§', '¶', '•', '—', '–', '…', '¿', '¡', '«', '»', '“', '”', '‘', '’', '✓', '✗', '★', '♥']
  },
  {
    name: 'Greek',
    symbols: ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'σ', 'τ', 'φ', 'ω', 'Ω', 'Δ', 'Σ', 'Ψ']
  }
];

const SymbolsModal = ({ isOpen, onClose, editor }) => {
  const [selectedCategory, setSelectedCategory] = useState('Currency');

  if (!isOpen) return null;

  const currentSymbols =
    SYMBOL_CATEGORIES.find((c) => c.name === selectedCategory)?.symbols || [];

  const handleSelectSymbol = (symbol) => {
    if (editor) {
      editor.chain().focus().insertContent(symbol).run();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="symbols-modal-title"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-600" />
            <h2 id="symbols-modal-title" className="text-sm font-semibold text-gray-900">
              Insert special characters
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

        {/* Category Pills */}
        <div className="flex gap-1.5 px-4 pt-3 pb-2 border-b border-gray-100 overflow-x-auto">
          {SYMBOL_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Symbol Grid */}
        <div className="p-4 grid grid-cols-7 gap-2 max-h-64 overflow-y-auto">
          {currentSymbols.map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => handleSelectSymbol(sym)}
              className="h-10 text-lg flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition cursor-pointer font-serif active:scale-95"
              title={`Insert ${sym}`}
            >
              {sym}
            </button>
          ))}
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Click any symbol to insert at cursor</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-100 font-medium text-gray-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SymbolsModal;
