import React, { useState, useMemo } from 'react';

function formatStatusLabel(s) {
  if (!s) return '';
  return s.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

function getStatusPill(status) {
  switch (status) {
    case 'RECEIVED':
      return { selectClass: 'bg-slate-800 text-slate-300 border-slate-700' };
    case 'DIAGNOSING':
      return { selectClass: 'bg-purple-950/80 text-purple-300 border-purple-800' };
    case 'IN_PROGRESS':
      return { selectClass: 'bg-amber-950/80 text-amber-300 border-amber-700 font-bold' };
    case 'WAITING_PARTS':
      return { selectClass: 'bg-rose-950/80 text-rose-300 border-rose-800' };
    case 'COMPLETED':
      return { selectClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700 font-bold' };
    case 'DELIVERED':
      return { selectClass: 'bg-indigo-950/80 text-indigo-300 border-indigo-700' };
    case 'CANCELLED':
    default:
      return { selectClass: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
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
  onShopLogout,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('overview'); // Default matches Image 2
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [customerSearch, setCustomerSearch] = useState('');

  // Initials for avatar in sidebar
  const initials = useMemo(() => {
    const str = workspace?.name || repairer?.name || 'WS';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  }, [workspace, repairer]);

  // Current Plan
  const currentPlan = subscription?.plan || { id: 'free', name: 'Free' };
  const ticketsUsed = subscription?.usage?.ticketsThisMonth || tickets.length;
  const ticketLimit = subscription?.plan?.maxTicketsPerMonth || 30;
  const isUnlimited = subscription?.plan?.unlimitedTickets;
  const maxStaff = subscription?.plan?.maxStaff || 1;

  // Active Repairs (not delivered / cancelled)
  const activeRepairsCount = useMemo(() => {
    return tickets.filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED').length;
  }, [tickets]);

  // Active Revenue sum
  const activeRevenue = useMemo(() => {
    return tickets
      .filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED')
      .reduce((sum, t) => sum + (Number(t.estimated_cost) || 0), 0);
  }, [tickets]);

  // Status breakdown counts
  const statusCounts = useMemo(() => {
    return {
      pending: tickets.filter(t => ['RECEIVED', 'DIAGNOSING', 'WAITING_PARTS'].includes(t.status)).length,
      progress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tickets.filter(t => t.status === 'COMPLETED').length,
      delivered: tickets.filter(t => t.status === 'DELIVERED').length
    };
  }, [tickets]);

  // Recent tickets sorted descending
  const recentTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
      const bDate = new Date(b.updated_at || b.created_at || 0).getTime();
      return bDate - aDate;
    }).slice(0, 4);
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
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

  return (
    <div id="shop-view-container" className={`relative w-full overflow-hidden min-h-[calc(100vh-3.5rem)] ${sidebarCollapsed ? 'workspace-sidebar-collapsed' : ''}`}>
      
      {/* 1: LEFT WORKSPACE SIDEBAR (Identical to Image 2) */}
      <aside id="workspace-sidebar" aria-label="Workspace navigation">
        <button 
          id="workspace-sidebar-toggle" 
          type="button" 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
          aria-label="Toggle workspace sidebar" 
          aria-expanded={!sidebarCollapsed}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>

        {/* Brand squircle & workspace title */}
        <div className="workspace-sidebar-brand">
          <div className="workspace-brand-mark">FF</div>
          <div>
            <strong>Fix Flow</strong>
            <span>Repair workspace</span>
          </div>
        </div>

        {/* Main Workspace navigation links */}
        <div className="workspace-sidebar-section">
          <span className="workspace-sidebar-label">Workspace</span>

          <button 
            type="button" 
            className={`workspace-nav-item cursor-pointer ${activeTab === 'overview' ? 'workspace-nav-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="workspace-nav-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
              </svg>
            </span>
            <span>Overview</span>
          </button>

          <button 
            type="button" 
            className={`workspace-nav-item cursor-pointer ${activeTab === 'tickets' ? 'workspace-nav-active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            <span className="workspace-nav-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 5h14v14H5zM8 9h8M8 12h8M8 15h5" />
              </svg>
            </span>
            <span>Repair Tickets</span>
          </button>

          <button 
            type="button" 
            className={`workspace-nav-item cursor-pointer ${activeTab === 'customers' ? 'workspace-nav-active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <span className="workspace-nav-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3" />
                <path d="M5 20a7 7 0 0 1 14 0" />
              </svg>
            </span>
            <span>Customer Directory</span>
          </button>

          <button 
            type="button" 
            className={`workspace-nav-item cursor-pointer ${activeTab === 'team' ? 'workspace-nav-active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <span className="workspace-nav-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20a6 6 0 0 1 12 0M16 11a3 3 0 1 1 3-3M16 15a5 5 0 0 1 5 5" />
              </svg>
            </span>
            <span>Staff &amp; Team Seats</span>
          </button>
        </div>

        {/* Management section */}
        <div className="workspace-sidebar-section workspace-sidebar-management">
          <span className="workspace-sidebar-label">Management</span>
          <button 
            type="button" 
            className={`workspace-nav-item cursor-pointer ${activeTab === 'subscription' ? 'workspace-nav-active' : ''}`}
            onClick={() => setActiveTab('subscription')}
            title="Shop Settings & Plans"
          >
            <span className="workspace-nav-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M3 12h2m14 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            </span>
            <span>Shop Settings</span>
          </button>
        </div>

        {/* Single Profile Avatar in Sidebar Footer (Exclusively one profile as requested) */}
        <div 
          className="workspace-sidebar-account relative cursor-pointer" 
          role="button" 
          tabIndex={0}
          onClick={() => setAccountMenuOpen(!accountMenuOpen)}
        >
          <div className="workspace-account-avatar flex items-center justify-center font-bold text-white uppercase text-xs">
            {initials}
          </div>
          <div className="workspace-account-copy">
            <strong className="truncate">{workspace?.name || 'Shop workspace'}</strong>
            <span>{currentPlan.name || 'Free'} plan</span>
          </div>
          <span className="workspace-account-menu cursor-pointer" aria-label="Open account menu">•••</span>

          {accountMenuOpen && (
            <div 
              className="absolute bottom-full left-0 mb-2 w-64 bg-[#15191F] border border-[#292F39] rounded-2xl shadow-2xl p-4 z-50 text-xs text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pb-3 border-b border-[#292F39]">
                <p className="text-xs font-bold text-white truncate">{workspace?.name}</p>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">{repairer?.email || 'Owner Account'}</p>
                <span className="inline-block mt-2 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-white/10 text-neutral-300 border border-white/20 rounded-full">
                  {workspace?.role || 'Shop Owner'}
                </span>
              </div>
              <div className="pt-3 space-y-1.5">
                <button
                  onClick={() => { setAccountMenuOpen(false); setActiveTab('subscription'); }}
                  className="w-full text-left py-2 px-3 rounded-xl text-zinc-300 hover:text-white hover:bg-[#1B2028] transition font-medium flex items-center justify-between cursor-pointer"
                >
                  <span>Subscription &amp; Plans</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">{currentPlan.name}</span>
                </button>
                {onShopLogout && (
                  <button
                    onClick={() => { setAccountMenuOpen(false); onShopLogout(); }}
                    className="w-full text-left py-2 px-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition font-bold cursor-pointer"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 2: MAIN DASHBOARD CONTENT CONTAINER */}
      <div id="shop-workspace-dashboard" className="max-w-7xl">
        
        {/* TAB 1: WORKSPACE OVERVIEW (Matches Image 2) */}
        {activeTab === 'overview' && (
          <section id="workspace-overview-panel" className="workspace-page-panel is-active" style={{ display: 'block' }}>
            
            {/* Header: Eyebrow, Title, Subtitle & Action */}
            <div className="workspace-page-header">
              <div>
                <span className="workspace-eyebrow">WORKSPACE OVERVIEW</span>
                <h1>Overview</h1>
                <p>Here's what's happening with your shop today.</p>
              </div>
              <button 
                type="button" 
                className="workspace-primary-action cursor-pointer hover:opacity-90 transition"
                onClick={onOpenNewTicketModal}
              >
                <span>+</span> New Repair Intake
              </button>
            </div>

            {/* 4 Metric KPI Widgets */}
            <div className="workspace-stat-grid">
              <div className="workspace-stat-widget">
                <span>Active Repairs</span>
                <strong id="overview-active-repairs">{activeRepairsCount}</strong>
                <small>In the shop queue</small>
              </div>
              <div className="workspace-stat-widget">
                <span>Total Customers</span>
                <strong id="overview-total-customers">{customers.length}</strong>
                <small>Unique customers</small>
              </div>
              <div className="workspace-stat-widget">
                <span>Staff Members</span>
                <strong id="overview-staff-members">{staff.length}</strong>
                <small id="overview-staff-capacity">{`${staff.length} of ${maxStaff} seats occupied`}</small>
              </div>
              <div className="workspace-stat-widget">
                <span>Repair Revenue</span>
                <strong id="overview-repair-revenue">₹{activeRevenue.toLocaleString()}</strong>
                <small>Active ticket estimates</small>
              </div>
            </div>

            {/* Operations & Activity Grid */}
            <div className="workspace-overview-grid">
              {/* Left Surface: Operations / Repair Status */}
              <div className="workspace-surface workspace-status-overview">
                <div className="workspace-surface-heading">
                  <div>
                    <span className="workspace-eyebrow">OPERATIONS</span>
                    <h2>Repair status</h2>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('tickets')} 
                    className="cursor-pointer hover:underline text-indigo-400"
                  >
                    View tickets <span>→</span>
                  </button>
                </div>
                <div className="workspace-status-list">
                  <div>
                    <span className="status-dot status-dot-pending"></span>
                    <span>Pending</span>
                    <strong id="overview-status-pending">{statusCounts.pending}</strong>
                  </div>
                  <div>
                    <span className="status-dot status-dot-progress"></span>
                    <span>In Progress</span>
                    <strong id="overview-status-progress">{statusCounts.progress}</strong>
                  </div>
                  <div>
                    <span className="status-dot status-dot-complete"></span>
                    <span>Completed</span>
                    <strong id="overview-status-completed">{statusCounts.completed}</strong>
                  </div>
                  <div>
                    <span className="status-dot status-dot-delivered"></span>
                    <span>Delivered</span>
                    <strong id="overview-status-delivered">{statusCounts.delivered}</strong>
                  </div>
                </div>
              </div>

              {/* Right Surface: Activity / Recent Repair Activity */}
              <div className="workspace-surface">
                <div className="workspace-surface-heading">
                  <div>
                    <span className="workspace-eyebrow">ACTIVITY</span>
                    <h2>Recent repair activity</h2>
                  </div>
                </div>
                <div id="overview-recent-activity" className="workspace-activity-list">
                  {recentTickets.length === 0 ? (
                    <div className="workspace-empty-state">No repair activity yet.</div>
                  ) : (
                    recentTickets.map(t => {
                      const dotClass = t.status === 'IN_PROGRESS' 
                        ? 'progress' 
                        : t.status === 'COMPLETED' 
                          ? 'complete' 
                          : t.status === 'DELIVERED' 
                            ? 'delivered' 
                            : 'pending';
                      return (
                        <div key={t.id || t._id} className="workspace-activity-item">
                          <span className={`status-dot status-dot-${dotClass}`}></span>
                          <div>
                            <strong>Ticket #{t.ticket_number} • {formatStatusLabel(t.status)}</strong>
                            <small>
                              {t.assigned_staff_name ? `Assigned to ${t.assigned_staff_name}` : 'No technician assigned'}
                              {t.customer_name ? ` • ${t.customer_name}` : ''}
                            </small>
                          </div>
                          <small>{new Date(t.updated_at || t.created_at || Date.now()).toLocaleDateString()}</small>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Surface: Queue / Recent Repair Tickets */}
            <div className="workspace-surface workspace-recent-tickets">
              <div className="workspace-surface-heading">
                <div>
                  <span className="workspace-eyebrow">QUEUE</span>
                  <h2>Recent repair tickets</h2>
                </div>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('tickets')} 
                  className="cursor-pointer hover:underline text-indigo-400"
                >
                  Open queue <span>→</span>
                </button>
              </div>
              <div id="overview-recent-tickets" className="workspace-ticket-list">
                {recentTickets.length === 0 ? (
                  <div className="workspace-empty-state">No repair tickets yet. Start with a new intake.</div>
                ) : (
                  recentTickets.map(t => {
                    const badgeClass = t.status === 'IN_PROGRESS' 
                      ? 'is-progress' 
                      : t.status === 'COMPLETED' 
                        ? 'is-complete' 
                        : t.status === 'DELIVERED' 
                          ? 'is-delivered' 
                          : '';
                    return (
                      <div key={t.id || t._id} className="workspace-ticket-item">
                        <strong>#{t.ticket_number}</strong>
                        <div>
                          <strong>{t.customer_name || 'Walk-in Customer'}</strong>
                          <small>{t.customer_phone || 'No phone added'}</small>
                        </div>
                        <div>
                          <strong>{t.brand || ''} {t.model || ''}</strong>
                          <small>{t.device_category || 'Device'}</small>
                        </div>
                        <span>{t.assigned_staff_name || 'Unassigned'}</span>
                        <strong>₹{(t.estimated_cost || 0).toLocaleString()}</strong>
                        <span className={`workspace-status-badge ${badgeClass}`}>
                          {formatStatusLabel(t.status)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </section>
        )}

        {/* TAB 2: REPAIR TICKETS TABLE */}
        {activeTab === 'tickets' && (
          <div id="tab-panel-tickets" className="workspace-page-panel is-active space-y-5" style={{ display: 'block' }}>
            
            {/* Header with New Ticket Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#292F39]">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Repair Tickets</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage intake, diagnosis, technician updates, and delivery</p>
              </div>
              <button 
                type="button"
                onClick={onOpenNewTicketModal}
                className="workspace-primary-action cursor-pointer hover:opacity-90 transition"
              >
                <span>+</span> New Repair Intake
              </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="bg-[#15191F] border border-[#292F39] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ticket #, customer name, phone, or device..." 
                  className="w-full bg-[#1B2028] border border-[#292F39] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {ALL_STATUSES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                      statusFilter === s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#1B2028] text-slate-400 hover:text-white border border-[#292F39]'
                    }`}
                  >
                    {s === 'ALL' ? 'All Statuses' : formatStatusLabel(s)}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#15191F] border border-[#292F39] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#292F39] text-slate-400 uppercase tracking-wider text-[11px] bg-[#101318] font-bold">
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
                  <tbody className="divide-y divide-[#292F39]">
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-slate-400">
                          <p className="text-sm font-semibold text-white mb-1">No repair tickets found</p>
                          <p className="text-xs">Create your first ticket by clicking "+ New Repair Intake" above.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map(t => {
                        const statusPill = getStatusPill(t.status);
                        return (
                          <tr key={t.id || t._id} className="hover:bg-[#1B2028] transition">
                            <td className="py-4 px-5 font-mono font-bold text-indigo-400">
                              #{t.ticket_number}
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
                                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
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
                                  className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
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

        {/* TAB 3: CUSTOMER DIRECTORY */}
        {activeTab === 'customers' && (
          <div id="tab-panel-customers" className="workspace-page-panel is-active space-y-5" style={{ display: 'block' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#292F39]">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Customer Directory</h2>
                <p className="text-xs text-slate-400 mt-0.5">Phone-verified CRM records created automatically during intake</p>
              </div>
            </div>

            <div className="bg-[#15191F] border border-[#292F39] rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customers by name or phone..." 
                  className="w-full bg-[#1B2028] border border-[#292F39] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {filteredCustomers.length} Customer Record{filteredCustomers.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="bg-[#15191F] border border-[#292F39] rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#292F39] text-slate-400 uppercase tracking-wider text-[11px] bg-[#101318] font-bold">
                    <th className="py-3.5 px-5">Customer</th>
                    <th className="py-3.5 px-5">Phone Number</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Total Repairs</th>
                    <th className="py-3.5 px-5 text-right">Last Interaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#292F39]">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400">
                        <p className="text-sm font-semibold text-white mb-1">No customers match this filter</p>
                        <p className="text-xs">Customers are registered automatically whenever a repair ticket is created.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c, idx) => {
                      const custInitials = (c.default_name || 'C').substring(0, 2).toUpperCase();
                      return (
                        <tr key={c.id || idx} className="hover:bg-[#1B2028] transition">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                                {custInitials}
                              </div>
                              <div className="font-bold text-white">{c.default_name}</div>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-mono text-slate-300">
                            {c.phone_e164}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              c.is_verified ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-slate-400 border border-zinc-700'
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

        {/* TAB 4: STAFF & TEAM SEATS */}
        {activeTab === 'team' && (
          <div id="tab-panel-team" className="workspace-page-panel is-active space-y-6" style={{ display: 'block' }}>
            <div className="flex items-center justify-between pb-2 border-b border-[#292F39]">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Workshop Team &amp; Seats</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage technician accounts, front desk access, and seat quota</p>
              </div>
              <button 
                type="button"
                onClick={onOpenAddStaffModal}
                className="workspace-primary-action cursor-pointer hover:opacity-90 transition"
              >
                <span>+</span> Invite Staff Member
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map((s, idx) => (
                <div key={s.id || idx} className="bg-[#15191F] border border-[#292F39] rounded-2xl p-5 shadow-lg flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-bold text-base flex items-center justify-center shadow-md flex-shrink-0">
                    {(s.name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-white text-sm truncate">{s.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
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

        {/* TAB 5: SHOP SETTINGS & PLANS */}
        {activeTab === 'subscription' && (
          <div id="tab-panel-billing" className="workspace-page-panel is-active space-y-6" style={{ display: 'block' }}>
            <div className="pb-2 border-b border-[#292F39]">
              <h2 className="text-xl font-black text-white tracking-tight">Shop Settings &amp; Subscription Plans</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage your active FixFlow SaaS tier, staff seats, and ticket quotas</p>
            </div>

            {/* Quota Progress */}
            <div className="bg-[#15191F] border border-[#292F39] rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Monthly Ticket Quota</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isUnlimited 
                      ? 'You have unlimited tickets on your active plan.' 
                      : `Free plan limit: 30 tickets per month.`}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                  {isUnlimited ? `${ticketsUsed} tickets created` : `${ticketsUsed} / ${ticketLimit} used`}
                </span>
              </div>

              {!isUnlimited && (
                <div className="w-full bg-[#101318] h-3 rounded-full overflow-hidden p-0.5 border border-[#292F39]">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full transition-all duration-300" 
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
                    className={`bg-[#15191F] rounded-2xl p-6 border flex flex-col justify-between transition ${
                      isActive 
                        ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' 
                        : 'border-[#292F39] hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
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
                      className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isActive 
                          ? 'bg-[#1B2028] text-slate-400 cursor-default border border-[#292F39]' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
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
