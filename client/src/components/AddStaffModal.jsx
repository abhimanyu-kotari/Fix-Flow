import React, { useState } from 'react';

export default function AddStaffModal({ isOpen, onClose, onAddStaff, showToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TECHNICIAN');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAddStaff({ name, email, password, role });
      setName('');
      setEmail('');
      setPassword('');
      setRole('TECHNICIAN');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Invite Staff Member</h3>
              <p className="text-xs text-slate-500">Assign technician or manager credentials</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              placeholder="Staff Name" 
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-slate-900 shadow-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="technician@shop.com" 
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-slate-900 shadow-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••" 
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-slate-900 shadow-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Role & Permissions</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-slate-900 shadow-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition font-bold"
            >
              <option value="TECHNICIAN">Technician (Update tickets & view status)</option>
              <option value="STAFF">Desk Staff (Intake & customer management)</option>
              <option value="MANAGER">Shop Manager (Full workspace access)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-gradient-to-r from-[#3B66D6] to-[#00A8FF] hover:from-[#3255B8] hover:to-[#0096E6] text-white font-bold tracking-wider text-xs uppercase py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-2 disabled:opacity-50"
          >
            {submitting ? 'Creating Staff Account...' : 'Create Staff Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
