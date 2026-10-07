import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, Undo2 } from 'lucide-react';

let toastIdCounter = 0;
let addToastHandler = null;

export const showToast = (message, type = 'info', action = null) => {
  if (addToastHandler) {
    addToastHandler({
      id: ++toastIdCounter,
      message,
      type,
      action
    });
  }
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastHandler = (newToast) => {
      setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5
    };
    return () => {
      addToastHandler = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />
  };

  return (
    <div className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-[#1e2024] text-slate-800 dark:text-slate-100 shadow-xl border border-slate-200/80 dark:border-neutral-800 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-2.5 min-w-0">
        {icons[toast.type] || icons.info}
        <span className="truncate">{toast.message}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {toast.action && (
          <button
            onClick={() => {
              toast.action.onClick();
              onClose();
            }}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
          >
            {toast.action.icon || <Undo2 className="w-3.5 h-3.5" />}
            <span>{toast.action.label || 'Undo'}</span>
          </button>
        )}
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
