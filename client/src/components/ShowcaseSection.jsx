import React, { useState } from 'react';

export default function ShowcaseSection({ onDemoLogin, onSwitchPortal }) {
  const [activeTab, setActiveTab] = useState('shop');

  return (
    <section id="showcase-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-[#0B0F17] via-[#111827] to-[#030712] rounded-[36px] p-8 sm:p-12 text-white overflow-hidden relative shadow-2xl border border-white/10">
        
        {/* Background glow */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-neutral-800/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Info */}
          <div className="lg:col-span-5 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-neutral-300 text-[11px] font-bold tracking-wider uppercase border border-white/10">
              <span>⚡ Dual-Portal Platform</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Built for Both Sides of the Repair Counter.
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Shop owners run high-velocity intake, assign technicians, and track revenue. Customers receive instant verification via OTP and follow their device repair live with full transparency.
            </p>
            
            <div className="pt-2 flex flex-wrap gap-3">
              <button 
                onClick={onDemoLogin} 
                className="bg-gradient-to-r from-zinc-800 to-black hover:from-black hover:to-zinc-800 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-lg shadow-black/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Launch Demo Workspace</span>
              </button>
              <button 
                onClick={() => {
                  onSwitchPortal('track');
                  const el = document.getElementById('public-portal-gateway');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-3 px-5 rounded-2xl border border-white/20 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                </svg>
                <span>Test Customer Tracking</span>
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
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeTab === 'shop' ? 'bg-white text-black shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Shop Queue
                </button>
                <button 
                  onClick={() => setActiveTab('cust')} 
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeTab === 'cust' ? 'bg-white text-black shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Customer Stepper
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
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">In Progress</span>
                    <div className="text-xs font-mono font-bold text-emerald-600 mt-0.5">₹4,500</div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">#FF-1002</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Pooja Nair • MacBook Air M2</div>
                      <div className="text-[11px] text-slate-500">Tech: Priya • Battery replacement</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>
                    <div className="text-xs font-mono font-bold text-emerald-600 mt-0.5">₹6,800</div>
                  </div>
                </div>
              </div>
            )}

            {/* Showcase View B: Customer 5-Stage Stepper Preview */}
            {activeTab === 'cust' && (
              <div className="mt-4 space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                    <span>Device: iPhone 14 Pro</span>
                    <span className="text-blue-600 font-mono">Stage 3 of 5</span>
                  </div>
                  {/* Stepper Bar */}
                  <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold">
                    <div className="bg-emerald-500 text-white py-1 rounded-md">Received ✓</div>
                    <div className="bg-emerald-500 text-white py-1 rounded-md">Diagnosing ✓</div>
                    <div className="bg-blue-600 text-white py-1 rounded-md animate-pulse">Repairing</div>
                    <div className="bg-slate-200 text-slate-500 py-1 rounded-md">Ready</div>
                    <div className="bg-slate-200 text-slate-500 py-1 rounded-md">Delivered</div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-[11px] text-blue-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Assigned Technician: <strong>Ramesh (+91 98765 00000)</strong></span>
                  </span>
                  <span className="font-bold text-blue-600">Direct Call Link</span>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
