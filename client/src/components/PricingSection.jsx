import React from 'react';

export default function PricingSection({ onSwitchPortal, onSelectPlan, currentPlanId, onSwitchPlan, shopToken }) {
  const plans = [
    {
      id: 'free',
      name: 'Free Forever',
      badge: 'Free Forever',
      price: '₹0',
      period: '/mo',
      desc: 'Ideal for solo repairers and single-counter shops.',
      features: [
        'Up to 30 Repair Tickets/mo',
        '1 Owner Account',
        'FixFlow Track Customer Portal'
      ],
      popular: false
    },
    {
      id: 'starter',
      name: 'Starter',
      badge: 'Starter',
      price: '₹199',
      period: '/mo',
      desc: 'Perfect for small repair shops adding apprentices & technicians.',
      features: [
        'Unlimited Repair Tickets',
        'Up to 3 Staff Accounts (RBAC)',
        'Basic Performance Reports',
        'SMS Status Alerts'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      badge: 'Pro',
      price: '₹499',
      period: '/mo',
      desc: 'For busy repair businesses managing spare parts & warranties.',
      features: [
        'Unlimited Repair Tickets',
        'Up to 10 Staff Accounts',
        'Parts Inventory Management',
        'Customer Repair Passport (QR)',
        'Advanced Revenue Analytics'
      ],
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      badge: 'Business',
      price: '₹999',
      period: '/mo',
      desc: 'For multi-location repair enterprises & franchise chains.',
      features: [
        'Unlimited Repair Tickets',
        'Up to 5 Shop Branches',
        'Up to 25 Staff Accounts',
        'Cross-Branch Customer CRM',
        'Priority 24/7 SLA Support'
      ],
      popular: false
    }
  ];

  const handleAction = (planId) => {
    if (shopToken && onSwitchPlan) {
      onSwitchPlan(planId);
      return;
    }
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
    if (onSwitchPortal) {
      onSwitchPortal('shop');
    }
    const el = document.getElementById('public-portal-gateway');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-black">Transparent Subscriptions</span>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Start Free, Scale as You Grow</h3>
        <p className="text-slate-500 text-xs sm:text-sm mt-1.5">Flexible plans for independent repair shops to multi-branch enterprises.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          return (
            <div 
              key={plan.id}
              className={`bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between relative ${
                plan.popular ? 'border-2 border-black shadow-md' : 'border border-slate-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-6 bg-black text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-xs">
                  Popular
                </span>
              )}

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-black">
                  {plan.badge}
                </span>
                <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
                  {plan.price} <span className="text-xs font-sans text-slate-400 font-normal">{plan.period}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">{plan.desc}</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                type="button"
                onClick={() => handleAction(plan.id)}
                disabled={isCurrent}
                className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition ${
                  isCurrent 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : 'bg-black hover:bg-zinc-800 text-white cursor-pointer'
                }`}
              >
                {isCurrent ? 'Current Plan' : (plan.id === 'free' ? 'Get Started Free' : `Upgrade to ${plan.name}`)}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
