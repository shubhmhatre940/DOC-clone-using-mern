import React, { useState, useEffect } from 'react';
import { X, Sliders, Bell, Check, Loader2 } from 'lucide-react';
import { getUserPreferences, updateUserPreferences } from '../../api/preferences';
import { useTheme } from '../../context/ThemeContext';

const FONT_OPTIONS = ['Arial', 'Roboto', 'Times New Roman', 'Georgia', 'Courier New'];
const SIZE_OPTIONS = ['9pt', '10pt', '11pt', '12pt', '14pt', '18pt'];

const PreferencesModal = ({
  isOpen,
  onClose,
  initialTab = 'preferences', // 'preferences' | 'notifications'
  onPreferencesUpdated
}) => {
  const { theme: currentGlobalTheme, setTheme: setGlobalTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [defaultFont, setDefaultFont] = useState('Arial');
  const [defaultFontSize, setDefaultFontSize] = useState('11pt');
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [theme, setTheme] = useState(currentGlobalTheme || 'light');

  const [emailOnShare, setEmailOnShare] = useState(true);
  const [emailOnComment, setEmailOnComment] = useState(true);
  const [emailOnReply, setEmailOnReply] = useState(true);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getUserPreferences();
        if (data.preferences) {
          setDefaultFont(data.preferences.defaultFont || 'Arial');
          setDefaultFontSize(data.preferences.defaultFontSize || '11pt');
          setShowLineNumbers(!!data.preferences.showLineNumbers);
          setTheme(data.preferences.theme || 'light');
        }
        if (data.notificationPreferences) {
          setEmailOnShare(data.notificationPreferences.emailOnShare ?? true);
          setEmailOnComment(data.notificationPreferences.emailOnComment ?? true);
          setEmailOnReply(data.notificationPreferences.emailOnReply ?? true);
        }
      } catch (err) {
        console.error('Failed to load user preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await updateUserPreferences({
        preferences: {
          defaultFont,
          defaultFontSize,
          showLineNumbers,
          theme
        },
        notificationPreferences: {
          emailOnShare,
          emailOnComment,
          emailOnReply
        }
      });

      setSavedSuccess(true);
      setGlobalTheme(theme);
      if (onPreferencesUpdated) {
        onPreferencesUpdated(updated);
      }
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 600);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      alert(err.response?.data?.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
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
        aria-labelledby="preferences-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 id="preferences-title" className="text-base font-semibold text-gray-900">
              Preferences & Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-100 px-4 pt-1 bg-gray-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'preferences'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            General Preferences
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'notifications'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Notification Settings
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
            <p className="text-xs">Loading preferences...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
            {activeTab === 'preferences' ? (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Default font family
                  </label>
                  <select
                    value={defaultFont}
                    onChange={(e) => setDefaultFont(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Default font size
                  </label>
                  <select
                    value={defaultFontSize}
                    onChange={(e) => setDefaultFontSize(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Interface Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="light">Light mode (Default)</option>
                    <option value="high-contrast">High contrast (Accessible)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLineNumbers}
                      onChange={(e) => setShowLineNumbers(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-gray-700">Show line numbers by default</span>
                  </label>
                </div>
              </>
            ) : (
              <div className="space-y-3 pt-1">
                <p className="text-gray-500 text-[11px] mb-2">
                  Choose when to receive notifications and email updates:
                </p>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailOnShare}
                    onChange={(e) => setEmailOnShare(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-gray-800">
                    Notify me when someone shares a document with me
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailOnComment}
                    onChange={(e) => setEmailOnComment(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-gray-800">
                    Notify me when someone comments on my document
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailOnReply}
                    onChange={(e) => setEmailOnReply(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-gray-800">
                    Notify me when someone replies to my comments
                  </span>
                </label>
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : savedSuccess ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : null}
                {savedSuccess ? 'Saved!' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PreferencesModal;
