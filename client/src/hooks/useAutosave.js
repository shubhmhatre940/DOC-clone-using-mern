import { useState, useEffect, useRef, useCallback } from 'react';
import { updateDocument } from '../api/documents';

/**
 * Custom hook for debounced document auto-saving to MongoDB.
 *
 * Coexistence with Yjs:
 * Real-time edits are synced peer-to-peer live via Yjs WebSockets and periodically
 * committed to MongoDB `yjsState` by collabServer.js.
 * This hook complements that by persisting human-readable `title` and `content`
 * to the Document model via PUT /api/documents/:id after 1.5s of inactivity.
 *
 * @param {string} docId - Target document ID
 * @param {string} title - Current document title
 * @param {string} content - Current document HTML content
 * @param {boolean} isEditable - Whether the current user has write permissions (owner or editor)
 * @param {number} delay - Debounce delay in milliseconds (default 1500ms)
 */
export function useAutosave(docId, title, content, isEditable = true, delay = 1500) {
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved' | 'offline'
  const timerRef = useRef(null);
  const isInitialMount = useRef(true);

  // Keep references to latest values to prevent stale closures
  const latestDataRef = useRef({ title, content });
  latestDataRef.current = { title, content };

  // Last persisted values to avoid redundant saves
  const lastSavedRef = useRef({ title, content });

  // Initialize lastSavedRef once data is first loaded
  useEffect(() => {
    if (isInitialMount.current && (title || content)) {
      lastSavedRef.current = { title, content };
      isInitialMount.current = false;
    }
  }, [title, content]);

  /**
   * Execute immediate save to MongoDB
   */
  const executeSave = useCallback(async () => {
    if (!docId || !isEditable) return;

    const currentTitle = latestDataRef.current.title;
    const currentContent = latestDataRef.current.content;

    // Check if anything actually changed from last saved state
    if (
      currentTitle === lastSavedRef.current.title &&
      currentContent === lastSavedRef.current.content
    ) {
      setSaveStatus('saved');
      return;
    }

    setSaveStatus('saving');

    const MAX_RETRIES = 2;
    let attempt = 0;
    let saveSuccess = false;

    while (attempt <= MAX_RETRIES && !saveSuccess) {
      try {
        await updateDocument(docId, {
          title: currentTitle,
          content: currentContent
        });

        lastSavedRef.current = {
          title: currentTitle,
          content: currentContent
        };
        setSaveStatus('saved');
        saveSuccess = true;
      } catch (err) {
        attempt++;
        console.warn(`[Autosave Attempt ${attempt} Failed]:`, err.message || err);
        if (attempt <= MAX_RETRIES && navigator.onLine) {
          // Wait before retrying (800ms, then 1600ms) with exponential backoff
          await new Promise((resolve) => setTimeout(resolve, attempt * 800));
        } else {
          console.error('[Autosave Final Failure]: Save retries exhausted');
          if (!navigator.onLine || err.code === 'ERR_NETWORK') {
            setSaveStatus('offline');
          } else {
            setSaveStatus('unsaved');
          }
        }
      }
    }
  }, [docId, isEditable]);

  /**
   * Force save immediately (e.g. for Ctrl+S or title enter/blur)
   */
  const saveNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    return executeSave();
  }, [executeSave]);

  /**
   * Debounce effect when title or content changes
   */
  useEffect(() => {
    // Viewers/commenters never trigger saves
    if (!isEditable || isInitialMount.current) {
      return;
    }

    // If values match last saved, stay 'saved'
    if (
      title === lastSavedRef.current.title &&
      content === lastSavedRef.current.content
    ) {
      return;
    }

    // Set unsaved status immediately as user types
    setSaveStatus('unsaved');

    // Reset debounce timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      executeSave();
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [title, content, isEditable, delay, executeSave]);

  // Listen to network status recovery
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Autosave]: Network reconnected, syncing pending changes...');
      executeSave();
    };

    const handleOffline = () => {
      setSaveStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [executeSave]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    setSaveStatus,
    saveNow
  };
}
