import React from 'react';

export default function FeaturesSection() {
  return (
    <section id="features-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-xs font-bold uppercase tracking-wider text-black">Built for Independent Repairers & Franchises</h2>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-1.5">Everything Your Shop Needs to Scale</h3>
        <p className="text-slate-500 text-xs sm:text-sm mt-2">Replace clumsy spreadsheets, lost receipts, and constant customer phone calls.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pillar 1 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-slate-900">10-Second Intake</h4>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Non-compulsory fields with smart fallbacks. Assign technicians by name or mobile number with zero friction.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-slate-900">Zero-Password OTP</h4>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Customers verify by mobile phone. Salted SHA-256 storage, 60s cooldown, and anti-enumeration privacy protection.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-slate-900">E.164 Global CRM</h4>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            One global customer phone identity deduplicated across shops, while keeping tenant repair notes strictly private.
          </p>
        </div>

        {/* Pillar 4 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-slate-900">Audit & Dual Delete</h4>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Append-only service milestones. Both shop owners and customers can delete or cancel tickets with instant updates.
          </p>
        </div>
      </div>
    </section>
  );
}
