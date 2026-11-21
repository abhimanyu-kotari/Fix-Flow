import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

function getTranslatedStatus(status, t) {
  switch (status) {
    case 'RECEIVED': return t('status_received');
    case 'DIAGNOSING': return t('status_diagnosing');
    case 'IN_PROGRESS': return t('status_in_progress');
    case 'WAITING_PARTS': return t('status_waiting_parts');
    case 'COMPLETED': return t('status_completed');
    case 'DELIVERED': return t('status_delivered');
    case 'CANCELLED': return t('status_cancelled');
    default: return status || t('status_pending');
  }
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
  const { t } = useLanguage();
  const initial = (customerProfile?.name || 'C').charAt(0).toUpperCase();

  // WhatsApp & UPI Payment Gateway State
  const [paymentTicket, setPaymentTicket] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txnRef, setTxnRef] = useState('');

  const handleConfirmInstantPayment = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      const refId = `FF-PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      setTxnRef(refId);
      setPaymentProcessing(false);
      setPaymentSuccess(true);
    }, 1200);
  };

  const handleClosePaymentModal = () => {
    setPaymentTicket(null);
    setPaymentSuccess(false);
    setPaymentProcessing(false);
    setTxnRef('');
  };

  return (
    <div id="track-view-container" className="relative w-full overflow-hidden min-h-[calc(100vh-3.5rem)]">
      <div id="cust-dashboard-screen" className="customer-track-shell max-w-5xl mx-auto space-y-6">
        
        {/* Track Header */}
        <header className="customer-track-header">
          <div>
            <span className="customer-track-eyebrow">{t('cp_eyebrow')}</span>
            <h1>{t('cp_title')}</h1>
            <p>{t('cp_subtitle')}</p>
          </div>
        </header>

        {/* Customer Profile Card */}
        <div className="customer-track-profile">
          <div className="flex items-center gap-4">
            <div className="customer-track-avatar font-bold text-sm">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="cust-name-heading">{customerProfile?.name || 'Customer Account'}</h3>
                <span className="customer-track-verified">{t('verified_customer')}</span>
              </div>
              <p id="cust-phone-subheading">{customerProfile?.phone || ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#101318] border border-[#292F39] text-[#9299A5]">
              {tickets.length === 1 ? t('cp_active_repairs', { count: tickets.length }) : t('cp_active_repairs_plural', { count: tickets.length })}
            </span>
          </div>
        </div>

        {/* Multi-Shop Tickets Section */}
        <div>
          <div className="customer-track-section-heading">
            <h2>{t('cp_active_records')}</h2>
            <span>{t('cp_across_shops')}</span>
          </div>

          <div id="cust-tickets-list" className="space-y-4">
            {tickets.length === 0 ? (
              <div className="customer-ticket-card p-12 text-center text-slate-400">
                <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3 className="text-base font-bold text-white mb-1">{t('cp_no_tickets_title')}</h3>
                <p className="text-xs text-slate-400">{t('cp_no_tickets_desc')}</p>
              </div>
            ) : (
              tickets.map((tItem) => {
                const isDone = tItem.status === 'COMPLETED' || tItem.status === 'DELIVERED';
                const statusBadge = isDone
                  ? 'done'
                  : (tItem.status === 'IN_PROGRESS' || tItem.status === 'WAITING_PARTS' ? 'progress' : 'info');

                return (
                  <article key={tItem.id || tItem._id} className="customer-ticket-card">
                    <div className="customer-ticket-header">
                      <div>
                        <span className="customer-ticket-number">#{tItem.ticket_number}</span>
                        <h3>{tItem.brand} {tItem.model}</h3>
                        <p>{tItem.device_category} {t('track_repair')}</p>
                      </div>
                      <div className="customer-ticket-status">
                        <span className={`customer-track-badge ${statusBadge}`}>
                          {getTranslatedStatus(tItem.status, t)}
                        </span>
                        <strong>{t('cp_estimate')} ₹{(tItem.estimated_cost || 0).toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="customer-track-content">
                      <div className="customer-track-progress">
                        <div className="customer-track-progress-labels">
                          <span>{t('cp_intake')}</span>
                          <span>{t('cp_diagnosis')}</span>
                          <span>{t('cp_in_repair')}</span>
                          <span>{t('cp_ready_pickup')}</span>
                          <span>{t('cp_delivered')}</span>
                        </div>
                        <div className="customer-track-progress-bar">
                          <div style={{ width: getStepperWidth(tItem.status) }}></div>
                        </div>
                      </div>

                      <aside className="customer-track-side">
                        <div>
                          <span className="customer-track-label">{t('cp_service_center')}</span>
                          <h4>{tItem.shop_name}</h4>
                          <p>{tItem.shop_address || 'Local authorized store'}</p>
                        </div>
                        {tItem.shop_phone && (
                          <a href={`tel:${tItem.shop_phone}`} className="customer-track-call">
                            {t('cp_call_shop', { phone: tItem.shop_phone })}
                          </a>
                        )}

                        {/* WhatsApp / UPI Payment Gateway Action Button */}
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentTicket(tItem);
                              setPaymentSuccess(false);
                              setPaymentProcessing(false);
                              setTxnRef('');
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition shadow-sm cursor-pointer"
                          >
                            <svg className="w-4 h-4 fill-emerald-400 flex-shrink-0" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                            </svg>
                            <span>{t('pay_whatsapp_btn')} · ₹{(tItem.estimated_cost || 0).toLocaleString()}</span>
                          </button>
                        </div>
                      </aside>

                      <aside className="customer-track-side">
                        <span className="customer-track-label">{t('cp_issue_reported')}</span>
                        <p style={{ color: '#F5F6F8' }}>{tItem.issue_description || 'No issue description provided'}</p>
                        {tItem.assigned_staff_name && (
                          <>
                            <span className="customer-track-label" style={{ marginTop: '.8rem' }}>{t('ws_tech_col')}</span>
                            <h4>{tItem.assigned_staff_name}</h4>
                            {tItem.assigned_staff_phone && (
                              <a href={`tel:${tItem.assigned_staff_phone}`} className="customer-track-call">
                                {t('cp_call_tech')}
                              </a>
                            )}
                          </>
                        )}
                      </aside>

                      <div className="customer-track-timeline">
                        <span className="customer-track-label">{t('cp_live_activity')}</span>
                        <div>
                          {(!tItem.timeline || tItem.timeline.length === 0) ? (
                            <div className="customer-track-timeline-row">
                              <strong>Intake Received</strong>
                              <span>Device checked in at counter</span>
                              <time>{new Date(tItem.created_at).toLocaleDateString()}</time>
                            </div>
                          ) : (
                            tItem.timeline.map((ev, idx) => (
                              <div key={idx} className="customer-track-timeline-row">
                                <strong>{getTranslatedStatus(ev.to_status, t)}</strong>
                                <span>{ev.notes || 'Status updated'}</span>
                                <time>{new Date(ev.created_at).toLocaleDateString()}</time>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <footer className="customer-track-footer">
                      <span>{t('cp_record_created', { date: new Date(tItem.created_at).toLocaleDateString() })}</span>
                      <button 
                        type="button" 
                        onClick={() => onDeleteTicket(tItem.id || tItem._id, tItem.ticket_number)} 
                        className="customer-track-delete cursor-pointer"
                      >
                        {t('cp_delete_record')}
                      </button>
                    </footer>
                  </article>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* WHATSAPP & UPI PAYMENT GATEWAY MODAL */}
      {paymentTicket && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#15191F] border border-[#292F39] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#292F39] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">{t('pay_modal_title')}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{t('pay_modal_subtitle')}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleClosePaymentModal} 
                className="w-8 h-8 rounded-full bg-[#1B2028] hover:bg-[#252C37] text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Success State */}
            {paymentSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h4 className="text-xl font-black text-white tracking-tight">{t('pay_success_title')}</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">{t('pay_success_desc')}</p>
                
                <div className="bg-[#101318] border border-[#292F39] rounded-2xl p-4 text-left space-y-2 mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{t('pay_ref_id')}:</span>
                    <span className="font-mono font-bold text-emerald-400">{txnRef}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{t('pay_amount_label')}:</span>
                    <span className="font-mono font-bold text-white">₹{(paymentTicket.estimated_cost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{t('cp_service_center')}:</span>
                    <span className="font-semibold text-white">{paymentTicket.shop_name}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClosePaymentModal}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {t('pay_close_btn')}
                </button>
              </div>
            ) : (
              /* Payment Information & Pathways */
              <div className="space-y-4">
                {/* Invoice Overview Card */}
                <div className="bg-[#101318] border border-[#292F39] rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{t('pay_ticket_label')}:</span>
                    <span className="text-xs font-mono font-bold text-indigo-400">#{paymentTicket.ticket_number} ({paymentTicket.brand} {paymentTicket.model})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{t('cp_service_center')}:</span>
                    <span className="text-xs font-semibold text-white">{paymentTicket.shop_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{t('pay_to_shop_label')}:</span>
                    <span className="text-xs font-mono text-slate-200">{paymentTicket.shop_phone || 'Shop Counter Mobile'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{t('pay_customer_phone')}:</span>
                    <span className="text-xs font-mono text-slate-200">{customerProfile?.phone || ''}</span>
                  </div>
                  <div className="pt-2 border-t border-[#292F39] flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">{t('pay_amount_label')}:</span>
                    <span className="text-xl font-black font-mono text-emerald-400">₹{(paymentTicket.estimated_cost || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Direct Action 1: WhatsApp Pay Deep Link */}
                {(() => {
                  const rawPhone = (paymentTicket.shop_phone || '').replace(/[^0-9]/g, '');
                  const waPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
                  const waMsg = encodeURIComponent(
                    `Hi ${paymentTicket.shop_name}, I am sending ₹${paymentTicket.estimated_cost} for repair ticket #${paymentTicket.ticket_number} (${paymentTicket.brand} ${paymentTicket.model}) via WhatsApp Pay. My contact phone is ${customerProfile?.phone || ''}.`
                  );
                  const waLink = `https://wa.me/${waPhone || ''}?text=${waMsg}`;

                  const upiLink = `upi://pay?pa=${rawPhone || 'fixflow'}@upi&pn=${encodeURIComponent(paymentTicket.shop_name)}&am=${paymentTicket.estimated_cost || 0}&cu=INR&tn=${encodeURIComponent('FixFlow Ticket #' + paymentTicket.ticket_number)}`;

                  return (
                    <div className="space-y-2.5 pt-2">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide transition shadow-lg shadow-emerald-600/25 cursor-pointer"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                        </svg>
                        <span>{t('pay_whatsapp_direct_btn')}</span>
                      </a>

                      <a
                        href={upiLink}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#1B2028] hover:bg-[#232934] text-slate-200 hover:text-white border border-[#292F39] font-bold text-xs uppercase tracking-wide transition cursor-pointer"
                      >
                        <span>⚡ {t('pay_upi_direct_btn')}</span>
                      </a>

                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={paymentProcessing}
                          onClick={handleConfirmInstantPayment}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-indigo-600/20 disabled:opacity-60 cursor-pointer"
                        >
                          {paymentProcessing ? t('pay_processing') : t('pay_confirm_instant')}
                        </button>
                      </div>
                    </div>
                  );
                })()}

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
