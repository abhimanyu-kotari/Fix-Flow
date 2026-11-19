import React, { useState } from 'react';

export default function NewTicketModal({
  isOpen,
  onClose,
  onCreateTicket,
  onSubmit,
  staffList = [],
  showToast
}) {
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deviceCategory, setDeviceCategory] = useState('Smartphone');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const submitHandler = onCreateTicket || onSubmit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (submitHandler) {
        await submitHandler({
          customerPhone: phone.trim() || undefined,
          customerName: customerName.trim() || undefined,
          deviceCategory,
          brand: brand.trim() || undefined,
          model: model.trim() || undefined,
          issueDescription: issueDescription.trim() || undefined,
          estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
          assignedToUserId: assignedUserId || undefined
        });
      }
      // Reset form
      setPhone('');
      setCustomerName('');
      setDeviceCategory('Smartphone');
      setBrand('');
      setModel('');
      setIssueDescription('');
      setEstimatedCost('');
      setAssignedUserId('');
      onClose();
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">New Repair Intake</h3>
              <p className="text-xs text-slate-500">Fast counter entry with non-compulsory fields &amp; E.164 linking</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Informative Tip */}
        <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100 text-xs text-blue-800 flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span><strong>Fast Intake:</strong> Only customer phone is recommended for tracking. All other fields are optional.</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Mobile</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210 (optional)"
                className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-slate-900 shadow-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer (optional)"
                className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-slate-900 shadow-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={deviceCategory}
                onChange={(e) => setDeviceCategory(e.target.value)}
                className="w-full bg-white border border-slate-200/90 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition"
              >
                <option value="Smartphone">Smartphone</option>
                <option value="Laptop">Laptop</option>
                <option value="Tablet">Tablet</option>
                <option value="Smartwatch">Smartwatch</option>
                <option value="Audio">Audio / Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple"
                className="w-full bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 shadow-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. iPhone 14"
                className="w-full bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 shadow-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Issue Description</label>
            <textarea
              rows={2}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="e.g. Broken display, battery draining fast (defaults to General Inspection)"
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-slate-900 shadow-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Cost (₹)</label>
              <input
                type="number"
                min="0"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0"
                className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono font-bold shadow-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assign Technician</label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition"
              >
                <option value="">-- Unassigned (Counter Intake) --</option>
                {staffList.map((st) => (
                  <option key={st._id || st.id} value={st._id || st.id}>
                    {st.name} ({st.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-[#3B66D6] to-[#00A8FF] hover:from-[#3255B8] hover:to-[#0096E6] text-white font-bold tracking-wider text-xs uppercase py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Creating Ticket...' : 'Create Repair Ticket'}
          </button>
        </form>

      </div>
    </div>
  );
}
