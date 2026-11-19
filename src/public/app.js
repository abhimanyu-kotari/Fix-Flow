/**
 * FixFlow — Frontend Application Engine
 * Light-Mode Modern SaaS Design
 * Supports Shop Workspace & FixFlow Track (Consumer Portal)
 */

let state = {
  currentPortal: 'shop', // 'shop' | 'track'
  shopToken: localStorage.getItem('ff_shop_token') || '',
  customerToken: localStorage.getItem('ff_cust_token') || '',
  workspace: null,
  subscription: null,
  tickets: [],
  staff: [],
  customers: [],
  devOtpCode: '',
  cooldownTimer: null,
  cooldownSecondsRemaining: 0,
  currentTab: 'tickets'
};

document.addEventListener('DOMContentLoaded', () => {
  renderHeaderUserArea();
  initApplication();
});

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');

  const bg = type === 'success' 
    ? 'bg-emerald-600 text-white' 
    : type === 'error' 
    ? 'bg-rose-600 text-white' 
    : 'bg-indigo-600 text-white';

  toast.className = `${bg} text-xs font-semibold px-4 py-3 rounded-xl shadow-xl transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto flex items-center justify-between gap-3 min-w-[280px]`;
  toast.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()" class="text-white/80 hover:text-white font-bold ml-2">✕</button>`;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Password visibility reveal toggle
function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  if (btnEl) {
    btnEl.classList.toggle('text-blue-600', isPass);
    btnEl.classList.toggle('text-slate-400', !isPass);
  }
}

// Portal Switcher (Used on public landing / login page)
function switchPortal(portal) {
  state.currentPortal = portal;
  const btnShop = document.getElementById('gateway-btn-shop');
  const btnTrack = document.getElementById('gateway-btn-track');
  const shopAuth = document.getElementById('shop-auth-screen');
  const custAuth = document.getElementById('cust-auth-hero');
  const leftTitle = document.getElementById('left-banner-title');
  const leftSubtitle = document.getElementById('left-banner-subtitle');

  if (portal === 'shop') {
    if (btnShop) {
      btnShop.className = 'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all bg-white text-blue-600 shadow-xs';
      btnShop.innerHTML = `
        <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 9l1-5h16l1 5M3 9a3 3 0 006 0 3 3 0 006 0M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M9 21v-7a1 1 0 011-1h4a1 1 0 011 1v7" />
        </svg>
        <span>Shop Portal</span>
      `;
    }
    if (btnTrack) {
      btnTrack.className = 'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all';
      btnTrack.innerHTML = `
        <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <rect x="5" y="2" width="14" height="20" rx="2" stroke-linecap="round" stroke-linejoin="round" />
          <line x1="12" y1="18" x2="12.01" y2="18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" />
        </svg>
        <span>Track Repair</span>
      `;
    }
    if (shopAuth) shopAuth.classList.remove('hidden');
    if (custAuth) custAuth.classList.add('hidden');
    if (leftTitle) leftTitle.textContent = 'Welcome';
    if (leftSubtitle) leftSubtitle.textContent = "Don't have an account? Create your account, it takes less than a minute.";
  } else {
    if (btnTrack) {
      btnTrack.className = 'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all bg-white text-blue-600 shadow-xs';
      btnTrack.innerHTML = `
        <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <rect x="5" y="2" width="14" height="20" rx="2" stroke-linecap="round" stroke-linejoin="round" />
          <line x1="12" y1="18" x2="12.01" y2="18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" />
        </svg>
        <span>Track Repair</span>
      `;
    }
    if (btnShop) {
      btnShop.className = 'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all';
      btnShop.innerHTML = `
        <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 9l1-5h16l1 5M3 9a3 3 0 006 0 3 3 0 006 0M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M9 21v-7a1 1 0 011-1h4a1 1 0 011 1v7" />
        </svg>
        <span>Shop Portal</span>
      `;
    }
    if (custAuth) custAuth.classList.remove('hidden');
    if (shopAuth) shopAuth.classList.add('hidden');
    if (leftTitle) leftTitle.textContent = 'Track Device';
    if (leftSubtitle) leftSubtitle.textContent = 'Real-time repair tracking with zero passwords. Just enter your mobile number.';
  }

  renderHeaderUserArea();
}

