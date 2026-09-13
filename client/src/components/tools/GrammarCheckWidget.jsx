import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SpellCheck,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Copy,
  Terminal,
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { checkGrammar } from '../../api/grammar';

const DOCKER_CMD = 'docker run -p 8081:8010 erikvl87/languagetool';

const GrammarCheckWidget = ({ editor, isOpen, onClose }) => {
  const [issues, setIssues] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [serviceAvailable, setServiceAvailable] = useState(true);
  const [ignoredRules, setIgnoredRules] = useState(new Set());
  const [copiedDocker, setCopiedDocker] = useState(false);
  const lastCheckedTextRef = useRef('');

  const runCheck = useCallback(async () => {
    if (!editor) return;
    const text = editor.getText();
    if (!text || !text.trim()) {
      setIssues([]);
      return;
    }

    try {
      setLoading(true);
      const res = await checkGrammar(text);
      setServiceAvailable(res.serviceAvailable ?? true);
      const matches = res.matches || [];
      setIssues(matches);
      setCurrentIndex(0);
      lastCheckedTextRef.current = text;
    } catch (err) {
      console.warn('[GrammarCheckWidget] Non-blocking check failed:', err);
      setServiceAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [editor]);

  // Debounced auto-check when editor changes while widget is open
  useEffect(() => {
    if (!isOpen || !editor) return;

    runCheck();

    let debounceTimer = null;
    const handleUpdate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const text = editor.getText();
        if (text !== lastCheckedTextRef.current) {
          runCheck();
        }
      }, 2500); // 2.5s pause debounce
    };

    editor.on('update', handleUpdate);
    return () => {
      clearTimeout(debounceTimer);
      editor.off('update', handleUpdate);
    };
  }, [isOpen, editor, runCheck]);

  if (!isOpen) return null;

  // Filter out ignored rules
  const activeIssues = issues.filter((iss) => !ignoredRules.has(iss.rule?.id || iss.offset));
  const currentIssue = activeIssues[currentIndex] || null;

  const handleCopyDocker = () => {
    navigator.clipboard.writeText(DOCKER_CMD);
    setCopiedDocker(true);
    setTimeout(() => setCopiedDocker(false), 2000);
  };

  const handleIgnore = () => {
    if (!currentIssue) return;
    const key = currentIssue.rule?.id || currentIssue.offset;
    setIgnoredRules((prev) => new Set(prev).add(key));
    if (currentIndex >= activeIssues.length - 1) {
      setCurrentIndex(Math.max(0, activeIssues.length - 2));
    }
  };

  const handleAccept = (replacement) => {
    if (!editor || !currentIssue || !replacement) return;

    const originalWord = currentIssue.context?.text?.substr(
      currentIssue.context.offset,
      currentIssue.context.length
    ) || '';

    // Replace in editor using text matching
    if (originalWord) {
      let replaced = false;
      const { doc } = editor.state;
      doc.descendants((node, pos) => {
        if (!replaced && node.isText && node.text.includes(originalWord)) {
          const start = pos + node.text.indexOf(originalWord);
          const end = start + originalWord.length;
          editor
            .chain()
            .focus()
            .setTextSelection({ from: start, to: end })
            .insertContent(replacement)
            .run();
          replaced = true;
        }
      });
    }

    // Ignore this specific issue from local list so it doesn't prompt again immediately
    const key = currentIssue.rule?.id || currentIssue.offset;
    setIgnoredRules((prev) => new Set(prev).add(key));
  };

  const getIssueBadge = (issueType) => {
    if (issueType === 'misspelling') {
      return {
        label: 'Spelling',
        color: 'bg-rose-100 text-rose-800 border-rose-300'
      };
    }
    if (issueType === 'style') {
      return {
        label: 'Style',
        color: 'bg-purple-100 text-purple-800 border-purple-300'
      };
    }
    return {
      label: 'Grammar',
      color: 'bg-blue-100 text-blue-800 border-blue-300'
    };
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-40 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden select-none animate-in fade-in slide-in-from-bottom-4 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex items-center gap-2">
          <SpellCheck className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Spelling & Grammar
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={runCheck}
            disabled={loading}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer"
            title="Re-check now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Service Status Pill */}
      <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              serviceAvailable ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
            }`}
          />
          <span className="text-gray-600 font-medium">
            {serviceAvailable ? 'LanguageTool connected (port 8081)' : 'LanguageTool offline'}
          </span>
        </div>
        {loading && <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />}
      </div>

      {/* Body */}
      <div className="p-4">
        {!serviceAvailable ? (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <p className="font-semibold mb-1 flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                LanguageTool server not running
              </p>
              <p className="text-[11px] text-amber-700">
                The grammar check uses a free self-hosted LanguageTool container. Start it locally with:
              </p>
            </div>

            <div className="flex items-center justify-between bg-gray-900 text-gray-200 p-2.5 rounded-lg text-[11px] font-mono">
              <span className="truncate">{DOCKER_CMD}</span>
              <button
                type="button"
                onClick={handleCopyDocker}
                className="ml-2 text-xs text-gray-400 hover:text-white shrink-0 p-1 cursor-pointer"
                title="Copy command"
              >
                {copiedDocker ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 italic">
              Editing, auto-save, and collaboration remain fully functional without LanguageTool.
            </p>
          </div>
        ) : activeIssues.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-gray-800">No issues found</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Your document spelling and grammar look clean!
            </p>
          </div>
        ) : currentIssue ? (
          <div className="space-y-3">
            {/* Top row: Counter & Category badge */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-gray-500">
                Suggestion {currentIndex + 1} of {activeIssues.length}
              </span>
              {(() => {
                const badge = getIssueBadge(currentIssue.rule?.issueType);
                return (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                );
              })()}
            </div>

            {/* Context snippet with wavy underline */}
            <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-800 leading-relaxed font-sans">
              {currentIssue.context?.text ? (
                <>
                  {currentIssue.context.text.slice(0, currentIssue.context.offset)}
                  <span className="underline decoration-wavy decoration-rose-500 font-semibold bg-rose-50 px-1 py-0.5 rounded">
                    {currentIssue.context.text.slice(
                      currentIssue.context.offset,
                      currentIssue.context.offset + currentIssue.context.length
                    )}
                  </span>
                  {currentIssue.context.text.slice(
                    currentIssue.context.offset + currentIssue.context.length
                  )}
                </>
              ) : (
                <span>{currentIssue.message}</span>
              )}
            </div>

            {/* Description message */}
            <p className="text-xs text-gray-600">{currentIssue.message}</p>

            {/* Suggested replacements */}
            {currentIssue.replacements && currentIssue.replacements.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Suggestions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentIssue.replacements.map((rep, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAccept(rep)}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-md text-xs font-semibold border border-blue-200 transition cursor-pointer"
                    >
                      {rep}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                  title="Previous suggestion"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentIndex >= activeIssues.length - 1}
                  onClick={() =>
                    setCurrentIndex((prev) => Math.min(activeIssues.length - 1, prev + 1))
                  }
                  className="p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                  title="Next suggestion"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleIgnore}
                  className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-md transition cursor-pointer"
                >
                  Ignore
                </button>
                {currentIssue.replacements && currentIssue.replacements[0] && (
                  <button
                    type="button"
                    onClick={() => handleAccept(currentIssue.replacements[0])}
                    className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-md transition cursor-pointer shadow-2xs"
                  >
                    Accept
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GrammarCheckWidget;
