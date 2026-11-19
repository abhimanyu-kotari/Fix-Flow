import React, { useState } from 'react';

export default function Navbar({
  portal,
  shopToken,
  workspace,
  repairerProfile,
  customerToken,
  customerSession,
  onShopLogout,
  onCustomerLogout,
  onSwitchPortal
}) {
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [custMenuOpen, setCustMenuOpen] = useState(false);

  const isShopLoggedIn = portal === 'shop' && shopToken && workspace;
  const isCustLoggedIn = portal === 'track' && customerToken;
  const isLoggedIn = isShopLoggedIn || isCustLoggedIn;

  // Always bg-black/95 on landing; stay dark when logged in too (matches original)
  const headerBg = 'bg-black/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 shadow-sm transition-colors duration-300';

  const brandTitle = isShopLoggedIn ? 'FixFlow' : (isCustLoggedIn ? 'FixFlow Track' : 'Fix Flow');

  const brandBadge = isShopLoggedIn
    ? { text: 'Shop Workspace', cls: 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30' }
    : (isCustLoggedIn
      ? { text: 'Customer Portal', cls: 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' }
      : { text: 'SaaS', cls: 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/20' });

  const brandSubtitle = isShopLoggedIn
    ? 'Active Repair Operations Center'
    : (isCustLoggedIn ? 'Real-time Repair Milestone Tracking' : 'Electronics Repair Operating System');

  const initials = isShopLoggedIn
    ? (workspace?.name || 'WS').substring(0, 2).toUpperCase()
    : 'FF';

  return (
    <header id="main-header" className={headerBg}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand Logo — black squircle, NOT blue */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-zinc-900 to-black border border-white/20 flex items-center justify-center shadow-md shadow-black/30 text-white font-black text-xl tracking-tight transition-transform group-hover:scale-105">
            FF
          </div>
          <div id="header-brand-content">
            <div className="flex items-center gap-2">
              <span id="header-brand-title" className="text-xl font-extrabold tracking-tight text-white transition-colors">
                {brandTitle}
              </span>
              <span id="header-badge" className={brandBadge.cls}>
                {brandBadge.text}
              </span>
            </div>
            <p id="header-subtitle" className="text-[11px] text-neutral-400 -mt-0.5 font-medium">
              {brandSubtitle}
            </p>
          </div>
        </a>

        {/* Public Landing Navigation Links */}
        {!isLoggedIn && (
          <nav id="landing-nav-links" className="hidden md:flex items-center gap-6 text-xs font-semibold text-white/80">
            <a href="#features-section" className="hover:text-white transition">Features</a>
            <a href="#showcase-section" className="hover:text-white transition">How It Works</a>
            <a href="#pricing-section" className="hover:text-white transition">Pricing</a>
          </nav>
        )}

        {/* Right Header Actions */}
        <div id="header-user-area" className="flex items-center gap-3">
          {/* Note: In Shop Workspace, user profile is exclusively displayed in the left sidebar footer as requested */}

          {/* Customer logged in */}
          {isCustLoggedIn && (
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer p-1.5 rounded-2xl hover:bg-white/10 transition"
                onClick={() => setCustMenuOpen(!custMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-xs flex items-center justify-center border border-white/20 shadow-xs">
                  {(customerSession?.name || 'C').substring(0, 1).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white">{customerSession?.name || 'Customer'}</div>
                  <span className="text-[10px] font-mono text-emerald-300">{customerSession?.phone}</span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-300 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {custMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 text-xs">
                  <div className="pb-3 border-b border-zinc-800">
                    <p className="text-xs font-bold text-white">{customerSession?.name || 'Customer'}</p>
                    <p className="text-[11px] text-emerald-400 font-mono mt-0.5">{customerSession?.phone}</p>
                    <span className="inline-block mt-2 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                      Verified Customer
                    </span>
                  </div>
                  <div className="pt-3">
                    <button
                      onClick={() => { setCustMenuOpen(false); onCustomerLogout(); }}
                      className="w-full text-center py-2 px-3 text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl transition"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Not logged in — white Sign In button */}
          {!isLoggedIn && (
            <button
              onClick={() => {
                const el = document.getElementById('public-portal-gateway');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white hover:bg-slate-100 text-black font-bold text-xs px-5 py-2 rounded-xl shadow-md transition transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