function renderHeaderUserArea() {
  const container = document.getElementById('header-user-area');
  const gateway = document.getElementById('public-portal-gateway');
  const mainHeader = document.getElementById('main-header');
  const landingNavLinks = document.getElementById('landing-nav-links');
  const brandTitle = document.getElementById('header-brand-title');
  const brandBadge = document.getElementById('header-badge');
  const brandSubtitle = document.getElementById('header-subtitle');
  const shopView = document.getElementById('shop-view-container');
  const trackView = document.getElementById('track-view-container');

  if (state.currentPortal === 'shop' && state.shopToken && state.workspace) {
    if (gateway) gateway.classList.add('hidden');
    if (shopView) shopView.classList.remove('hidden');
    if (trackView) trackView.classList.add('hidden');
    
    // Cohesive royal navy glass header
    if (mainHeader) mainHeader.className = 'bg-[#14204F]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 shadow-md transition-colors duration-300';
    if (landingNavLinks) landingNavLinks.classList.add('hidden');
    if (brandTitle) {
      brandTitle.textContent = state.workspace.name || 'FixFlow';
      brandTitle.className = 'text-xl font-extrabold tracking-tight text-white transition-colors';
    }
    if (brandBadge) {
      brandBadge.textContent = 'Shop Workspace';
      brandBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30';
    }
    if (brandSubtitle) {
      brandSubtitle.textContent = 'Active Repair Operations Center';
      brandSubtitle.className = 'text-[11px] text-slate-300 -mt-0.5 font-medium';
    }

    const initials = (state.workspace.name || 'WS').substring(0, 2).toUpperCase();
    container.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-white font-black text-xs flex items-center justify-center border border-white/20 shadow-xs">
            ${initials}
          </div>
          <div class="text-left hidden sm:block">
            <div class="text-xs font-bold text-white">${state.workspace.name}</div>
            <span class="text-[10px] font-semibold text-sky-200 uppercase tracking-wider">${state.workspace.role || 'Shop Staff'}</span>
          </div>
        </div>
        <button onclick="shopLogout()" class="text-xs font-bold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-xl transition shadow-xs">
          Sign Out
        </button>
      </div>
    `;
  } else if (state.currentPortal === 'track' && state.customerToken) {
    if (gateway) gateway.classList.add('hidden');
    if (trackView) trackView.classList.remove('hidden');
    if (shopView) shopView.classList.add('hidden');
    
    // Cohesive royal navy glass header
    if (mainHeader) mainHeader.className = 'bg-[#14204F]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 shadow-md transition-colors duration-300';
    if (landingNavLinks) landingNavLinks.classList.add('hidden');
    if (brandTitle) {
      brandTitle.textContent = 'FixFlow Track';
      brandTitle.className = 'text-xl font-extrabold tracking-tight text-white transition-colors';
    }
    if (brandBadge) {
      brandBadge.textContent = 'Customer Portal';
      brandBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30';
    }
    if (brandSubtitle) {
      brandSubtitle.textContent = 'Real-time Repair Milestone Tracking';
      brandSubtitle.className = 'text-[11px] text-slate-300 -mt-0.5 font-medium';
    }

    container.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Customer Verified</span>
        </span>
        <button onclick="customerLogout()" class="text-xs font-bold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-xl transition shadow-xs">
          Sign Out
        </button>
      </div>
    `;
  } else {
    // Logged out / Public Landing state: Seamless royal-blue header, hide both portal views
    if (gateway) gateway.classList.remove('hidden');
    if (shopView) shopView.classList.add('hidden');
    if (trackView) trackView.classList.add('hidden');
    const wsDash = document.getElementById('shop-workspace-dashboard');
    if (wsDash) wsDash.classList.add('hidden');
    const custDash = document.getElementById('cust-dashboard-screen');
    if (custDash) custDash.classList.add('hidden');
    if (mainHeader) mainHeader.className = 'bg-[#162256]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 shadow-sm transition-colors duration-300';
    if (landingNavLinks) landingNavLinks.className = 'hidden md:flex items-center gap-6 text-xs font-semibold text-white/80';
    if (brandTitle) {
      brandTitle.textContent = 'FixFlow';
      brandTitle.className = 'text-xl font-extrabold tracking-tight text-white transition-colors';
    }
    if (brandBadge) {
      brandBadge.textContent = 'SaaS';
      brandBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30';
    }
    if (brandSubtitle) {
      brandSubtitle.textContent = 'Electronics Repair Operating System';
      brandSubtitle.className = 'text-[11px] text-slate-300 -mt-0.5 font-medium';
    }

    container.innerHTML = `
      <button onclick="document.getElementById('public-portal-gateway').scrollIntoView({behavior: 'smooth'})" class="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition transform hover:-translate-y-0.5">
        Sign In
      </button>
    `;
  }
}

// Interactive showcase preview toggle between shop queue and customer stepper
function toggleShowcasePreview(tab) {
  const shopTab = document.getElementById('showcase-tab-shop');
  const custTab = document.getElementById('showcase-tab-cust');
  const shopView = document.getElementById('showcase-view-shop');
  const custView = document.getElementById('showcase-view-cust');

  if (tab === 'shop') {
    if (shopTab) shopTab.className = 'px-2.5 py-1 rounded-lg bg-white text-blue-600 shadow-xs transition';
    if (custTab) custTab.className = 'px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 transition';
    if (shopView) shopView.classList.remove('hidden');
    if (custView) custView.classList.add('hidden');
  } else {
    if (custTab) custTab.className = 'px-2.5 py-1 rounded-lg bg-white text-blue-600 shadow-xs transition';
    if (shopTab) shopTab.className = 'px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 transition';
    if (custView) custView.classList.remove('hidden');
    if (shopView) shopView.classList.add('hidden');
  }
}

function initApplication() {
  if (state.shopToken) {
    loadShopDashboard();
  }
  if (state.customerToken) {
    loadCustomerDashboard();
  }
}

/* ========================================================
   SECTION A: SHOP WORKSPACE IMPLEMENTATION
   ======================================================== */

function toggleShopAuthMode(mode) {
  const isLogin = mode === 'login';
  document.getElementById('shop-login-form').classList.toggle('hidden', !isLogin);
  document.getElementById('shop-register-form').classList.toggle('hidden', isLogin);

  const btnLogin = document.getElementById('auth-tab-signin-btn');
  const btnReg = document.getElementById('auth-tab-register-btn');
  const titleEl = document.getElementById('auth-main-title');
  const subEl = document.getElementById('auth-main-subtitle');

  if (isLogin) {
    if (btnLogin) btnLogin.className = 'text-xs sm:text-sm font-bold text-blue-600 border-b-2 border-blue-600 pb-2 -mb-2.5 transition';
    if (btnReg) btnReg.className = 'text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-700 pb-2 -mb-2.5 transition';
    if (titleEl) titleEl.textContent = 'Welcome to login system';
    if (subEl) subEl.textContent = "Don't have an account? Create your account, it takes less than a minute";
  } else {
    if (btnReg) btnReg.className = 'text-xs sm:text-sm font-bold text-blue-600 border-b-2 border-blue-600 pb-2 -mb-2.5 transition';
    if (btnLogin) btnLogin.className = 'text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-700 pb-2 -mb-2.5 transition';
    if (titleEl) titleEl.textContent = 'Create Shop Workspace';
    if (subEl) subEl.textContent = 'Start on Free tier with unlimited repair tickets.';
  }
}

