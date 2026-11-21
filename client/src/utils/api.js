const API_BASE = '/api';

async function apiRequest(endpoint, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // ── Shop Auth ──────────────────────────────────────────────────────────
  // App.jsx calls: api.shopLogin(email, password)
  shopLogin: (email, password) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // App.jsx calls: api.shopRegister(payload)
  shopRegister: (payload) =>
    apiRequest('/auth/register-owner', { method: 'POST', body: JSON.stringify(payload) }),

  // App.jsx calls: api.demoLogin()
  // Demo login: try known credentials, auto-register if first time
  demoLogin: async () => {
    const DEMO_EMAIL = 'demo@metromobile.com';
    const DEMO_PASSWORD = 'demoPassword123';
    try {
      return await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
      });
    } catch {
      // Auto-register demo shop on first run
      return await apiRequest('/auth/register-owner', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Metro Mobile Repair',
          ownerName: 'Demo Owner',
          ownerEmail: DEMO_EMAIL,
          ownerPassword: DEMO_PASSWORD,
          phone: '9000000000',
          address: '1 Demo Street, Bangalore'
        })
      });
    }
  },

  // App.jsx calls: api.getProfile(token)
  getProfile: (token) =>
    apiRequest('/auth/me', { method: 'GET' }, token),

  // App.jsx calls: api.getWorkspace(token)
  getWorkspace: (token) =>
    apiRequest('/workspace', { method: 'GET' }, token),

  // ── Subscription ──────────────────────────────────────────────────────
  // App.jsx calls: api.getSubscription(token)
  getSubscription: (token) =>
    apiRequest('/subscription', { method: 'GET' }, token),

  // App.jsx calls: api.switchPlan(targetPlanId, shopToken, options)
  switchPlan: (planId, token, options = {}) =>
    apiRequest('/subscription/change-plan', { 
      method: 'POST', 
      body: JSON.stringify({ planId, ...options }) 
    }, token),

  // ── Tickets ───────────────────────────────────────────────────────────
  // App.jsx calls: api.getTickets(token)
  getTickets: (token, query = '') =>
    apiRequest(`/tickets${query ? `?${query}` : ''}`, { method: 'GET' }, token),

  // App.jsx calls: api.createTicket(ticketData, shopToken)
  createTicket: (ticketData, token) =>
    apiRequest('/tickets', { method: 'POST', body: JSON.stringify(ticketData) }, token),

  // App.jsx calls: api.updateTicketStatus(ticketId, newStatus, shopToken)
  updateTicketStatus: (ticketId, newStatus, token) =>
    apiRequest(`/tickets/${ticketId}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) }, token),

  // App.jsx calls: api.deleteShopTicket(ticketId, shopToken)
  deleteShopTicket: (ticketId, token) =>
    apiRequest(`/tickets/${ticketId}`, { method: 'DELETE' }, token),

  // App.jsx calls: api.getTicketDetails(ticketId, shopToken)
  getTicketDetails: (ticketId, token) =>
    apiRequest(`/tickets/${ticketId}`, { method: 'GET' }, token),

  // ── Staff ─────────────────────────────────────────────────────────────
  // App.jsx calls: api.getStaff(token)
  getStaff: (token) =>
    apiRequest('/workspace/staff', { method: 'GET' }, token),

  // App.jsx calls: api.addStaff(staffPayload, shopToken)
  addStaff: (staffPayload, token) =>
    apiRequest('/workspace/staff', { method: 'POST', body: JSON.stringify(staffPayload) }, token),

  // ── Customers (Shop View) ─────────────────────────────────────────────
  // App.jsx calls: api.getCustomers(token)
  getCustomers: (token) =>
    apiRequest('/customers', { method: 'GET' }, token),

  // ── Customer Track Portal ─────────────────────────────────────────────
  // App.jsx calls: api.customerLogin(phone, password)
  customerLogin: (phone, password) =>
    apiRequest('/track/login', { method: 'POST', body: JSON.stringify({ phone, password }) }),

  // App.jsx calls: api.customerRegister({ phone, name, password })
  customerRegister: (payload) =>
    apiRequest('/track/register', { method: 'POST', body: JSON.stringify(payload) }),

  // App.jsx calls: api.getCustomerProfile(token)
  getCustomerProfile: (token) =>
    apiRequest('/track/me', { method: 'GET' }, token),

  // App.jsx calls: api.getCustomerTickets(token)
  getCustomerTickets: (token) =>
    apiRequest('/track/tickets', { method: 'GET' }, token),

  // App.jsx calls: api.deleteCustomerTicket(ticketId, customerToken)
  deleteCustomerTicket: (ticketId, token) =>
    apiRequest(`/track/tickets/${ticketId}`, { method: 'DELETE' }, token),
};
