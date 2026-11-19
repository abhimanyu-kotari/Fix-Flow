import React, { useState, useMemo } from 'react';

function formatStatusLabel(s) {
  if (!s) return '';
  return s.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

function getStatusPill(status) {
  switch (status) {
    case 'RECEIVED':
      return { selectClass: 'bg-slate-100 text-slate-800 border-slate-300' };
    case 'DIAGNOSING':
      return { selectClass: 'bg-purple-50 text-purple-800 border-purple-200' };
    case 'IN_PROGRESS':
      return { selectClass: 'bg-amber-50 text-amber-800 border-amber-200 font-bold' };
    case 'WAITING_PARTS':
      return { selectClass: 'bg-rose-50 text-rose-800 border-rose-200' };
    case 'COMPLETED':
      return { selectClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' };
    case 'DELIVERED':
      return { selectClass: 'bg-teal-50 text-teal-800 border-teal-200' };
    case 'CANCELLED':
    default:
      return { selectClass: 'bg-gray-100 text-gray-600 border-gray-200' };
  }
}

const ALL_STATUSES = [
  'ALL',
  'RECEIVED',
  'DIAGNOSING',
  'IN_PROGRESS',
  'WAITING_PARTS',
  'COMPLETED',
  'DELIVERED',
  'CANCELLED'
];

export default function ShopWorkspace({
  workspace,
  repairer,
  tickets = [],
  staff = [],
  customers = [],
  subscription,
  onOpenNewTicketModal,
  onOpenAddStaffModal,
  onOpenTimelineModal,
  onUpdateTicketStatus,
  onDeleteTicket,
  onSwitchPlan,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'customers' | 'team' | 'subscription'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [customerSearch, setCustomerSearch] = useState('');

  // KPI calculations
  const activeRepairsCount = useMemo(() => {
    return tickets.filter(t => !['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(t.status)).length;
  }, [tickets]);

  const totalValue = useMemo(() => {
    return tickets.reduce((sum, t) => sum + (Number(t.estimated_cost) || 0), 0);
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      // Status filter
      if (statusFilter !== 'ALL' && t.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const numMatch = (t.ticket_number || '').toLowerCase().includes(q);
        const nameMatch = (t.customer_name || '').toLowerCase().includes(q);
        const phoneMatch = (t.customer_phone || '').toLowerCase().includes(q);
        const deviceMatch = `${t.brand || ''} ${t.model || ''}`.toLowerCase().includes(q);
        if (!numMatch && !nameMatch && !phoneMatch && !deviceMatch) return false;
      }
      return true;
    });
  }, [tickets, statusFilter, searchQuery]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(c => {
      const nameMatch = (c.default_name || '').toLowerCase().includes(q);
      const phoneMatch = (c.phone_e164 || '').toLowerCase().includes(q);
      return nameMatch || phoneMatch;
    });
  }, [customers, customerSearch]);

  const currentPlan = subscription?.plan || { id: 'free', name: 'Free' };
  const ticketsUsed = subscription?.usage?.ticketsThisMonth || tickets.length;
  const ticketLimit = subscription?.plan?.maxTicketsPerMonth || 30;
  const isUnlimited = subscription?.plan?.unlimitedTickets;

  return (
    <div id="shop-view-container" className="relative w-full overflow-hidden min-h-[calc(100vh-4rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 shadow-2xl">
      <div id="shop-workspace-dashboard" className="max-w-7xl mx-auto space-y-6">
        
        {/* SHOP HERO BANNER */}
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-950/40 border border-white/20 transform transition-transform hover:scale-105 flex-shrink-0">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {workspace?.name || 'Electronics Repair Workspace'}
                </h1>
                <span id="ws-plan-badge" className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {currentPlan.name} Plan
                </span>
              </div>
              <p id="ws-meta-subheading" className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span>Owner: <strong>{repairer?.name || 'Shop Owner'}</strong></span>
                <span>•</span>
                <span>{workspace?.phone || 'No phone set'}</span>
                {workspace?.address && (
                  <>
                    <span>•</span>
                    <span>{workspace.address}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
            <button 
              type="button"
              onClick={onOpenNewTicketModal}
              className="w-full md:w-auto bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ New Repair Ticket</span>
            </button>
          </div>
        </div>

        {/* 4 KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Repairs */}
          <div className="relative overflow-hidden rounded-2xl p-5 border border-slate-800 bg-slate-900/90 shadow-lg group hover:border-sky-500/40 transition">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Repairs</span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">{activeRepairsCount}</div>
                <span className="text-[11px] text-sky-400 font-medium">In workbench queue</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Staff Capacity */}
          <div className="relative overflow-hidden rounded-2xl p-5 border border-slate-800 bg-slate-900/90 shadow-lg group hover:border-indigo-500/40 transition">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Staff Capacity</span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {staff.length} <span className="text-sm font-normal text-slate-400">/ {subscription?.plan?.maxStaff || 1}</span>
                </div>
                <span className="text-[11px] text-indigo-400 font-medium">Technicians on staff</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-400 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: Total Customers */}
          <div className="relative overflow-hidden rounded-2xl p-5 border border-slate-800 bg-slate-900/90 shadow-lg group hover:border-cyan-500/40 transition">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Customers</span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">{customers.length}</div>
                <span className="text-[11px] text-cyan-400 font-medium">Phone-verified CRM</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 4: Repair Value */}
          <div className="relative overflow-hidden rounded-2xl p-5 border border-slate-800 bg-slate-900/90 shadow-lg group hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Repair Value</span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">₹{totalValue.toLocaleString()}</div>
                <span className="text-[11px] text-emerald-400 font-medium">Estimated queue revenue</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div id="workspace-tabs-nav">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 w-fit">
            <button 
              type="button"
              onClick={() => setActiveTab('tickets')}
              className={`px-4 sm:px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeTab === 'tickets'
                  ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Repair Tickets ({tickets.length})</span>
            </button>

            <button 
              type="button"
              onClick={() => setActiveTab('customers')}
              className={`px-4 sm:px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeTab === 'customers'
                  ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Customer CRM ({customers.length})</span>
            </button>

            <button 
              type="button"
              onClick={() => setActiveTab('team')}
              className={`px-4 sm:px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeTab === 'team'
                  ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Team ({staff.length})</span>
            </button>

            <button 
              type="button"
              onClick={() => setActiveTab('subscription')}
              className={`px-4 sm:px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeTab === 'subscription'
                  ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Subscription & Plans</span>
            </button>
          </div>
        </div>

        {/* TAB 1: REPAIR TICKETS TABLE */}
        {activeTab === 'tickets' && (
          <div id="tab-panel-tickets" className="space-y-4">
            {/* Filter / Search Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ticket #, customer name, phone, or device..." 
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {ALL_STATUSES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                      statusFilter === s
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s === 'ALL' ? 'All Statuses' : formatStatusLabel(s)}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/60 font-bold">
                      <th className="py-3.5 px-5">Ticket</th>
                      <th className="py-3.5 px-5">Customer</th>
                      <th className="py-3.5 px-5">Device</th>
                      <th className="py-3.5 px-5">Issue</th>
                      <th className="py-3.5 px-5">Technician</th>
                      <th className="py-3.5 px-5">Cost</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-slate-400">
                          <p className="text-sm font-semibold text-white mb-1">No repair tickets found</p>
                          <p className="text-xs">Create your first ticket by clicking "+ New Repair Ticket" above.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map(t => {
                        const statusPill = getStatusPill(t.status);
                        return (
                          <tr key={t.id || t._id} className="hover:bg-slate-800/40 transition">
                            <td className="py-4 px-5 font-mono font-bold text-sky-400">
                              {t.ticket_number}
                            </td>
                            <td className="py-4 px-5">
                              <div className="font-bold text-white">{t.customer_name}</div>
                              <div className="font-mono text-[11px] text-slate-400">{t.customer_phone}</div>
                            </td>
                            <td className="py-4 px-5">
                              <div className="font-semibold text-white">{t.brand} {t.model}</div>
                              <div className="text-[11px] text-slate-400 capitalize">{t.device_category}</div>
                            </td>
                            <td className="py-4 px-5 max-w-xs truncate text-slate-300">
                              {t.issue_description || '—'}
                            </td>
                            <td className="py-4 px-5 text-slate-300">
                              {t.assigned_staff_name || 'Unassigned'}
                            </td>
                            <td className="py-4 px-5 font-mono font-bold text-emerald-400">
                              ₹{(t.estimated_cost || 0).toLocaleString()}
                            </td>
                            <td className="py-4 px-5">
                              <select 
                                value={t.status}
                                onChange={(e) => onUpdateTicketStatus(t.id || t._id, e.target.value)}
                                className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border cursor-pointer focus:outline-none transition ${statusPill.selectClass}`}
                              >
                                {['RECEIVED', 'DIAGNOSING', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'DELIVERED', 'CANCELLED'].map(s => (
                                  <option key={s} value={s}>{formatStatusLabel(s)}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  type="button"
                                  onClick={() => onOpenTimelineModal(t)}
                                  className="text-xs font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1"
                                  title="View Timeline History"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M12 7v5l3 3" />
                                  </svg>
                                  <span>Timeline</span>
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => onDeleteTicket(t.id || t._id, t.ticket_number)}
                                  className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1"
                                  title="Delete Ticket"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMER CRM */}
        {activeTab === 'customers' && (
          <div id="tab-panel-customers" className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customers by name or phone..." 
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {filteredCustomers.length} Customer Record{filteredCustomers.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/60 font-bold">
                    <th className="py-3.5 px-5">Customer</th>
                    <th className="py-3.5 px-5">Phone Number</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Total Repairs</th>
                    <th className="py-3.5 px-5 text-right">Last Interaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400">
                        <p className="text-sm font-semibold text-white mb-1">No customers match this filter</p>
                        <p className="text-xs">Customers are registered automatically whenever a repair ticket is created.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c, idx) => {
                      const initials = (c.default_name || 'C').substring(0, 2).toUpperCase();
                      return (
                        <tr key={c.id || idx} className="hover:bg-slate-800/40 transition">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                                {initials}
                              </div>
                              <div className="font-bold text-white">{c.default_name}</div>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-mono text-slate-300">
                            {c.phone_e164}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              c.is_verified ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {c.is_verified ? '✓ Phone Verified' : 'Intake Registered'}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-mono font-bold text-white">
                            {c.ticket_count} repair{c.ticket_count === 1 ? '' : 's'}
                          </td>
                          <td className="py-4 px-5 text-right text-slate-400 font-mono text-[11px]">
                            {new Date(c.last_seen_at || Date.now()).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TEAM / STAFF */}
        {activeTab === 'team' && (
          <div id="tab-panel-team" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">Workshop Team</h3>
                <p className="text-xs text-slate-400">Manage technicians, front desk staff, and repair managers</p>
              </div>
              <button 
                type="button"
                onClick={onOpenAddStaffModal}
                className="bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center gap-2"
              >
                <span>+ Invite Staff Member</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map((s, idx) => (
                <div key={s.id || idx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-400 text-white font-bold text-base flex items-center justify-center shadow-md flex-shrink-0">
                    {(s.name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-white text-sm truncate">{s.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                        {s.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{s.email}</p>
                    <p className="text-[11px] text-slate-500 mt-2">Active Workshop Member</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SUBSCRIPTION & PLANS */}
        {activeTab === 'subscription' && (
          <div id="tab-panel-subscription" className="space-y-6">
            {/* Current Quota Progress */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Monthly Ticket Quota</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isUnlimited 
                      ? 'You have unlimited tickets on your active plan.' 
                      : `Free plan limit: 30 tickets per month.`}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20">
                  {isUnlimited ? `${ticketsUsed} tickets created` : `${ticketsUsed} / ${ticketLimit} used`}
                </span>
              </div>

              {!isUnlimited && (
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="bg-gradient-to-r from-sky-400 to-blue-600 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, Math.round((ticketsUsed / ticketLimit) * 100))}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  id: 'free',
                  name: 'Free',
                  price: '₹0',
                  badge: 'Starter Solo',
                  desc: 'Up to 30 tickets/month, 1 owner account, core repair tracking.',
                  popular: false
                },
                {
                  id: 'starter',
                  name: 'Starter',
                  price: '₹199',
                  badge: 'Small Shop',
                  desc: 'Unlimited tickets, up to 3 staff members, SMS alerts & basic reports.',
                  popular: true
                },
                {
                  id: 'pro',
                  name: 'Pro',
                  price: '₹499',
                  badge: 'Growing Workshop',
                  desc: 'Unlimited tickets, up to 10 staff, inventory parts & Repair Passport.',
                  popular: false
                },
                {
                  id: 'business',
                  name: 'Business',
                  price: '₹999',
                  badge: 'Franchise & Enterprise',
                  desc: 'Multi-branch (up to 5), 25 staff members, advanced BI analytics.',
                  popular: false
                }
              ].map(plan => {
                const isActive = currentPlan.id === plan.id;
                return (
                  <div 
                    key={plan.id}
                    className={`bg-slate-900/90 rounded-2xl p-6 border flex flex-col justify-between transition ${
                      isActive 
                        ? 'border-sky-500 shadow-lg shadow-sky-500/10' 
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                          {plan.badge}
                        </span>
                        {plan.popular && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                            Popular
                          </span>
                        )}
                      </div>
                      <h4 className="text-xl font-black text-white">{plan.name}</h4>
                      <div className="mt-2 text-2xl font-black text-white">
                        {plan.price} <span className="text-xs font-normal text-slate-400">/mo</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                        {plan.desc}
                      </p>
                    </div>

                    <button 
                      type="button"
                      disabled={isActive}
                      onClick={() => onSwitchPlan(plan.id)}
                      className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition ${
                        isActive 
                          ? 'bg-slate-800 text-slate-400 cursor-default border border-slate-700' 
                          : 'bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white shadow-md shadow-blue-500/25'
                      }`}
                    >
                      {isActive ? 'Current Plan' : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