async function handleShopLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    state.shopToken = data.token;
    state.workspace = { ...data.workspace, role: data.user.role };
    localStorage.setItem('ff_shop_token', data.token);

    showToast(`Welcome back, ${data.user.name}!`, 'success');
    renderHeaderUserArea();
    loadShopDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function demoLogin() {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@metromobile.com', password: 'demoPassword123' })
    });

    if (res.ok) {
      const data = await res.json();
      state.shopToken = data.token;
      state.workspace = { ...data.workspace, role: data.user.role };
      localStorage.setItem('ff_shop_token', data.token);
      showToast('Logged in as Demo Shop Owner!', 'success');
      renderHeaderUserArea();
      loadShopDashboard();
      return;
    }

    // Register demo if not yet present
    const regRes = await fetch('/api/auth/register-owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arjun Mehta',
        email: 'demo@metromobile.com',
        password: 'demoPassword123',
        shopName: 'Metro Mobile Care',
        shopPhone: '9876543210',
        shopAddress: '45 MG Road, Indiranagar, Bengaluru'
      })
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(regData.error || 'Demo setup failed');

    state.shopToken = regData.token;
    state.workspace = { ...regData.workspace, role: regData.user.role };
    localStorage.setItem('ff_shop_token', regData.token);
    showToast('Demo workspace created & logged in!', 'success');
    renderHeaderUserArea();
    loadShopDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleShopRegister(e) {
  e.preventDefault();
  const shopName = document.getElementById('reg-shop-name').value;
  const name = document.getElementById('reg-owner-name').value;
  const email = document.getElementById('reg-owner-email').value;
  const password = document.getElementById('reg-owner-password').value;
  const shopPhone = document.getElementById('reg-shop-phone').value;
  const shopAddress = document.getElementById('reg-shop-address').value;

  try {
    const res = await fetch('/api/auth/register-owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopName, name, email, password, shopPhone, shopAddress })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    state.shopToken = data.token;
    state.workspace = { ...data.workspace, role: data.user.role };
    localStorage.setItem('ff_shop_token', data.token);

    showToast('Workspace created! Free tier active.', 'success');
    renderHeaderUserArea();
    loadShopDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function shopLogout() {
  state.shopToken = '';
  state.workspace = null;
  localStorage.removeItem('ff_shop_token');
  const wsDash = document.getElementById('shop-workspace-dashboard');
  if (wsDash) wsDash.classList.add('hidden');
  const shopView = document.getElementById('shop-view-container');
  if (shopView) shopView.classList.add('hidden');
  switchPortal('shop');
  renderHeaderUserArea();
  showToast('Signed out of shop workspace.', 'info');
}

async function loadShopDashboard() {
  const gateway = document.getElementById('public-portal-gateway');
  if (gateway) gateway.classList.add('hidden');
  const shopView = document.getElementById('shop-view-container');
  if (shopView) shopView.classList.remove('hidden');
  const trackView = document.getElementById('track-view-container');
  if (trackView) trackView.classList.add('hidden');
  const wsDash = document.getElementById('shop-workspace-dashboard');
  if (wsDash) wsDash.classList.remove('hidden');

  try {
    await Promise.all([
      loadWorkspaceDetails(),
      loadSubscriptionDetails(),
      loadWorkspaceTickets(),
      loadWorkspaceStaff(),
      loadWorkspaceCustomers()
    ]);
  } catch (err) {
    if (err.message && (err.message.includes('Authentication required') || err.message.includes('expired'))) {
      shopLogout();
    }
  }
}

async function loadWorkspaceDetails() {
  const res = await fetch('/api/workspace', {
    headers: { Authorization: `Bearer ${state.shopToken}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load workspace');

  state.workspace = data.workspace;
  document.getElementById('ws-name-heading').textContent = data.workspace.name;
  document.getElementById('ws-meta-subheading').textContent = `Phone: ${data.workspace.phone || 'N/A'} • Address: ${data.workspace.address || 'Address unlisted'}`;
  renderHeaderUserArea();
}

async function loadSubscriptionDetails() {
  const res = await fetch('/api/subscription', {
    headers: { Authorization: `Bearer ${state.shopToken}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);

  state.subscription = data;
  const plan = data.currentPlan;

  // Plan badge
  document.getElementById('ws-plan-badge').textContent = `Plan: ${plan.name} (₹${plan.priceMonthlyInr}/mo)`;

  // Staff Seat Meter
  const staffCur = data.usage.staff.current;
  const staffMax = plan.maxStaff;
  document.getElementById('stat-staff-seats').textContent = `${staffCur} / ${staffMax}`;
  document.getElementById('seats-meter-label').textContent = `${staffCur} / ${staffMax} Seats Used`;
  document.getElementById('team-seats-desc').textContent = `${staffCur} of ${staffMax} seats currently occupied on ${plan.name} plan.`;

  const percent = Math.min(100, Math.round((staffCur / staffMax) * 100));
  const bar = document.getElementById('seats-meter-bar');
  bar.style.width = `${percent}%`;
  bar.className = percent >= 100 ? 'bg-rose-500 h-full rounded-full transition-all' : 'bg-indigo-600 h-full rounded-full transition-all';

  // Render SaaS Pricing Comparison Cards
  renderPricingCards(data.availablePlans, plan.id);
}

function renderPricingCards(plans, currentPlanId) {
  const container = document.getElementById('ws-plans-pricing-grid');
  container.innerHTML = plans.map(p => {
    const isCurrent = p.id === currentPlanId;
    const isPro = p.id === 'pro';
    const border = isCurrent 
      ? 'border-2 border-blue-600 ring-4 ring-blue-500/15 shadow-xl shadow-blue-500/10' 
      : isPro 
      ? 'border-2 border-sky-400/80 shadow-md' 
      : 'border border-slate-200/90 hover:border-slate-300 shadow-xs';

    return `
      <div class="bg-white rounded-[28px] ${border} p-6 flex flex-col justify-between transition-all hover:shadow-lg relative overflow-hidden group">
        ${isPro ? '<span class="absolute top-4 right-5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-xs">Popular</span>' : ''}
        <div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-base font-extrabold text-slate-900">${p.name}</h4>
            ${isCurrent ? '<span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">Current Plan</span>' : ''}
          </div>
          <div class="flex items-baseline gap-1 my-3">
            <span class="text-3xl font-black text-slate-900 font-mono">₹${p.priceMonthlyInr}</span>
            <span class="text-xs text-slate-400 font-medium">/month</span>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed mb-4">${p.description}</p>

          <div class="space-y-2.5 text-xs border-t border-slate-100 pt-4">
            <div class="flex items-center gap-2.5 text-slate-700 font-medium">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span><strong>${p.maxStaff}</strong> Staff Account${p.maxStaff > 1 ? 's' : ''}</span>
            </div>
            <div class="flex items-center gap-2.5 text-slate-700 font-medium">
              <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span><strong>Unlimited</strong> Tickets (No Cap)</span>
            </div>
            <div class="flex items-center gap-2.5 ${p.features.inventoryManagement ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}">
              <svg class="w-4 h-4 ${p.features.inventoryManagement ? 'text-sky-600' : 'text-slate-300'} flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Parts Inventory Suite</span>
            </div>
            <div class="flex items-center gap-2.5 ${p.features.repairPassport ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}">
              <svg class="w-4 h-4 ${p.features.repairPassport ? 'text-indigo-600' : 'text-slate-300'} flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Digital Repair Passport</span>
            </div>
            <div class="flex items-center gap-2.5 ${p.features.advancedAnalytics ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}">
              <svg class="w-4 h-4 ${p.features.advancedAnalytics ? 'text-purple-600' : 'text-slate-300'} flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Franchise Analytics</span>
            </div>
          </div>
        </div>

        <button 
          onclick="handleSwitchPlan('${p.id}')"
          ${isCurrent ? 'disabled' : ''}
          class="mt-6 w-full py-3 px-4 rounded-2xl text-xs font-bold transition shadow-xs uppercase tracking-wider ${isCurrent ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-gradient-to-r from-[#3B66D6] to-[#00A8FF] hover:from-[#3255B8] hover:to-[#0096E6] text-white shadow-md shadow-blue-500/20 transform hover:-translate-y-0.5 active:translate-y-0'}">
          ${isCurrent ? 'Active Plan' : p.isUpgrade ? 'Upgrade to ' + p.name : 'Switch to ' + p.name}
        </button>
      </div>
    `;
  }).join('');
}

async function handleSwitchPlan(targetPlanId) {
  try {
    const res = await fetch('/api/subscription/change-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.shopToken}`
      },
      body: JSON.stringify({ planId: targetPlanId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update plan');

    showToast(data.message, 'success');
    await loadSubscriptionDetails();
    await loadWorkspaceStaff();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadWorkspaceTickets() {
  const search = document.getElementById('ws-ticket-search').value;
  const status = document.getElementById('ws-ticket-status-filter').value;
  const url = `/api/tickets?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${state.shopToken}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);

  state.tickets = data.tickets;

  // Calculate live stats
  document.getElementById('stat-active-repairs').textContent = data.tickets.filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED').length;
  const totalVal = data.tickets.reduce((sum, t) => sum + (t.estimated_cost || 0), 0);
  document.getElementById('stat-total-value').textContent = `₹${totalVal.toLocaleString()}`;

  const tbody = document.getElementById('ws-tickets-tbody');
  if (data.tickets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="py-10 text-center text-slate-400 text-xs">No repair tickets found. Click "+ New Repair Intake" to register one.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.tickets.map(t => {
    const statusPill = getStatusPill(t.status);
    const techDisplay = t.assigned_staff_name 
      ? `<div class="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl">
           <div class="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
             ${t.assigned_staff_name.charAt(0).toUpperCase()}
           </div>
           <div>
             <span class="font-bold text-slate-800 text-xs">${t.assigned_staff_name}</span>
             ${t.assigned_staff_phone ? `<div class="font-mono text-[10px] text-slate-400">${t.assigned_staff_phone}</div>` : ''}
           </div>
         </div>`
      : `<span class="inline-block text-slate-400 border border-dashed border-slate-300 rounded-xl px-2.5 py-1 text-[11px] italic">Unassigned</span>`;

    return `
      <tr class="hover:bg-blue-50/40 transition-colors">
        <td class="py-4 px-5 font-mono font-bold">
          <span class="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200/80 px-3 py-1.5 rounded-xl text-xs shadow-xs font-mono font-bold">
            #${t.ticket_number}
          </span>
        </td>
        <td class="py-4 px-5">
          <div class="font-bold text-slate-900 text-xs">${t.customer_name}</div>
          <div class="font-mono text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
            <svg class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>${t.customer_phone || 'Walk-in'}</span>
          </div>
        </td>
        <td class="py-4 px-5">
          <div class="font-bold text-slate-800 text-xs">${t.brand} ${t.model}</div>
          <span class="inline-block text-[10px] text-sky-700 bg-sky-50 border border-sky-200/70 rounded-md px-1.5 py-0.5 font-semibold mt-0.5 uppercase tracking-wide">${t.device_category}</span>
        </td>
        <td class="py-4 px-5">
          ${techDisplay}
        </td>
        <td class="py-4 px-5 max-w-xs truncate text-slate-600 font-medium" title="${t.issue_description}">
          ${t.issue_description}
        </td>
        <td class="py-4 px-5 font-mono font-black text-emerald-600 text-sm">
          ₹${(t.estimated_cost || 0).toLocaleString()}
        </td>
        <td class="py-4 px-5">
          <select onchange="updateTicketStatus('${t.id}', this.value)" class="text-xs font-bold rounded-xl px-3 py-1.5 border shadow-xs focus:outline-none cursor-pointer transition ${statusPill.selectClass}">
            ${['RECEIVED', 'DIAGNOSING', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'DELIVERED', 'CANCELLED'].map(s => `
              <option value="${s}" ${s === t.status ? 'selected' : ''}>${formatStatusLabel(s)}</option>
            `).join('')}
          </select>
        </td>
        <td class="py-4 px-5 text-right">
          <div class="flex items-center justify-end gap-2">
            <button onclick="viewTicketHistory('${t.id}')" class="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-linejoin="round" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 3" />
              </svg>
              <span>Timeline</span>
            </button>
            <button onclick="handleDeleteShopTicket('${t.id}', '${t.ticket_number}')" class="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5" title="Delete Ticket">
              <svg class="w-3.5 h-3.5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
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

function formatStatusLabel(s) {
  return s.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

let debounceSearchTimer = null;
function debounceTicketSearch() {
  clearTimeout(debounceSearchTimer);
  debounceSearchTimer = setTimeout(() => loadWorkspaceTickets(), 200);
}

function handleIntakeStaffSelect(userId) {
  if (!userId) return;
  const staffMember = (state.staff || []).find(s => s.id === userId);
  if (staffMember) {
    document.getElementById('intake-staff-name').value = staffMember.name;
  }
}

async function handleCreateTicket(e) {
  e.preventDefault();
  const customerName = document.getElementById('intake-name').value;
  const customerPhone = document.getElementById('intake-phone').value;
  const deviceCategory = document.getElementById('intake-category').value;
  const brand = document.getElementById('intake-brand').value;
  const model = document.getElementById('intake-model').value;
  const issueDescription = document.getElementById('intake-issue').value;
  const estimatedCost = document.getElementById('intake-cost').value;
  const estimatedCompletionDate = document.getElementById('intake-date').value;
  const assignedStaffName = document.getElementById('intake-staff-name') ? document.getElementById('intake-staff-name').value : '';
  const assignedStaffPhone = document.getElementById('intake-staff-phone') ? document.getElementById('intake-staff-phone').value : '';
  const staffSelectEl = document.getElementById('intake-staff-select');
  const assignedToUserId = staffSelectEl && staffSelectEl.value ? staffSelectEl.value : undefined;

  try {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.shopToken}`
      },
      body: JSON.stringify({
        customerName,
        customerPhone,
        deviceCategory,
        brand,
        model,
        issueDescription,
        estimatedCost,
        estimatedCompletionDate,
        assignedStaffName,
        assignedStaffPhone,
        assignedToUserId
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create ticket');

    showToast(`Ticket ${data.ticket.ticketNumber} registered successfully!`, 'success');
    toggleIntakeModal(false);

    document.getElementById('intake-name').value = '';
    document.getElementById('intake-phone').value = '';
    document.getElementById('intake-brand').value = '';
    document.getElementById('intake-model').value = '';
    document.getElementById('intake-issue').value = '';
    document.getElementById('intake-cost').value = '';
    if (document.getElementById('intake-staff-name')) document.getElementById('intake-staff-name').value = '';
    if (document.getElementById('intake-staff-phone')) document.getElementById('intake-staff-phone').value = '';
    if (staffSelectEl) staffSelectEl.value = '';

    await Promise.all([loadWorkspaceTickets(), loadWorkspaceCustomers(), loadSubscriptionDetails()]);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleDeleteShopTicket(ticketId, ticketNumber) {
  if (!confirm(`Are you sure you want to delete repair ticket ${ticketNumber}? This action cannot be undone.`)) {
    return;
  }
  try {
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${state.shopToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete ticket');

    showToast(`Ticket ${ticketNumber} deleted successfully.`, 'success');
    await Promise.all([loadWorkspaceTickets(), loadWorkspaceCustomers(), loadSubscriptionDetails()]);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function updateTicketStatus(ticketId, newStatus) {
  try {
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.shopToken}`
      },
      body: JSON.stringify({ status: newStatus, notes: `Status transitioned to ${newStatus}` })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    showToast(`Ticket updated to ${formatStatusLabel(newStatus)}`, 'success');
    await loadWorkspaceTickets();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function viewTicketHistory(ticketId) {
  try {
    const res = await fetch(`/api/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${state.shopToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const t = data.ticket;
    document.getElementById('modal-tk-num').textContent = t.ticket_number;
    document.getElementById('modal-tk-device').textContent = `${t.brand} ${t.model} • Customer: ${t.customer_name} (${t.customer_phone})`;

    const list = document.getElementById('modal-tk-timeline-list');
    list.innerHTML = (t.timeline || []).map(ev => `
      <div class="relative pl-6 pb-4 border-l-2 border-indigo-200 last:border-l-0">
        <div class="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-50"></div>
        <div class="flex items-center justify-between text-xs mb-1">
          <span class="font-bold text-slate-900">${formatStatusLabel(ev.to_status)}</span>
          <span class="text-[10px] text-slate-400 font-mono">${new Date(ev.created_at).toLocaleString()}</span>
        </div>
        <p class="text-xs text-slate-600">${ev.notes || 'Status changed'}</p>
        <span class="text-[10px] text-slate-400 mt-1 block font-medium">Logged by: ${ev.changed_by_name || 'Staff'}</span>
      </div>
    `).join('');

    toggleTimelineModal(true);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadWorkspaceStaff() {
  const res = await fetch('/api/workspace/staff', {
    headers: { Authorization: `Bearer ${state.shopToken}` }
  });
  const data = await res.json();
  if (!res.ok) return;

  state.staff = data.staff;

  const staffSelect = document.getElementById('intake-staff-select');
  if (staffSelect) {
    staffSelect.innerHTML = `<option value="">-- Or choose from existing workspace team --</option>` +
      data.staff.map(s => `<option value="${s.id}">${s.name} (${s.role})</option>`).join('');
  }

  const grid = document.getElementById('ws-staff-grid');

  grid.innerHTML = data.staff.map(s => {
    const roleBadge = s.role === 'OWNER' 
      ? 'bg-blue-50 text-blue-700 border-blue-200' 
      : s.role === 'MANAGER' 
      ? 'bg-amber-50 text-amber-700 border-amber-200' 
      : 'bg-cyan-50 text-cyan-700 border-cyan-200';

    const initials = (s.name || 'ST').substring(0, 2).toUpperCase();

    return `
      <div class="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between group">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20 transform transition-transform group-hover:scale-105">
              ${initials}
            </div>
            <div>
              <h4 class="text-sm font-black text-slate-900">${s.name}</h4>
              <p class="text-xs text-slate-500 font-mono mt-0.5">${s.email}</p>
            </div>
          </div>
          <span class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${roleBadge}">
            ${s.role}
          </span>
        </div>
        <div class="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Workspace Member</span>
          <span class="text-emerald-600 font-bold flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Active</span>
          </span>
        </div>
      </div>
    `;
  }).join('');
}

async function handleAddStaff(e) {
  e.preventDefault();
  const name = document.getElementById('staff-input-name').value;
  const email = document.getElementById('staff-input-email').value;
  const password = document.getElementById('staff-input-password').value;
  const role = document.getElementById('staff-input-role').value;

  try {
    const res = await fetch('/api/workspace/staff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.shopToken}`
      },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to add staff member');
    }

    showToast(`Staff member ${data.staff.name} invited successfully!`, 'success');
    toggleAddStaffModal(false);
    await Promise.all([loadWorkspaceStaff(), loadSubscriptionDetails()]);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadWorkspaceCustomers() {
  const res = await fetch('/api/customers', {
    headers: { Authorization: `Bearer ${state.shopToken}` }
  });
  const data = await res.json();
  if (!res.ok) return;

  state.customers = data.customers;
  document.getElementById('stat-total-customers').textContent = data.customers.length;

  const tbody = document.getElementById('ws-customers-tbody');
  if (data.customers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-slate-400 text-xs">No customer records yet. Customers are registered automatically when intake tickets are created.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.customers.map(c => {
    const initials = (c.default_name || 'C').substring(0, 2).toUpperCase();
    return `
      <tr class="hover:bg-blue-50/40 transition-colors">
        <td class="py-4 px-5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              ${initials}
            </div>
            <div class="font-bold text-slate-900 text-xs">${c.default_name}</div>
          </div>
        </td>
        <td class="py-4 px-5 font-mono font-medium text-slate-700">${c.phone_e164}</td>
        <td class="py-4 px-5">
          <span class="text-[10px] font-bold px-2.5 py-1 rounded-full ${c.is_verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}">
            ${c.is_verified ? '✓ Phone Verified (OTP)' : 'Intake Registered'}
          </span>
        </td>
        <td class="py-4 px-5 font-bold text-slate-800 font-mono text-xs">${c.ticket_count} repair${c.ticket_count > 1 ? 's' : ''}</td>
        <td class="py-4 px-5 text-right text-slate-500 text-[11px] font-medium">${new Date(c.last_seen_at).toLocaleDateString()}</td>
      </tr>
    `;
  }).join('');
}

async function testFeatureAccess(feature) {
  const card = document.getElementById('feature-response-card');
  const pre = document.getElementById('feature-response-content');

  let endpoint = '';
  if (feature === 'inventory') endpoint = '/api/features/inventory';
  else if (feature === 'repair-passport') {
    const ticketId = state.tickets.length > 0 ? state.tickets[0].id : 'sample';
    endpoint = `/api/features/repair-passport/${ticketId}`;
  } else if (feature === 'analytics') endpoint = '/api/features/analytics';

  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${state.shopToken}` }
    });
    const data = await res.json();

    card.classList.remove('hidden');
    pre.textContent = JSON.stringify(data, null, 2);

    if (res.ok) {
      showToast(`Feature "${feature}" accessed successfully!`, 'success');
    } else {
      showToast(`Plan Locked: ${data.error}`, 'error');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function switchWorkspaceTab(tab) {
  state.currentTab = tab;
  const tabs = ['tickets', 'customers', 'team', 'billing', 'features'];
  tabs.forEach(t => {
    const panel = document.getElementById(`tab-panel-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (t === tab) {
      if (panel) panel.classList.remove('hidden');
      if (btn) btn.className = 'bg-gradient-to-r from-[#3B66D6] to-[#00A8FF] text-white font-bold rounded-xl px-4 sm:px-5 py-2.5 text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2';
    } else {
      if (panel) panel.classList.add('hidden');
      if (btn) btn.className = 'text-slate-600 hover:text-slate-900 font-semibold rounded-xl px-4 sm:px-5 py-2.5 text-xs hover:bg-white/80 transition-all flex items-center gap-2';
    }
  });
}

function toggleIntakeModal(show) {
  document.getElementById('modal-new-ticket').classList.toggle('hidden', !show);
}
function toggleAddStaffModal(show) {
  document.getElementById('modal-add-staff').classList.toggle('hidden', !show);
}
function toggleTimelineModal(show) {
  document.getElementById('modal-timeline').classList.toggle('hidden', !show);
}


/* ========================================================
   SECTION B: FIXFLOW TRACK (CUSTOMER PORTAL)
   ======================================================== */

function previewCanonicalPhone(val) {
  const preview = document.getElementById('phone-canonical-preview');
  const clean = val.replace(/\D/g, '');
  if (clean.length === 10) {
    preview.textContent = `Canonical International E.164: +91${clean}`;
  } else if (val.startsWith('+')) {
    preview.textContent = `International E.164: ${val}`;
  } else {
    preview.textContent = 'Enter 10-digit number or international with +';
  }
}

// Toggle between Customer Sign In and Customer Create Password
function toggleCustAuthMode(mode) {
  const btnLogin = document.getElementById('cust-tab-signin-btn');
  const btnReg = document.getElementById('cust-tab-register-btn');
  const formLogin = document.getElementById('cust-login-form');
  const formReg = document.getElementById('cust-register-form');
  const titleEl = document.getElementById('cust-auth-title');
  const subEl = document.getElementById('cust-auth-subtitle');

  if (mode === 'login') {
    if (btnLogin) btnLogin.className = 'text-xs sm:text-sm font-bold text-blue-600 border-b-2 border-blue-600 pb-2 -mb-2.5 transition';
    if (btnReg) btnReg.className = 'text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-700 pb-2 -mb-2.5 transition';
    if (formLogin) formLogin.classList.remove('hidden');
    if (formReg) formReg.classList.add('hidden');
    if (titleEl) titleEl.textContent = 'Track Your Device Repair';
    if (subEl) subEl.textContent = 'Sign in with your mobile phone & password to see real-time repair status.';
  } else {
    if (btnReg) btnReg.className = 'text-xs sm:text-sm font-bold text-blue-600 border-b-2 border-blue-600 pb-2 -mb-2.5 transition';
    if (btnLogin) btnLogin.className = 'text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-700 pb-2 -mb-2.5 transition';
    if (formReg) formReg.classList.remove('hidden');
    if (formLogin) formLogin.classList.add('hidden');
    if (titleEl) titleEl.textContent = 'Create Customer Password';
    if (subEl) subEl.textContent = 'Set a password to easily track your device repairs anytime with zero OTP.';
  }
}

async function handleCustomerLogin(e) {
  e.preventDefault();
  const phone = document.getElementById('cust-login-phone').value;
  const password = document.getElementById('cust-login-password').value;

  try {
    const res = await fetch('/api/track/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    state.customerToken = data.token;
    localStorage.setItem('ff_cust_token', data.token);

    showToast(`Welcome, ${data.customer.name}!`, 'success');
    renderHeaderUserArea();
    loadCustomerDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleCustomerRegister(e) {
  e.preventDefault();
  const phone = document.getElementById('cust-reg-phone').value;
  const name = document.getElementById('cust-reg-name').value;
  const password = document.getElementById('cust-reg-password').value;

  try {
    const res = await fetch('/api/track/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to set password');

    state.customerToken = data.token;
    localStorage.setItem('ff_cust_token', data.token);

    showToast(data.message || 'Password saved! Logged in.', 'success');
    renderHeaderUserArea();
    loadCustomerDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleCustomerRequestOtp() {
  const phone = document.getElementById('track-phone-input').value;
  if (!phone) {
    showToast('Please enter your mobile phone number.', 'error');
    return;
  }

  const btn = document.getElementById('btn-request-otp');
  btn.disabled = true;
  btn.textContent = 'Sending Code...';

  try {
    const res = await fetch('/api/track/otp/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to request verification code');

    showToast(data.message, 'success');

    // Switch to OTP stage
    document.getElementById('cust-phone-stage').classList.add('hidden');
    document.getElementById('cust-otp-stage').classList.remove('hidden');
    document.getElementById('otp-phone-label').textContent = phone;

    // Show dev banner if available
    if (data.devOtp) {
      state.devOtpCode = data.devOtp;
      document.getElementById('dev-otp-val').textContent = data.devOtp;
      document.getElementById('dev-otp-banner').classList.remove('hidden');
    }

    startOtpCooldown(data.cooldownSeconds || 60);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send Verification Code';
  }
}

function startOtpCooldown(seconds) {
  clearInterval(state.cooldownTimer);
  state.cooldownSecondsRemaining = seconds;
  const resendBtn = document.getElementById('btn-resend-otp');
  resendBtn.disabled = true;

  state.cooldownTimer = setInterval(() => {
    state.cooldownSecondsRemaining--;
    if (state.cooldownSecondsRemaining <= 0) {
      clearInterval(state.cooldownTimer);
      resendBtn.disabled = false;
      resendBtn.textContent = 'Resend Code';
    } else {
      resendBtn.textContent = `Resend Code (${state.cooldownSecondsRemaining}s)`;
    }
  }, 1000);
}

function autoFillOtp() {
  if (state.devOtpCode) {
    document.getElementById('track-otp-input').value = state.devOtpCode;
  }
}

function resetCustomerOtpStage() {
  document.getElementById('cust-phone-stage').classList.remove('hidden');
  document.getElementById('cust-otp-stage').classList.add('hidden');
  document.getElementById('dev-otp-banner').classList.add('hidden');
  document.getElementById('track-otp-input').value = '';
}

async function handleCustomerVerifyOtp() {
  const phone = document.getElementById('track-phone-input').value;
  const otp = document.getElementById('track-otp-input').value;

  if (!otp || otp.length < 6) {
    showToast('Please enter the 6-digit verification code.', 'error');
    return;
  }

  const btn = document.getElementById('btn-verify-otp');
  btn.disabled = true;
  btn.textContent = 'Verifying...';

  try {
    const res = await fetch('/api/track/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');

    state.customerToken = data.token;
    localStorage.setItem('ff_cust_token', data.token);
    showToast(`Welcome, ${data.customer.name}!`, 'success');

    renderHeaderUserArea();
    loadCustomerDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Verify & View Repairs';
  }
}

async function loadCustomerDashboard() {
  const gateway = document.getElementById('public-portal-gateway');
  if (gateway) gateway.classList.add('hidden');
  const trackView = document.getElementById('track-view-container');
  if (trackView) trackView.classList.remove('hidden');
  const shopView = document.getElementById('shop-view-container');
  if (shopView) shopView.classList.add('hidden');
  const custDash = document.getElementById('cust-dashboard-screen');
  if (custDash) custDash.classList.remove('hidden');

  try {
    const profileRes = await fetch('/api/track/me', {
      headers: { Authorization: `Bearer ${state.customerToken}` }
    });
    const profileData = await profileRes.json();
    if (!profileRes.ok) throw new Error(profileData.error);

    document.getElementById('cust-name-heading').textContent = profileData.customer.name;
    document.getElementById('cust-phone-subheading').textContent = profileData.customer.phone;

    const ticketsRes = await fetch('/api/track/tickets', {
      headers: { Authorization: `Bearer ${state.customerToken}` }
    });
    const ticketsData = await ticketsRes.json();
    if (!ticketsRes.ok) throw new Error(ticketsData.error);

    const list = document.getElementById('cust-tickets-list');
    if (ticketsData.tickets.length === 0) {
      list.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
          <p class="text-sm font-medium">No repair records found for this phone number.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = ticketsData.tickets.map(t => {
      const isDone = t.status === 'COMPLETED' || t.status === 'DELIVERED';
      const statusBadge = isDone 
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' 
        : 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold';

      return `
        <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          
          <!-- Top Row: Device & Ticket Number -->
          <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span class="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">${t.ticket_number}</span>
              <h3 class="text-xl font-black text-slate-900 mt-1">${t.brand} ${t.model}</h3>
              <p class="text-xs text-slate-500 font-medium">${t.device_category} Repair</p>
            </div>
            <div class="text-right">
              <span class="px-3 py-1 rounded-full text-xs uppercase tracking-wide border ${statusBadge}">
                ${formatStatusLabel(t.status)}
              </span>
              <div class="text-xs font-mono font-extrabold text-slate-900 mt-2">Estimate: ₹${(t.estimated_cost || 0).toLocaleString()}</div>
            </div>
          </div>

          <!-- Interactive Repair Stepper Progress Bar -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div class="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
              <span>Intake</span>
              <span>Diagnosis</span>
              <span>In Repair</span>
              <span>Ready for Pickup</span>
              <span>Delivered</span>
            </div>
            <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
              <div class="bg-indigo-600 h-full transition-all duration-500" style="width: ${getStepperWidth(t.status)};"></div>
            </div>
          </div>

          <!-- Repair Shop Card -->
          <div class="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Service Center</span>
              <h4 class="text-sm font-black text-slate-900">${t.shop_name}</h4>
              <p class="text-xs text-slate-600 mt-0.5">${t.shop_address || 'Local Authorized Store'}</p>
            </div>
            ${t.shop_phone ? `
              <a href="tel:${t.shop_phone}" class="bg-white hover:bg-slate-50 border border-slate-200 text-indigo-700 font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Call Shop (${t.shop_phone})</span>
              </a>
            ` : ''}
          </div>

          <!-- Assigned Technician Info (if assigned) -->
          ${t.assigned_staff_name ? `
            <div class="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <div class="flex items-center gap-2.5">
                <span class="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <div>
                  <span class="font-bold text-slate-800">Assigned Technician:</span>
                  <span class="text-slate-600 ml-1 font-semibold">${t.assigned_staff_name}</span>
                </div>
              </div>
              ${t.assigned_staff_phone ? `
                <a href="tel:${t.assigned_staff_phone}" class="bg-white border border-slate-200 hover:border-indigo-300 text-indigo-600 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs">
                  <svg class="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call Tech (${t.assigned_staff_phone})</span>
                </a>
              ` : ''}
            </div>
          ` : ''}

          <!-- Problem & Description -->
          <div class="text-xs">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Issue Reported</span>
            <p class="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">${t.issue_description}</p>
          </div>

          <!-- Timeline -->
          <div class="pt-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">Live Service Activity Log</span>
            <div class="space-y-2.5">
              ${(t.timeline || []).map(ev => `
                <div class="flex items-center gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span class="font-bold text-indigo-700 font-mono text-[11px]">${formatStatusLabel(ev.to_status)}</span>
                  <span class="text-slate-600 flex-1">${ev.notes || 'Status updated'}</span>
                  <span class="text-[10px] font-mono text-slate-400">${new Date(ev.created_at).toLocaleDateString()}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Customer Ticket Actions -->
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-[11px] text-slate-400 font-medium">Record Created: ${new Date(t.created_at).toLocaleDateString()}</span>
            <button onclick="handleDeleteCustomerTicket('${t.id}', '${t.ticket_number}')" class="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete / Cancel Record</span>
            </button>
          </div>

        </div>
      `;
    }).join('');

  } catch (err) {
    if (err.message && (err.message.includes('Authentication required') || err.message.includes('expired'))) {
      customerLogout();
    }
  }
}

async function handleDeleteCustomerTicket(ticketId, ticketNumber) {
  if (!confirm(`Are you sure you want to delete / remove repair ticket ${ticketNumber}? This will remove it from your customer portal.`)) {
    return;
  }
  try {
    const res = await fetch(`/api/track/tickets/${ticketId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${state.customerToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete ticket');

    showToast(`Ticket ${ticketNumber} deleted successfully.`, 'success');
    await loadCustomerDashboard();
  } catch (err) {
    showToast(err.message, 'error');
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

function customerLogout() {
  state.customerToken = '';
  localStorage.removeItem('ff_cust_token');
  const custDash = document.getElementById('cust-dashboard-screen');
  if (custDash) custDash.classList.add('hidden');
  const trackView = document.getElementById('track-view-container');
  if (trackView) trackView.classList.add('hidden');
  toggleCustAuthMode('login');
  switchPortal('track');
  renderHeaderUserArea();
  showToast('Signed out of FixFlow Track.', 'info');
}
