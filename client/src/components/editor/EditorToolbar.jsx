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

const FONT_SIZES = [
  { label: '8', value: '8px' },
  { label: '9', value: '9px' },
  { label: '10', value: '10px' },
  { label: '11', value: '11px' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '30', value: '30px' },
  { label: '36', value: '36px' },
  { label: '48', value: '48px' },
  { label: '60', value: '60px' },
  { label: '72', value: '72px' }
];

const FONT_SIZE_MIN = 6;
const FONT_SIZE_MAX = 400;

/**
 * Parse a CSS font-size string (e.g. "14px", "1.5em") into an integer pixel value.
 * Returns null if unparseable.
 */
function parsePxSize(sizeStr) {
  if (!sizeStr) return null;
  const match = String(sizeStr).match(/^(\d+(?:\.\d+)?)(px|pt|em|rem)?$/i);
  if (!match) return null;
  return Math.round(parseFloat(match[1]));
}

/**
 * Walk all inline text nodes in the selection and collect the unique set of
 * font-size values (as integer px numbers).
 * Returns an empty Set if the selection is collapsed (cursor) or nothing is
 * found — callers should fall back to the mark at the cursor position.
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
      // Text with no explicit size — treat as "default" sentinel
      sizes.add(null);
    }
  });
  return sizes;
}

const EditorToolbar = ({ editor, editable = true }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const colorPickerRef = useRef(null);
  const highlightPickerRef = useRef(null);

  // Bug 1 — live font size state driven by the editor selection
  const [fontSizeInput, setFontSizeInput] = useState('11');
  // Whether the current selection has mixed sizes (show blank)
  const [isMixedSize, setIsMixedSize] = useState(false);

  // Sync font size display whenever editor selection or content changes
  const syncFontSize = useCallback(() => {
    if (!editor) return;
    const sizes = getSelectionFontSizes(editor);

    // Remove null (no-mark) from the set to figure out explicit sizes
    const explicitSizes = new Set([...sizes].filter((s) => s !== null));

    if (explicitSizes.size === 0) {
      // No explicit sizes at all — show default
      setFontSizeInput('11');
      setIsMixedSize(false);
    } else if (explicitSizes.size === 1) {
      // Single consistent size
      setFontSizeInput(String([...explicitSizes][0]));
      setIsMixedSize(false);
    } else {
      // Multiple different sizes in the selection — show blank (Google Docs behaviour)
      setFontSizeInput('');
      setIsMixedSize(true);
    }
  }, [editor]);

  // Attach to both selectionUpdate and transaction so it updates on cursor move AND content edits
  useEffect(() => {
    if (!editor) return;
    editor.on('selectionUpdate', syncFontSize);
    editor.on('transaction', syncFontSize);
    // Initial sync
    syncFontSize();
    return () => {
      editor.off('selectionUpdate', syncFontSize);
      editor.off('transaction', syncFontSize);
    };
  }, [editor, syncFontSize]);

  // Close dropdowns on outside click
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

  if (!editor) {
    return null;
  }

  // If document is in read-only mode for viewers/commenters
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

  // Handle heading selection
  const handleHeadingChange = (e) => {
    const value = e.target.value;
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

  const getCurrentHeadingValue = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'paragraph';
  };

  // Handle font family change
  const handleFontFamilyChange = (e) => {
    const font = e.target.value;
    if (!font || font === 'default') {
      editor.chain().focus().unsetFontFamily().run();
    } else {
      editor.chain().focus().setFontFamily(font).run();
    }
  };

  const getCurrentFontFamily = () => {
    return editor.getAttributes('textStyle').fontFamily || 'Arial';
  };

  // Bug 1+2 — Apply a concrete pixel size to the selection
  const applyFontSize = (pxNum) => {
    const clamped = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(pxNum)));
    editor.chain().focus().setFontSize(`${clamped}px`).run();
    setFontSizeInput(String(clamped));
    setIsMixedSize(false);
  };

  // Bug 2 — +/- increment: each text node keeps its own size (preserves relative differences)
  // When mixed sizes are present, each piece increments from its own current size.
  const handleIncrementSize = (delta) => {
    const { state } = editor;
    const { from, to, empty } = state.selection;

    if (empty) {
      // Cursor — read current size and increment
      const attrs = editor.getAttributes('textStyle');
      const current = parsePxSize(attrs.fontSize) ?? 11;
      applyFontSize(current + delta);
      return;
    }

    // Range selection — walk nodes and set individual sizes
    const chain = editor.chain().focus();
    // Collect all (from, to, currentSize) tuples per continuous mark range
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
      // No text nodes found — fallback to single apply
      const current = parsePxSize(editor.getAttributes('textStyle').fontSize) ?? 11;
      applyFontSize(current + delta);
      return;
    }

    // Apply per-range size changes via a single chained transaction
    // We use setTextSelection + setFontSize for each range
    let tr = state.tr;
    const textStyleType = state.schema.marks.textStyle;
    if (!textStyleType) {
      // Fallback: apply once for whole selection
      const current = parsePxSize(editor.getAttributes('textStyle').fontSize) ?? 11;
      applyFontSize(current + delta);
      return;
    }

    ranges.forEach(({ from: rFrom, to: rTo, current }) => {
      const clamped = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, current + delta));
      // Merge new fontSize into existing textStyle mark attrs
      tr = tr.addMark(
        rFrom,
        rTo,
        textStyleType.create({ fontSize: `${clamped}px` })
      );
    });

    editor.view.dispatch(tr);

    // Update the displayed font size — if all end up the same, show it; otherwise blank
    const newSizes = new Set(
      ranges.map(({ current }) => {
        return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, current + delta));
      })
    );
    if (newSizes.size === 1) {
      setFontSizeInput(String([...newSizes][0]));
      setIsMixedSize(false);
    } else {
      setFontSizeInput('');
      setIsMixedSize(true);
    }
  };

  // Bug 1 — user types directly in the font size box
  const handleFontSizeInputChange = (e) => {
    setFontSizeInput(e.target.value);
    setIsMixedSize(false);
  };

  const handleFontSizeInputCommit = (e) => {
    if (e.type === 'keydown' && e.key !== 'Enter') return;
    const num = parseInt(fontSizeInput, 10);
    if (!isNaN(num) && num > 0) {
      applyFontSize(num);
    } else {
      // Invalid — revert to last known good size
      syncFontSize();
    }
  };

  // Handle text color selection
  const handleSetColor = (color) => {
    if (color) {
      editor.chain().focus().setColor(color).run();
    } else {
      editor.chain().focus().unsetColor().run();
    }
    setShowColorPicker(false);
  };

  // Handle highlight selection
  const handleSetHighlight = (color) => {
    if (color) {
      editor.chain().focus().setHighlight({ color }).run();
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
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

      <div className="h-5 w-[1px] bg-gray-300 mx-1"></div>

      {/* Heading / Style Selector */}
      <select
        value={getCurrentHeadingValue()}
        onChange={handleHeadingChange}
        className="h-7 rounded border border-transparent bg-transparent hover:bg-gray-200 px-2 text-xs font-medium text-gray-700 focus:outline-none cursor-pointer"
        title="Styles"
      >
        <option value="paragraph">Normal text</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      {/* Font Family Selector */}
      <select
        value={getCurrentFontFamily()}
        onChange={handleFontFamilyChange}
        className="h-7 max-w-[120px] rounded border border-transparent bg-transparent hover:bg-gray-200 px-1.5 text-xs font-medium text-gray-700 focus:outline-none cursor-pointer truncate"
        title="Font"
      >
        {FONT_FAMILIES.map((font) => (
          <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
            {font.label}
          </option>
        ))}
      </select>

      {/* Bug 2 — Font Size Controls: [−] [input/dropdown] [+] */}
      <div className="flex items-center gap-0 shrink-0">
        {/* Decrement button */}
        <button
          type="button"
          onClick={() => handleIncrementSize(-1)}
          className="h-7 w-5 flex items-center justify-center rounded-l border border-transparent bg-transparent hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 transition cursor-pointer"
          title="Decrease font size"
        >
          <Minus className="w-3 h-3" />
        </button>

        {/* Font size input — Bug 1: value driven by live selection */}
        <input
          type="text"
          inputMode="numeric"
          value={isMixedSize ? '' : fontSizeInput}
          placeholder={isMixedSize ? '–' : '11'}
          onChange={handleFontSizeInputChange}
          onBlur={handleFontSizeInputCommit}
          onKeyDown={handleFontSizeInputCommit}
          className="h-7 w-10 border-t border-b border-transparent bg-transparent hover:bg-gray-200 dark:hover:bg-neutral-700 focus:bg-white dark:focus:bg-neutral-800 focus:border-blue-400 text-xs font-medium text-gray-700 dark:text-gray-200 text-center focus:outline-none transition"
          title="Font size"
          aria-label="Font size"
        />

        {/* Increment button */}
        <button
          type="button"
          onClick={() => handleIncrementSize(1)}
          className="h-7 w-5 flex items-center justify-center rounded-r border border-transparent bg-transparent hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 transition cursor-pointer"
          title="Increase font size"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="h-5 w-[1px] bg-gray-300 mx-1"></div>

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
          <div className="absolute left-0 top-8 z-30 p-2 bg-white rounded-xl shadow-lg border border-gray-200 grid grid-cols-5 gap-1.5 w-40">
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
          <div className="absolute left-0 top-8 z-30 p-2 bg-white rounded-xl shadow-lg border border-gray-200 grid grid-cols-4 gap-1.5 w-36">
            {HIGHLIGHT_COLORS.map((hc) => (
              <button
                key={hc.name}
                type="button"
                onClick={() => handleSetHighlight(hc.color)}
                className={`w-6 h-6 rounded border transition-transform hover:scale-115 focus:outline-none flex items-center justify-center text-[10px] ${
                  !hc.color ? 'border-gray-400 bg-transparent text-gray-500' : 'border-gray-200'
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

      <div className="h-5 w-[1px] bg-gray-300 mx-1"></div>

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

      <div className="h-5 w-[1px] bg-gray-300 mx-1"></div>

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

      <div className="h-5 w-[1px] bg-gray-300 mx-1"></div>

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
