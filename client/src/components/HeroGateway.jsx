import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function HeroGateway({
  portal = 'shop',
  onSwitchPortal,
  onShopLogin,
  onShopRegister,
  onDemoLogin,
  onCustomerLogin,
  onCustomerRegister,
  showToast
}) {
  const { t } = useLanguage();
  const [shopAuthMode, setShopAuthMode] = useState('login'); // 'login' | 'register'
  const [custAuthMode, setCustAuthMode] = useState('login'); // 'login' | 'register'

  // Shop Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Shop Register State
  const [regShopName, setRegShopName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regOwnerEmail, setRegOwnerEmail] = useState('');
  const [regOwnerPassword, setRegOwnerPassword] = useState('');
  const [regShopPhone, setRegShopPhone] = useState('');
  const [regShopAddress, setRegShopAddress] = useState('');

  // Customer Login State
  const [custPhone, setCustPhone] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [showCustPassword, setShowCustPassword] = useState(false);

  // Customer Register State
  const [custRegPhone, setCustRegPhone] = useState('');
  const [custRegName, setCustRegName] = useState('');
  const [custRegPassword, setCustRegPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Handlers
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
        name: regOwnerName,
        shopName: regShopName,
        email: regOwnerEmail,
        password: regOwnerPassword,
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

  // Portal Toggle Pills
  const renderPortalSelector = () => (
    <div id="gateway-portal-selector" className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner mb-6">
      <button
        id="gateway-btn-shop"
        type="button"
        onClick={() => onSwitchPortal('shop')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          portal === 'shop'
            ? 'bg-black text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <svg className={`w-4 h-4 flex-shrink-0 ${portal === 'shop' ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1-5h16l1 5M3 9a3 3 0 006 0 3 3 0 006 0M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M9 21v-7a1 1 0 011-1h4a1 1 0 011 1v7" />
        </svg>
        <span>{t('shop_portal')}</span>
      </button>

      <button
        id="gateway-btn-track"
        type="button"
        onClick={() => onSwitchPortal('track')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          portal === 'track'
            ? 'bg-black text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <svg className={`w-4 h-4 flex-shrink-0 ${portal === 'track' ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{t('track_repair')}</span>
      </button>
    </div>
  );

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#0B0F17] via-[#07090E] to-[#000000] py-12 px-4 sm:px-6 lg:px-8 shadow-2xl">
      {/* Decorative horizontal pill bars */}
      <div className="absolute top-12 -left-6 w-28 h-6 bg-white/10 rounded-r-full pointer-events-none hidden sm:block"></div>
      <div className="absolute top-24 -left-3 w-16 h-5 bg-white/5 rounded-r-full pointer-events-none hidden sm:block"></div>
      <div className="absolute bottom-16 -right-6 w-32 h-7 bg-white/10 rounded-l-full pointer-events-none hidden sm:block"></div>
      <div className="absolute bottom-28 -right-3 w-18 h-5 bg-white/5 rounded-l-full pointer-events-none hidden sm:block"></div>

      {/* Ambient Glow Orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-neutral-800/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-zinc-900/50 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Headline & Intro */}
      <div className="max-w-4xl mx-auto text-center text-white mb-10 relative z-10">
        <h1 className="hero-title text-3xl sm:text-5xl font-black tracking-tight leading-tight drop-shadow-sm">
          <span className="hero-line">{t('hero_title_1')}</span><br />
          <span className="hero-line hero-line-secondary text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 via-white to-neutral-400">
            {t('hero_title_2')}
          </span>
        </h1>
        <p className="text-neutral-300 text-xs sm:text-sm mt-3.5 max-w-2xl mx-auto leading-relaxed font-normal">
          {t('hero_desc')}
        </p>
      </div>

      {/* MAIN EXECUTIVE AUTH CARD (38% Form / 62% Image on desktop; clean full-width without image on mobile) */}
      <div
        id="gateway-auth-card"
        className="max-w-5xl mx-auto bg-white rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col md:flex-row relative z-10 border border-neutral-800/20"
      >
        {/* ======================================================== */}
        {/* SHOP PORTAL MODE                                         */}
        {/* Left Side: Auth Form (38%) | Right Side: Image (62%)     */}
        {/* ======================================================== */}
        {portal === 'shop' && (
          <>
            {/* LEFT COLUMN: AUTH FORM (38% on desktop, full width on mobile) */}
            <div className="w-full md:w-[42%] lg:w-[38%] p-6 sm:p-8 flex flex-col justify-center border-b-0 md:border-r border-slate-100 bg-white relative transition-all duration-500">
              {renderPortalSelector()}

              <div className="mb-4">
                <h2 id="auth-main-title" className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                  {t('manage_repairs_faster')}
                </h2>
                <p id="auth-main-subtitle" className="text-xs text-slate-400 mt-1.5">
                  {t('build_trust')}
                </p>
              </div>

              {/* Sign In / Create Workspace Tabs */}
              <div id="shop-tabs-bar" className="flex items-center gap-5 border-b border-slate-100 pb-2 mb-5">
                <button
                  type="button"
                  id="auth-tab-signin-btn"
                  onClick={() => setShopAuthMode('login')}
                  className={`text-xs sm:text-sm font-bold pb-2 -mb-2.5 transition cursor-pointer ${
                    shopAuthMode === 'login'
                      ? 'text-black border-b-2 border-black'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {t('sign_in_to_shop')}
                </button>
                <button
                  type="button"
                  id="auth-tab-register-btn"
                  onClick={() => setShopAuthMode('register')}
                  className={`text-xs sm:text-sm font-semibold pb-2 -mb-2.5 transition cursor-pointer ${
                    shopAuthMode === 'register'
                      ? 'text-black border-b-2 border-black'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {t('create_workspace')}
                </button>
              </div>

              {/* 1A: SHOP LOGIN FORM */}
              {shopAuthMode === 'login' ? (
                <form id="shop-login-form" onSubmit={handleShopLoginSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-3.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      type="email"
                      id="login-email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={t('email_placeholder')}
                      className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none ml-3 font-medium"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-3.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      id="login-password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={t('password_placeholder')}
                      className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none ml-3 font-medium tracking-wide"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      title="Show/Hide Password"
                      className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2 cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        {showLoginPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        ) : (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>

                  {/* Remember Me & Forgot Password Row */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-semibold select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-black border-slate-300 focus:ring-black"
                      />
                      <span>{t('remember_me')}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => showToast('Password reset is managed by shop owner via Workspace Settings.', 'info')}
                      className="text-slate-400 hover:text-black font-semibold transition cursor-pointer"
                    >
                      {t('forgot_password')}
                    </button>
                  </div>

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-black via-zinc-900 to-black hover:from-zinc-900 hover:to-zinc-800 text-white font-bold tracking-widest text-xs uppercase py-3.5 rounded-2xl shadow-lg shadow-black/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    <span>{submitting ? t('signing_in') : t('login_btn')}</span>
                  </button>
                </form>
              ) : (
                /* 1B: SHOP REGISTER FORM */
                <form id="shop-register-form" onSubmit={handleShopRegisterSubmit} className="space-y-3">
                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <input
                      type="text"
                      required
                      value={regShopName}
                      onChange={(e) => setRegShopName(e.target.value)}
                      placeholder={t('shop_name_placeholder')}
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                      <input
                        type="text"
                        required
                        value={regOwnerName}
                        onChange={(e) => setRegOwnerName(e.target.value)}
                        placeholder={t('owner_name_placeholder')}
                        className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                      />
                    </div>
                    <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                      <input
                        type="email"
                        required
                        value={regOwnerEmail}
                        onChange={(e) => setRegOwnerEmail(e.target.value)}
                        placeholder={t('owner_email_placeholder')}
                        className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={regOwnerPassword}
                        onChange={(e) => setRegOwnerPassword(e.target.value)}
                        placeholder={t('password_min6')}
                        className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                      />
                    </div>
                    <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                      <input
                        type="tel"
                        value={regShopPhone}
                        onChange={(e) => setRegShopPhone(e.target.value)}
                        placeholder={t('contact_mobile')}
                        className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <input
                      type="text"
                      value={regShopAddress}
                      onChange={(e) => setRegShopAddress(e.target.value)}
                      placeholder={t('shop_address_placeholder')}
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-black via-zinc-900 to-black hover:from-zinc-900 hover:to-zinc-800 text-white font-bold tracking-widest text-xs uppercase py-3.5 rounded-2xl shadow-lg shadow-black/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 cursor-pointer"
                  >
                    <span>{submitting ? t('creating') : t('create_workspace_btn')}</span>
                  </button>
                </form>
              )}
            </div>

            {/* RIGHT COLUMN: STOREFRONT PHOTOGRAPHY (62% on desktop, hidden on mobile) */}
            <div id="gateway-visual" className="hidden md:block md:w-[58%] lg:w-[62%] md:min-h-[520px] bg-slate-950 relative overflow-hidden">
              <img
                id="gateway-visual-image"
                src="/images/hero-shop.jpg"
                alt="Electronics repair shop"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none"></div>
              <div className="absolute bottom-5 right-5 text-white/40 pointer-events-none text-2xl select-none">
                ✦
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* TRACK REPAIR PORTAL MODE                                 */}
        {/* Left Side: Image (62%) | Right Side: Auth Form (38%)     */}
        {/* ======================================================== */}
        {portal === 'track' && (
          <>
            {/* LEFT COLUMN: CUSTOMER PHOTOGRAPHY (62% on desktop, hidden on mobile) */}
            <div id="gateway-visual" className="hidden md:block md:w-[58%] lg:w-[62%] md:min-h-[520px] bg-slate-950 relative overflow-hidden order-2 md:order-1">
              <img
                id="gateway-visual-image"
                src="/images/hero-track.jpg"
                alt="Customer repair tracking"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none"></div>
              <div className="absolute bottom-5 left-5 text-white/40 pointer-events-none text-2xl select-none">
                ✦
              </div>
            </div>

            {/* RIGHT COLUMN: AUTH FORM (38% on desktop, full width on mobile) */}
            <div className="w-full md:w-[42%] lg:w-[38%] p-6 sm:p-8 flex flex-col justify-center border-b-0 md:border-l border-slate-100 bg-white relative transition-all duration-500 order-1 md:order-2">
              {renderPortalSelector()}

              <div className="mb-4">
                <h2 id="cust-auth-title" className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                  {t('track_title')}
                </h2>
                <p id="cust-auth-subtitle" className="text-xs text-slate-400 mt-1.5">
                  {t('track_subtitle')}
                </p>
              </div>

              {/* Sign In / Create Password Tabs */}
              <div id="cust-tabs-bar" className="flex items-center gap-5 border-b border-slate-100 pb-2 mb-5">
                <button
                  type="button"
                  id="cust-tab-signin-btn"
                  onClick={() => setCustAuthMode('login')}
                  className={`text-xs sm:text-sm font-bold pb-2 -mb-2.5 transition cursor-pointer ${
                    custAuthMode === 'login'
                      ? 'text-black border-b-2 border-black'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {t('nav_sign_in')}
                </button>
                <button
                  type="button"
                  id="cust-tab-register-btn"
                  onClick={() => setCustAuthMode('register')}
                  className={`text-xs sm:text-sm font-semibold pb-2 -mb-2.5 transition cursor-pointer ${
                    custAuthMode === 'register'
                      ? 'text-black border-b-2 border-black'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {t('create_set_password')}
                </button>
              </div>

              {/* 2A: CUSTOMER LOGIN FORM */}
              {custAuthMode === 'login' ? (
                <form id="cust-login-form" onSubmit={handleCustLoginSubmit} className="space-y-4">
                  {/* Phone Input with Phone Glyph */}
                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-3.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <input
                      type="tel"
                      id="cust-login-phone"
                      required
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      placeholder={t('enter_phone')}
                      className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none ml-3 font-medium"
                    />
                  </div>

                  {/* Password Input with Lock & Eye Reveal */}
                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-3.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type={showCustPassword ? 'text' : 'password'}
                      id="cust-login-password"
                      required
                      value={custPassword}
                      onChange={(e) => setCustPassword(e.target.value)}
                      placeholder={t('password_placeholder')}
                      className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none ml-3 font-medium tracking-wide"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustPassword(!showCustPassword)}
                      title="Show/Hide Password"
                      className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2 cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        {showCustPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        ) : (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">First time tracking?</span>
                    <button
                      type="button"
                      onClick={() => setCustAuthMode('register')}
                      className="text-black hover:text-zinc-700 font-bold transition cursor-pointer"
                    >
                      {t('create_set_password')} →
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-black via-zinc-900 to-black hover:from-zinc-900 hover:to-zinc-800 text-white font-bold tracking-widest text-xs uppercase py-3.5 rounded-2xl shadow-lg shadow-black/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    <span>{submitting ? 'VERIFYING...' : t('sign_in_track')}</span>
                  </button>
                </form>
              ) : (
                /* 2B: CUSTOMER CREATE / SET PASSWORD FORM */
                <form id="cust-register-form" onSubmit={handleCustRegisterSubmit} className="space-y-3">
                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <input
                      type="tel"
                      id="cust-reg-phone"
                      required
                      value={custRegPhone}
                      onChange={(e) => setCustRegPhone(e.target.value)}
                      placeholder={t('enter_phone')}
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <input
                      type="text"
                      id="cust-reg-name"
                      value={custRegName}
                      onChange={(e) => setCustRegName(e.target.value)}
                      placeholder={t('your_name')}
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition">
                    <input
                      type="password"
                      id="cust-reg-password"
                      required
                      minLength={6}
                      value={custRegPassword}
                      onChange={(e) => setCustRegPassword(e.target.value)}
                      placeholder={t('password_min6')}
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="bg-zinc-100 p-3 rounded-xl border border-zinc-200 text-[11px] text-zinc-800">
                    <span><strong>Secure Verified Access:</strong> Authenticate with your verified phone number to inspect your live repair milestones anytime.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-black via-zinc-900 to-black hover:from-zinc-900 hover:to-zinc-800 text-white font-bold tracking-widest text-xs uppercase py-3.5 rounded-2xl shadow-lg shadow-black/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 cursor-pointer"
                  >
                    <span>{submitting ? 'SETTING UP...' : t('set_password_track')}</span>
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
