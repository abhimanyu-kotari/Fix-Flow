import React from 'react';

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-800 bg-slate-900 text-white';
        let icon = 'ℹ️';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500 bg-slate-900 text-white shadow-emerald-500/10';
          icon = '✅';
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-500 bg-slate-900 text-white shadow-rose-500/10';
          icon = '⚠️';
        }

        return (
          <div
            key={toast.id}
            onClick={() => onDismiss(toast.id)}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md cursor-pointer transition transform hover:scale-102 ${borderClass}`}
          >
            <span className="text-sm">{icon}</span>
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
