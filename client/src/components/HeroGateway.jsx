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
  // Shop Auth Mode ('login' | 'register')
  const [shopAuthMode, setShopAuthMode] = useState('login');
  
  // Customer Auth Mode ('login' | 'register')
  const [custAuthMode, setCustAuthMode] = useState('login');

  // Shop Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regShopName, setRegShopName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regOwnerEmail, setRegOwnerEmail] = useState('');
  const [regOwnerPassword, setRegOwnerPassword] = useState('');
  const [regShopPhone, setRegShopPhone] = useState('');
  const [regShopAddress, setRegShopAddress] = useState('');

  // Customer Form state
  const [custPhone, setCustPhone] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [showCustPassword, setShowCustPassword] = useState(false);

  const [custRegPhone, setCustRegPhone] = useState('');
  const [custRegName, setCustRegName] = useState('');
  const [custRegPassword, setCustRegPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleShopLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onShopLogin(loginEmail, loginPassword);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShopRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onShopRegister({
        name: regShopName,
        ownerName: regOwnerName,
        ownerEmail: regOwnerEmail,
        ownerPassword: regOwnerPassword,
        phone: regShopPhone,
        address: regShopAddress
      });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCustomerLogin(custPhone, custPassword);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCustomerRegister({
        phone: custRegPhone,
        name: custRegName,
        password: custRegPassword
      });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#1E2E72] via-[#1A2E76] to-[#00A8FF] py-12 px-4 sm:px-6 lg:px-8 shadow-2xl">
      {/* Floating decorative horizontal pill bars */}
      <div className="absolute top-12 -left-6 w-28 h-6 bg-white/10 rounded-r-full pointer-events-none hidden sm:block"></div>
      <div className="absolute top-24 -left-3 w-16 h-5 bg-white/5 rounded-r-full pointer-events-none hidden sm:block"></div>
      <div className="absolute bottom-16 -right-6 w-32 h-7 bg-white/10 rounded-l-full pointer-events-none hidden sm:block"></div>
      <div className="absolute bottom-28 -right-3 w-18 h-5 bg-white/5 rounded-l-full pointer-events-none hidden sm:block"></div>

      {/* Ambient Glow Orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Headline & Intro with typing animation */}
      <div className="max-w-4xl mx-auto text-center text-white mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-sky-100 mb-4 shadow-sm">
          <span>⚡ FixFlow 2.0</span>
          <span className="text-white/40">•</span>
          <span>The Operating System for Electronics Repair Shops</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight drop-shadow-sm">
          <span className="hero-line">Manage Repairs Faster.</span><br/>
          <span className="hero-line hero-line-secondary text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-sky-100">
            Build Trust with Every Customer.
          </span>
        </h1>
        <p className="text-sky-100 text-xs sm:text-sm mt-3.5 max-w-2xl mx-auto leading-relaxed font-normal">
          Fast counter intake with flexible non-compulsory fields, automatic phone deduplication across your branches, and zero-password customer repair tracking.
        </p>
      </div>

      {/* THE MAIN WHITE AUTH CARD */}
      <div 
        id="gateway-auth-card" 
        className="max-w-5xl mx-auto bg-white rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10 border border-white/40 transition-all duration-500"
      >
        {/* LEFT COLUMN: AUTHENTIC FIXFLOW BRAND EMBLEM */}
        <div id="gateway-left-column" className="md:col-span-5 p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 bg-white relative">
          <div>
            {/* Stylized Circular Brand Shape */}
            <div className="relative -mt-12 -ml-12 w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-[#0091FF] via-[#00A8FF] to-[#38BDF8] flex flex-col items-center justify-center shadow-xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
              <div className="absolute w-40 h-40 rounded-full border border-white/25 pointer-events-none"></div>
              <div className="absolute w-48 h-48 rounded-full border border-white/15 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-xl shadow-blue-950/20 font-black text-3xl sm:text-4xl tracking-tight transform transition-transform group-hover:scale-105">
                  FF
                </div>
                <span className="text-white font-black text-xl sm:text-2xl tracking-tight mt-2.5 drop-shadow-md font-sans">FixFlow</span>
                <span className="text-sky-100 text-[10px] uppercase tracking-widest font-extrabold drop-shadow-xs mt-0.5">Repair OS</span>
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
                  portal === 'shop' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1-5h16l1 5M3 9a3 3 0 006 0 3 3 0 006 0M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M9 21v-7a1 1 0 011-1h4a1 1 0 011 1v7" />
                </svg>
                <span>Shop Portal</span>
              </button>
              <button 
                id="gateway-btn-track" 
                onClick={() => onSwitchPortal('track')} 
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  portal === 'track' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
              <span>⚡ 1-Click Demo Shop Login</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: DYNAMIC AUTHENTICATION FORMS */}
        <div id="gateway-right-column" className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white transition-all duration-500 overflow-hidden">
          
          {/* SECTION 1: SHOP AUTHENTICATION */}
          {portal === 'shop' && (
            <div id="shop-auth-screen" className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h3 id="auth-main-title" className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                  {shopAuthMode === 'login' ? 'Sign In to Shop' : 'Create Shop Workspace'}
                </h3>
                <p id="auth-main-subtitle" className="text-xs text-slate-400 mt-1.5">
                  {shopAuthMode === 'login'
                    ? "Manage your repair shop, staff, tickets, and customer tracking."
                    : 'Start on Free tier with up to 30 repair tickets per month.'}
                </p>
              </div>

              {/* Sign In / Register Tabs */}
              <div id="shop-tabs-bar" className="flex items-center gap-5 border-b border-slate-100 pb-2">
                <button 
                  type="button"
                  id="auth-tab-signin-btn" 
                  onClick={() => setShopAuthMode('login')} 
                  className={`text-xs sm:text-sm font-bold pb-2 -mb-2.5 transition ${
                    shopAuthMode === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Sign In to Shop
                </button>
                <button 
                  type="button"
                  id="auth-tab-register-btn" 
                  onClick={() => setShopAuthMode('register')} 
                  className={`text-xs sm:text-sm font-bold pb-2 -mb-2.5 transition ${
                    shopAuthMode === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Create Workspace
                </button>
              </div>

              {/* 1A: SHOP LOGIN FORM */}
              {shopAuthMode === 'login' ? (
                <form id="shop-login-form" onSubmit={handleShopLoginSubmit} className="space-y-4 pt-1">
                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-3.5 shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition">
                    <input 
                      type="email" 
                      id="login-email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required 
                      placeholder="owner@shop.com" 
                      className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-3.5 shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition">
                    <input 
                      type={showLoginPassword ? "text" : "password"} 
                      id="login-password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required 
                      placeholder="••••••••" 
                      className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium pr-10"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowLoginPassword(!showLoginPassword)} 
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showLoginPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#3B66D6] to-[#00A8FF] hover:from-[#3255B8] hover:to-[#0096E6] text-white font-bold tracking-wider text-xs uppercase py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{submitting ? 'SIGNING IN...' : 'LOGIN'}</span>
                  </button>
                </form>
              ) : (
                /* 1B: CREATE SHOP WORKSPACE FORM */
                <form id="shop-register-form" onSubmit={handleShopRegisterSubmit} className="space-y-3 pt-1">
                  <div>
                    <input 
                      type="text" 
                      id="reg-shop-name" 
                      value={regShopName}
                      onChange={(e) => setRegShopName(e.target.value)}
                      required 
                      placeholder="Shop Name (e.g. AK-ELECTRIC-STORE)" 
                      className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      id="reg-owner-name" 
                      value={regOwnerName}
                      onChange={(e) => setRegOwnerName(e.target.value)}
                      required 
                      placeholder="Owner Name (e.g. Abhimanyu Kotari)" 
                      className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition font-medium"
                    />
                    <input 
                      type="email" 
                      id="reg-owner-email" 
                      value={regOwnerEmail}
                      onChange={(e) => setRegOwnerEmail(e.target.value)}
                      required 
                      placeholder="Email (e.g. abhimanyukotari4@gmail.com)" 
                      className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      type="password" 
                      id="reg-owner-password" 
                      value={regOwnerPassword}
                      onChange={(e) => setRegOwnerPassword(e.target.value)}
                      required 
                      placeholder="Password (••••••••)" 
                      className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition font-medium"
                    />
                    <input 
                      type="tel" 
                      id="reg-shop-phone" 
                      value={regShopPhone}
                      onChange={(e) => setRegShopPhone(e.target.value)}
                      placeholder="Shop Phone (e.g. 6362937303)" 
                      className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition font-medium"
                    />
                  </div>

                  <div>
                    <input 
                      type="text" 
                      id="reg-shop-address" 
                      value={regShopAddress}
                      onChange={(e) => setRegShopAddress(e.target.value)}
                      placeholder="Shop Address (e.g. 12 Brigade Road)" 
                      className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition font-medium"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#3B66D6] to-[#00A8FF] hover:from-[#3255B8] hover:to-[#0096E6] text-white font-bold tracking-wider text-xs uppercase py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    {submitting ? 'CREATING WORKSPACE...' : 'CREATE WORKSPACE - FREE'}
                  </button>
                </form>
              )}

              {/* Bottom 3 icon badges matching the screenshot */}
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <div className="w-9 h-9 rounded-full bg-[#1E2E72] flex items-center justify-center text-white shadow-md" title="Shop Portal">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#00A8FF] flex items-center justify-center text-white shadow-md" title="Customer Device Tracking">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#F43F5E] flex items-center justify-center text-white shadow-md" title="Fast Repair OS">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: CUSTOMER AUTHENTICATION */}
          {portal === 'track' && (
            <div id="customer-auth-screen" className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h3 id="cust-main-title" className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                  Track Your Device Repair
                </h3>
                <p id="cust-main-subtitle" className="text-xs text-slate-400 mt-1.5">
                  Enter your mobile phone number and password to view real-time repair status.
                </p>
              </div>

              {/* Customer Sign In / Register Tabs */}
              <div id="cust-tabs-bar" className="flex items-center gap-5 border-b border-slate-100 pb-2">
                <button 
                  type="button"
                  onClick={() => setCustAuthMode('login')} 
                  className={`text-xs sm:text-sm font-bold pb-2 -mb-2.5 transition ${
                    custAuthMode === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Sign In with Password
                </button>
                <button 
                  type="button"
                  onClick={() => setCustAuthMode('register')} 
                  className={`text-xs sm:text-sm font-bold pb-2 -mb-2.5 transition ${
                    custAuthMode === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Create Account / Password
                </button>
              </div>

              {custAuthMode === 'login' ? (
                <form onSubmit={handleCustLoginSubmit} className="space-y-4 pt-1">
                  <div>
                    <input 
                      type="tel" 
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      required 
                      placeholder="Mobile Phone (e.g. 9591560751)" 
                      className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition font-medium"
                    />
                  </div>

                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-3.5 shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition">
                    <input 
                      type={showCustPassword ? "text" : "password"} 
                      value={custPassword}
                      onChange={(e) => setCustPassword(e.target.value)}
                      required 
                      placeholder="Password (••••••••)" 
                      className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium pr-10"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowCustPassword(!showCustPassword)} 
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none text-xs"
                    >
                      {showCustPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#3B66D6] to-[#00A8FF] hover:from-[#3255B8] hover:to-[#0096E6] text-white font-bold tracking-wider text-xs uppercase py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    {submitting ? 'VERIFYING...' : 'VERIFY & VIEW REPAIRS'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCustRegisterSubmit} className="space-y-3 pt-1">
                  <div>
                    <input 
                      type="tel" 
                      value={custRegPhone}
                      onChange={(e) => setCustRegPhone(e.target.value)}
                      required 
                      placeholder="Mobile Phone (e.g. 9591560751)" 
                      className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition font-medium"
                    />
                  </div>
                  <div>
                    <input 
                      type="text" 
                      value={custRegName}
                      onChange={(e) => setCustRegName(e.target.value)}
                      placeholder="Your Name (e.g. Abhimanyu Kotari)" 
                      className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition font-medium"
                    />
                  </div>
                  <div>
                    <input 
                      type="password" 
                      value={custRegPassword}
                      onChange={(e) => setCustRegPassword(e.target.value)}
                      required 
                      placeholder="Create Password (••••••••)" 
                      className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition font-medium"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#3B66D6] to-[#00A8FF] hover:from-[#3255B8] hover:to-[#0096E6] text-white font-bold tracking-wider text-xs uppercase py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    {submitting ? 'SETTING UP...' : 'SET PASSWORD & VIEW REPAIRS'}
                  </button>
                </form>
              )}

              {/* Bottom 3 icon badges matching the screenshot */}
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <div className="w-9 h-9 rounded-full bg-[#1E2E72] flex items-center justify-center text-white shadow-md" title="Shop Portal">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#00A8FF] flex items-center justify-center text-white shadow-md" title="Customer Device Tracking">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#F43F5E] flex items-center justify-center text-white shadow-md" title="Fast Repair OS">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
