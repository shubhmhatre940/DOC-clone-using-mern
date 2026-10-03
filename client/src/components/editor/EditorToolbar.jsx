import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  RemoveFormatting,
  Eye,
  Highlighter,
  Baseline,
  ChevronDown,
  Plus,
  Minus
} from 'lucide-react';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const TEXT_COLORS = [
  { name: 'Black', color: '#000000' },
  { name: 'Dark Gray', color: '#434343' },
  { name: 'Gray', color: '#666666' },
  { name: 'Red', color: '#cc0000' },
  { name: 'Orange', color: '#e69138' },
  { name: 'Yellow', color: '#f1c232' },
  { name: 'Green', color: '#38761d' },
  { name: 'Cyan', color: '#45818e' },
  { name: 'Blue', color: '#1155cc' },
  { name: 'Purple', color: '#674ea7' }
];

const HIGHLIGHT_COLORS = [
  { name: 'None', color: null },
  { name: 'Yellow', color: '#fff2cc' },
  { name: 'Green', color: '#d9ead3' },
  { name: 'Cyan', color: '#cfe2f3' },
  { name: 'Pink', color: '#f4cccc' },
  { name: 'Purple', color: '#d9d2e9' },
  { name: 'Orange', color: '#fce5cd' }
];

const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS' }
];

// Google Docs standard preset sizes
const FONT_SIZES = [
  '8', '9', '10', '10.5', '11', '12', '14', '18',
  '24', '30', '36', '48', '60', '72', '96'
];

const FONT_SIZE_MIN = 6;
const FONT_SIZE_MAX = 400;

