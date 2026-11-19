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
  onDeleteTicket
}) {
  const initial = (customerProfile?.name || 'C').charAt(0).toUpperCase();

  return (
    <div id="track-view-container" className="relative w-full overflow-hidden min-h-[calc(100vh-3.5rem)]">
      <div id="cust-dashboard-screen" className="customer-track-shell max-w-5xl mx-auto space-y-6">
        
        {/* Track Header */}
        <header className="customer-track-header">
          <div>
            <span className="customer-track-eyebrow">REPAIR TRACKING</span>
            <h1>Your repairs</h1>
            <p>Live status and service updates from your repair shops.</p>
          </div>
        </header>

        {/* Customer Profile Card (Authentic dark theme with lavender accent) */}
        <div className="customer-track-profile">
          <div className="flex items-center gap-4">
            <div className="customer-track-avatar font-bold text-sm">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="cust-name-heading">{customerProfile?.name || 'Customer Account'}</h3>
                <span className="customer-track-verified">Phone verified</span>
              </div>
              <p id="cust-phone-subheading">{customerProfile?.phone || ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#101318] border border-[#292F39] text-[#9299A5]">
              {tickets.length} Active {tickets.length === 1 ? 'Repair' : 'Repairs'}
            </span>
          </div>
        </div>

        {/* Multi-Shop Tickets Section */}
        <div>
          <div className="customer-track-section-heading">
            <h2>Active records</h2>
            <span>Across FixFlow shops</span>
          </div>

          <div id="cust-tickets-list" className="space-y-4">
            {tickets.length === 0 ? (
              <div className="customer-ticket-card p-12 text-center text-slate-400">
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
                        <span className="customer-ticket-number">#{t.ticket_number}</span>
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
                        className="customer-track-delete cursor-pointer"
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
    </div>
  );
}
