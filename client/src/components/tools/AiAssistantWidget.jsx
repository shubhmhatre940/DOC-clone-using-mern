import React, { useState } from 'react';
import {
  Sparkles,
  X,
  RefreshCw,
  Check,
  Wand2,
  FileText,
  AlignLeft,
  MessageSquarePlus,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { processAiAssistant } from '../../api/ai';

const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'casual', label: 'Casual & Friendly' },
  { id: 'academic', label: 'Academic' },
  { id: 'persuasive', label: 'Persuasive' },
  { id: 'concise', label: 'Short & Concise' }
];

const AiAssistantWidget = ({ isOpen, onClose, editor }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [selectedAction, setSelectedAction] = useState('generate'); // 'generate' | 'rephrase' | 'tone' | 'summarize'
  const [selectedTone, setSelectedTone] = useState('professional');

  if (!isOpen) return null;

  // Get currently selected text in TipTap editor
  const getSelectedText = () => {
    if (!editor) return '';
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, ' ');
  };

  const selectedText = getSelectedText();

  const handleRunAi = async (actionOverride, toneOverride) => {
    const act = actionOverride || selectedAction;
    const tone = toneOverride || selectedTone;

    setError('');
    setResult('');

    if (act === 'generate' && !prompt.trim()) {
      setError('Please enter a prompt describing what document content you want to generate.');
      return;
    }

    if ((act === 'rephrase' || act === 'tone' || act === 'summarize') && !selectedText.trim()) {
      setError('Please select some text in your document first.');
      return;
    }

    try {
      setLoading(true);
      const res = await processAiAssistant({
        action: act,
        prompt: prompt.trim(),
        text: selectedText,
        tone
      });
      setResult(res.result || '');
    } catch (err) {
      console.error('[AI Assistant Error]:', err);
      setError(err.response?.data?.message || 'Failed to generate AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInsertOrReplace = (mode) => {
    if (!editor || !result) return;

    if (mode === 'replace' && selectedText) {
      editor.chain().focus().insertContent(result).run();
    } else {
      // Append below selection
      editor.chain().focus().insertContentAt(editor.state.selection.to, `<p></p>${result}`).run();
    }

    setResult('');
    setPrompt('');
    onClose();
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-96 sm:w-[420px] bg-white dark:bg-[#1e2024] rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden select-none animate-in fade-in slide-in-from-bottom-5 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <h3 className="text-sm font-bold tracking-wide">Gemini Smart AI Writing Assistant</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Selection Tabs */}
      <div className="grid grid-cols-4 bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => {
            setSelectedAction('generate');
            setError('');
          }}
          className={`py-2 px-1 text-center border-b-2 transition cursor-pointer ${
            selectedAction === 'generate'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#1e2024]'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          ✨ Generate Doc
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedAction('rephrase');
            setError('');
          }}
          className={`py-2 px-1 text-center border-b-2 transition cursor-pointer ${
            selectedAction === 'rephrase'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#1e2024]'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          ✍️ Rephrase
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedAction('tone');
            setError('');
          }}
          className={`py-2 px-1 text-center border-b-2 transition cursor-pointer ${
            selectedAction === 'tone'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#1e2024]'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          🎭 Tone Shift
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedAction('summarize');
            setError('');
          }}
          className={`py-2 px-1 text-center border-b-2 transition cursor-pointer ${
            selectedAction === 'summarize'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#1e2024]'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
          }`}
        >
          📝 Summarize
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3.5 text-xs">
        {selectedText ? (
          <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 leading-relaxed font-sans truncate">
            <span className="font-semibold block text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-0.5">
              Selected Text Context
            </span>
            "{selectedText}"
          </div>
        ) : (
          (selectedAction === 'rephrase' || selectedAction === 'tone' || selectedAction === 'summarize') && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 leading-relaxed">
              💡 Highlight any text in your document to use <strong>Rephrase</strong>, <strong>Tone Shift</strong>, or <strong>Summarize</strong>.
            </div>
          )
        )}

        {/* Generate Prompt Input */}
        {selectedAction === 'generate' && (
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
              Describe the document you want to create:
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Draft a formal non-disclosure agreement for software development contractors..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-2xs resize-none"
            />
          </div>
        )}

        {/* Tone Selector */}
        {selectedAction === 'tone' && (
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
              Choose desired tone:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTone(t.id)}
                  className={`px-2.5 py-1.5 rounded-lg border text-left font-medium transition cursor-pointer ${
                    selectedTone === t.id
                      ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </p>
        )}

        {/* Action Trigger Button */}
        <button
          type="button"
          onClick={() => handleRunAi()}
          disabled={loading}
          className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Generating with Gemini AI...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 text-amber-300" />
              <span>
                {selectedAction === 'generate' && 'Generate Content'}
                {selectedAction === 'rephrase' && 'Rephrase Selected Text'}
                {selectedAction === 'tone' && `Shift Tone to ${selectedTone}`}
                {selectedAction === 'summarize' && 'Create Summary'}
              </span>
            </>
          )}
        </button>

        {/* AI Result Box */}
        {result && (
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-gray-700 dark:text-gray-300 font-bold text-xs">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4" />
                Generated Preview
              </span>
              <button
                type="button"
                onClick={() => handleRunAi()}
                disabled={loading}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            </div>

            <div
              className="p-3 bg-gray-50 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 rounded-xl text-gray-800 dark:text-gray-200 text-xs leading-relaxed max-h-56 overflow-y-auto font-sans shadow-inner"
              dangerouslySetInnerHTML={{ __html: result }}
            />

            {/* Insertion Options */}
            <div className="flex items-center gap-2 pt-1">
              {selectedText && (
                <button
                  type="button"
                  onClick={() => handleInsertOrReplace('replace')}
                  className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg font-semibold text-xs hover:bg-blue-700 transition cursor-pointer shadow-xs"
                >
                  Replace Selected
                </button>
              )}
              <button
                type="button"
                onClick={() => handleInsertOrReplace('append')}
                className="flex-1 py-1.5 bg-gray-900 dark:bg-neutral-700 text-white rounded-lg font-semibold text-xs hover:bg-black transition cursor-pointer shadow-xs"
              >
                {selectedText ? 'Insert Below' : 'Insert into Document'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAssistantWidget;
