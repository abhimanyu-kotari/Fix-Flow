import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ onSwitchPortal }) {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200/80 bg-white py-10 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-sm">
            FF
          </div>
          <span className="font-bold text-slate-800 text-sm">FixFlow SaaS</span>
          <span className="text-slate-400">• {t('brand_subtitle')} (MERN)</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            type="button"
            onClick={() => {
              onSwitchPortal('shop');
              const el = document.getElementById('public-portal-gateway');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="hover:text-black font-semibold transition cursor-pointer"
          >
            {t('shop_portal')}
          </button>
          <button 
            type="button"
            onClick={() => {
              onSwitchPortal('track');
              const el = document.getElementById('public-portal-gateway');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="hover:text-black font-semibold transition cursor-pointer"
          >
            {t('track_repair')}
          </button>
          <span>Protected by E.164 Privacy &amp; Anti-Enumeration</span>
        </div>
      </div>
    </footer>
  );
}
