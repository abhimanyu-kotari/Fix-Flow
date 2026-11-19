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
  repairerProfile: null,
  customerProfile: null,
  customerTicketCount: 0,
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

function toggleHeaderProfileMenu(menuId) {
  const menu = document.getElementById(menuId);
  if (!menu) return;

  document.querySelectorAll('[id$="-profile-menu"]').forEach(otherMenu => {
    if (otherMenu !== menu) otherMenu.classList.add('hidden');
  });
  menu.classList.toggle('hidden');
}

document.addEventListener('click', event => {
  if (event.target.closest('[data-profile-menu-trigger]')) return;
  document.querySelectorAll('[id$="-profile-menu"]').forEach(menu => menu.classList.add('hidden'));
});

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
  const authCard = document.getElementById('gateway-auth-card');
  const leftColumn = document.getElementById('gateway-left-column');
  const rightColumn = document.getElementById('gateway-right-column');
  const visual = document.getElementById('gateway-visual');
  const leftContent = document.getElementById('gateway-left-content');
  const leftFooter = document.getElementById('gateway-left-footer');
  const leftBrand = document.getElementById('gateway-left-brand');
  const portalSelector = document.getElementById('gateway-portal-selector');
  const socialActions = document.getElementById('gateway-social-actions');

  if (portal === 'shop') {
    if (btnShop) {
      btnShop.className = 'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all bg-black text-white shadow-xs';
      btnShop.innerHTML = `
        <svg class="w-4 h-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
    if (shopAuth) {
      shopAuth.classList.remove('hidden');
      leftColumn?.insertBefore(shopAuth, leftFooter);
      shopAuth.classList.add('pt-2');
    }
    if (custAuth) custAuth.classList.add('hidden');
    if (authCard) authCard.className = 'max-w-5xl mx-auto bg-white rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10 border border-neutral-800/20';
    if (authCard) authCard.style.gridTemplateColumns = window.innerWidth >= 768 ? '35% 65%' : '';
    if (leftColumn) {
      leftColumn.className = 'p-6 sm:p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 bg-white relative transition-all duration-500';
      leftColumn.style.gridColumn = '1';
    }
    if (rightColumn) {
      rightColumn.className = 'p-0 flex flex-col justify-between bg-white transition-all duration-500 overflow-hidden';
      rightColumn.style.gridColumn = '2';
    }
    if (leftContent) leftContent.classList.add('hidden');
    if (leftFooter) leftFooter.classList.add('hidden');
    if (leftBrand) leftBrand.classList.add('hidden');
    if (portalSelector) leftColumn?.prepend(portalSelector);
    if (socialActions) socialActions.classList.add('hidden');
    const oldTitle = document.getElementById('auth-main-title');
    if (oldTitle) oldTitle.textContent = 'Manage repairs faster';
    const oldSubtitle = document.getElementById('auth-main-subtitle');
    if (oldSubtitle) oldSubtitle.textContent = 'Build trust with everyone.';
    if (visual) rightColumn?.appendChild(visual);
    visual?.classList.remove('min-h-[520px]');
    visual?.classList.add('min-h-[520px]');
    visual?.classList.remove('hidden');
    if (leftTitle) leftTitle.textContent = 'Welcome';
    if (leftSubtitle) leftSubtitle.textContent = 'Manage repairs faster, build trust with everyone.';
    const visualImage = document.getElementById('gateway-visual-image');
    if (visualImage) {
      visualImage.src = '/images/hero-shop.jpg';
      visualImage.alt = 'Electronics repair shop';
    }
  } else {
    if (btnTrack) {
      btnTrack.className = 'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all bg-black text-white shadow-xs';
      btnTrack.innerHTML = `
        <svg class="w-4 h-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
    if (custAuth) {
      custAuth.classList.remove('hidden');
      rightColumn?.insertBefore(custAuth, visual);
    }
    if (shopAuth) shopAuth.classList.add('hidden');
    if (authCard) authCard.className = 'max-w-5xl mx-auto bg-white rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10 border border-neutral-800/20';
    if (authCard) authCard.style.gridTemplateColumns = window.innerWidth >= 768 ? '65% 35%' : '';
    if (leftColumn) {
      leftColumn.className = 'p-0 flex flex-col justify-between bg-slate-950 relative transition-all duration-500 overflow-hidden';
      leftColumn.style.gridColumn = '1';
    }
    if (rightColumn) {
      rightColumn.className = 'p-8 sm:p-8 flex flex-col justify-center bg-white transition-all duration-500 overflow-hidden';
      rightColumn.style.gridColumn = '2';
    }
    if (leftContent) leftContent.classList.add('hidden');
    if (leftFooter) leftFooter.classList.add('hidden');
    if (leftBrand) leftBrand.classList.add('hidden');
    if (portalSelector) rightColumn?.prepend(portalSelector);
    if (socialActions) socialActions.classList.add('hidden');
    if (visual) leftColumn?.appendChild(visual);
    visual?.classList.remove('hidden');
    visual?.classList.add('min-h-[520px]');
    if (custAuth) {
      custAuth.classList.remove('hidden');
      custAuth.classList.add('space-y-5');
    }
    if (leftTitle) leftTitle.textContent = 'Track Device';
    if (leftSubtitle) leftSubtitle.textContent = 'Real-time repair tracking with zero passwords. Just enter your mobile number.';
    const visualImage = document.getElementById('gateway-visual-image');
    if (visualImage) {
      visualImage.src = '/images/hero-track.jpg';
      visualImage.alt = 'Customer discussing a repair';
    }
  }

  renderHeaderUserArea();
}

