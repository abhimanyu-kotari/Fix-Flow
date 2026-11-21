import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function ShowcaseSection({ onDemoLogin, onTryDemo, onSwitchPortal }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('shop');
  const launchDemo = onDemoLogin || onTryDemo;

  return (
    <section id="showcase-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-[#0B0F17] via-[#111827] to-[#030712] rounded-[36px] p-8 sm:p-12 text-white overflow-hidden relative shadow-2xl border border-white/10">
        
        {/* Background glow */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-neutral-800/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Info */}
          <div className="lg:col-span-5 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-neutral-300 text-[11px] font-bold tracking-wider uppercase border border-white/10">
              <span>{t('showcase_badge')}</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {t('showcase_title')}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {t('showcase_desc')}
            </p>
            
            <div className="pt-2 flex flex-wrap gap-3">
              <button 
                onClick={launchDemo} 
                className="bg-gradient-to-r from-zinc-800 to-black hover:from-black hover:to-zinc-800 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-lg shadow-black/30 transition transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{t('launch_demo')}</span>
              </button>
              <button 
                onClick={() => {
                  if (onSwitchPortal) onSwitchPortal('track');
                  const el = document.getElementById('public-portal-gateway');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-3 px-5 rounded-2xl border border-white/20 transition flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{t('track_demo')}</span>
              </button>
            </div>
          </div>

          {/* Right Visual Mockup Card */}
          <div className="lg:col-span-7 bg-white/95 text-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/20 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-xs font-mono font-bold text-slate-400 ml-2">FixFlow Live Experience</span>
              </div>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                <button 
                  onClick={() => setActiveTab('shop')} 
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    activeTab === 'shop' ? 'bg-white text-black shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('preview_shop_tab')}
                </button>
                <button 
                  onClick={() => setActiveTab('cust')} 
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    activeTab === 'cust' ? 'bg-white text-black shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('preview_track_tab')}
                </button>
              </div>
            </div>

            {/* Showcase View A: Shop Queue Preview */}
            {activeTab === 'shop' && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">#FF-1001</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Rahul Sharma • iPhone 14 Pro</div>
                      <div className="text-[11px] text-slate-500">Tech: Ramesh (Assigned) • Broken OLED Panel</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{t('status_in_progress')}</span>
                    <div className="text-xs font-mono font-bold text-emerald-600 mt-0.5">₹4,500</div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">#FF-1002</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Pooja Patel • MacBook Air M2</div>
                      <div className="text-[11px] text-slate-500">Tech: Anita (Assigned) • Battery Replacement</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">{t('status_diagnosing')}</span>
                    <div className="text-xs font-mono font-bold text-emerald-600 mt-0.5">₹7,200</div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">#FF-1003</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Vikram Singh • Samsung Galaxy S23</div>
                      <div className="text-[11px] text-slate-500">Tech: Ramesh (Assigned) • USB-C Port Replaced</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{t('status_completed')}</span>
                    <div className="text-xs font-mono font-bold text-emerald-600 mt-0.5">₹1,800</div>
                  </div>
                </div>
              </div>
            )}

            {/* Showcase View B: Customer Stepper Preview */}
            {activeTab === 'cust' && (
              <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">#FF-1001</span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1">Apple iPhone 14 Pro</h5>
                    <p className="text-[11px] text-slate-500">Apex Repair Hub • Brigade Road Branch</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900">₹4,500</span>
                    <div className="text-[10px] text-slate-400 font-medium">Estimated Total</div>
                  </div>
                </div>

                {/* Stepper Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span className="text-emerald-600">{t('cp_intake')}</span>
                    <span className="text-emerald-600">{t('cp_diagnosis')}</span>
                    <span className="text-emerald-600 font-black">{t('cp_in_repair')}</span>
                    <span>{t('cp_ready_pickup')}</span>
                    <span>{t('cp_delivered')}</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/60 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-medium text-slate-700">Display panel in final testing on workbench</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">14 mins ago</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
