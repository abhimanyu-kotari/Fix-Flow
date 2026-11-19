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
  const [portal, setPortal] = useState('shop'); // 'shop' | 'track'
  const [toasts, setToasts] = useState([]);

  // Shop state
  const [shopToken, setShopToken] = useState(() => localStorage.getItem('ff_shop_token') || '');
  const [workspace, setWorkspace] = useState(null);
  const [repairerProfile, setRepairerProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [subscription, setSubscription] = useState(null);

  // Customer state
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem('ff_cust_token') || '');
  const [customerProfile, setCustomerProfile] = useState(null);
  const [customerTickets, setCustomerTickets] = useState([]);

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
    if (!currentToken) return;

    try {
      // Load workspace
      const wsData = await api.getWorkspace(currentToken);
      setWorkspace(wsData.workspace);

      // Load profile
      const profData = await api.getProfile(currentToken);
      setRepairerProfile(profData.repairer);

      // Load tickets
      const tkData = await api.getTickets(currentToken);
      setTickets(tkData.tickets || []);

      // Load staff
      const stData = await api.getStaff(currentToken);
      setStaff(stData.staff || []);

      // Load customers
      const csData = await api.getCustomers(currentToken);
      setCustomers(csData.customers || []);

      // Load subscription
      const subData = await api.getSubscription(currentToken);
      setSubscription(subData);
    } catch (err) {
      if (err.message && (err.message.includes('Authentication') || err.message.includes('expired') || err.message.includes('invalid'))) {
        localStorage.removeItem('ff_shop_token');
        setShopToken('');
        setWorkspace(null);
      }
    }
  }, [shopToken]);

  // Fetch customer dashboard data
  const loadCustomerData = useCallback(async (token) => {
    const currentToken = token || customerToken;
    if (!currentToken) return;

    try {
      const profData = await api.getCustomerProfile(currentToken);
      setCustomerProfile(profData.customer);

      const tkData = await api.getCustomerTickets(currentToken);
      setCustomerTickets(tkData.tickets || []);
    } catch (err) {
      if (err.message && (err.message.includes('Authentication') || err.message.includes('expired') || err.message.includes('invalid'))) {
        localStorage.removeItem('ff_cust_token');
        setCustomerToken('');
        setCustomerProfile(null);
      }
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
    localStorage.setItem('ff_shop_token', data.token);
    setShopToken(data.token);
    setWorkspace(data.workspace);
    setPortal('shop');
    showToast(`Welcome back, ${data.workspace.name}!`, 'success');
    await loadShopData(data.token);
  };

  const handleShopRegister = async (payload) => {
    const data = await api.shopRegister(payload);
    localStorage.setItem('ff_shop_token', data.token);
    setShopToken(data.token);
    setWorkspace(data.workspace);
    setPortal('shop');
    showToast(`Workspace ${data.workspace.name} created successfully!`, 'success');
    await loadShopData(data.token);
  };

  const handleDemoLogin = async () => {
    try {
      const data = await api.demoLogin();
      localStorage.setItem('ff_shop_token', data.token);
      setShopToken(data.token);
      setWorkspace(data.workspace);
      setPortal('shop');
      showToast('Signed in to Live Demo Shop Workspace!', 'success');
      await loadShopData(data.token);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleShopLogout = () => {
    localStorage.removeItem('ff_shop_token');
    setShopToken('');
    setWorkspace(null);
    setRepairerProfile(null);
    setTickets([]);
    setStaff([]);
    setCustomers([]);
    setSubscription(null);
    showToast('Signed out of shop workspace', 'info');
  };

  // Customer Auth Handlers
  const handleCustomerLogin = async (phone, password) => {
    const data = await api.customerLogin(phone, password);
    localStorage.setItem('ff_cust_token', data.token);
    setCustomerToken(data.token);
    setCustomerProfile(data.customer);
    setPortal('track');
    showToast(`Welcome back, ${data.customer.name}!`, 'success');
    await loadCustomerData(data.token);
  };

  const handleCustomerRegister = async (payload) => {
    const data = await api.customerRegister(payload);
    localStorage.setItem('ff_cust_token', data.token);
    setCustomerToken(data.token);
    setCustomerProfile(data.customer);
    setPortal('track');
    showToast(`Account created for ${data.customer.phone}!`, 'success');
    await loadCustomerData(data.token);
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('ff_cust_token');
    setCustomerToken('');
    setCustomerProfile(null);
    setCustomerTickets([]);
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
      const data = await api.switchPlan(targetPlanId, shopToken);
      showToast(`Switched plan to ${data.subscription.plan.name}!`, 'success');
      await loadShopData(shopToken);
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

  const isShopActive = portal === 'shop' && shopToken && workspace;
  const isCustActive = portal === 'track' && customerToken;

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
        onSwitchPortal={setPortal}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto">
        {/* VIEW 1: SHOP WORKSPACE DASHBOARD */}
        {isShopActive ? (
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
            showToast={showToast}
          />
        ) : isCustActive ? (
          /* VIEW 2: CUSTOMER DEVICE TRACKING PORTAL */
          <CustomerPortal 
            customerProfile={customerProfile}
            tickets={customerTickets}
            onDeleteTicket={handleDeleteCustomerTicket}
            onLogout={handleCustomerLogout}
          />
        ) : (
          /* VIEW 3: PUBLIC LANDING & AUTH GATEWAY */
          <div id="public-portal-gateway" className="w-full space-y-16">
            <HeroGateway 
              portal={portal}
              onSwitchPortal={setPortal}
              onShopLogin={handleShopLogin}
              onShopRegister={handleShopRegister}
              onDemoLogin={handleDemoLogin}
              onCustomerLogin={handleCustomerLogin}
              onCustomerRegister={handleCustomerRegister}
              showToast={showToast}
            />
            <FeaturesSection />
            <ShowcaseSection onTryDemo={handleDemoLogin} />
            <PricingSection onSelectPlan={() => {
              const el = document.getElementById('public-portal-gateway');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

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