function handleWorkspaceBrandClick(event) {
  if (state.currentPortal === 'shop' && state.shopToken && state.workspace) {
    event.preventDefault();
    toggleWorkspaceSidebar();
  }
}

function toggleWorkspaceSidebar() {
  const shopView = document.getElementById('shop-view-container');
  const toggle = document.getElementById('workspace-sidebar-toggle');
  if (!shopView) return;
  const collapsed = shopView.classList.toggle('workspace-sidebar-collapsed');
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? 'Open workspace sidebar' : 'Close workspace sidebar');
  }
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
    
    if (mainHeader) mainHeader.className = 'ff-shop-header bg-black/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 shadow-md transition-colors duration-300';
    if (landingNavLinks) landingNavLinks.classList.add('hidden');
    if (brandTitle) {
      brandTitle.textContent = 'Fix Flow';
      brandTitle.className = 'text-xl font-extrabold tracking-tight text-white transition-colors';
    }
    if (brandBadge) {
      brandBadge.classList.add('hidden');
    }
    if (brandSubtitle) {
      brandSubtitle.classList.add('hidden');
    }

    container.classList.remove('ff-shop-header-account');
    const initials = (state.workspace.name || 'WS').substring(0, 2).toUpperCase();
    const planName = state.subscription?.currentPlan?.name || 'SaaS Workspace';
    const repairerName = state.repairerProfile?.name || state.workspace.name || 'Shop account';
    const repairerEmail = state.repairerProfile?.email || '';
    const repairerRole = state.repairerProfile?.role || state.workspace.role || 'Shop staff';
    const repairerInitials = repairerName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || initials;
    container.innerHTML = '';

    const accountName = document.getElementById('workspace-account-name');
    const accountAvatar = document.getElementById('workspace-account-avatar');
    const accountPlan = document.getElementById('workspace-account-plan');
    if (accountName) accountName.textContent = state.workspace.name || 'Shop workspace';
    if (accountAvatar) accountAvatar.textContent = repairerInitials;
    if (accountPlan) accountPlan.textContent = `${planName} plan`;

    let profileMenu = document.getElementById('shop-profile-menu');
    if (!profileMenu) {
      profileMenu = document.createElement('div');
      profileMenu.id = 'shop-profile-menu';
      document.body.appendChild(profileMenu);
    }
    profileMenu.className = 'hidden customer-header-profile-menu shop-header-profile-menu';
    profileMenu.innerHTML = `
      <div class="shop-profile-menu-heading">
        <span>Account</span>
        <button type="button" aria-label="Close account menu" onclick="toggleHeaderProfileMenu('shop-profile-menu')">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>
        </button>
      </div>
      <div class="customer-header-profile-summary">
        <span class="customer-header-avatar customer-header-avatar-large">${repairerInitials}</span>
        <div>
          <strong>${repairerName}</strong>
          <span>${repairerEmail}</span>
        </div>
      </div>
      <div class="customer-header-profile-details">
        <div><span>Workspace</span><strong>${state.workspace.name || 'Fix Flow Shop'}</strong></div>
        <div><span>Account role</span><strong>${repairerRole}</strong></div>
        <div><span>Subscription</span><strong>${planName}</strong></div>
        ${state.workspace.phone ? `<div><span>Shop phone</span><strong>${state.workspace.phone}</strong></div>` : ''}
      </div>
      <button type="button" onclick="openProfilePlanPanel('billing'); toggleHeaderProfileMenu('shop-profile-menu')">SaaS Plans & Billing</button>
      <button type="button" onclick="openProfilePlanPanel('features'); toggleHeaderProfileMenu('shop-profile-menu')">Pro Features & Repair Passport</button>
      <button type="button" onclick="shopLogout()" class="customer-header-signout">Sign out</button>
    `;
  } else if (state.currentPortal === 'track' && state.customerToken) {
    if (gateway) gateway.classList.add('hidden');
    if (trackView) trackView.classList.remove('hidden');
    if (shopView) shopView.classList.add('hidden');
    
    if (mainHeader) mainHeader.className = 'bg-black/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 shadow-md transition-colors duration-300';
    if (landingNavLinks) landingNavLinks.classList.add('hidden');
    if (brandTitle) {
      brandTitle.textContent = 'Fix Flow Track';
      brandTitle.className = 'text-xl font-extrabold tracking-tight text-white transition-colors';
    }

    if (brandBadge) {
      brandBadge.classList.add('hidden');
    }
    if (brandSubtitle) {
      brandSubtitle.classList.add('hidden');
    }
    container.classList.remove('ff-shop-header-account');

    const customerName = state.customerProfile?.name || 'Customer Account';
    const customerPhone = state.customerProfile?.phone || 'Phone not available';
    const customerInitials = customerName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'CU';

    container.innerHTML = `
      <div class="relative">
        <button type="button" data-profile-menu-trigger onclick="toggleHeaderProfileMenu('customer-profile-menu')" aria-label="Open customer profile menu" class="customer-header-profile-trigger">
          <span class="customer-header-avatar">${customerInitials}</span>
          <span class="customer-header-name">${customerName}</span>
          <svg class="customer-header-chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 8l4 4 4-4"/></svg>
        </button>
        <div id="customer-profile-menu" class="hidden customer-header-profile-menu">
          <div class="customer-header-profile-summary">
            <span class="customer-header-avatar customer-header-avatar-large">${customerInitials}</span>
            <div>
              <strong>${customerName}</strong>
              <span>${customerPhone}</span>
            </div>
          </div>
          <div class="customer-header-profile-details">
            <div>
              <span>Account status</span>
              <strong><i></i> Phone verified</strong>
            </div>
            <div>
              <span>Repair records</span>
              <strong>${state.customerTicketCount}</strong>
            </div>
          </div>
          <button type="button" onclick="customerLogout()" class="customer-header-signout">Sign out</button>
        </div>
      </div>
    `;
  } else {
    // Logged out / Public Landing state: Sleek black header, hide both portal views
    if (gateway) gateway.classList.remove('hidden');
    if (shopView) shopView.classList.add('hidden');
    if (trackView) trackView.classList.add('hidden');
    const wsDash = document.getElementById('shop-workspace-dashboard');
    if (wsDash) wsDash.classList.add('hidden');
    const custDash = document.getElementById('cust-dashboard-screen');
    if (custDash) custDash.classList.add('hidden');
    if (mainHeader) mainHeader.className = 'bg-black/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 shadow-sm transition-colors duration-300';
    if (landingNavLinks) landingNavLinks.className = 'hidden md:flex items-center gap-6 text-xs font-semibold text-white/80';
    if (brandTitle) {
      brandTitle.textContent = 'Fix Flow';
      brandTitle.className = 'text-xl font-extrabold tracking-tight text-white transition-colors';
    }
    if (brandBadge) {
      brandBadge.textContent = 'SaaS';
      brandBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/20';
    }
    if (brandSubtitle) {
      brandSubtitle.textContent = 'Electronics Repair Operating System';
      brandSubtitle.className = 'text-[11px] text-neutral-400 -mt-0.5 font-medium';
    }
    container.classList.remove('ff-shop-header-account');
    const headerBrandContent = document.getElementById('header-brand-content');
    const headerBrandMark = mainHeader?.querySelector('a > div:first-child');
    if (headerBrandContent) headerBrandContent.classList.remove('hidden');
    if (headerBrandMark) headerBrandMark.classList.remove('hidden');

    container.innerHTML = `
      <button onclick="document.getElementById('public-portal-gateway').scrollIntoView({behavior: 'smooth'})" class="bg-white hover:bg-slate-100 text-black font-bold text-xs px-4 py-2 rounded-xl shadow-md transition transform hover:-translate-y-0.5">
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
  if (!state.shopToken && !state.customerToken) {
    switchPortal('shop');
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
    if (btnLogin) btnLogin.className = 'text-xs sm:text-sm font-bold text-black border-b-2 border-black pb-2 -mb-2.5 transition';
    if (btnReg) btnReg.className = 'text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-700 pb-2 -mb-2.5 transition';
    if (titleEl) titleEl.textContent = 'Welcome to login system';
    if (subEl) subEl.textContent = "Don't have an account? Create your account, it takes less than a minute";
  } else {
    if (btnReg) btnReg.className = 'text-xs sm:text-sm font-bold text-black border-b-2 border-black pb-2 -mb-2.5 transition';
    if (btnLogin) btnLogin.className = 'text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-700 pb-2 -mb-2.5 transition';
    if (titleEl) titleEl.textContent = 'Create Shop Workspace';
    if (subEl) subEl.textContent = 'Start on Free tier with up to 30 repair tickets per month.';
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
    state.repairerProfile = data.user;
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
      state.repairerProfile = data.user;
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
    state.repairerProfile = regData.user;
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
    state.repairerProfile = data.user;
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
  state.repairerProfile = null;
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
  switchWorkspaceTab('overview');

  try {
    await Promise.all([
      loadWorkspaceDetails(),
      loadRepairerProfile(),
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
  const accountName = document.getElementById('workspace-account-name');
  const accountAvatar = document.getElementById('workspace-account-avatar');
  if (accountName) accountName.textContent = data.workspace.name || 'Shop workspace';
  if (accountAvatar) accountAvatar.textContent = (data.workspace.name || 'WS').substring(0, 2).toUpperCase();
  document.getElementById('ws-meta-subheading').innerHTML =
    `<span class="inline-flex items-center gap-1.5">${data.workspace.phone || 'No phone added'}</span>` +
    `<span class="text-white/30">•</span>` +
    `<span class="truncate">${data.workspace.address || 'Location not added'}</span>`;
  renderHeaderUserArea();
}

async function loadRepairerProfile() {
  if (!state.shopToken) return;
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${state.shopToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load profile');
    state.repairerProfile = data.user;
    renderHeaderUserArea();
  } catch (_) {
    // Existing login response remains available if profile refresh fails.
  }
}

async function loadSubscriptionDetails() {
  const res = await fetch('/api/subscription', {
    headers: { Authorization: `Bearer ${state.shopToken}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);

  state.subscription = data;
  const plan = data.currentPlan;
  const accountPlan = document.getElementById('workspace-account-plan');
  if (accountPlan) accountPlan.textContent = `${plan.name} plan`;

  // Plan badge
  document.getElementById('ws-plan-badge').textContent = `Plan: ${plan.name} (₹${plan.priceMonthlyInr}/mo)`;

  // Staff Seat Meter
  const staffCur = data.usage.staff.current;
  const staffMax = plan.maxStaff;
  document.getElementById('stat-staff-seats').textContent = `${staffCur} / ${staffMax}`;
  document.getElementById('seats-meter-label').textContent = `${staffCur} / ${staffMax} Seats Used`;
  document.getElementById('team-seats-desc').textContent = `${staffCur} of ${staffMax} seats currently occupied on ${plan.name} plan.`;
  const staffCapacityEl = document.getElementById('overview-staff-capacity');
  if (staffCapacityEl) staffCapacityEl.textContent = `${staffCur} of ${staffMax} seats occupied`;

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
    const ticketAllowance = p.unlimitedTickets ? 'Unlimited' : `Up to ${p.maxTicketsPerMonth}`;
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
              <span><strong>${ticketAllowance}</strong> Tickets${p.unlimitedTickets ? '' : ' / Month'}</span>
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
          class="mt-6 w-full py-3 px-4 rounded-2xl text-xs font-bold transition shadow-xs uppercase tracking-wider ${isCurrent ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-gradient-to-r from-zinc-700 via-black to-zinc-500 border border-white/15 text-white shadow-lg shadow-black/30 transform hover:-translate-y-0.5 active:translate-y-0'}">
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
  renderWorkspaceOverview(data.tickets);

  const tbody = document.getElementById('ws-tickets-tbody');
  if (data.tickets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="py-10 text-center text-slate-400 text-xs">No repair tickets found. Click "+ New Repair Intake" to register one.</td></tr>`;
    return;
  }

  function renderWorkspaceOverview(tickets) {
    const activeTickets = tickets.filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED');
    const counts = {
      pending: tickets.filter(t => ['RECEIVED', 'DIAGNOSING', 'WAITING_PARTS'].includes(t.status)).length,
      progress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tickets.filter(t => t.status === 'COMPLETED').length,
      delivered: tickets.filter(t => t.status === 'DELIVERED').length
    };
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    setText('overview-active-repairs', activeTickets.length);
    setText('overview-repair-revenue', `₹${activeTickets.reduce((sum, t) => sum + (t.estimated_cost || 0), 0).toLocaleString()}`);
    setText('overview-status-pending', counts.pending);
    setText('overview-status-progress', counts.progress);
    setText('overview-status-completed', counts.completed);
    setText('overview-status-delivered', counts.delivered);

    const recent = [...tickets].sort((a, b) => {
      const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
      const bDate = new Date(b.updated_at || b.created_at || 0).getTime();
      return bDate - aDate;
    }).slice(0, 4);
    const activity = document.getElementById('overview-recent-activity');
    const ticketList = document.getElementById('overview-recent-tickets');
    const statusClass = status => status === 'IN_PROGRESS' ? 'is-progress' : status === 'COMPLETED' ? 'is-complete' : status === 'DELIVERED' ? 'is-delivered' : '';

    if (activity) {
      activity.innerHTML = recent.length
        ? recent.map(t => `
          <div class="workspace-activity-item">
            <span class="status-dot status-dot-${statusClass(t.status).replace('is-', '') || 'pending'}"></span>
            <div><strong>Ticket #${t.ticket_number} · ${formatStatusLabel(t.status)}</strong><small>${t.assigned_staff_name ? `Assigned to ${t.assigned_staff_name}` : 'No technician assigned'}${t.customer_name ? ` · ${t.customer_name}` : ''}</small></div>
            <small>${new Date(t.updated_at || t.created_at || Date.now()).toLocaleDateString()}</small>
          </div>
        `).join('')
        : '<div class="workspace-empty-state">No repair activity yet.</div>';
    }

    if (ticketList) {
      ticketList.innerHTML = recent.length
        ? recent.map(t => `
          <div class="workspace-ticket-item">
            <strong>#${t.ticket_number}</strong>
            <div><strong>${t.customer_name || 'Walk-in Customer'}</strong><small>${t.customer_phone || 'No phone added'}</small></div>
            <div><strong>${t.brand || ''} ${t.model || ''}</strong><small>${t.device_category || 'Device'}</small></div>
            <span>${t.assigned_staff_name || 'Unassigned'}</span>
            <strong>₹${(t.estimated_cost || 0).toLocaleString()}</strong>
            <span class="workspace-status-badge ${statusClass(t.status)}">${formatStatusLabel(t.status)}</span>
          </div>
        `).join('')
        : '<div class="workspace-empty-state">No repair tickets yet. Start with a new intake.</div>';
    }
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
  const staffCountEl = document.getElementById('overview-staff-members');
  const staffCapacityEl = document.getElementById('overview-staff-capacity');
  if (staffCountEl) staffCountEl.textContent = data.staff.length;
  if (staffCapacityEl && state.subscription?.currentPlan) {
    staffCapacityEl.textContent = `${data.staff.length} of ${state.subscription.currentPlan.maxStaff} seats occupied`;
  }

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
  const overviewCustomers = document.getElementById('overview-total-customers');
  if (overviewCustomers) overviewCustomers.textContent = data.customers.length;

  const tbody = document.getElementById('ws-customers-tbody');
  if (data.customers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-slate-400 text-xs">No customer records yet. Customers are registered automatically when intake tickets are created.</td></tr>`;
    return;
  }

  renderCustomerDirectoryRows(data.customers);
}

