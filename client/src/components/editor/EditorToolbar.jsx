import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown
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
  { label: '10', value: '10px' },
  { label: '11', value: '11px' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '18', value: '18px' },
  { label: '24', value: '24px' },
  { label: '30', value: '30px' },
  { label: '36', value: '36px' }
];

const EditorToolbar = ({ editor, editable = true }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const colorPickerRef = useRef(null);
  const highlightPickerRef = useRef(null);

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

  // Handle font size change
  const handleFontSizeChange = (e) => {
    const size = e.target.value;
    if (size === 'default') {
      editor.chain().focus().unsetFontSize().run();
    } else {
      editor.chain().focus().setFontSize(size).run();
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
    `p-1.5 rounded transition flex items-center justify-center cursor-pointer ${
      disabled
        ? 'opacity-40 cursor-not-allowed text-gray-400'
        : isActive
        ? 'bg-[#e8f0fe] text-[#1a73e8]'
        : 'text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 sm:gap-1 bg-[#edf2fa] px-4 py-1.5 border-b border-gray-300 select-none">
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

      {/* Font Size Selector */}
      <select
        defaultValue="11px"
        onChange={handleFontSizeChange}
        className="h-7 w-14 rounded border border-transparent bg-transparent hover:bg-gray-200 px-1 text-xs font-medium text-gray-700 focus:outline-none cursor-pointer text-center"
        title="Font size"
      >
        {FONT_SIZES.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>

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
