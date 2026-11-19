import React, { useState } from 'react';

export default function HeroGateway({
  portal,
  onSwitchPortal,
  onShopLogin,
  onShopRegister,
  onDemoLogin,
  onCustomerLogin,
  onCustomerRegister,
  showToast
}) {
  const [shopAuthMode, setShopAuthMode] = useState('login');
  const [custAuthMode, setCustAuthMode] = useState('login');

  // Shop form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);

  const [regShopName, setRegShopName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regOwnerEmail, setRegOwnerEmail] = useState('');
  const [regOwnerPassword, setRegOwnerPassword] = useState('');
  const [regShopPhone, setRegShopPhone] = useState('');
  const [regShopAddress, setRegShopAddress] = useState('');

  // Customer form state
  const [custPhone, setCustPhone] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [showCustPw, setShowCustPw] = useState(false);

  const [custRegPhone, setCustRegPhone] = useState('');
  const [custRegName, setCustRegName] = useState('');
  const [custRegPassword, setCustRegPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleShopLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await onShopLogin(loginEmail, loginPassword); }
    catch (err) { showToast(err.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleShopRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onShopRegister({
        name: regShopName, ownerName: regOwnerName, ownerEmail: regOwnerEmail,
        ownerPassword: regOwnerPassword, phone: regShopPhone, address: regShopAddress
      });
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleCustLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await onCustomerLogin(custPhone, custPassword); }
    catch (err) { showToast(err.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleCustRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await onCustomerRegister({ phone: custRegPhone, name: custRegName, password: custRegPassword }); }
    catch (err) { showToast(err.message, 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#0B0F17] via-[#07090E] to-[#000000] py-12 px-4 sm:px-6 lg:px-8 shadow-2xl">

      {/* Floating decorative horizontal pill bars */}
      <div className="absolute top-12 -left-6 w-28 h-6 bg-white/10 rounded-r-full pointer-events-none hidden sm:block"></div>
      <div className="absolute top-24 -left-3 w-16 h-5 bg-white/5 rounded-r-full pointer-events-none hidden sm:block"></div>
      <div className="absolute bottom-16 -right-6 w-32 h-7 bg-white/10 rounded-l-full pointer-events-none hidden sm:block"></div>
      <div className="absolute bottom-28 -right-3 w-18 h-5 bg-white/5 rounded-l-full pointer-events-none hidden sm:block"></div>

      {/* Ambient Glow Orbs — dark neutral, NOT sky blue */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-neutral-800/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-zinc-900/50 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Headline */}
      <div className="max-w-4xl mx-auto text-center text-white mb-10 relative z-10">
        <h1 className="hero-title text-3xl sm:text-5xl font-black tracking-tight leading-tight drop-shadow-sm">
          <span className="hero-line">Manage Repairs Faster.</span><br/>
          <span className="hero-line hero-line-secondary text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 via-white to-neutral-400">
            Build Trust with Every Customer.
          </span>
        </h1>
        <p className="text-neutral-300 text-xs sm:text-sm mt-3.5 max-w-2xl mx-auto leading-relaxed font-normal">
          Fast counter intake with flexible non-compulsory fields, automatic phone deduplication across your branches, and zero-password customer repair tracking.
        </p>
      </div>

      {/* THE MAIN WHITE AUTH CARD */}
      <div
        id="gateway-auth-card"
        className="max-w-5xl mx-auto bg-white rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10 border border-neutral-800/20"
      >
        {/* ============================================ */}
        {/* LEFT COLUMN: AUTHENTIC FIXFLOW BRAND EMBLEM  */}
        {/* ============================================ */}
        <div id="gateway-left-column" className="md:col-span-4 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 bg-white relative transition-all duration-500">
          <div id="gateway-left-brand">

            {/* Stylized Circular Brand Shape — Obsidian Black Gradient */}
            <div className="relative -mt-12 -ml-12 w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-[#05070B] via-[#12141C] to-[#1F2430] flex flex-col items-center justify-center shadow-xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
              <div className="absolute w-40 h-40 rounded-full border border-white/15 pointer-events-none"></div>
              <div className="absolute w-48 h-48 rounded-full border border-white/10 pointer-events-none"></div>

              {/* Crisp FF Monogram — White badge, BLACK text */}
              <div className="relative z-10 flex flex-col items-center text-center px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-black flex items-center justify-center shadow-xl shadow-black/40 font-black text-3xl sm:text-4xl tracking-tight transform transition-transform group-hover:scale-105">
                  FF
                </div>
                <span className="text-white font-black text-xl sm:text-2xl tracking-tight mt-2.5 drop-shadow-md font-sans">FixFlow</span>
                <span className="text-neutral-400 text-[10px] uppercase tracking-widest font-extrabold drop-shadow-xs mt-0.5">Repair OS</span>
              </div>
            </div>

            {/* Welcome Text */}
            <div className="mt-4">
              <h2 id="left-banner-title" className="text-3xl font-black text-slate-800 tracking-tight">
                {portal === 'shop' ? 'Welcome' : 'Track Device'}
              </h2>
              <p id="left-banner-subtitle" className="text-slate-400 text-xs mt-2 leading-relaxed">
                {portal === 'shop'
                  ? "Don't have an account? Create your account, it takes less than a minute."
                  : 'Real-time repair tracking with zero passwords. Just enter your mobile number.'}
              </p>
            </div>

            {/* Portal Selector Pill */}
            <div id="gateway-portal-selector" className="mt-6 flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
              <button
                id="gateway-btn-shop"
                onClick={() => onSwitchPortal('shop')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  portal === 'shop' ? 'bg-black text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <svg className={`w-4 h-4 flex-shrink-0 ${portal === 'shop' ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1-5h16l1 5M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M9 21v-7a1 1 0 011-1h4a1 1 0 011 1v7" />
                </svg>
                <span>Shop Portal</span>
              </button>
              <button
                id="gateway-btn-track"
                onClick={() => onSwitchPortal('track')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  portal === 'track' ? 'bg-black text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <svg className={`w-4 h-4 flex-shrink-0 ${portal === 'track' ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                </svg>
                <span>Track Repair</span>
              </button>
            </div>
          </div>

          {/* Left Footer: Quick Demo Access */}
          <div id="gateway-left-footer" className="mt-8 pt-4 border-t border-slate-100">
            <button
              onClick={onDemoLogin}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl border border-slate-200 transition flex items-center justify-center gap-2 shadow-xs group"
            >
              <svg className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>1-Click Demo Shop Login</span>
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* RIGHT COLUMN: DYNAMIC AUTHENTICATION FORMS   */}
        {/* ============================================ */}
        <div id="gateway-right-column" className="md:col-span-8 p-0 flex flex-col justify-between bg-white transition-all duration-500 overflow-hidden">

          {/* Dynamic hero visual */}
          <div id="gateway-visual" className="relative min-h-[260px] sm:min-h-[300px] w-full bg-slate-950 overflow-hidden">
            <img
              id="gateway-visual-image"
              src={portal === 'shop' ? '/images/hero-shop.jpg' : '/images/hero-track.jpg'}
              alt={portal === 'shop' ? 'Electronics repair shop' : 'Device repair tracking'}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10"></div>
          </div>

          {/* SECTION 1: SHOP AUTHENTICATION */}
          {portal === 'shop' && (
            <div id="shop-auth-screen" className="space-y-5 p-6 sm:p-8">
              <div>
                <h3 id="auth-main-title" className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                  {shopAuthMode === 'login' ? 'Sign In to Shop' : 'Create Shop Workspace'}
                </h3>
                <p id="auth-main-subtitle" className="text-xs text-slate-400 mt-1.5">
                  {shopAuthMode === 'login'
                    ? "Don't have an account? Create your account, it takes less than a minute"
                    : 'Start on Free tier with up to 30 repair tickets per month.'}
                </p>
              </div>

              {/* Sign In / Register Tabs */}
              <div id="shop-tabs-bar" className="flex items-center gap-5 border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => setShopAuthMode('login')}
                  className={`text-xs sm:text-sm font-bold pb-2 -mb-2.5 transition ${
                    shopAuthMode === 'login' ? 'text-black border-b-2 border-black' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Sign In to Shop
                </button>
                <button
                  type="button"
                  onClick={() => setShopAuthMode('register')}
                  className={`text-xs sm:text-sm font-semibold pb-2 -mb-2.5 transition ${
                    shopAuthMode === 'register' ? 'text-black border-b-2 border-black' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Create Workspace
                </button>
              </div>

              {/* 1A: SHOP LOGIN FORM */}
              {shopAuthMode === 'login' ? (
                <form id="shop-login-form" onSubmit={handleShopLogin} className="space-y-4 pt-1">
                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-3.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      type="email"
                      id="login-email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      placeholder="owner@repairshop.com"
                      className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none ml-3 font-medium"
                    />
                  </div>

                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-3.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type={showLoginPw ? 'text' : 'password'}
                      id="login-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder="••••••••••"
                      className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none ml-3 font-medium tracking-wide"
                    />
                    <button type="button" onClick={() => setShowLoginPw(!showLoginPw)} className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-semibold select-none">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-black border-slate-300 focus:ring-black" />
                      <span>Remember me</span>
                    </label>
                    <button type="button" onClick={() => showToast('Password reset is managed by shop owner via Workspace Settings.', 'info')} className="text-slate-400 hover:text-black font-semibold transition">
                      Forgot Password?
                    </button>
                  </div>

                  {/* BLACK gradient action button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-black via-zinc-900 to-black hover:from-zinc-900 hover:to-zinc-800 text-white font-bold tracking-widest text-xs uppercase py-3.5 rounded-2xl shadow-lg shadow-black/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{submitting ? 'SIGNING IN...' : 'LOGIN'}</span>
                  </button>
                </form>
              ) : (
                /* 1B: CREATE SHOP WORKSPACE FORM */
                <form id="shop-register-form" onSubmit={handleShopRegister} className="space-y-3 pt-1">
                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition">
                    <input type="text" id="reg-shop-name" value={regShopName} onChange={(e) => setRegShopName(e.target.value)} required placeholder="Shop / Business Name" className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition">
                      <input type="text" id="reg-owner-name" value={regOwnerName} onChange={(e) => setRegOwnerName(e.target.value)} required placeholder="Owner Full Name" className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium" />
                    </div>
                    <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition">
                      <input type="email" id="reg-owner-email" value={regOwnerEmail} onChange={(e) => setRegOwnerEmail(e.target.value)} required placeholder="Owner Email" className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition">
                      <input type="password" id="reg-owner-password" value={regOwnerPassword} onChange={(e) => setRegOwnerPassword(e.target.value)} required minLength="6" placeholder="Password (min 6)" className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium" />
                    </div>
                    <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition">
                      <input type="tel" id="reg-shop-phone" value={regShopPhone} onChange={(e) => setRegShopPhone(e.target.value)} placeholder="Contact Mobile" className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium" />
                    </div>
                  </div>
                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition">
                    <input type="text" id="reg-shop-address" value={regShopAddress} onChange={(e) => setRegShopAddress(e.target.value)} placeholder="Shop Address (e.g. 12 Brigade Road)" className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium" />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-black via-zinc-900 to-black hover:from-zinc-900 hover:to-zinc-800 text-white font-bold tracking-widest text-xs uppercase py-3.5 rounded-2xl shadow-lg shadow-black/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    {submitting ? 'CREATING...' : 'CREATE WORKSPACE & START FREE'}
                  </button>
                </form>
              )}

              {/* Social / Quick-Action Circular Buttons */}
              <div id="gateway-social-actions" className="flex items-center justify-center gap-4 pt-6 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => onSwitchPortal('shop')} title="Repair Shop Login" className="w-10 h-10 rounded-full bg-black hover:bg-zinc-800 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1-5h16l1 5M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M9 21v-7a1 1 0 011-1h4a1 1 0 011 1v7" />
                  </svg>
                </button>
                <button type="button" onClick={() => onSwitchPortal('track')} title="Customer Repair Tracker" className="w-10 h-10 rounded-full bg-zinc-700 hover:bg-zinc-800 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                </button>
                <button type="button" onClick={onDemoLogin} title="1-Click Instant Demo Login" className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-black text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: CUSTOMER PASSWORD AUTHENTICATION */}
          {portal === 'track' && (
            <div id="cust-auth-hero" className="space-y-5 p-6 sm:p-8">
              <div>
                <h3 id="cust-auth-title" className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Track Your Device Repair</h3>
                <p id="cust-auth-subtitle" className="text-xs text-slate-400 mt-1.5">Sign in with your mobile phone &amp; password to see real-time repair status.</p>
              </div>

              {/* Customer Tabs */}
              <div id="cust-tabs-bar" className="flex items-center gap-5 border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => setCustAuthMode('login')}
                  className={`text-xs sm:text-sm font-bold pb-2 -mb-2.5 transition ${
                    custAuthMode === 'login' ? 'text-black border-b-2 border-black' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setCustAuthMode('register')}
                  className={`text-xs sm:text-sm font-semibold pb-2 -mb-2.5 transition ${
                    custAuthMode === 'register' ? 'text-black border-b-2 border-black' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Create / Set Password
                </button>
              </div>

              {/* 2A: CUSTOMER LOGIN FORM */}
              {custAuthMode === 'login' ? (
                <form id="cust-login-form" onSubmit={handleCustLogin} className="space-y-4 pt-1">
                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-3.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <input
                      type="tel"
                      id="cust-login-phone"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      required
                      placeholder="Mobile Number (e.g. 9591560751)"
                      className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none ml-3 font-medium"
                    />
                  </div>

                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-3.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type={showCustPw ? 'text' : 'password'}
                      id="cust-login-password"
                      value={custPassword}
                      onChange={(e) => setCustPassword(e.target.value)}
                      required
                      placeholder="••••••••••"
                      className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none ml-3 font-medium tracking-wide"
                    />
                    <button type="button" onClick={() => setShowCustPw(!showCustPw)} className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">First time tracking?</span>
                    <button type="button" onClick={() => setCustAuthMode('register')} className="text-black hover:text-zinc-700 font-bold transition">
                      Create / Set Password →
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-black via-zinc-900 to-black hover:from-zinc-900 hover:to-zinc-800 text-white font-bold tracking-widest text-xs uppercase py-3.5 rounded-2xl shadow-lg shadow-black/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{submitting ? 'VERIFYING...' : 'SIGN IN & TRACK REPAIR'}</span>
                  </button>
                </form>
              ) : (
                /* 2B: CUSTOMER CREATE / SET PASSWORD FORM */
                <form id="cust-register-form" onSubmit={handleCustRegister} className="space-y-3 pt-1">
                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <input type="tel" id="cust-reg-phone" value={custRegPhone} onChange={(e) => setCustRegPhone(e.target.value)} required placeholder="Customer Mobile Number (e.g. 9591560751)" className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium" />
                  </div>
                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <input type="text" id="cust-reg-name" value={custRegName} onChange={(e) => setCustRegName(e.target.value)} placeholder="Your Full Name (optional)" className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium" />
                  </div>
                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <input type="password" id="cust-reg-password" value={custRegPassword} onChange={(e) => setCustRegPassword(e.target.value)} required minLength="6" placeholder="Create Password (min 6 chars)" className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium" />
                  </div>

                  <div className="bg-zinc-100 p-3 rounded-xl border border-zinc-200 text-[11px] text-zinc-800">
                    <span><strong>Zero-OTP Access:</strong> Set a password once and access all your device repair timelines anytime.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-black via-zinc-900 to-black hover:from-zinc-900 hover:to-zinc-800 text-white font-bold tracking-widest text-xs uppercase py-3.5 rounded-2xl shadow-lg shadow-black/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    {submitting ? 'SETTING UP...' : 'SET PASSWORD & VIEW REPAIRS'}
                  </button>
                </form>
              )}

              {/* Social / Quick-Action Circular Buttons */}
              <div id="gateway-social-actions" className="flex items-center justify-center gap-4 pt-6 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => onSwitchPortal('shop')} title="Repair Shop Login" className="w-10 h-10 rounded-full bg-black hover:bg-zinc-800 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1-5h16l1 5M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M9 21v-7a1 1 0 011-1h4a1 1 0 011 1v7" />
                  </svg>
                </button>
                <button type="button" onClick={() => onSwitchPortal('track')} title="Customer Repair Tracker" className="w-10 h-10 rounded-full bg-zinc-700 hover:bg-zinc-800 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                </button>
                <button type="button" onClick={onDemoLogin} title="1-Click Instant Demo Login" className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-black text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