function renderCustomerDirectoryRows(customers) {
  const tbody = document.getElementById('ws-customers-tbody');
  if (!tbody) return;
  if (customers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-slate-400 text-xs">No customers match this search.</td></tr>`;
    return;
  }

  tbody.innerHTML = customers.map(c => {
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

function filterCustomerDirectory() {
  const query = (document.getElementById('ws-customer-search')?.value || '').trim().toLowerCase();
  const filtered = state.customers.filter(customer => {
    return `${customer.default_name || ''} ${customer.phone_e164 || ''}`.toLowerCase().includes(query);
  });
  renderCustomerDirectoryRows(filtered);
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
  const tabs = ['overview', 'tickets', 'customers', 'team', 'billing', 'features'];
  tabs.forEach(t => {
    const panel = t === 'overview'
      ? document.getElementById('workspace-overview-panel')
      : document.getElementById(`tab-panel-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    const navBtn = document.getElementById(`workspace-nav-${t}`);
    if (t === tab) {
      if (panel) panel.classList.remove('hidden');
      if (panel) panel.style.display = 'block';
      if (btn) btn.className = 'bg-gradient-to-r from-zinc-700 via-black to-zinc-500 border border-white/15 text-white font-bold rounded-xl px-4 sm:px-5 py-2.5 text-xs shadow-lg shadow-black/30 transition-all flex items-center gap-2';
      if (navBtn) navBtn.classList.add('workspace-nav-active');
    } else {
      if (panel) panel.classList.add('hidden');
      if (panel) panel.style.display = 'none';
      if (btn) btn.className = 'text-slate-600 hover:text-slate-900 font-semibold rounded-xl px-4 sm:px-5 py-2.5 text-xs hover:bg-white/80 transition-all flex items-center gap-2';
      if (navBtn) navBtn.classList.remove('workspace-nav-active');
    }
  });
}

function openProfilePlanPanel(tab) {
  const modal = document.getElementById('modal-profile-plans');
  const content = document.getElementById('profile-plan-panel-content');
  const panel = document.getElementById(`tab-panel-${tab}`);
  if (!modal || !content || !panel) return;

  content.replaceChildren(panel);
  panel.classList.remove('hidden');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.classList.add('overflow-hidden');
}

function closeProfilePlanPanel() {
  const modal = document.getElementById('modal-profile-plans');
  const content = document.getElementById('profile-plan-panel-content');
  const billing = document.getElementById('tab-panel-billing');
  const features = document.getElementById('tab-panel-features');
  const dashboard = document.getElementById('shop-workspace-dashboard');

  if (dashboard) {
    if (billing) dashboard.appendChild(billing);
    if (features) dashboard.appendChild(features);
  }
  if (billing) billing.classList.add('hidden');
  if (features) features.classList.add('hidden');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  document.body.classList.remove('overflow-hidden');
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
    if (btnLogin) btnLogin.className = 'text-xs sm:text-sm font-bold text-black border-b-2 border-black pb-2 -mb-2.5 transition';
    if (btnReg) btnReg.className = 'text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-700 pb-2 -mb-2.5 transition';
    if (formLogin) formLogin.classList.remove('hidden');
    if (formReg) formReg.classList.add('hidden');
    if (titleEl) titleEl.textContent = 'Track Your Device Repair';
    if (subEl) subEl.textContent = 'Sign in with your mobile phone & password to see real-time repair status.';
  } else {
    if (btnReg) btnReg.className = 'text-xs sm:text-sm font-bold text-black border-b-2 border-black pb-2 -mb-2.5 transition';
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
  state.currentPortal = 'track';
  renderHeaderUserArea();
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
    state.customerProfile = profileData.customer;

    const ticketsRes = await fetch('/api/track/tickets', {
      headers: { Authorization: `Bearer ${state.customerToken}` }
    });
    const ticketsData = await ticketsRes.json();
    if (!ticketsRes.ok) throw new Error(ticketsData.error);
    state.customerTicketCount = ticketsData.tickets.length;
    renderHeaderUserArea();

    const list = document.getElementById('cust-tickets-list');
    if (ticketsData.tickets.length === 0) {
      list.innerHTML = `
        <div class="customer-ticket-card p-8 text-center" style="color:#9299A5">
          <p class="text-sm font-medium">No repair records found for this phone number.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = ticketsData.tickets.map(t => {
      const isDone = t.status === 'COMPLETED' || t.status === 'DELIVERED';
      const statusBadge = isDone
        ? 'done'
        : (t.status === 'IN_PROGRESS' || t.status === 'WAITING_PARTS' ? 'progress' : 'info');

      return `
        <article class="customer-ticket-card">
          <div class="customer-ticket-header">
            <div>
              <span class="customer-ticket-number">${t.ticket_number}</span>
              <h3>${t.brand} ${t.model}</h3>
              <p>${t.device_category} repair</p>
            </div>
            <div class="customer-ticket-status">
              <span class="customer-track-badge ${statusBadge}">
                ${formatStatusLabel(t.status)}
              </span>
              <strong>Estimate ₹${(t.estimated_cost || 0).toLocaleString()}</strong>
            </div>
          </div>

          <div class="customer-track-content">
          <div class="customer-track-progress">
            <div class="customer-track-progress-labels">
              <span>Intake</span>
              <span>Diagnosis</span>
              <span>In Repair</span>
              <span>Ready for Pickup</span>
              <span>Delivered</span>
            </div>
            <div class="customer-track-progress-bar">
              <div style="width:${getStepperWidth(t.status)}"></div>
            </div>
          </div>

          <aside class="customer-track-side">
            <div>
              <span class="customer-track-label">Service center</span>
              <h4>${t.shop_name}</h4>
              <p>${t.shop_address || 'Local authorized store'}</p>
            </div>
            ${t.shop_phone ? `
              <a href="tel:${t.shop_phone}" class="customer-track-call">Call shop · ${t.shop_phone}</a>
            ` : ''}
          </aside>

          <aside class="customer-track-side">
            <span class="customer-track-label">Issue reported</span>
            <p style="color:#F5F6F8">${t.issue_description || 'No issue description provided'}</p>
            ${t.assigned_staff_name ? `
              <span class="customer-track-label" style="margin-top:.8rem">Technician</span>
              <h4>${t.assigned_staff_name}</h4>
              ${t.assigned_staff_phone ? `<a href="tel:${t.assigned_staff_phone}" class="customer-track-call">Call technician</a>` : ''}
            ` : ''}
          </aside>

          <div class="customer-track-timeline">
            <span class="customer-track-label">Live service activity</span>
            <div>
              ${(t.timeline || []).map(ev => `
                <div class="customer-track-timeline-row">
                  <strong>${formatStatusLabel(ev.to_status)}</strong>
                  <span>${ev.notes || 'Status updated'}</span>
                  <time>${new Date(ev.created_at).toLocaleDateString()}</time>
                </div>
              `).join('')}
            </div>
          </div>
          </div>

          <footer class="customer-track-footer">
            <span>Record created ${new Date(t.created_at).toLocaleDateString()}</span>
            <button type="button" onclick="handleDeleteCustomerTicket('${t.id}', '${t.ticket_number}')" class="customer-track-delete">
              Delete / cancel record
            </button>
          </footer>
        </article>
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
  state.customerProfile = null;
  state.customerTicketCount = 0;
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
