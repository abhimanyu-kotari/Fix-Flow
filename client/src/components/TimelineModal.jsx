import React from 'react';

function formatStatusLabel(s) {
  if (!s) return '';
  return s.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

export default function TimelineModal({ isOpen, onClose, ticket }) {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
                <span>Ticket History</span>
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {ticket.ticket_number}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {ticket.brand} {ticket.model} • Customer: {ticket.customer_name} ({ticket.customer_phone})
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {(!ticket.timeline || ticket.timeline.length === 0) ? (
            <p className="text-xs text-slate-400 py-6 text-center">No timeline events recorded yet.</p>
          ) : (
            ticket.timeline.map((ev, index) => (
              <div key={index} className="relative pl-6 pb-4 border-l-2 border-indigo-200 last:border-l-0">
                <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-50"></div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">{formatStatusLabel(ev.to_status)}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(ev.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{ev.notes || 'Status changed'}</p>
                <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                  Logged by: {ev.changed_by_name || 'Staff'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