// ─────────────────────────────────────────────
// Heading style definitions — these MUST mirror
// the actual CSS applied to h1/h2/h3 in the
// editor body (TipTap StarterKit defaults use
// browser UA sheet values, tweaked below to
// match typical Google-Docs-style proportions).
// ─────────────────────────────────────────────
const HEADING_STYLES = [
  {
    value: 'paragraph',
    label: 'Normal text',
    style: { fontSize: '13px', fontWeight: '400', lineHeight: '1.4', color: '#202124' }
  },
  {
    value: 'h1',
    label: 'Heading 1',
    style: { fontSize: '22px', fontWeight: '700', lineHeight: '1.2', color: '#202124' }
  },
  {
    value: 'h2',
    label: 'Heading 2',
    style: { fontSize: '17px', fontWeight: '700', lineHeight: '1.25', color: '#202124' }
  },
  {
    value: 'h3',
    label: 'Heading 3',
    style: { fontSize: '14px', fontWeight: '700', lineHeight: '1.3', color: '#202124', fontStyle: 'italic' }
  }
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Parse a CSS font-size string (e.g. "14px") into a numeric value. */
function parsePxSize(sizeStr) {
  if (!sizeStr) return null;
  const match = String(sizeStr).match(/^(\d+(?:\.\d+)?)(px|pt|em|rem)?$/i);
  if (!match) return null;
  return Math.round(parseFloat(match[1]));
}

/**
 * Walk all inline text nodes in the selection and collect the unique set of
 * font-size values (as integer px numbers).
 */
function getSelectionFontSizes(editor) {
  const { state } = editor;
  const { from, to, empty } = state.selection;

  // Cursor (no range) → read mark at cursor
  if (empty) {
    const attrs = editor.getAttributes('textStyle');
    const px = parsePxSize(attrs.fontSize);
    if (px !== null) return new Set([px]);
    return new Set();
  }

  const sizes = new Set();
  state.doc.nodesBetween(from, to, (node) => {
    if (!node.isText) return;
    const textStyleMark = node.marks.find((m) => m.type.name === 'textStyle');
    const px = parsePxSize(textStyleMark?.attrs?.fontSize);
    if (px !== null) {
      sizes.add(px);
    } else {
      sizes.add(null); // sentinel for "no explicit size"
    }
  });
  return sizes;
}

// ─────────────────────────────────────────────
// Sub-component: Heading Dropdown
// A fully custom dropdown so each option renders
// in its own visual heading style.
// ─────────────────────────────────────────────
const HeadingDropdown = ({ currentValue, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = HEADING_STYLES.find((h) => h.value === currentValue) || HEADING_STYLES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (value) => {
    setOpen(false);
    onChange(value);
  };

  return (
    <div className="relative shrink-0" ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-7 flex items-center gap-1 rounded border border-transparent bg-transparent hover:bg-gray-200 dark:hover:bg-neutral-700 px-2 text-xs font-medium text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer transition min-w-[110px]"
        title="Paragraph styles"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex-1 text-left truncate">{current.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute left-0 top-8 z-40 min-w-[180px] bg-white dark:bg-[#2c2c2e] rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 py-1 overflow-hidden"
          role="listbox"
        >
          {HEADING_STYLES.map((h) => (
            <button
              key={h.value}
              type="button"
              role="option"
              aria-selected={currentValue === h.value}
              onClick={() => handleSelect(h.value)}
              className={`w-full text-left px-4 py-2 transition cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/40 ${
                currentValue === h.value
                  ? 'bg-blue-50 dark:bg-blue-950/40'
                  : ''
              }`}
              style={h.style}
            >
              {h.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Sub-component: Font Size Combo-Box
// Three interaction modes:
//   1. Editable text input (type custom value, press Enter/blur to apply)
//   2. Preset dropdown panel (click ChevronDown to see standard sizes)
//   3. +/- buttons (increment/decrement by 1pt)
// ─────────────────────────────────────────────
const FontSizeComboBox = ({
  fontSizeInput,
  isMixedSize,
  onInputChange,
  onInputCommit,
  onIncrement,
  onSelectPreset
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePresetClick = (size) => {
    setOpen(false);
    onSelectPreset(size);
    // Re-focus the input after selection
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="relative flex items-center shrink-0" ref={ref}>
      {/* Decrement */}
      <button
        type="button"
        onClick={() => onIncrement(-1)}
        className="h-7 w-5 flex items-center justify-center rounded-l border border-transparent bg-transparent hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 transition cursor-pointer"
        title="Decrease font size"
        aria-label="Decrease font size"
      >
        <Minus className="w-3 h-3" />
      </button>

      {/* Editable number input */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={isMixedSize ? '' : fontSizeInput}
        placeholder={isMixedSize ? '–' : '11'}
        onChange={onInputChange}
        onBlur={onInputCommit}
        onKeyDown={onInputCommit}
        className="h-7 w-9 border-t border-b border-transparent bg-transparent hover:bg-gray-200 dark:hover:bg-neutral-700 focus:bg-white dark:focus:bg-neutral-800 focus:border-blue-400 text-xs font-medium text-gray-700 dark:text-gray-200 text-center focus:outline-none transition"
        title="Font size"
        aria-label="Font size"
      />

      {/* Chevron — opens preset size list */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-7 w-4 flex items-center justify-center border-t border-b border-transparent bg-transparent hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-500 dark:text-gray-400 transition cursor-pointer"
        title="Font size presets"
        aria-label="Show font size presets"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <ChevronDown className="w-2.5 h-2.5" />
      </button>

      {/* Increment */}
      <button
        type="button"
        onClick={() => onIncrement(1)}
        className="h-7 w-5 flex items-center justify-center rounded-r border border-transparent bg-transparent hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 transition cursor-pointer"
        title="Increase font size"
        aria-label="Increase font size"
      >
        <Plus className="w-3 h-3" />
      </button>

      {/* Preset size dropdown panel */}
      {open && (
        <div
          className="absolute left-4 top-8 z-40 w-20 bg-white dark:bg-[#2c2c2e] rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 py-1 overflow-y-auto max-h-56"
          role="listbox"
          aria-label="Font size presets"
        >
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              role="option"
              aria-selected={fontSizeInput === size}
              onClick={() => handlePresetClick(size)}
              className={`w-full text-left px-3 py-1 text-xs transition cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/40 ${
                fontSizeInput === size
                  ? 'bg-blue-50 dark:bg-blue-950/40 font-semibold text-blue-700'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Toolbar
// ─────────────────────────────────────────────
const EditorToolbar = ({ editor, editable = true }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const colorPickerRef = useRef(null);
  const highlightPickerRef = useRef(null);

  // Live font size state driven by editor selection
  const [fontSizeInput, setFontSizeInput] = useState('11');
  const [isMixedSize, setIsMixedSize] = useState(false);

  // Sync font size display whenever editor selection or content changes
  const syncFontSize = useCallback(() => {
    if (!editor) return;
    const sizes = getSelectionFontSizes(editor);
    const explicitSizes = new Set([...sizes].filter((s) => s !== null));

    if (explicitSizes.size === 0) {
      setFontSizeInput('11');
      setIsMixedSize(false);
    } else if (explicitSizes.size === 1) {
      setFontSizeInput(String([...explicitSizes][0]));
      setIsMixedSize(false);
    } else {
      setFontSizeInput('');
      setIsMixedSize(true);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.on('selectionUpdate', syncFontSize);
    editor.on('transaction', syncFontSize);
    syncFontSize();
    return () => {
      editor.off('selectionUpdate', syncFontSize);
      editor.off('transaction', syncFontSize);
    };
  }, [editor, syncFontSize]);

  // Close color pickers on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
      if (highlightPickerRef.current && !highlightPickerRef.current.contains(e.target)) {
        setShowHighlightPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!editor) return null;

  // Read-only view banner
  if (!editable) {
    return (
      <div className="sticky top-0 z-20 flex items-center justify-between bg-[#edf2fa] px-4 py-2 border-b border-gray-300 select-none">
        <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
            <Eye className="w-3.5 h-3.5" />
            <span>Viewing</span>
          </div>
          <span className="text-gray-500 hidden sm:inline">
            You do not have permission to edit this document
          </span>
        </div>
      </div>
    );
  }

  // ── Heading ──────────────────────────────────
  const getCurrentHeadingValue = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'paragraph';
  };

  const handleHeadingChange = (value) => {
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else if (value === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (value === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (value === 'h3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

  // ── Font family ───────────────────────────────
  const handleFontFamilyChange = (e) => {
    const font = e.target.value;
    if (!font || font === 'default') {
      editor.chain().focus().unsetFontFamily().run();
    } else {
      editor.chain().focus().setFontFamily(font).run();
    }
  };

  const getCurrentFontFamily = () =>
    editor.getAttributes('textStyle').fontFamily || 'Arial';

  // ── Font size helpers ─────────────────────────
  const applyFontSize = (pxNum) => {
    const clamped = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(pxNum)));
    editor.chain().focus().setFontSize(`${clamped}px`).run();
    setFontSizeInput(String(clamped));
    setIsMixedSize(false);
  };

  const handleIncrementSize = (delta) => {
    const { state } = editor;
    const { from, to, empty } = state.selection;

    if (empty) {
      const attrs = editor.getAttributes('textStyle');
      const current = parsePxSize(attrs.fontSize) ?? 11;
      applyFontSize(current + delta);
      return;
    }

    const ranges = [];
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isText) return;
      const textStyleMark = node.marks.find((m) => m.type.name === 'textStyle');
      const current = parsePxSize(textStyleMark?.attrs?.fontSize) ?? 11;
      const nodeFrom = Math.max(from, pos);
      const nodeTo = Math.min(to, pos + node.nodeSize);
      ranges.push({ from: nodeFrom, to: nodeTo, current });
    });

    if (ranges.length === 0) {
      const current = parsePxSize(editor.getAttributes('textStyle').fontSize) ?? 11;
      applyFontSize(current + delta);
      return;
    }

    const textStyleType = state.schema.marks.textStyle;
    if (!textStyleType) {
      const current = parsePxSize(editor.getAttributes('textStyle').fontSize) ?? 11;
      applyFontSize(current + delta);
      return;
    }

    let tr = state.tr;
    ranges.forEach(({ from: rFrom, to: rTo, current }) => {
      const clamped = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, current + delta));
      tr = tr.addMark(rFrom, rTo, textStyleType.create({ fontSize: `${clamped}px` }));
    });
    editor.view.dispatch(tr);

    const newSizes = new Set(
      ranges.map(({ current }) =>
        Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, current + delta))
      )
    );
    if (newSizes.size === 1) {
      setFontSizeInput(String([...newSizes][0]));
      setIsMixedSize(false);
    } else {
      setFontSizeInput('');
      setIsMixedSize(true);
    }
  };

  const handleFontSizeInputChange = (e) => {
    setFontSizeInput(e.target.value);
    setIsMixedSize(false);
  };

  const handleFontSizeInputCommit = (e) => {
    if (e.type === 'keydown' && e.key !== 'Enter') return;
    // Support decimals like "10.5"
    const num = parseFloat(fontSizeInput);
    if (!isNaN(num) && num > 0) {
      applyFontSize(num);
    } else {
      syncFontSize();
    }
  };

  const handleSelectPreset = (size) => {
    const num = parseFloat(size);
    if (!isNaN(num)) applyFontSize(num);
  };

  // ── Color / highlight ─────────────────────────
  const handleSetColor = (color) => {
    if (color) editor.chain().focus().setColor(color).run();
    else editor.chain().focus().unsetColor().run();
    setShowColorPicker(false);
  };

  const handleSetHighlight = (color) => {
    if (color) editor.chain().focus().setHighlight({ color }).run();
    else editor.chain().focus().unsetHighlight().run();
    setShowHighlightPicker(false);
  };

  const btnClass = (isActive = false, disabled = false) =>
    `p-1.5 rounded transition flex items-center justify-center cursor-pointer shrink-0 ${
      disabled
        ? 'opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-600'
        : isActive
        ? 'bg-[#e8f0fe] dark:bg-blue-950/60 text-[#1a73e8] dark:text-blue-400'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
    }`;

  return (
    <div className="sticky top-0 z-20 flex items-center gap-0.5 sm:gap-1 bg-[#edf2fa] dark:bg-[#202124] px-2 sm:px-4 py-1.5 border-b border-gray-300 dark:border-[#383a3d] select-none overflow-x-auto scrollbar-none transition-colors">
      {/* Undo / Redo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={btnClass(false, !editor.can().undo())}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={btnClass(false, !editor.can().redo())}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="h-5 w-[1px] bg-gray-300 dark:bg-neutral-600 mx-1"></div>

      {/* Bug 2 — Heading Dropdown with per-level visual previews */}
      <HeadingDropdown
        currentValue={getCurrentHeadingValue()}
        onChange={handleHeadingChange}
      />

      {/* Font Family Selector */}
      <select
        value={getCurrentFontFamily()}
        onChange={handleFontFamilyChange}
        className="h-7 max-w-[120px] rounded border border-transparent bg-transparent hover:bg-gray-200 dark:hover:bg-neutral-700 px-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer truncate"
        title="Font"
      >
        {FONT_FAMILIES.map((font) => (
          <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
            {font.label}
          </option>
        ))}
      </select>

      {/* Bug 1 — Font Size Combo-Box: preset dropdown + editable input + +/- */}
      <FontSizeComboBox
        fontSizeInput={fontSizeInput}
        isMixedSize={isMixedSize}
        onInputChange={handleFontSizeInputChange}
        onInputCommit={handleFontSizeInputCommit}
        onIncrement={handleIncrementSize}
        onSelectPreset={handleSelectPreset}
      />

      <div className="h-5 w-[1px] bg-gray-300 dark:bg-neutral-600 mx-1"></div>

      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btnClass(editor.isActive('underline'))}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>

      {/* Strikethrough */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive('strike'))}
        title="Strikethrough (Alt+Shift+5)"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      {/* Text Color Picker */}
      <div className="relative" ref={colorPickerRef}>
        <button
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className={btnClass(showColorPicker)}
          title="Text color"
        >
          <Baseline className="w-4 h-4" />
        </button>
        {showColorPicker && (
          <div className="absolute left-0 top-8 z-30 p-2 bg-white dark:bg-[#2c2c2e] rounded-xl shadow-lg border border-gray-200 dark:border-neutral-700 grid grid-cols-5 gap-1.5 w-40">
            {TEXT_COLORS.map((tc) => (
              <button
                key={tc.color}
                type="button"
                onClick={() => handleSetColor(tc.color)}
                className="w-6 h-6 rounded-full border border-gray-300 transition-transform hover:scale-115 focus:outline-none"
                style={{ backgroundColor: tc.color }}
                title={tc.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Highlight Color Picker */}
      <div className="relative" ref={highlightPickerRef}>
        <button
          type="button"
          onClick={() => setShowHighlightPicker(!showHighlightPicker)}
          className={btnClass(editor.isActive('highlight') || showHighlightPicker)}
          title="Highlight color"
        >
          <Highlighter className="w-4 h-4" />
        </button>
        {showHighlightPicker && (
          <div className="absolute left-0 top-8 z-30 p-2 bg-white dark:bg-[#2c2c2e] rounded-xl shadow-lg border border-gray-200 dark:border-neutral-700 grid grid-cols-4 gap-1.5 w-36">
            {HIGHLIGHT_COLORS.map((hc) => (
              <button
                key={hc.name}
                type="button"
                onClick={() => handleSetHighlight(hc.color)}
                className={`w-6 h-6 rounded border transition-transform hover:scale-115 focus:outline-none flex items-center justify-center text-[10px] ${
                  !hc.color
                    ? 'border-gray-400 bg-transparent text-gray-500'
                    : 'border-gray-200'
                }`}
                style={{ backgroundColor: hc.color || 'transparent' }}
                title={hc.name}
              >
                {!hc.color && '✕'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-5 w-[1px] bg-gray-300 dark:bg-neutral-600 mx-1"></div>

      {/* Alignment */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={btnClass(editor.isActive({ textAlign: 'left' }))}
        title="Left align (Ctrl+Shift+L)"
      >
        <AlignLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={btnClass(editor.isActive({ textAlign: 'center' }))}
        title="Center align (Ctrl+Shift+E)"
      >
        <AlignCenter className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={btnClass(editor.isActive({ textAlign: 'right' }))}
        title="Right align (Ctrl+Shift+R)"
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={btnClass(editor.isActive({ textAlign: 'justify' }))}
        title="Justify (Ctrl+Shift+J)"
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <div className="h-5 w-[1px] bg-gray-300 dark:bg-neutral-600 mx-1"></div>

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))}
        title="Bulleted list (Ctrl+Shift+8)"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive('orderedList'))}
        title="Numbered list (Ctrl+Shift+7)"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="h-5 w-[1px] bg-gray-300 dark:bg-neutral-600 mx-1"></div>

      {/* Clear Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        className={btnClass(false)}
        title="Clear formatting (Ctrl+\)"
      >
        <RemoveFormatting className="w-4 h-4" />
      </button>
    </div>
  );
};

export default EditorToolbar;
