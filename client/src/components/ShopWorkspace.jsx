import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const ALL_STATUSES = ['ALL', 'RECEIVED', 'DIAGNOSING', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'DELIVERED', 'CANCELLED'];

const TIER_ORDER = {
  free: 0,
  starter: 1,
  pro: 2,
  business: 3
};

const PLANS_DATA = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    badge: 'Solo Technician',
    desc: 'Up to 30 tickets/month, 1 owner account, core repair tracking.',
    popular: false,
    maxStaff: 1,
    tickets: '30 tickets / mo',
    features: [
      { text: '30 Repair Tickets / month', included: true },
      { text: '1 Workshop Owner Account', included: true },
      { text: 'Live Customer Repair Tracking Portal', included: true },
      { text: 'Full Multilingual Support (12 Languages)', included: true },
      { text: 'Repair Status History & Audit Trail', included: true },
      { text: 'Customer Phone Deduplication', included: true },
      { text: 'SMS & WhatsApp Notifications', included: false },
      { text: 'Parts Inventory & Stock Control', included: false },
      { text: 'Repair Passport & Advanced Analytics', included: false },
    ],
    highlights: [
      'Zero cost forever for independent repairers and solo technicians',
      'Full access to the 12-language multilingual customer tracking system'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '₹199',
    badge: 'Small Shop',
    desc: 'Unlimited tickets, up to 3 staff members, SMS alerts & basic reports.',
    popular: true,
    maxStaff: 3,
    tickets: 'Unlimited tickets',
    features: [
      { text: 'Unlimited Repair Tickets', included: true },
      { text: 'Up to 3 Staff Member Seats', included: true },
      { text: 'Live Customer Repair Tracking Portal', included: true },
      { text: 'Full Multilingual Support (12 Languages)', included: true },
      { text: 'SMS & WhatsApp Customer Alerts', included: true },
      { text: 'Repair Estimates & Invoicing', included: true },
      { text: 'Basic Workshop Analytics & Reports', included: true },
      { text: 'Technician Role Permissions', included: true },
      { text: 'Parts Inventory & Stock Control', included: false },
    ],
    highlights: [
      'Unlimited tickets so your shop can scale with zero volume caps',
      'Invite up to 3 technicians to assign tickets and monitor productivity',
      'Automated SMS & WhatsApp status alerts to keep customers updated'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹499',
    badge: 'Growing Workshop',
    desc: 'Unlimited tickets, up to 10 staff, inventory parts & Repair Passport.',
    popular: false,
    maxStaff: 10,
    tickets: 'Unlimited tickets',
    features: [
      { text: 'Unlimited Repair Tickets', included: true },
      { text: 'Up to 10 Staff Member Seats', included: true },
      { text: 'Spare Parts Inventory & Stock Control', included: true },
      { text: 'Repair Passport Digital Device History', included: true },
      { text: 'Technician Performance & Revenue Tracking', included: true },
      { text: 'SMS & WhatsApp Customer Alerts', included: true },
      { text: 'Priority Email & WhatsApp Support', included: true },
      { text: 'Custom Workshop Branding on Receipts', included: true },
      { text: 'Multi-Branch Management', included: false },
    ],
    highlights: [
      'Comprehensive parts inventory module with low-stock alerts',
      'Generate verifiable Repair Passport certificates for customer devices',
      'Supports growing repair centers with up to 10 active technician accounts'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: '₹999',
    badge: 'Franchise & Enterprise',
    desc: 'Multi-branch (up to 5), 25 staff members, advanced BI analytics.',
    popular: false,
    maxStaff: 25,
    tickets: 'Unlimited tickets',
    features: [
      { text: 'Unlimited Repair Tickets', included: true },
      { text: 'Up to 25 Staff Member Seats', included: true },
      { text: 'Multi-Branch Management (Up to 5 Locations)', included: true },
      { text: 'Full Spare Parts Inventory & Stock Audits', included: true },
      { text: 'Advanced BI Analytics & Financial Exports', included: true },
      { text: 'Repair Passport & Digital Warranty Proof', included: true },
      { text: 'Dedicated Account Manager & 24/7 SLA', included: true },
      { text: 'Custom Invoices, Receipts & Webhook Integrations', included: true },
      { text: 'Enterprise Role-Based Access Controls', included: true },
    ],
    highlights: [
      'Manage multiple repair branches under a unified executive dashboard',
      'Scale up to 25 staff members across all locations',
      'Enterprise financial analysis, custom invoicing, and VIP support SLA'
    ]
  }
];

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

function formatStatusLabel(s) {
  if (!s) return '';
  return s.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

function getStatusPill(status) {
  switch (status) {
    case 'RECEIVED':
      return { label: 'Received', dotClass: 'status-dot-pending', selectClass: 'bg-zinc-800 text-slate-300 border-zinc-700' };
    case 'DIAGNOSING':
      return { label: 'Diagnosing', dotClass: 'status-dot-progress', selectClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
    case 'IN_PROGRESS':
      return { label: 'In Progress', dotClass: 'status-dot-progress', selectClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30' };
    case 'WAITING_PARTS':
      return { label: 'Waiting for Parts', dotClass: 'status-dot-progress', selectClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
    case 'COMPLETED':
      return { label: 'Completed', dotClass: 'status-dot-complete', selectClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
    case 'DELIVERED':
      return { label: 'Delivered', dotClass: 'status-dot-delivered', selectClass: 'bg-teal-500/10 text-teal-300 border-teal-500/30' };
    case 'CANCELLED':
      return { label: 'Cancelled', dotClass: 'status-dot-pending', selectClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
    default:
      return { label: status, dotClass: 'status-dot-pending', selectClass: 'bg-zinc-800 text-slate-300 border-zinc-700' };
  }
}

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
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [customerSearch, setCustomerSearch] = useState('');

  // Storefront Photo State
  const fileInputRef = useRef(null);
  const [shopPhoto, setShopPhoto] = useState(() => {
    try {
      return localStorage.getItem('ff_shop_photo') || '/images/shop-banner.jpg';
    } catch {
      return '/images/shop-banner.jpg';
    }
  });
  const [hasCustomPhoto, setHasCustomPhoto] = useState(() => {
    try {
      return Boolean(localStorage.getItem('ff_shop_photo'));
    } catch {
      return false;
    }
  });

  // Plan Details & Switch Modal State
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null);
  const [switchingPlanLoading, setSwitchingPlanLoading] = useState(false);

  // Storefront Photo Handlers
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast?.('Please choose an image under 4MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      try {
        localStorage.setItem('ff_shop_photo', dataUrl);
        setShopPhoto(dataUrl);
        setHasCustomPhoto(true);
        showToast?.('Shop photo updated successfully!', 'success');
      } catch (err) {
        showToast?.('Image is too large to save in browser storage', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhoto = () => {
    try {
      localStorage.removeItem('ff_shop_photo');
      setShopPhoto('/images/shop-banner.jpg');
      setHasCustomPhoto(false);
      showToast?.('Shop photo reset to default.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  // Plan Switch Execution Handler
  const handleConfirmPlanSwitch = async (targetPlanId) => {
    setSwitchingPlanLoading(true);
    try {
      if (onSwitchPlan) {
        await onSwitchPlan(targetPlanId, { autoDeactivateExcessStaff: true });
      }
      setSelectedPlanForModal(null);
    } catch (err) {
      console.error('Plan switch error:', err);
    } finally {
      setSwitchingPlanLoading(false);
    }
  };

  // Initials for avatar in sidebar
  const initials = useMemo(() => {
    const str = workspace?.name || repairer?.name || 'WS';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  }, [workspace, repairer]);

  // Current Plan — fully robust resolution across server payload formats
  const currentPlan = useMemo(() => {
    if (subscription?.currentPlan) return subscription.currentPlan;
    if (subscription?.subscription?.plan) return subscription.subscription.plan;
    if (subscription?.plan) return subscription.plan;
    if (workspace?.plan) return workspace.plan;
    if (workspace?.planId) {
      return {
        id: workspace.planId,
        name: workspace.planId.charAt(0).toUpperCase() + workspace.planId.slice(1)
      };
    }
    return { id: 'free', name: 'Free' };
  }, [subscription, workspace]);

  const currentTierId = (currentPlan?.id || 'free').toLowerCase();
  const currentTierIndex = TIER_ORDER[currentTierId] ?? 0;
  const isFreePlan = currentTierId === 'free';
  const isUnlimited = !isFreePlan || Boolean(currentPlan?.unlimitedTickets);
  const ticketLimit = currentPlan?.maxTicketsPerMonth || 30;
  const ticketsUsed = subscription?.usage?.tickets?.totalCreated ?? (subscription?.usage?.ticketsThisMonth || tickets.length);
  const maxStaff = currentPlan?.maxStaff || (currentTierId === 'business' ? 25 : currentTierId === 'pro' ? 10 : currentTierId === 'starter' ? 3 : 1);

  // Active Repairs (not delivered / cancelled)
  const activeRepairsCount = useMemo(() => {
    return tickets.filter(tItem => tItem.status !== 'DELIVERED' && tItem.status !== 'CANCELLED').length;
  }, [tickets]);

  // Active Revenue sum
  const activeRevenue = useMemo(() => {
    return tickets
      .filter(tItem => tItem.status !== 'DELIVERED' && tItem.status !== 'CANCELLED')
      .reduce((sum, tItem) => sum + (Number(tItem.estimated_cost) || 0), 0);
  }, [tickets]);

  // Status counts for overview widget
  const statusCounts = useMemo(() => {
    const counts = { pending: 0, progress: 0, completed: 0, delivered: 0 };
    tickets.forEach(tItem => {
      if (tItem.status === 'RECEIVED') counts.pending++;
      else if (tItem.status === 'IN_PROGRESS' || tItem.status === 'DIAGNOSING' || tItem.status === 'WAITING_PARTS') counts.progress++;
      else if (tItem.status === 'COMPLETED') counts.completed++;
      else if (tItem.status === 'DELIVERED') counts.delivered++;
    });
    return counts;
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(tItem => {
      const matchesStatus = statusFilter === 'ALL' || tItem.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesStatus;
      const matchesSearch = 
        (tItem.ticket_number && tItem.ticket_number.toString().includes(q)) ||
        (tItem.customer_name && tItem.customer_name.toLowerCase().includes(q)) ||
        (tItem.customer_phone && tItem.customer_phone.includes(q)) ||
        (tItem.brand && tItem.brand.toLowerCase().includes(q)) ||
        (tItem.model && tItem.model.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [tickets, statusFilter, searchQuery]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(c => 
      (c.default_name && c.default_name.toLowerCase().includes(q)) ||
      (c.phone_e164 && c.phone_e164.includes(q))
    );
  }, [customers, customerSearch]);

  // Recent tickets for overview
  const recentTickets = useMemo(() => {
    return [...tickets].slice(0, 5);
  }, [tickets]);

  return (
    <div 
      id="shop-view-container" 
      className={`relative w-full overflow-hidden min-h-[calc(100vh-3.5rem)] ${sidebarCollapsed ? 'workspace-sidebar-collapsed' : ''}`}
    >
      {/* 1: WORKSPACE SIDEBAR NAVIGATION */}
      <aside 
        id="workspace-sidebar" 
        className="workspace-sidebar"
        aria-label="Workspace navigation"
      >
        {/* Toggle Collapse */}
        <button 
          id="workspace-sidebar-toggle"
          type="button" 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title="Toggle Sidebar"
          aria-label="Toggle Sidebar"
          aria-expanded={!sidebarCollapsed}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Main Workspace navigation links */}
        <div className="workspace-sidebar-section">
          <span className="workspace-sidebar-label">{t('ws_navigation')}</span>

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
            <span>{t('ws_overview')}</span>
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
            <span>{t('ws_tickets')}</span>
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
            <span>{t('ws_customers')}</span>
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
            <span>{t('ws_team')}</span>
          </button>
        </div>

        {/* Management section */}
        <div className="workspace-sidebar-section workspace-sidebar-management">
          <span className="workspace-sidebar-label">{t('ws_management')}</span>
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
            <span>{t('ws_settings')}</span>
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
            <span>{t('ws_plan_badge', { plan: currentPlan.name || 'Free' })}</span>
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
                  {workspace?.role === 'OWNER' ? t('shop_owner') : (workspace?.role || t('shop_staff'))}
                </span>
              </div>
              <div className="pt-3 space-y-1.5">
                <button
                  onClick={() => { setAccountMenuOpen(false); setActiveTab('subscription'); }}
                  className="w-full text-left py-2 px-3 rounded-xl text-zinc-300 hover:text-white hover:bg-[#1B2028] transition font-medium flex items-center justify-between cursor-pointer"
                >
                  <span>{t('ws_settings')} &amp; Plans</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">{currentPlan.name}</span>
                </button>
                {onShopLogout && (
                  <button
                    onClick={() => { setAccountMenuOpen(false); onShopLogout(); }}
                    className="w-full text-left py-2 px-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition font-bold cursor-pointer"
                  >
                    {t('nav_sign_out')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 2: MAIN DASHBOARD CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <div id="shop-workspace-dashboard" className="space-y-8">
          
          {/* TAB 1: WORKSPACE OVERVIEW */}
          {activeTab === 'overview' && (
            <section id="workspace-overview-panel" className="workspace-page-panel is-active" style={{ display: 'block' }}>
              
              {/* Top 25% Screen: Storefront Photo Showcase */}
              <div 
                id="overview-shop-showcase" 
                className="relative w-full rounded-3xl overflow-hidden min-h-[220px] sm:min-h-[260px] md:min-h-[280px] p-6 sm:p-8 flex flex-col justify-between border border-[#292F39] shadow-2xl mb-8 bg-cover bg-center transition-all duration-300"
                style={{ backgroundImage: `url("${shopPhoto}")` }}
              >
                {/* Layered dark gradients for contrast and luxury aesthetic */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/85 to-[#0d1117]/45 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent pointer-events-none" />

                {/* Top Row: Shop status pill + Photo controls */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Workshop Operational
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10 backdrop-blur-md">
                      {currentPlan?.name || 'Free'} Tier
                    </span>
                  </div>

                  {/* Photo Customization Action Buttons */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePhotoUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white bg-black/60 hover:bg-black/80 border border-white/20 backdrop-blur-md transition cursor-pointer"
                      title="Upload your shop banner or storefront photo"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <span>Change Shop Photo</span>
                    </button>

                    {hasCustomPhoto && (
                      <button 
                        type="button"
                        onClick={handleResetPhoto}
                        className="px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-md transition cursor-pointer"
                        title="Reset to default shop banner"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Shop Title, Address/Contact & Primary Intake CTA */}
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mt-6">
                  <div className="max-w-xl">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-1 block">
                      {t('ws_overview_eyebrow')}
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                      {workspace?.name || t('ws_overview_title')}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed drop-shadow line-clamp-1">
                      {workspace?.address ? `${workspace.address} • ` : ''}
                      {repairer?.email || workspace?.phone || t('ws_overview_subtitle')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button 
                      type="button" 
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition cursor-pointer"
                      onClick={onOpenNewTicketModal}
                    >
                      <span className="text-base leading-none font-bold">+</span>
                      <span>{t('ws_new_intake_btn').replace(/^\+\s*/, '')}</span>
                    </button>
                  </div>
                </div>
              </div>

            {/* 4 Metric KPI Widgets */}
            <div className="workspace-stat-grid">
              <div className="workspace-stat-widget">
                <span>{t('stat_active_repairs')}</span>
                <strong id="overview-active-repairs">{activeRepairsCount}</strong>
                <small>{t('stat_in_queue')}</small>
              </div>
              <div className="workspace-stat-widget">
                <span>{t('stat_total_customers')}</span>
                <strong id="overview-total-customers">{customers.length}</strong>
                <small>{t('stat_unique_customers')}</small>
              </div>
              <div className="workspace-stat-widget">
                <span>{t('stat_staff_members')}</span>
                <strong id="overview-staff-members">{staff.length}</strong>
                <small id="overview-staff-capacity">
                  {t('stat_seats_occupied', { current: staff.length, max: maxStaff })}
                </small>
              </div>
              <div className="workspace-stat-widget">
                <span>{t('stat_repair_revenue')}</span>
                <strong id="overview-repair-revenue">₹{activeRevenue.toLocaleString()}</strong>
                <small>{t('stat_active_estimates')}</small>
              </div>
            </div>

            {/* Operations & Activity Grid */}
            <div className="workspace-overview-grid">
              {/* Left Surface: Operations / Repair Status */}
              <div className="workspace-surface workspace-status-overview">
                <div className="workspace-surface-heading">
                  <div>
                    <span className="workspace-eyebrow">{t('ws_operations')}</span>
                    <h2>{t('ws_repair_status')}</h2>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('tickets')} 
                    className="cursor-pointer hover:underline text-indigo-400"
                  >
                    {t('ws_view_tickets')} <span>→</span>
                  </button>
                </div>
                <div className="workspace-status-list">
                  <div>
                    <span className="status-dot status-dot-pending"></span>
                    <span>{t('status_pending')}</span>
                    <strong id="overview-status-pending">{statusCounts.pending}</strong>
                  </div>
                  <div>
                    <span className="status-dot status-dot-progress"></span>
                    <span>{t('status_in_progress')}</span>
                    <strong id="overview-status-progress">{statusCounts.progress}</strong>
                  </div>
                  <div>
                    <span className="status-dot status-dot-complete"></span>
                    <span>{t('status_completed')}</span>
                    <strong id="overview-status-completed">{statusCounts.completed}</strong>
                  </div>
                  <div>
                    <span className="status-dot status-dot-delivered"></span>
                    <span>{t('status_delivered')}</span>
                    <strong id="overview-status-delivered">{statusCounts.delivered}</strong>
                  </div>
                </div>
              </div>

              {/* Right Surface: Activity / Recent Repair Activity */}
              <div className="workspace-surface">
                <div className="workspace-surface-heading">
                  <div>
                    <span className="workspace-eyebrow">{t('ws_activity')}</span>
                    <h2>{t('ws_recent_activity')}</h2>
                  </div>
                </div>
                <div id="overview-recent-activity" className="workspace-activity-list">
                  {recentTickets.length === 0 ? (
                    <div className="workspace-empty-state">{t('ws_no_activity')}</div>
                  ) : (
                    recentTickets.map(tItem => {
                      const dotClass = tItem.status === 'IN_PROGRESS' 
                        ? 'progress' 
                        : tItem.status === 'COMPLETED' 
                          ? 'complete' 
                          : tItem.status === 'DELIVERED' 
                            ? 'delivered' 
                            : 'pending';
                      return (
                        <div key={tItem.id || tItem._id} className="workspace-activity-item">
                          <span className={`status-dot status-dot-${dotClass}`}></span>
                          <div>
                            <strong>Ticket #{tItem.ticket_number} • {getTranslatedStatus(tItem.status, t)}</strong>
                            <small>
                              {tItem.assigned_staff_name ? `Assigned to ${tItem.assigned_staff_name}` : 'No technician assigned'}
                              {tItem.customer_name ? ` • ${tItem.customer_name}` : ''}
                            </small>
                          </div>
                          <small>{new Date(tItem.updated_at || tItem.created_at || Date.now()).toLocaleDateString()}</small>
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
                  <span className="workspace-eyebrow">{t('ws_queue')}</span>
                  <h2>{t('ws_recent_tickets')}</h2>
                </div>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('tickets')} 
                  className="cursor-pointer hover:underline text-indigo-400"
                >
                  {t('ws_open_queue')} <span>→</span>
                </button>
              </div>
              <div id="overview-recent-tickets" className="workspace-ticket-list">
                {recentTickets.length === 0 ? (
                  <div className="workspace-empty-state">{t('ws_no_tickets')}</div>
                ) : (
                  recentTickets.map(tItem => {
                    const badgeClass = tItem.status === 'IN_PROGRESS' 
                      ? 'is-progress' 
                      : tItem.status === 'COMPLETED' 
                        ? 'is-complete' 
                        : tItem.status === 'DELIVERED' 
                          ? 'is-delivered' 
                          : '';
                    return (
                      <div key={tItem.id || tItem._id} className="workspace-ticket-item">
                        <strong>#{tItem.ticket_number}</strong>
                        <div>
                          <strong>{tItem.customer_name || 'Walk-in Customer'}</strong>
                          <small>{tItem.customer_phone || 'No phone added'}</small>
                        </div>
                        <div>
                          <strong>{tItem.brand || ''} {tItem.model || ''}</strong>
                          <small>{tItem.device_category || 'Device'}</small>
                        </div>
                        <span>{tItem.assigned_staff_name || 'Unassigned'}</span>
                        <strong>₹{(tItem.estimated_cost || 0).toLocaleString()}</strong>
                        <span className={`workspace-status-badge ${badgeClass}`}>
                          {getTranslatedStatus(tItem.status, t)}
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
                <h2 className="text-xl font-black text-white tracking-tight">{t('ws_tickets')}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage intake, diagnosis, technician updates, and delivery</p>
              </div>
              <button 
                type="button"
                onClick={onOpenNewTicketModal}
                className="workspace-primary-action cursor-pointer hover:opacity-90 transition"
              >
                <span>+</span> {t('ws_new_intake_btn').replace(/^\+\s*/, '')}
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
                  placeholder={t('ws_search_placeholder')} 
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
                    {s === 'ALL' ? t('ws_all_statuses') : getTranslatedStatus(s, t)}
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
                      <th className="py-3.5 px-5">{t('ws_ticket_col')}</th>
                      <th className="py-3.5 px-5">{t('ws_customer_col')}</th>
                      <th className="py-3.5 px-5">{t('ws_device_col')}</th>
                      <th className="py-3.5 px-5">{t('ws_issue_col')}</th>
                      <th className="py-3.5 px-5">{t('ws_tech_col')}</th>
                      <th className="py-3.5 px-5">{t('ws_cost_col')}</th>
                      <th className="py-3.5 px-5">{t('ws_status_col')}</th>
                      <th className="py-3.5 px-5 text-right">{t('ws_actions_col')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#292F39]">
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-slate-400">
                          <p className="text-sm font-semibold text-white mb-1">{t('ws_no_tickets')}</p>
                          <p className="text-xs">Create your first ticket by clicking "+ New Repair Intake" above.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map(tItem => {
                        const statusPill = getStatusPill(tItem.status);
                        return (
                          <tr key={tItem.id || tItem._id} className="hover:bg-[#1B2028] transition">
                            <td className="py-4 px-5 font-mono font-bold text-indigo-400">
                              #{tItem.ticket_number}
                            </td>
                            <td className="py-4 px-5">
                              <div className="font-bold text-white">{tItem.customer_name}</div>
                              <div className="font-mono text-[11px] text-slate-400">{tItem.customer_phone}</div>
                            </td>
                            <td className="py-4 px-5">
                              <div className="font-semibold text-white">{tItem.brand} {tItem.model}</div>
                              <div className="text-[11px] text-slate-400 capitalize">{tItem.device_category}</div>
                            </td>
                            <td className="py-4 px-5 max-w-xs truncate text-slate-300">
                              {tItem.issue_description || '—'}
                            </td>
                            <td className="py-4 px-5 text-slate-300">
                              {tItem.assigned_staff_name || 'Unassigned'}
                            </td>
                            <td className="py-4 px-5 font-mono font-bold text-emerald-400">
                              ₹{(tItem.estimated_cost || 0).toLocaleString()}
                            </td>
                            <td className="py-4 px-5">
                              <select 
                                value={tItem.status}
                                onChange={(e) => onUpdateTicketStatus(tItem.id || tItem._id, e.target.value)}
                                className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border cursor-pointer focus:outline-none transition ${statusPill.selectClass}`}
                              >
                                {['RECEIVED', 'DIAGNOSING', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'DELIVERED', 'CANCELLED'].map(s => (
                                  <option key={s} value={s}>{getTranslatedStatus(s, t)}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  type="button"
                                  onClick={() => onOpenTimelineModal(tItem)}
                                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                                  title="View Timeline History"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M12 7v5l3 3" />
                                  </svg>
                                  <span>{t('ws_timeline_btn')}</span>
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => onDeleteTicket(tItem.id || tItem._id, tItem.ticket_number)}
                                  className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                                  title="Delete Ticket"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  <span>{t('ws_delete_btn')}</span>
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
                <h2 className="text-xl font-black text-white tracking-tight">{t('ws_customers')}</h2>
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
                {t('ws_customer_records', { count: filteredCustomers.length })}
              </span>
            </div>

            <div className="bg-[#15191F] border border-[#292F39] rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#292F39] text-slate-400 uppercase tracking-wider text-[11px] bg-[#101318] font-bold">
                    <th className="py-3.5 px-5">{t('ws_customer_col')}</th>
                    <th className="py-3.5 px-5">Phone Number</th>
                    <th className="py-3.5 px-5">{t('ws_status_col')}</th>
                    <th className="py-3.5 px-5">{t('ws_total_repairs')}</th>
                    <th className="py-3.5 px-5 text-right">{t('ws_last_interaction')}</th>
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
                              {c.is_verified ? `✓ ${t('verified_customer')}` : 'Intake Registered'}
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
                <h2 className="text-xl font-black text-white tracking-tight">{t('ws_workshop_team')}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{t('ws_workshop_team_desc')}</p>
              </div>
              <button 
                type="button"
                onClick={onOpenAddStaffModal}
                className="workspace-primary-action cursor-pointer hover:opacity-90 transition"
              >
                <span>+</span> {t('ws_invite_staff').replace(/^\+\s*/, '')}
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
              <h2 className="text-xl font-black text-white tracking-tight">{t('ws_settings')} &amp; Subscription Plans</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage your active FixFlow SaaS tier, staff seats, and ticket quotas</p>
            </div>

            {/* Quota / Capacity Progress */}
            <div className="bg-[#15191F] border border-[#292F39] rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    {isUnlimited ? 'Active Plan Ticket Capacity' : t('ws_monthly_quota')}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isUnlimited 
                      ? 'You have unlimited repair tickets on your active plan.' 
                      : t('ws_free_limit')}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                  {isUnlimited 
                    ? `${ticketsUsed} tickets created` 
                    : t('ws_used_quota', { used: ticketsUsed, limit: ticketLimit })}
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

            {/* Plans Grid with Features Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS_DATA.map(plan => {
                const isActive = currentPlan.id === plan.id;
                const targetTierIndex = TIER_ORDER[plan.id] ?? 0;
                const buttonText = isActive
                  ? t('current_plan')
                  : targetTierIndex > currentTierIndex
                    ? t('upgrade_to', { plan: plan.name })
                    : t('downgrade_to', { plan: plan.name });

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
                            {t('popular_badge')}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xl font-black text-white">{plan.name}</h4>
                      <div className="mt-2 text-2xl font-black text-white">
                        {plan.price} <span className="text-xs font-normal text-slate-400">{t('mo')}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                        {plan.desc}
                      </p>

                      {/* Included Features Preview */}
                      <div className="mt-4 pt-4 border-t border-[#292F39] space-y-2">
                        {plan.features.slice(0, 4).map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className={f.included ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                              {f.included ? '✓' : '✕'}
                            </span>
                            <span className={f.included ? 'text-slate-300' : 'text-slate-500 line-through'}>
                              {f.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      type="button"
                      disabled={isActive}
                      onClick={() => setSelectedPlanForModal(plan)}
                      className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isActive 
                          ? 'bg-[#1B2028] text-slate-400 cursor-default border border-[#292F39]' 
                          : targetTierIndex < currentTierIndex
                            ? 'bg-zinc-800 hover:bg-zinc-700 text-slate-200 border border-zinc-700 shadow-md'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      }`}
                    >
                      {buttonText}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        </div>
      </div>

      {/* PLAN DETAILS & CONFIRMATION MODAL */}
      {selectedPlanForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#15191F] border border-[#292F39] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Top decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#292F39]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                    {selectedPlanForModal.badge}
                  </span>
                  {selectedPlanForModal.popular && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      {t('popular_badge')}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-white">
                  {selectedPlanForModal.name} Plan
                </h3>
                <p className="text-sm font-semibold text-indigo-400 mt-0.5">
                  {selectedPlanForModal.price} <span className="text-xs text-slate-400 font-normal">{t('mo')}</span>
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedPlanForModal(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Scrollable Features List */}
            <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedPlanForModal.desc}
              </p>

              {/* Highlights */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                  Plan Highlights
                </span>
                {selectedPlanForModal.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                    <span className="text-indigo-400 font-bold mt-0.5">✦</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* What You Get Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  What's included in this plan:
                </h4>
                <div className="space-y-2.5">
                  {selectedPlanForModal.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      {feat.included ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30 flex-shrink-0">
                          ✓
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-bold border border-slate-700 flex-shrink-0">
                          ✕
                        </span>
                      )}
                      <span className={feat.included ? 'text-slate-200 font-medium' : 'text-slate-500 line-through'}>
                        {feat.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deactivation Notice if switching down to Free with > 1 staff */}
              {selectedPlanForModal.id === 'free' && staff.length > 1 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <span>⚠️</span>
                    <span>Staff Quota Notice</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Your workshop currently has {staff.length} staff members. The Free plan includes 1 owner seat. Extra staff members will be placed on standby and can be restored anytime by upgrading to Starter or Pro.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#292F39] flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => setSelectedPlanForModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>

              <button 
                type="button"
                disabled={switchingPlanLoading}
                onClick={() => handleConfirmPlanSwitch(selectedPlanForModal.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition cursor-pointer flex items-center gap-2 ${
                  selectedPlanForModal.id === 'free'
                    ? 'bg-zinc-700 hover:bg-zinc-600'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
              >
                {switchingPlanLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Updating Plan...</span>
                  </>
                ) : (
                  <span>
                    {TIER_ORDER[selectedPlanForModal.id] < currentTierIndex
                      ? `Confirm Switch to ${selectedPlanForModal.name}`
                      : `Confirm Upgrade to ${selectedPlanForModal.name}`}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
