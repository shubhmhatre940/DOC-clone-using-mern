import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Download,
  Trash2,
  Edit3,
  Undo2,
  Redo2,
  Scissors,
  Clipboard,
  Check,
  Maximize2,
  Minimize2,
  ZoomIn,
  ChevronRight,
  Loader2,
  Info,
  Printer,
  Keyboard,
  History,
  Image as ImageIcon,
  Table as TableIcon,
  BarChart3,
  Mic,
  Volume2,
  Minus,
  Link,
  Bookmark,
  FileCode,
  LayoutGrid,
  FileText,
  Settings,
  Sliders,
  SpellCheck,
  Sparkles,
  GitCompare,
  Quote,
  SplitSquareVertical,
  Activity,
  Music,
  ListTree,
  Eye,
  BookOpen,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  List,
  ListOrdered,
  RemoveFormatting,
  Pilcrow,
  Heading,
  Square,
  Palette,
  ArrowLeftRight,
  Columns,
  Rows,
  Type
} from 'lucide-react';

const EditorMenuBar = ({
  editor,
  // File actions
  onMakeCopy,
  onRename,
  onDelete,
  onExport,
  exportLoadingFormat,
  canDelete = true,
  canEdit = true,
  onOpenDetails,
  onOpenVersionHistory,
  onOpenActivityLog,
  onPrint,

  // Edit actions
  onUndo,
  onRedo,
  onCut,
  onCopyText,
  onPaste,
  onSelectAll,

  // View actions
  showToolbar = true,
  onToggleToolbar,
  showToc = false,
  onToggleToc,
  isFocusMode = false,
  onToggleFocusMode,
  isReadingMode = false,
  onToggleReadingMode,
  isFullscreen = false,
  onToggleFullscreen,
  zoomLevel = 100,
  onSetZoom,

  // Insert actions
  onInsertLink,
  onInsertSymbol,
  onInsertHorizontalLine,
  onInsertImage,
  onInsertTable,
  onInsertAudio,
  onInsertChart,
  onInsertBookmark,
  onInsertPageBreak,
  onInsertBuildingBlock,

  // Tools actions
  onOpenWordCount,
  showLineNumbers = false,
  onToggleLineNumbers,
  onProofread,
  onOpenGrammarCheck,
  onOpenAiAssistant,
  isVoiceTyping = false,
  onToggleVoiceTyping,
  onOpenCompare,
  onOpenCitations,
  onOpenPreferences,
  onOpenAccessibility,

  // Page layout features
  pageSettings = {},
  onTogglePrintLayout,
  onSetOrientation,
  onEditHeaderFooter,
  onSetPageNumbers,
  onInsertColumnBreak,

  // Help actions
  onOpenShortcuts
}) => {
  const [activeMenu, setActiveMenu] = useState(null); // 'File' | 'Edit' | 'View' | 'Help' | null
  const [activeSubmenu, setActiveSubmenu] = useState(null); // 'download' | 'zoom' | null
  const menuBarRef = useRef(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target)) {
        setActiveMenu(null);
        setActiveSubmenu(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setActiveSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleMenuClick = (menuName) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
      setActiveSubmenu(null);
    } else {
      setActiveMenu(menuName);
      setActiveSubmenu(null);
    }
  };

  const handleMenuHover = (menuName) => {
    if (activeMenu !== null && activeMenu !== menuName) {
      setActiveMenu(menuName);
      setActiveSubmenu(null);
    }
  };

  const executeAction = (actionFn) => {
    setActiveMenu(null);
    setActiveSubmenu(null);
    if (typeof actionFn === 'function') {
      actionFn();
    }
  };

  // Format actions handlers
  const handleClearFormatting = () => {
    if (!editor) return;
    editor.chain().focus().unsetAllMarks().clearNodes().run();
  };

  const handleSetTextDirection = (dir) => {
    if (!editor) return;
    if (editor.isActive('heading')) {
      editor.chain().focus().updateAttributes('heading', { dir }).run();
    } else {
      editor.chain().focus().updateAttributes('paragraph', { dir }).run();
    }
  };

  const handleSetAlign = (alignment) => {
    if (!editor) return;
    editor.chain().focus().setTextAlign(alignment).run();
  };

  const handleIncreaseIndent = () => {
    if (!editor) return;
    if (editor.isActive('listItem')) {
      editor.chain().focus().sinkListItem('listItem').run();
    } else {
      const currentStyle = editor.getAttributes('paragraph')?.blockStyle || editor.getAttributes('heading')?.blockStyle || '';
      const match = currentStyle.match(/margin-left:\s*(\d+)px/);
      const currentMargin = match ? parseInt(match[1], 10) : 0;
      const nextMargin = Math.min(currentMargin + 36, 180);
      const updatedStyle = currentStyle.replace(/margin-left:\s*\d+px;?/g, '').trim() + ` margin-left: ${nextMargin}px;`;
      if (editor.isActive('heading')) {
        editor.chain().focus().updateAttributes('heading', { blockStyle: updatedStyle.trim() }).run();
      } else {
        editor.chain().focus().updateAttributes('paragraph', { blockStyle: updatedStyle.trim() }).run();
      }
    }
  };

  const handleDecreaseIndent = () => {
    if (!editor) return;
    if (editor.isActive('listItem')) {
      editor.chain().focus().liftListItem('listItem').run();
    } else {
      const currentStyle = editor.getAttributes('paragraph')?.blockStyle || editor.getAttributes('heading')?.blockStyle || '';
      const match = currentStyle.match(/margin-left:\s*(\d+)px/);
      const currentMargin = match ? parseInt(match[1], 10) : 0;
      const nextMargin = Math.max(currentMargin - 36, 0);
      const updatedStyle = currentStyle.replace(/margin-left:\s*\d+px;?/g, '').trim() + (nextMargin > 0 ? ` margin-left: ${nextMargin}px;` : '');
      if (editor.isActive('heading')) {
        editor.chain().focus().updateAttributes('heading', { blockStyle: updatedStyle.trim() }).run();
      } else {
        editor.chain().focus().updateAttributes('paragraph', { blockStyle: updatedStyle.trim() }).run();
      }
    }
  };

  const handleSetLineSpacing = (lineHeight) => {
    if (!editor) return;
    const currentStyle = editor.getAttributes('paragraph')?.blockStyle || editor.getAttributes('heading')?.blockStyle || '';
    const cleaned = currentStyle.replace(/line-height:\s*[\d.]+;?/g, '').trim();
    const updatedStyle = `${cleaned} line-height: ${lineHeight};`.trim();
    if (editor.isActive('heading')) {
      editor.chain().focus().updateAttributes('heading', { blockStyle: updatedStyle }).run();
    } else {
      editor.chain().focus().updateAttributes('paragraph', { blockStyle: updatedStyle }).run();
    }
  };

  const handleParagraphSpacing = (type) => {
    if (!editor) return;
    const currentStyle = editor.getAttributes('paragraph')?.blockStyle || editor.getAttributes('heading')?.blockStyle || '';
    let updatedStyle = currentStyle;
    if (type === 'add-before') {
      updatedStyle = updatedStyle.replace(/margin-top:\s*[\w\d.]+;?/g, '').trim() + ' margin-top: 14px;';
    } else if (type === 'remove-before') {
      updatedStyle = updatedStyle.replace(/margin-top:\s*[\w\d.]+;?/g, '').trim();
    } else if (type === 'add-after') {
      updatedStyle = updatedStyle.replace(/margin-bottom:\s*[\w\d.]+;?/g, '').trim() + ' margin-bottom: 14px;';
    } else if (type === 'remove-after') {
      updatedStyle = updatedStyle.replace(/margin-bottom:\s*[\w\d.]+;?/g, '').trim();
    }
    if (editor.isActive('heading')) {
      editor.chain().focus().updateAttributes('heading', { blockStyle: updatedStyle.trim() }).run();
    } else {
      editor.chain().focus().updateAttributes('paragraph', { blockStyle: updatedStyle.trim() }).run();
    }
  };

  const handleSetBorder = (borderType) => {
    if (!editor) return;
    const currentStyle = editor.getAttributes('paragraph')?.blockStyle || editor.getAttributes('heading')?.blockStyle || '';
    let cleaned = currentStyle.replace(/border(-top|-bottom)?:\s*[^;]+;?/g, '').replace(/padding:\s*[^;]+;?/g, '').replace(/border-radius:\s*[^;]+;?/g, '').trim();
    let borderCss = '';
    if (borderType === 'box') {
      borderCss = 'border: 1px solid #dadce0; padding: 10px 14px; border-radius: 4px;';
    } else if (borderType === 'thick') {
      borderCss = 'border: 2px solid #5f6368; padding: 10px 14px; border-radius: 4px;';
    } else if (borderType === 'dashed') {
      borderCss = 'border: 1.5px dashed #9aa0a6; padding: 10px 14px; border-radius: 4px;';
    } else if (borderType === 'top') {
      borderCss = 'border-top: 2px solid #1a73e8; padding-top: 8px;';
    } else if (borderType === 'bottom') {
      borderCss = 'border-bottom: 2px solid #dadce0; padding-bottom: 8px;';
    } else if (borderType === 'none') {
      borderCss = '';
    }
    const updatedStyle = `${cleaned} ${borderCss}`.trim();
    if (editor.isActive('heading')) {
      editor.chain().focus().updateAttributes('heading', { blockStyle: updatedStyle }).run();
    } else {
      editor.chain().focus().updateAttributes('paragraph', { blockStyle: updatedStyle }).run();
    }
  };

  const handleSetColumns = (columns) => {
    if (!editor) return;
    if (columns === 1) {
      editor.chain().focus().unsetColumns().run();
    } else {
      editor.chain().focus().setColumns(columns).run();
    }
  };

  const handleInsertColumnBreak = () => {
    if (!editor) return;
    if (onInsertColumnBreak) {
      onInsertColumnBreak();
    } else {
      editor.chain().focus().insertColumnBreak().run();
    }
  };

  const isInsideTable = !!editor?.isActive('table');
  const isImageSelected = !!editor?.isActive('image');

  const ZOOM_OPTIONS = [50, 75, 90, 100, 125, 150];

  return (
    <div ref={menuBarRef} className="flex items-center gap-0.5 text-[13px] text-gray-700 dark:text-gray-300 mt-0.5 relative select-none">
      {/* 1. FILE MENU */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('File')}
          onMouseEnter={() => handleMenuHover('File')}
          className={`px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition whitespace-nowrap ${
            activeMenu === 'File' ? 'bg-gray-200 dark:bg-neutral-800' : 'hover:bg-gray-100 dark:hover:bg-neutral-800'
          }`}
        >
          File
        </button>

        {activeMenu === 'File' && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50 text-[13px] text-gray-800">
            {/* Make a copy */}
            <button
              type="button"
              onClick={() => executeAction(onMakeCopy)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-gray-500" />
                Make a copy
              </span>
            </button>

            {/* Rename */}
            {canEdit && (
              <button
                type="button"
                onClick={() => executeAction(onRename)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-gray-500" />
                  Rename
                </span>
              </button>
            )}

            {/* Download as Submenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('download')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'download' ? null : 'download')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-gray-500" />
                  Download
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {/* Submenu Options */}
              {activeSubmenu === 'download' && (
                <div className="absolute left-full top-0 -ml-1 w-64 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    disabled={!!exportLoadingFormat}
                    onClick={() => executeAction(() => onExport('pdf'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-60 transition text-left cursor-pointer"
                  >
                    <span>PDF Document (.pdf)</span>
                    {exportLoadingFormat === 'pdf' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <span className="text-[11px] text-gray-400 font-mono">PDF</span>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={!!exportLoadingFormat}
                    onClick={() => executeAction(() => onExport('docx'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-60 transition text-left cursor-pointer"
                  >
                    <span>Microsoft Word (.docx)</span>
                    {exportLoadingFormat === 'docx' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <span className="text-[11px] text-gray-400 font-mono">DOCX</span>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={!!exportLoadingFormat}
                    onClick={() => executeAction(() => onExport('txt'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-60 transition text-left cursor-pointer"
                  >
                    <span>Plain Text (.txt)</span>
                    {exportLoadingFormat === 'txt' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <span className="text-[11px] text-gray-400 font-mono">TXT</span>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={!!exportLoadingFormat}
                    onClick={() => executeAction(() => onExport('html'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-60 transition text-left cursor-pointer"
                  >
                    <span>Web Page (.html)</span>
                    {exportLoadingFormat === 'html' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <span className="text-[11px] text-gray-400 font-mono">HTML</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Version History */}
            <button
              type="button"
              onClick={() => executeAction(onOpenVersionHistory)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500" />
                Version history
              </span>
            </button>

            {/* Activity Log */}
            <button
              type="button"
              onClick={() => executeAction(onOpenActivityLog)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" />
                Activity log
              </span>
            </button>

            {/* Document Details */}
            <button
              type="button"
              onClick={() => executeAction(onOpenDetails)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-500" />
                Document details
              </span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Print */}
            <button
              type="button"
              onClick={() => executeAction(onPrint)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-gray-500" />
                Print
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+P</span>
            </button>

            {/* Delete / Move to Trash (Owner/Editor only) */}
            {canDelete && (
              <>
                <div className="my-1 border-t border-gray-200" />
                <button
                  type="button"
                  onClick={() => executeAction(onDelete)}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-red-50 text-red-600 transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Move to trash
                  </span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 2. EDIT MENU */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('Edit')}
          onMouseEnter={() => handleMenuHover('Edit')}
          className={`px-2 py-0.5 rounded text-gray-700 hover:text-gray-900 transition ${
            activeMenu === 'Edit' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
        >
          Edit
        </button>

        {activeMenu === 'Edit' && (
          <div className="absolute left-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50 text-[13px] text-gray-800">
            {/* Undo */}
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => executeAction(onUndo)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Undo2 className="w-4 h-4 text-gray-500" />
                Undo
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+Z</span>
            </button>

            {/* Redo */}
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => executeAction(onRedo)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Redo2 className="w-4 h-4 text-gray-500" />
                Redo
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+Y</span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Cut */}
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => executeAction(onCut)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-gray-500" />
                Cut
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+X</span>
            </button>

            {/* Copy */}
            <button
              type="button"
              onClick={() => executeAction(onCopyText)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-gray-500" />
                Copy
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+C</span>
            </button>

            {/* Paste */}
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => executeAction(onPaste)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-gray-500" />
                Paste
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+V</span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Select All */}
            <button
              type="button"
              onClick={() => executeAction(onSelectAll)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span>Select all</span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+A</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. VIEW MENU */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('View')}
          onMouseEnter={() => handleMenuHover('View')}
          className={`px-2 py-0.5 rounded text-gray-700 hover:text-gray-900 transition ${
            activeMenu === 'View' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
        >
          View
        </button>

        {activeMenu === 'View' && (
          <div className="absolute left-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50 text-[13px] text-gray-800">
            {/* Show Toolbar Toggle */}
            <button
              type="button"
              onClick={() => executeAction(onToggleToolbar)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-4 flex justify-center">
                  {showToolbar && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </span>
                Show toolbar
              </span>
            </button>

            {/* Show Print Layout (Paginated vs Pageless) */}
            <button
              type="button"
              onClick={() => executeAction(onTogglePrintLayout)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-4 flex justify-center">
                  {!pageSettings?.isPageless && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </span>
                Show print layout (Pages)
              </span>
            </button>

            {/* Document Outline / Table of Contents */}
            <button
              type="button"
              onClick={() => executeAction(onToggleToc)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-4 flex justify-center">
                  {showToc && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </span>
                Show document outline
              </span>
            </button>

            {/* Focus Mode */}
            <button
              type="button"
              onClick={() => executeAction(onToggleFocusMode)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-4 flex justify-center">
                  {isFocusMode && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </span>
                Focus mode
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+Shift+F</span>
            </button>

            {/* Reading Mode */}
            <button
              type="button"
              onClick={() => executeAction(onToggleReadingMode)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-4 flex justify-center">
                  {isReadingMode && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </span>
                Reading mode
              </span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => executeAction(onToggleFullscreen)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-4 flex justify-center">
                  {isFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5 text-gray-500" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </span>
                {isFullscreen ? 'Exit full screen' : 'Full screen'}
              </span>
            </button>

            {/* Zoom Submenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('zoom')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'zoom' ? null : 'zoom')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-4 flex justify-center">
                    <ZoomIn className="w-3.5 h-3.5 text-gray-500" />
                  </span>
                  Zoom ({zoomLevel}%)
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {activeSubmenu === 'zoom' && (
                <div className="absolute left-full top-0 -ml-1 w-36 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  {ZOOM_OPTIONS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => executeAction(() => onSetZoom(val))}
                      className="w-full flex items-center justify-between px-3 py-1 hover:bg-gray-100 transition text-left text-xs cursor-pointer"
                    >
                      <span>{val}%</span>
                      {zoomLevel === val && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. INSERT MENU */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('Insert')}
          onMouseEnter={() => handleMenuHover('Insert')}
          className={`px-2 py-0.5 rounded text-gray-700 hover:text-gray-900 transition ${
            activeMenu === 'Insert' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          aria-haspopup="true"
          aria-expanded={activeMenu === 'Insert'}
        >
          Insert
        </button>

        {activeMenu === 'Insert' && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50 text-[13px] text-gray-800">
            {/* Image */}
            <button
              type="button"
              onClick={() => executeAction(onInsertImage)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-500" />
                Image
              </span>
            </button>

            {/* Table */}
            <button
              type="button"
              onClick={() => executeAction(onInsertTable)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-gray-500" />
                Table
              </span>
            </button>

            {/* Chart */}
            <button
              type="button"
              onClick={() => executeAction(onInsertChart)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                Chart
              </span>
            </button>

            {/* Audio clip / button */}
            <button
              type="button"
              onClick={() => executeAction(onInsertAudio)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-gray-500" />
                Audio
              </span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Horizontal line */}
            <button
              type="button"
              onClick={() => executeAction(onInsertHorizontalLine)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-gray-500" />
                Horizontal line
              </span>
            </button>

            {/* Link */}
            <button
              type="button"
              onClick={() => executeAction(onInsertLink)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Link className="w-4 h-4 text-gray-500" />
                Link
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+K</span>
            </button>

            {/* Special Characters / Symbols */}
            <button
              type="button"
              onClick={() => executeAction(onInsertSymbol)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-gray-500" />
                Special characters
              </span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Bookmark */}
            <button
              type="button"
              onClick={() => executeAction(onInsertBookmark)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-gray-500" />
                Bookmark
              </span>
            </button>

            {/* Page Break */}
            <button
              type="button"
              onClick={() => executeAction(onInsertPageBreak)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <SplitSquareVertical className="w-4 h-4 text-gray-500" />
                Page break
              </span>
            </button>

            {/* Building blocks */}
            <button
              type="button"
              onClick={() => executeAction(onInsertBuildingBlock)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-gray-500" />
                Building blocks
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 5. FORMAT MENU */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('Format')}
          onMouseEnter={() => handleMenuHover('Format')}
          className={`px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition whitespace-nowrap ${
            activeMenu === 'Format' ? 'bg-gray-200 dark:bg-neutral-800' : 'hover:bg-gray-100 dark:hover:bg-neutral-800'
          }`}
          aria-haspopup="true"
          aria-expanded={activeMenu === 'Format'}
        >
          Format
        </button>

        {activeMenu === 'Format' && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50 text-[13px] text-gray-800">
            {/* 1. Text (Font styles) */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('format-text')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'format-text' ? null : 'format-text')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Bold className="w-4 h-4 text-gray-500" />
                  Text
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {activeSubmenu === 'format-text' && (
                <div className="absolute left-full top-0 -ml-1 w-60 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().toggleBold().run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-bold">
                      <Bold className="w-4 h-4 text-gray-500" />
                      Bold
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">Ctrl+B</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().toggleItalic().run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2 italic">
                      <Italic className="w-4 h-4 text-gray-500" />
                      Italic
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">Ctrl+I</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().toggleUnderline().run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2 underline">
                      <UnderlineIcon className="w-4 h-4 text-gray-500" />
                      Underline
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">Ctrl+U</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().toggleStrike().run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2 line-through">
                      <Strikethrough className="w-4 h-4 text-gray-500" />
                      Strikethrough
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">Alt+Shift+5</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Paragraph styles */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('format-styles')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'format-styles' ? null : 'format-styles')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Heading className="w-4 h-4 text-gray-500" />
                  Paragraph styles
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {activeSubmenu === 'format-styles' && (
                <div className="absolute left-full top-0 -ml-1 w-64 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().setParagraph().run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="text-sm font-normal text-gray-800">Normal text</span>
                    {editor?.isActive('paragraph') && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().toggleHeading({ level: 1 }).run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="text-lg font-bold text-gray-900">Title</span>
                    {editor?.isActive('heading', { level: 1 }) && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().toggleHeading({ level: 2 }).run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="text-base font-semibold text-gray-700">Subtitle</span>
                    {editor?.isActive('heading', { level: 2 }) && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>

                  <div className="my-1 border-t border-gray-200" />

                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().toggleHeading({ level: 1 }).run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="text-lg font-bold">Heading 1</span>
                    <span className="text-[11px] text-gray-400 font-mono">Ctrl+Alt+1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().toggleHeading({ level: 2 }).run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="text-base font-semibold">Heading 2</span>
                    <span className="text-[11px] text-gray-400 font-mono">Ctrl+Alt+2</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().toggleHeading({ level: 3 }).run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="text-sm font-semibold">Heading 3</span>
                    <span className="text-[11px] text-gray-400 font-mono">Ctrl+Alt+3</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().toggleHeading({ level: 4 }).run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="text-[13px] font-semibold">Heading 4</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().toggleHeading({ level: 5 }).run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="text-xs font-semibold">Heading 5</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().toggleHeading({ level: 6 }).run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="text-xs font-medium">Heading 6</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Align & indent */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('format-align')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'format-align' ? null : 'format-align')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-gray-500" />
                  Align & indent
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {activeSubmenu === 'format-align' && (
                <div className="absolute left-full top-0 -ml-1 w-60 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetAlign('left'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <AlignLeft className="w-4 h-4 text-gray-500" />
                      Left align
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">Ctrl+Shift+L</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetAlign('center'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <AlignCenter className="w-4 h-4 text-gray-500" />
                      Center align
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">Ctrl+Shift+E</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetAlign('right'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <AlignRight className="w-4 h-4 text-gray-500" />
                      Right align
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">Ctrl+Shift+R</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetAlign('justify'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <AlignJustify className="w-4 h-4 text-gray-500" />
                      Justify
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">Ctrl+Shift+J</span>
                  </button>

                  <div className="my-1 border-t border-gray-200" />

                  <button
                    type="button"
                    onClick={() => executeAction(handleIncreaseIndent)}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Indent className="w-4 h-4 text-gray-500" />
                      Increase indent
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">Tab</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(handleDecreaseIndent)}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Outdent className="w-4 h-4 text-gray-500" />
                      Decrease indent
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">Shift+Tab</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Line & paragraph spacing */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('format-spacing')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'format-spacing' ? null : 'format-spacing')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Pilcrow className="w-4 h-4 text-gray-500" />
                  Line & paragraph spacing
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {activeSubmenu === 'format-spacing' && (
                <div className="absolute left-full top-0 -ml-1 w-64 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetLineSpacing('1.0'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Single</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetLineSpacing('1.15'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>1.15</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetLineSpacing('1.5'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>1.5</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetLineSpacing('2.0'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Double</span>
                  </button>

                  <div className="my-1 border-t border-gray-200" />

                  <button
                    type="button"
                    onClick={() => executeAction(() => handleParagraphSpacing('add-before'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Add space before paragraph</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleParagraphSpacing('add-after'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Add space after paragraph</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleParagraphSpacing('remove-before'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Remove space before paragraph</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleParagraphSpacing('remove-after'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Remove space after paragraph</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. Bullets & numbering */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('format-bullets')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'format-bullets' ? null : 'format-bullets')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <List className="w-4 h-4 text-gray-500" />
                  Bullets & numbering
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {activeSubmenu === 'format-bullets' && (
                <div className="absolute left-full top-0 -ml-1 w-60 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().toggleBulletList().run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <List className="w-4 h-4 text-gray-500" />
                      Bulleted list
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">Ctrl+Shift+8</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => editor?.chain().focus().toggleOrderedList().run())}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ListOrdered className="w-4 h-4 text-gray-500" />
                      Numbered list
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">Ctrl+Shift+7</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6. Borders & lines */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('format-borders')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'format-borders' ? null : 'format-borders')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Square className="w-4 h-4 text-gray-500" />
                  Borders & lines
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {activeSubmenu === 'format-borders' && (
                <div className="absolute left-full top-0 -ml-1 w-56 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetBorder('box'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Box border (1px solid)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetBorder('thick'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Thick border (2px solid)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetBorder('dashed'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Dashed border</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetBorder('top'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Top border line</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetBorder('bottom'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Bottom border line</span>
                  </button>
                  <div className="my-1 border-t border-gray-200" />
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetBorder('none'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 text-rose-600 transition text-left cursor-pointer"
                  >
                    <span>Remove borders</span>
                  </button>
                </div>
              )}
            </div>

            {/* 7. Table Formatting */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('format-table')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'format-table' ? null : 'format-table')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-gray-500" />
                  Table
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {activeSubmenu === 'format-table' && (
                <div className="absolute left-full top-0 -ml-1 w-64 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  {isInsideTable ? (
                    <>
                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().addRowBefore().run())}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                      >
                        <Rows className="w-4 h-4 text-gray-500" />
                        Insert row above
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().addRowAfter().run())}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                      >
                        <Rows className="w-4 h-4 text-gray-500" />
                        Insert row below
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().deleteRow().run())}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-rose-600 transition text-left cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        Delete row
                      </button>

                      <div className="my-1 border-t border-gray-200" />

                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().addColumnBefore().run())}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                      >
                        <Columns className="w-4 h-4 text-gray-500" />
                        Insert column left
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().addColumnAfter().run())}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                      >
                        <Columns className="w-4 h-4 text-gray-500" />
                        Insert column right
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().deleteColumn().run())}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-rose-600 transition text-left cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        Delete column
                      </button>

                      <div className="my-1 border-t border-gray-200" />

                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().mergeCells().run())}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                      >
                        Merge cells
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().splitCell().run())}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                      >
                        Split cell
                      </button>

                      <div className="my-1 border-t border-gray-200" />

                      <div className="px-3 py-1 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Cell background
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1">
                        {[
                          { color: null, label: 'None', bg: 'bg-white border border-gray-300' },
                          { color: '#f1f3f4', label: 'Gray', bg: 'bg-gray-100' },
                          { color: '#e8f0fe', label: 'Blue', bg: 'bg-blue-100' },
                          { color: '#fef7e0', label: 'Yellow', bg: 'bg-amber-100' },
                          { color: '#e6f4ea', label: 'Green', bg: 'bg-emerald-100' }
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => executeAction(() => editor?.chain().focus().setCellAttribute('backgroundColor', item.color).run())}
                            className={`w-6 h-6 rounded-full cursor-pointer transition hover:scale-110 shadow-xs ${item.bg}`}
                            title={item.label}
                          />
                        ))}
                      </div>

                      <div className="my-1 border-t border-gray-200" />

                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().deleteTable().run())}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 text-rose-600 transition text-left cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        Delete table
                      </button>
                    </>
                  ) : (
                    <div className="px-3 py-2.5 text-xs text-gray-500 italic">
                      Place cursor inside a table to format rows, columns, and cells.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 8. Image Formatting */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('format-image')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'format-image' ? null : 'format-image')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  Image
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {activeSubmenu === 'format-image' && (
                <div className="absolute left-full top-0 -ml-1 w-56 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  {isImageSelected ? (
                    <>
                      <div className="px-3 py-1 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Resize image
                      </div>
                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().updateAttributes('image', { width: '25%' }).run())}
                        className="w-full flex items-center justify-between px-3 py-1 hover:bg-gray-100 transition text-left text-xs cursor-pointer"
                      >
                        <span>Small (25%)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().updateAttributes('image', { width: '50%' }).run())}
                        className="w-full flex items-center justify-between px-3 py-1 hover:bg-gray-100 transition text-left text-xs cursor-pointer"
                      >
                        <span>Medium (50%)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().updateAttributes('image', { width: '75%' }).run())}
                        className="w-full flex items-center justify-between px-3 py-1 hover:bg-gray-100 transition text-left text-xs cursor-pointer"
                      >
                        <span>Large (75%)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().updateAttributes('image', { width: '100%' }).run())}
                        className="w-full flex items-center justify-between px-3 py-1 hover:bg-gray-100 transition text-left text-xs cursor-pointer"
                      >
                        <span>Original / Full (100%)</span>
                      </button>

                      <div className="my-1 border-t border-gray-200" />

                      <div className="px-3 py-1 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Text wrap & position
                      </div>
                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().updateAttributes('image', { alignment: 'inline' }).run())}
                        className="w-full flex items-center justify-between px-3 py-1 hover:bg-gray-100 transition text-left text-xs cursor-pointer"
                      >
                        <span>In line</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().updateAttributes('image', { alignment: 'center' }).run())}
                        className="w-full flex items-center justify-between px-3 py-1 hover:bg-gray-100 transition text-left text-xs cursor-pointer"
                      >
                        <span>Break text (Center)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().updateAttributes('image', { alignment: 'left' }).run())}
                        className="w-full flex items-center justify-between px-3 py-1 hover:bg-gray-100 transition text-left text-xs cursor-pointer"
                      >
                        <span>Wrap text left</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAction(() => editor?.chain().focus().updateAttributes('image', { alignment: 'right' }).run())}
                        className="w-full flex items-center justify-between px-3 py-1 hover:bg-gray-100 transition text-left text-xs cursor-pointer"
                      >
                        <span>Wrap text right</span>
                      </button>
                    </>
                  ) : (
                    <div className="px-3 py-2.5 text-xs text-gray-500 italic">
                      Click an image to format resize and text wrap.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="my-1 border-t border-gray-200" />

            {/* 9. Text direction */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('format-direction')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'format-direction' ? null : 'format-direction')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-gray-500" />
                  Text direction
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {activeSubmenu === 'format-direction' && (
                <div className="absolute left-full top-0 -ml-1 w-52 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetTextDirection('ltr'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Left-to-right (LTR)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetTextDirection('rtl'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Right-to-left (RTL)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Columns Submenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('format-columns')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'format-columns' ? null : 'format-columns')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Columns className="w-4 h-4 text-gray-500" />
                  Columns
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {activeSubmenu === 'format-columns' && (
                <div className="absolute left-full top-0 -ml-1 w-56 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetColumns(1))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>1 Column (Standard)</span>
                    {!editor?.isActive('columnBlock') && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetColumns(2))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>2 Columns</span>
                    {editor?.isActive('columnBlock', { columns: 2 }) && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => handleSetColumns(3))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>3 Columns</span>
                    {editor?.isActive('columnBlock', { columns: 3 }) && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>

                  <div className="my-1 border-t border-gray-200" />

                  <button
                    type="button"
                    onClick={() => executeAction(handleInsertColumnBreak)}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Insert column break</span>
                  </button>
                </div>
              )}
            </div>

            {/* Page Orientation Submenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('format-orientation')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'format-orientation' ? null : 'format-orientation')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Page orientation
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {activeSubmenu === 'format-orientation' && (
                <div className="absolute left-full top-0 -ml-1 w-52 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => executeAction(() => onSetOrientation && onSetOrientation('portrait'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Portrait (8.5 × 11 in)</span>
                    {pageSettings?.orientation !== 'landscape' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => onSetOrientation && onSetOrientation('landscape'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Landscape (11 × 8.5 in)</span>
                    {pageSettings?.orientation === 'landscape' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Headers & Footers */}
            <button
              type="button"
              onClick={() => executeAction(onEditHeaderFooter)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Headers & footers
              </span>
            </button>

            {/* Page numbers Submenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('format-page-numbers')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'format-page-numbers' ? null : 'format-page-numbers')}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Pilcrow className="w-4 h-4 text-gray-500" />
                  Page numbers
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {activeSubmenu === 'format-page-numbers' && (
                <div className="absolute left-full top-0 -ml-1 w-60 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => executeAction(() => onSetPageNumbers && onSetPageNumbers(true, 'header-right'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Top of page (Right)</span>
                    {pageSettings?.showPageNumbers && pageSettings?.pageNumberPosition === 'header-right' && (
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => onSetPageNumbers && onSetPageNumbers(true, 'footer-right'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Bottom of page (Right)</span>
                    {pageSettings?.showPageNumbers && pageSettings?.pageNumberPosition === 'footer-right' && (
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => executeAction(() => onSetPageNumbers && onSetPageNumbers(true, 'footer-center'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
                  >
                    <span>Bottom of page (Center)</span>
                    {pageSettings?.showPageNumbers && pageSettings?.pageNumberPosition === 'footer-center' && (
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </button>

                  <div className="my-1 border-t border-gray-200" />

                  <button
                    type="button"
                    onClick={() => executeAction(() => onSetPageNumbers && onSetPageNumbers(false, 'footer-right'))}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 text-rose-600 transition text-left cursor-pointer"
                  >
                    <span>Remove page numbers</span>
                  </button>
                </div>
              )}
            </div>

            <div className="my-1 border-t border-gray-200" />

            {/* 10. Clear formatting */}
            <button
              type="button"
              onClick={() => executeAction(handleClearFormatting)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <RemoveFormatting className="w-4 h-4 text-gray-500" />
                Clear formatting
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+\</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. TOOLS MENU */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('Tools')}
          onMouseEnter={() => handleMenuHover('Tools')}
          className={`px-2 py-0.5 rounded text-gray-700 hover:text-gray-900 transition ${
            activeMenu === 'Tools' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          aria-haspopup="true"
          aria-expanded={activeMenu === 'Tools'}
        >
          Tools
        </button>

        {activeMenu === 'Tools' && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50 text-[13px] text-gray-800">
            {/* Gemini AI Assistant */}
            <button
              type="button"
              onClick={() => executeAction(onOpenAiAssistant)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-50 text-blue-700 font-bold transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                Gemini AI Writing Assistant
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">AI</span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Spelling and grammar check */}
            <button
              type="button"
              onClick={() => executeAction(onOpenGrammarCheck)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <SpellCheck className="w-4 h-4 text-blue-600" />
                Spelling and grammar
              </span>
            </button>

            {/* Proofread */}
            <button
              type="button"
              onClick={() => executeAction(onProofread)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <SpellCheck className="w-4 h-4 text-gray-500" />
                Proofread document
              </span>
            </button>

            {/* Word count */}
            <button
              type="button"
              onClick={() => executeAction(onOpenWordCount)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Word count
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+Shift+C</span>
            </button>

            {/* Line numbers toggle */}
            <button
              type="button"
              onClick={() => executeAction(onToggleLineNumbers)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-4 flex justify-center">
                  {showLineNumbers && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </span>
                Line numbers
              </span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Voice typing */}
            <button
              type="button"
              onClick={() => executeAction(onToggleVoiceTyping)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Mic className={`w-4 h-4 ${isVoiceTyping ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
                Voice typing
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+Shift+S</span>
            </button>

            {/* Compare documents */}
            <button
              type="button"
              onClick={() => executeAction(onOpenCompare)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-gray-500" />
                Compare documents
              </span>
            </button>

            {/* Citations */}
            <button
              type="button"
              onClick={() => executeAction(onOpenCitations)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-gray-500" />
                Citations
              </span>
            </button>

            <div className="my-1 border-t border-gray-200" />

            {/* Notification settings */}
            <button
              type="button"
              onClick={() => executeAction(onOpenPreferences)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-500" />
                Notification settings
              </span>
            </button>

            {/* Preferences */}
            <button
              type="button"
              onClick={() => executeAction(onOpenPreferences)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gray-500" />
                Preferences
              </span>
            </button>

            {/* Accessibility */}
            <button
              type="button"
              onClick={() => executeAction(onOpenAccessibility)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" />
                Accessibility
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Table Tabs in Top Navbar (Appears seamlessly when inside a table) */}
      {isInsideTable && (
        <>
          {/* Table Design Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => handleMenuClick('TableDesign')}
              onMouseEnter={() => handleMenuHover('TableDesign')}
              className={`px-2 py-0.5 rounded font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 transition ${
                activeMenu === 'TableDesign' ? 'bg-indigo-100 dark:bg-indigo-950' : 'hover:bg-indigo-50 dark:hover:bg-neutral-800'
              }`}
            >
              Table Design
            </button>

            {activeMenu === 'TableDesign' && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-[#1e2024] border border-gray-200 dark:border-neutral-800 rounded-sm shadow-lg py-1.5 z-50 text-[13px]">
                <button
                  type="button"
                  onClick={() => executeAction(() => editor?.chain().focus().toggleHeaderRow().run())}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-left cursor-pointer"
                >
                  <Type className="w-4 h-4 text-blue-600" />
                  Toggle Header Row
                </button>

                <div className="my-1 border-t border-gray-200 dark:border-neutral-800" />

                <div className="px-3 py-1 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Cell Shading
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 flex-wrap">
                  {[
                    { color: null, label: 'None', bg: 'bg-white border border-gray-300' },
                    { color: '#e8f0fe', label: 'Soft Blue', bg: 'bg-blue-100' },
                    { color: '#e6f4ea', label: 'Soft Green', bg: 'bg-emerald-100' },
                    { color: '#fef7e0', label: 'Soft Yellow', bg: 'bg-amber-100' },
                    { color: '#fce8e6', label: 'Soft Red', bg: 'bg-rose-100' },
                    { color: '#f1f3f4', label: 'Gray', bg: 'bg-gray-200' }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => executeAction(() => editor?.chain().focus().setCellAttribute('backgroundColor', item.color).run())}
                      className={`w-6 h-6 rounded cursor-pointer transition hover:scale-110 shadow-2xs ${item.bg}`}
                      title={item.label}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Table Layout Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => handleMenuClick('TableLayout')}
              onMouseEnter={() => handleMenuHover('TableLayout')}
              className={`px-2 py-0.5 rounded font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 transition ${
                activeMenu === 'TableLayout' ? 'bg-indigo-100 dark:bg-indigo-950' : 'hover:bg-indigo-50 dark:hover:bg-neutral-800'
              }`}
            >
              Table Layout
            </button>

            {activeMenu === 'TableLayout' && (
              <div className="absolute left-0 top-full mt-1 w-60 bg-white dark:bg-[#1e2024] border border-gray-200 dark:border-neutral-800 rounded-sm shadow-lg py-1.5 z-50 text-[13px]">
                <button
                  type="button"
                  onClick={() => executeAction(() => editor?.chain().focus().addRowBefore().run())}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-left cursor-pointer"
                >
                  <Rows className="w-4 h-4 text-gray-500" />
                  Insert Row Above
                </button>
                <button
                  type="button"
                  onClick={() => executeAction(() => editor?.chain().focus().addRowAfter().run())}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-left cursor-pointer"
                >
                  <Rows className="w-4 h-4 text-gray-500" />
                  Insert Row Below
                </button>
                <button
                  type="button"
                  onClick={() => executeAction(() => editor?.chain().focus().addColumnBefore().run())}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-left cursor-pointer"
                >
                  <Columns className="w-4 h-4 text-gray-500" />
                  Insert Column Left
                </button>
                <button
                  type="button"
                  onClick={() => executeAction(() => editor?.chain().focus().addColumnAfter().run())}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-left cursor-pointer"
                >
                  <Columns className="w-4 h-4 text-gray-500" />
                  Insert Column Right
                </button>

                <div className="my-1 border-t border-gray-200 dark:border-neutral-800" />

                <button
                  type="button"
                  onClick={() => executeAction(() => editor?.chain().focus().mergeOrSplit().run())}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-left cursor-pointer font-semibold text-blue-600"
                >
                  Merge / Split Cells
                </button>

                <div className="my-1 border-t border-gray-200 dark:border-neutral-800" />

                <button
                  type="button"
                  onClick={() => executeAction(() => editor?.chain().focus().deleteRow().run())}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 text-rose-600 transition text-left cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  Delete Row
                </button>
                <button
                  type="button"
                  onClick={() => executeAction(() => editor?.chain().focus().deleteColumn().run())}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 text-rose-600 transition text-left cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  Delete Column
                </button>
                <button
                  type="button"
                  onClick={() => executeAction(() => editor?.chain().focus().deleteTable().run())}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-100 text-rose-700 font-bold transition text-left cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  Delete Table
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Passive Extensions button */}
      <button
        type="button"
        className="px-2 py-0.5 rounded hover:bg-gray-100 transition text-gray-700 hover:text-gray-900"
      >
        Extensions
      </button>

      {/* 4. HELP MENU */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('Help')}
          onMouseEnter={() => handleMenuHover('Help')}
          className={`px-2 py-0.5 rounded text-gray-700 hover:text-gray-900 transition ${
            activeMenu === 'Help' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
        >
          Help
        </button>

        {activeMenu === 'Help' && (
          <div className="absolute left-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-sm shadow-lg py-1.5 z-50 text-[13px] text-gray-800">
            <button
              type="button"
              onClick={() => executeAction(onOpenShortcuts)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-gray-500" />
                Keyboard shortcuts
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Ctrl+/</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorMenuBar;
