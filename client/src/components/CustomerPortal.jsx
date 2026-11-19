import React from 'react';

function formatStatusLabel(s) {
  if (!s) return '';
  return s.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

function getStepperWidth(status) {
  switch (status) {
    case 'RECEIVED': return '20%';
    case 'DIAGNOSING': return '40%';
    case 'IN_PROGRESS': return '60%';
    case 'WAITING_PARTS': return '50%';
    case 'COMPLETED': return '85%';
    case 'DELIVERED': return '100%';
    case 'CANCELLED': return '10%';
    default: return '20%';
  }
}

export default function CustomerPortal({
  customerProfile,
  tickets = [],
  onDeleteTicket,
  onLogout
}) {
  return (
    <div id="track-view-container" className="relative w-full overflow-hidden bg-gradient-to-br from-[#0B0F17] via-[#111827] to-[#030712] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 shadow-2xl min-h-[calc(100vh-4rem)]">
      <div id="cust-dashboard-screen" className="max-w-4xl mx-auto space-y-6">
        {/* Customer Header Banner */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/25">
              {(customerProfile?.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 id="cust-name-heading" className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {customerProfile?.name || 'Customer'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified Customer
                </span>
              </div>
              <p id="cust-phone-subheading" className="text-xs text-slate-400 font-mono mt-0.5">
                {customerProfile?.phone || ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-medium">
              {tickets.length} Active {tickets.length === 1 ? 'Repair' : 'Repairs'}
            </span>
            <button 
              type="button"
              onClick={onLogout}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3.5 py-1.5 rounded-xl transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tickets List */}
        <div id="cust-tickets-list" className="space-y-6">
          {tickets.length === 0 ? (
            <div className="customer-ticket-card p-12 text-center bg-slate-900/90 border border-slate-800 rounded-3xl text-slate-400">
              <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="text-base font-bold text-white mb-1">No Active Repair Tickets</h3>
              <p className="text-xs text-slate-400">No repair records found for this phone number.</p>
            </div>
          ) : (
            tickets.map((t) => {
              const isDone = t.status === 'COMPLETED' || t.status === 'DELIVERED';
              const statusBadge = isDone
                ? 'done'
                : (t.status === 'IN_PROGRESS' || t.status === 'WAITING_PARTS' ? 'progress' : 'info');

              return (
                <article key={t.id || t._id} className="customer-ticket-card">
                  <div className="customer-ticket-header">
                    <div>
                      <span className="customer-ticket-number">{t.ticket_number}</span>
                      <h3>{t.brand} {t.model}</h3>
                      <p>{t.device_category} repair</p>
                    </div>
                    <div className="customer-ticket-status">
                      <span className={`customer-track-badge ${statusBadge}`}>
                        {formatStatusLabel(t.status)}
                      </span>
                      <strong>Estimate ₹{(t.estimated_cost || 0).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="customer-track-content">
                    <div className="customer-track-progress">
                      <div className="customer-track-progress-labels">
                        <span>Intake</span>
                        <span>Diagnosis</span>
                        <span>In Repair</span>
                        <span>Ready for Pickup</span>
                        <span>Delivered</span>
                      </div>
                      <div className="customer-track-progress-bar">
                        <div style={{ width: getStepperWidth(t.status) }}></div>
                      </div>
                    </div>

                    <aside className="customer-track-side">
                      <div>
                        <span className="customer-track-label">Service center</span>
                        <h4>{t.shop_name}</h4>
                        <p>{t.shop_address || 'Local authorized store'}</p>
                      </div>
                      {t.shop_phone && (
                        <a href={`tel:${t.shop_phone}`} className="customer-track-call">
                          Call shop · {t.shop_phone}
                        </a>
                      )}
                    </aside>

                    <aside className="customer-track-side">
                      <span className="customer-track-label">Issue reported</span>
                      <p style={{ color: '#F5F6F8' }}>{t.issue_description || 'No issue description provided'}</p>
                      {t.assigned_staff_name && (
                        <>
                          <span className="customer-track-label" style={{ marginTop: '.8rem' }}>Technician</span>
                          <h4>{t.assigned_staff_name}</h4>
                          {t.assigned_staff_phone && (
                            <a href={`tel:${t.assigned_staff_phone}`} className="customer-track-call">
                              Call technician
                            </a>
                          )}
                        </>
                      )}
                    </aside>

                    <div className="customer-track-timeline">
                      <span className="customer-track-label">Live service activity</span>
                      <div>
                        {(!t.timeline || t.timeline.length === 0) ? (
                          <div className="customer-track-timeline-row">
                            <strong>Intake Received</strong>
                            <span>Device checked in at counter</span>
                            <time>{new Date(t.created_at).toLocaleDateString()}</time>
                          </div>
                        ) : (
                          t.timeline.map((ev, idx) => (
                            <div key={idx} className="customer-track-timeline-row">
                              <strong>{formatStatusLabel(ev.to_status)}</strong>
                              <span>{ev.notes || 'Status updated'}</span>
                              <time>{new Date(ev.created_at).toLocaleDateString()}</time>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <footer className="customer-track-footer">
                    <span>Record created {new Date(t.created_at).toLocaleDateString()}</span>
                    <button 
                      type="button" 
                      onClick={() => onDeleteTicket(t.id || t._id, t.ticket_number)} 
                      className="customer-track-delete"
                    >
                      Delete / cancel record
                    </button>
                  </footer>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
