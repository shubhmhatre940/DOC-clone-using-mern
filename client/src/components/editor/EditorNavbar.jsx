import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConnectionStatus from './ConnectionStatus';
import ActiveUsers from './ActiveUsers';
import EditorMenuBar from './EditorMenuBar';
import {
  FileText,
  CloudCheck,
  Loader2,
  CloudOff,
  Lock,
  Save,
  Share2,
  MessageSquare,
  BookOpen,
  ListTree,
  Activity as ActivityIcon,
  Sparkles
} from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

const EditorNavbar = ({
  title,
  setTitle,
  onSaveTitle,
  saveStatus,
  onManualSave,
  activeUsers = [],
  connectionStatus = 'connected',
  onOpenShare,
  isEditable = true,
  editor = null,
  commentsCount = 0,
  onToggleComments,
  isCommentsOpen = false,
  // TOC & View modes
  showToc = false,
  onToggleToc,
  isFocusMode = false,
  onToggleFocusMode,
  isReadingMode = false,
  onToggleReadingMode,
  // Activity log & Grammar & AI
  onOpenActivityLog,
  onOpenGrammarCheck,
  onOpenAiAssistant,
  // Menu bar props
  onMakeCopy,
  onDelete,
  onExport,
  exportLoadingFormat,
  canDelete = true,
  onUndo,
  onRedo,
  onCut,
  onCopyText,
  onPaste,
  onSelectAll,
  showToolbar = true,
  onToggleToolbar,
  isFullscreen = false,
  onToggleFullscreen,
  zoomLevel = 100,
  onSetZoom,
  onOpenDetails,
  onOpenVersionHistory,
  onPrint,
  onOpenShortcuts,
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
  onInsertColumnBreak
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title || 'Untitled document');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setLocalTitle(title || 'Untitled document');
  }, [title]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSubmit = () => {
    if (!isEditable) return;
    setIsEditingTitle(false);
    const finalTitle = localTitle.trim() || 'Untitled document';
    setLocalTitle(finalTitle);
    setTitle(finalTitle);
    onSaveTitle(finalTitle);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setLocalTitle(title);
    }
  };

  const handleTriggerRename = () => {
    if (isEditable) {
      setIsEditingTitle(true);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="flex flex-col bg-white dark:bg-[#1f1f1f] border-b border-gray-200 dark:border-[#383a3d] select-none relative z-30">
      {/* Top row */}
      <div className="flex items-center justify-between px-3 py-2">
        {/* Left: Document Icon & Title & Status */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-1 flex items-center justify-center text-blue-600 hover:opacity-85 transition"
            title="Google Docs Home"
          >
            <div className="w-8 h-9 bg-[#2684fc] rounded-xs flex items-center justify-center text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
          </button>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isEditable && isEditingTitle ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleKeyDown}
                  className="text-lg font-medium text-gray-900 dark:text-white border border-blue-500 dark:border-blue-400 rounded px-1.5 py-0.5 outline-none bg-white dark:bg-[#282a2e] max-w-sm sm:max-w-md shadow-xs"
                />
              ) : (
                <h1
                  onClick={() => isEditable && setIsEditingTitle(true)}
                  className={`text-lg font-medium text-gray-800 dark:text-gray-100 border border-transparent rounded px-1 py-0.5 truncate max-w-xs sm:max-w-md transition ${
                    isEditable ? 'hover:border-gray-400 dark:hover:border-neutral-600 cursor-pointer' : 'cursor-default'
                  }`}
                  title={isEditable ? 'Rename document' : title}
                >
                  {localTitle}
                </h1>
              )}

              {/* Real-time Collaboration Connection Indicator */}
              <ConnectionStatus status={connectionStatus} />

              {/* Save-to-Database Status Indicator (Auto-save) */}
              <div className="flex items-center ml-1 text-xs text-gray-500 dark:text-gray-400 transition-opacity duration-300 ease-in-out">
                {saveStatus === 'saving' && (
                  <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 animate-in fade-in duration-200">
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span className="hidden sm:inline">Saving...</span>
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <button
                    type="button"
                    onClick={onOpenVersionHistory}
                    className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition cursor-pointer animate-in fade-in duration-300"
                    title="All changes saved. Click to view version history"
                  >
                    <CloudCheck className="w-4 h-4 text-gray-600 dark:text-gray-300 shrink-0" />
                    <span className="hidden sm:inline">All changes saved</span>
                  </button>
                )}
                {saveStatus === 'unsaved' && (
                  <span
                    className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 animate-in fade-in duration-200"
                    title="Unsaved changes (saving automatically in 1.5s, or press Ctrl+S)"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="hidden sm:inline">Unsaved changes</span>
                  </span>
                )}
                {saveStatus === 'offline' && (
                  <span
                    className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 animate-in fade-in duration-200"
                    title="Offline — changes will sync when reconnected"
                  >
                    <CloudOff className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Offline — will sync</span>
                  </span>
                )}
              </div>
            </div>

            {/* Menu Bar (Google Docs functional dropdown menus) */}
            <EditorMenuBar
              editor={editor}
              onMakeCopy={onMakeCopy}
              onRename={handleTriggerRename}
              onDelete={onDelete}
              onExport={onExport}
              exportLoadingFormat={exportLoadingFormat}
              canDelete={canDelete}
              canEdit={isEditable}
              onUndo={onUndo}
              onRedo={onRedo}
              onCut={onCut}
              onCopyText={onCopyText}
              onPaste={onPaste}
              onSelectAll={onSelectAll}
              showToolbar={showToolbar}
              onToggleToolbar={onToggleToolbar}
              showToc={showToc}
              onToggleToc={onToggleToc}
              isFocusMode={isFocusMode}
              onToggleFocusMode={onToggleFocusMode}
              isReadingMode={isReadingMode}
              onToggleReadingMode={onToggleReadingMode}
              isFullscreen={isFullscreen}
              onToggleFullscreen={onToggleFullscreen}
              zoomLevel={zoomLevel}
              onSetZoom={onSetZoom}
              onOpenDetails={onOpenDetails}
              onOpenVersionHistory={onOpenVersionHistory}
              onOpenActivityLog={onOpenActivityLog}
              onPrint={onPrint}
              onOpenShortcuts={onOpenShortcuts}
              // Insert actions
              onInsertLink={onInsertLink}
              onInsertSymbol={onInsertSymbol}
              onInsertHorizontalLine={onInsertHorizontalLine}
              onInsertImage={onInsertImage}
              onInsertTable={onInsertTable}
              onInsertAudio={onInsertAudio}
              onInsertChart={onInsertChart}
              onInsertBookmark={onInsertBookmark}
              onInsertPageBreak={onInsertPageBreak}
              onInsertBuildingBlock={onInsertBuildingBlock}
              // Tools actions
              onOpenWordCount={onOpenWordCount}
              showLineNumbers={showLineNumbers}
              onToggleLineNumbers={onToggleLineNumbers}
              onProofread={onProofread}
              onOpenGrammarCheck={onOpenGrammarCheck}
              onOpenAiAssistant={onOpenAiAssistant}
              isVoiceTyping={isVoiceTyping}
              onToggleVoiceTyping={onToggleVoiceTyping}
              onOpenCompare={onOpenCompare}
              onOpenCitations={onOpenCitations}
              onOpenPreferences={onOpenPreferences}
              onOpenAccessibility={onOpenAccessibility}
              // Page layout features
              pageSettings={pageSettings}
              onTogglePrintLayout={onTogglePrintLayout}
              onSetOrientation={onSetOrientation}
              onEditHeaderFooter={onEditHeaderFooter}
              onSetPageNumbers={onSetPageNumbers}
              onInsertColumnBreak={onInsertColumnBreak}
            />
          </div>
        </div>

        {/* Right: Active Users, Quick Mode Toggles, Share Button & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Document Outline Quick Toggle */}
          <button
            type="button"
            onClick={onToggleToc}
            className={`p-1.5 rounded-full transition cursor-pointer ${
              showToc
                ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
            }`}
            title={showToc ? 'Hide document outline' : 'Show document outline'}
          >
            <ListTree className="w-4 h-4" />
          </button>

          {/* Reading Mode Quick Toggle */}
          <button
            type="button"
            onClick={onToggleReadingMode}
            className={`p-1.5 rounded-full transition cursor-pointer ${
              isReadingMode
                ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
            }`}
            title={isReadingMode ? 'Exit reading mode' : 'Reading mode'}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Gemini AI Writing Assistant Quick Trigger Button */}
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xs transition text-xs font-bold cursor-pointer"
            title="Gemini AI Assistant (Generate, Rephrase, Shift Tone, Summarize)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Active Collaborators Presence List */}
          <ActiveUsers users={activeUsers} />

          {/* Manual Save Button (Only if editable) */}
          {isEditable && !isReadingMode && (
            <button
              onClick={onManualSave}
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-700 transition focus:outline-none cursor-pointer"
              title="Save changes (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Save</span>
            </button>
          )}

          {/* Comments History / Toggle Button */}
          <button
            type="button"
            onClick={onToggleComments}
            className={`relative p-2 rounded-full transition cursor-pointer ${
              isCommentsOpen
                ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
            }`}
            title="Open comments (Ctrl+Alt+M)"
          >
            <MessageSquare className="w-4 h-4" />
            {commentsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {commentsCount}
              </span>
            )}
          </button>

          {/* In-App Notifications Bell */}
          <NotificationBell />

          {/* Share Button (Google Docs Blue) */}
          <button
            type="button"
            onClick={onOpenShare}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-[#c2e7ff] dark:bg-blue-600 text-[#001d35] dark:text-white hover:bg-[#b3dfff] dark:hover:bg-blue-500 hover:shadow-xs transition text-xs font-semibold cursor-pointer"
            title="Share with people and groups"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {/* User Avatar */}
          <div
            className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center text-xs font-semibold shadow-xs"
            title={user?.name || 'Account'}
          >
            {getInitials(user?.name)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default EditorNavbar;
