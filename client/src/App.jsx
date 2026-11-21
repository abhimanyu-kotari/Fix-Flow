import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroGateway from './components/HeroGateway';
import FeaturesSection from './components/FeaturesSection';
import ShowcaseSection from './components/ShowcaseSection';
import PricingSection from './components/PricingSection';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import NewTicketModal from './components/NewTicketModal';
import AddStaffModal from './components/AddStaffModal';
import TimelineModal from './components/TimelineModal';
import ShopWorkspace from './components/ShopWorkspace';
import CustomerPortal from './components/CustomerPortal';
import { api } from './utils/api';

export default function App() {
  // Persist portal selection so page reload stays on the current portal
  const [portal, setPortal] = useState(() => {
    const saved = localStorage.getItem('ff_portal');
    if (saved === 'shop' || saved === 'track') return saved;
    if (localStorage.getItem('ff_shop_token')) return 'shop';
    if (localStorage.getItem('ff_cust_token')) return 'track';
    return 'shop';
  });

  const [toasts, setToasts] = useState([]);

  // Shop state — persisted in localStorage to survive page refreshes
  const [shopToken, setShopToken] = useState(() => localStorage.getItem('ff_shop_token') || '');
  const [workspace, setWorkspace] = useState(() => {
    try {
      const saved = localStorage.getItem('ff_workspace');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [repairerProfile, setRepairerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('ff_repairer_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [tickets, setTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [subscription, setSubscription] = useState(null);

  // Customer state — persisted in localStorage to survive page refreshes
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem('ff_cust_token') || '');
  const [customerProfile, setCustomerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('ff_cust_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [customerTickets, setCustomerTickets] = useState([]);

  // Session verification state (only true if token exists but cached workspace is missing)
  const [authVerifying, setAuthVerifying] = useState(() => {
    const hasShop = Boolean(localStorage.getItem('ff_shop_token'));
    const hasShopData = Boolean(localStorage.getItem('ff_workspace'));
    const hasCust = Boolean(localStorage.getItem('ff_cust_token'));
    const hasCustData = Boolean(localStorage.getItem('ff_cust_profile'));
    if (hasShop && !hasShopData) return true;
    if (hasCust && !hasCustData) return true;
    return false;
  });

  const handleSwitchPortal = useCallback((newPortal) => {
    setPortal(newPortal);
    localStorage.setItem('ff_portal', newPortal);
  }, []);

  // Modals
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [selectedTimelineTicket, setSelectedTimelineTicket] = useState(null);

  // Toast notification helper
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch shop dashboard data
  const loadShopData = useCallback(async (token) => {
    const currentToken = token || shopToken;
    if (!currentToken) {
      setAuthVerifying(false);
      return;
    }

    try {
      // 1. Load workspace and profile in parallel
      const [wsResult, profResult] = await Promise.allSettled([
        api.getWorkspace(currentToken),
        api.getProfile(currentToken)
      ]);

      // If workspace request failed due to authentication (401), clear session
      if (wsResult.status === 'rejected') {
        const err = wsResult.reason;
        const msg = (err?.message || '').toLowerCase();
        if (msg.includes('authentication required') || msg.includes('expired') || msg.includes('401') || msg.includes('access denied')) {
          handleShopLogout();
          return;
        }
      }

      if (wsResult.status === 'fulfilled' && wsResult.value?.workspace) {
        const ws = wsResult.value.workspace;
        setWorkspace(prev => {
          const updated = { ...(ws || {}), role: prev?.role || 'OWNER' };
          localStorage.setItem('ff_workspace', JSON.stringify(updated));
          return updated;
        });
      }

      if (profResult.status === 'fulfilled' && profResult.value?.user) {
        const usr = profResult.value.user;
        setRepairerProfile(usr);
        localStorage.setItem('ff_repairer_profile', JSON.stringify(usr));
        setWorkspace(prev => {
          const updated = { ...(prev || {}), role: usr.role };
          localStorage.setItem('ff_workspace', JSON.stringify(updated));
          return updated;
        });
      }

      // 2. Load auxiliary dashboard metrics in parallel (isolated so any network glitch doesn't log the user out)
      const [tkRes, stRes, csRes, subRes] = await Promise.allSettled([
        api.getTickets(currentToken),
        api.getStaff(currentToken),
        api.getCustomers(currentToken),
        api.getSubscription(currentToken)
      ]);

      if (tkRes.status === 'fulfilled') setTickets(tkRes.value?.tickets || []);
      if (stRes.status === 'fulfilled') setStaff(stRes.value?.staff || []);
      if (csRes.status === 'fulfilled') setCustomers(csRes.value?.customers || []);
      if (subRes.status === 'fulfilled') setSubscription(subRes.value);

    } catch (err) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('authentication required') || msg.includes('expired') || msg.includes('401')) {
        handleShopLogout();
      }
    } finally {
      setAuthVerifying(false);
    }
  }, [shopToken]);

  // Fetch customer dashboard data
  const loadCustomerData = useCallback(async (token) => {
    const currentToken = token || customerToken;
    if (!currentToken) {
      setAuthVerifying(false);
      return;
    }

    try {
      const [profRes, tkRes] = await Promise.allSettled([
        api.getCustomerProfile(currentToken),
        api.getCustomerTickets(currentToken)
      ]);

      if (profRes.status === 'rejected') {
        const err = profRes.reason;
        const msg = (err?.message || '').toLowerCase();
        if (msg.includes('authentication required') || msg.includes('expired') || msg.includes('401')) {
          handleCustomerLogout();
          return;
        }
      }

      if (profRes.status === 'fulfilled' && profRes.value?.customer) {
        setCustomerProfile(profRes.value.customer);
        localStorage.setItem('ff_cust_profile', JSON.stringify(profRes.value.customer));
      }

      if (tkRes.status === 'fulfilled') {
        setCustomerTickets(tkRes.value?.tickets || []);
      }
    } catch (err) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('authentication required') || msg.includes('expired') || msg.includes('401')) {
        handleCustomerLogout();
      }
    } finally {
      setAuthVerifying(false);
    }
  }, [customerToken]);

  // Initial load
  useEffect(() => {
    if (shopToken) {
      loadShopData(shopToken);
    }
    if (customerToken) {
      loadCustomerData(customerToken);
    }
  }, [shopToken, customerToken, loadShopData, loadCustomerData]);

  // Shop Auth Handlers
  const handleShopLogin = async (email, password) => {
    const data = await api.shopLogin(email, password);
    const ws = { ...data.workspace, role: data.user?.role || 'OWNER' };
    localStorage.setItem('ff_shop_token', data.token);
    localStorage.setItem('ff_workspace', JSON.stringify(ws));
    if (data.user) {
      localStorage.setItem('ff_repairer_profile', JSON.stringify(data.user));
    }
    localStorage.setItem('ff_portal', 'shop');

    setShopToken(data.token);
    setRepairerProfile(data.user);
    setWorkspace(ws);
    setPortal('shop');
    setAuthVerifying(false);
    showToast(`Welcome back, ${data.user?.name || data.workspace?.name}!`, 'success');
    await loadShopData(data.token);
  };

  const handleShopRegister = async (payload) => {
    const data = await api.shopRegister({
      shopName: payload.shopName || payload.name,
      name: payload.name || payload.ownerName,
      email: payload.email || payload.ownerEmail,
      password: payload.password || payload.ownerPassword,
      shopPhone: payload.phone || payload.shopPhone,
      shopAddress: payload.address || payload.shopAddress
    });
    const ws = { ...data.workspace, role: data.user?.role || 'OWNER' };
    localStorage.setItem('ff_shop_token', data.token);
    localStorage.setItem('ff_workspace', JSON.stringify(ws));
    if (data.user) {
      localStorage.setItem('ff_repairer_profile', JSON.stringify(data.user));
    }
    localStorage.setItem('ff_portal', 'shop');

    setShopToken(data.token);
    setRepairerProfile(data.user);
    setWorkspace(ws);
    setPortal('shop');
    setAuthVerifying(false);
    showToast(`Workspace ${data.workspace?.name || 'created'} successfully!`, 'success');
    await loadShopData(data.token);
  };

  const handleDemoLogin = async () => {
    try {
      const data = await api.demoLogin();
      const ws = { ...data.workspace, role: data.user?.role || 'OWNER' };
      localStorage.setItem('ff_shop_token', data.token);
      localStorage.setItem('ff_workspace', JSON.stringify(ws));
      if (data.user) {
        localStorage.setItem('ff_repairer_profile', JSON.stringify(data.user));
      }
      localStorage.setItem('ff_portal', 'shop');

      setShopToken(data.token);
      setRepairerProfile(data.user);
      setWorkspace(ws);
      setPortal('shop');
      setAuthVerifying(false);
      showToast('Signed in to Live Demo Shop Workspace!', 'success');
      await loadShopData(data.token);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleShopLogout = () => {
    localStorage.removeItem('ff_shop_token');
    localStorage.removeItem('ff_workspace');
    localStorage.removeItem('ff_repairer_profile');
    setShopToken('');
    setWorkspace(null);
    setRepairerProfile(null);
    setTickets([]);
    setStaff([]);
    setCustomers([]);
    setSubscription(null);
    setAuthVerifying(false);
    showToast('Signed out of shop workspace', 'info');
  };

  // Customer Auth Handlers
  const handleCustomerLogin = async (phone, password) => {
    const data = await api.customerLogin(phone, password);
    localStorage.setItem('ff_cust_token', data.token);
    localStorage.setItem('ff_cust_profile', JSON.stringify(data.customer));
    localStorage.setItem('ff_portal', 'track');

    setCustomerToken(data.token);
    setCustomerProfile(data.customer);
    setPortal('track');
    setAuthVerifying(false);
    showToast(`Welcome, ${data.customer.name}!`, 'success');
    await loadCustomerData(data.token);
  };

  const handleCustomerRegister = async (payload) => {
    const data = await api.customerRegister(payload);
    localStorage.setItem('ff_cust_token', data.token);
    localStorage.setItem('ff_cust_profile', JSON.stringify(data.customer));
    localStorage.setItem('ff_portal', 'track');

    setCustomerToken(data.token);
    setCustomerProfile(data.customer);
    setPortal('track');
    setAuthVerifying(false);
    showToast(`Account created for ${data.customer.phone}!`, 'success');
    await loadCustomerData(data.token);
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('ff_cust_token');
    localStorage.removeItem('ff_cust_profile');
    setCustomerToken('');
    setCustomerProfile(null);
    setCustomerTickets([]);
    setAuthVerifying(false);
    showToast('Signed out of repair tracking', 'info');
  };

  // Ticket Operations
  const handleCreateTicket = async (ticketData) => {
    const data = await api.createTicket(ticketData, shopToken);
    showToast(`Repair ticket ${data.ticket.ticketNumber} created successfully!`, 'success');
    setNewTicketModalOpen(false);
    await loadShopData(shopToken);
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      await api.updateTicketStatus(ticketId, newStatus, shopToken);
      showToast(`Status updated to ${newStatus}`, 'success');
      await loadShopData(shopToken);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteShopTicket = async (ticketId, ticketNumber) => {
    if (!window.confirm(`Are you sure you want to delete repair ticket ${ticketNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteShopTicket(ticketId, shopToken);
      showToast(`Ticket ${ticketNumber} deleted successfully`, 'success');
      await loadShopData(shopToken);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCustomerTicket = async (ticketId, ticketNumber) => {
    if (!window.confirm(`Are you sure you want to cancel / remove repair ticket ${ticketNumber}?`)) {
      return;
    }
    try {
      await api.deleteCustomerTicket(ticketId, customerToken);
      showToast(`Ticket ${ticketNumber} cancelled successfully`, 'success');
      await loadCustomerData(customerToken);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Staff invitation
  const handleAddStaff = async (staffPayload) => {
    const data = await api.addStaff(staffPayload, shopToken);
    showToast(`Staff member ${data.staff.name} invited successfully!`, 'success');
    setAddStaffModalOpen(false);
    await loadShopData(shopToken);
  };

  // Plan switch
  const handleSwitchPlan = async (targetPlanId) => {
    try {
      let token = shopToken;
      if (!token) {
        const demo = await api.demoLogin();
        const ws = { ...demo.workspace, role: demo.user?.role || 'OWNER' };
        localStorage.setItem('ff_shop_token', demo.token);
        localStorage.setItem('ff_workspace', JSON.stringify(ws));
        if (demo.user) {
          localStorage.setItem('ff_repairer_profile', JSON.stringify(demo.user));
        }
        localStorage.setItem('ff_portal', 'shop');

        setShopToken(demo.token);
        token = demo.token;
        setRepairerProfile(demo.user);
        setWorkspace(ws);
        setPortal('shop');
      }
      const data = await api.switchPlan(targetPlanId, token);
      setSubscription(data);
      const planName = data?.currentPlan?.name || data?.subscription?.plan?.name || targetPlanId.toUpperCase();
      showToast(`Workspace plan switched to ${planName}!`, 'success');
      await loadShopData(token);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Timeline viewer
  const handleOpenTimeline = async (ticket) => {
    try {
      const data = await api.getTicketDetails(ticket.id || ticket._id, shopToken);
      setSelectedTimelineTicket(data.ticket);
      setTimelineModalOpen(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const isShopActive = portal === 'shop' && Boolean(shopToken && workspace);
  const isCustActive = portal === 'track' && Boolean(customerToken && customerProfile);

  return (
    <div className="min-h-screen flex flex-col bg-[#05070B] text-white selection:bg-sky-500 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Top Navigation */}
      <Navbar 
        portal={portal}
        shopToken={shopToken}
        workspace={workspace}
        repairerProfile={repairerProfile}
        customerToken={customerToken}
        customerSession={customerProfile}
        onShopLogout={handleShopLogout}
        onCustomerLogout={handleCustomerLogout}
        onSwitchPortal={handleSwitchPortal}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto">
        {/* VIEW 1: SHOP WORKSPACE DASHBOARD */}
        {authVerifying ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-black border border-white/20 flex items-center justify-center font-black text-white text-lg animate-pulse shadow-xl shadow-black/50">
              FF
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide animate-pulse">Restoring your workspace session...</p>
          </div>
        ) : isShopActive ? (
          <ShopWorkspace 
            workspace={workspace}
            repairer={repairerProfile}
            tickets={tickets}
            staff={staff}
            customers={customers}
            subscription={subscription}
            onOpenNewTicketModal={() => setNewTicketModalOpen(true)}
            onOpenAddStaffModal={() => setAddStaffModalOpen(true)}
            onOpenTimelineModal={handleOpenTimeline}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onDeleteTicket={handleDeleteShopTicket}
            onSwitchPlan={handleSwitchPlan}
            onShopLogout={handleShopLogout}
            showToast={showToast}
          />
        ) : isCustActive ? (
          /* VIEW 2: CUSTOMER DEVICE TRACKING PORTAL */
          <CustomerPortal 
            customerProfile={customerProfile}
            tickets={customerTickets}
            onDeleteTicket={handleDeleteCustomerTicket}
          />
        ) : (
          /* VIEW 3: PUBLIC LANDING & AUTH GATEWAY */
          <div id="public-portal-gateway" className="w-full space-y-16">
            <HeroGateway 
              portal={portal}
              onSwitchPortal={handleSwitchPortal}
              onShopLogin={handleShopLogin}
              onShopRegister={handleShopRegister}
              onDemoLogin={handleDemoLogin}
              onCustomerLogin={handleCustomerLogin}
              onCustomerRegister={handleCustomerRegister}
              showToast={showToast}
            />
            <FeaturesSection />
            <ShowcaseSection 
              onTryDemo={handleDemoLogin} 
              onSwitchPortal={handleSwitchPortal}
            />
            <PricingSection 
              onSwitchPortal={handleSwitchPortal}
              onSelectPlan={() => {
                const el = document.getElementById('public-portal-gateway');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              currentPlanId={subscription?.currentPlan?.id || subscription?.subscription?.planId || 'free'}
              onSwitchPlan={handleSwitchPlan}
              shopToken={shopToken}
            />
          </div>
        )}
      </main>

      {/* Footer (Only rendered on public landing page) */}
      {!authVerifying && !isShopActive && !isCustActive && <Footer onSwitchPortal={handleSwitchPortal} />}

      {/* Modals */}
      <NewTicketModal 
        isOpen={newTicketModalOpen}
        onClose={() => setNewTicketModalOpen(false)}
        onCreateTicket={handleCreateTicket}
        staffList={staff}
        showToast={showToast}
      />

      <AddStaffModal 
        isOpen={addStaffModalOpen}
        onClose={() => setAddStaffModalOpen(false)}
        onAddStaff={handleAddStaff}
        showToast={showToast}
      />

      <TimelineModal 
        isOpen={timelineModalOpen}
        onClose={() => {
          setTimelineModalOpen(false);
          setSelectedTimelineTicket(null);
        }}
        ticket={selectedTimelineTicket}
      />
    </div>
  );
}
