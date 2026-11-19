const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}, token = null) {
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

// Auth API
export const api = {
  // Shop Auth
  loginShop: (creds) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(creds) }),
  registerShop: (data) => apiRequest('/auth/register-owner', { method: 'POST', body: JSON.stringify(data) }),
  getShopProfile: (token) => apiRequest('/auth/me', { method: 'GET' }, token),
  getWorkspace: (token) => apiRequest('/workspace', { method: 'GET' }, token),
  
  // Subscription
  getSubscription: (token) => apiRequest('/subscription', { method: 'GET' }, token),
  changePlan: (token, planId) => apiRequest('/subscription/change-plan', { method: 'POST', body: JSON.stringify({ planId }) }, token),
  getPlans: () => apiRequest('/plans', { method: 'GET' }),

  // Tickets
  getTickets: (token, query = '') => apiRequest(`/tickets${query ? `?${query}` : ''}`, { method: 'GET' }, token),
  createTicket: (token, data) => apiRequest('/tickets', { method: 'POST', body: JSON.stringify(data) }, token),
  updateTicketStatus: (token, id, status, notes = '') => apiRequest(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }, token),
  deleteTicket: (token, id) => apiRequest(`/tickets/${id}`, { method: 'DELETE' }, token),

  // Staff
  getStaff: (token) => apiRequest('/workspace/staff', { method: 'GET' }, token),
  addStaff: (token, data) => apiRequest('/workspace/staff', { method: 'POST', body: JSON.stringify(data) }, token),

  // Customers (Shop View)
  getShopCustomers: (token) => apiRequest('/customers', { method: 'GET' }, token),

  // Customer Portal
  loginCustomer: (data) => apiRequest('/track/login', { method: 'POST', body: JSON.stringify(data) }),
  registerCustomer: (data) => apiRequest('/track/register', { method: 'POST', body: JSON.stringify(data) }),
  requestOtp: (phone) => apiRequest('/track/otp/request', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (phone, code) => apiRequest('/track/otp/verify', { method: 'POST', body: JSON.stringify({ phone, code }) }),
  getCustomerTickets: (token) => apiRequest('/track/tickets', { method: 'GET' }, token),
  deleteCustomerTicket: (token, id) => apiRequest(`/track/tickets/${id}`, { method: 'DELETE' }, token)
};
