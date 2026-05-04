import { useState, useEffect } from 'react';
import Icon from '../../../components/ui/Icon';
import { vendorApi } from '../vendorApi';

const VendorEarnings = () => {
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingPayments: 0,
    platformCommission: 0,
    currency: 'INR'
  });
  const [loading, setLoading] = useState(true);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    ifsc: '',
    upiId: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('vendorToken');
      const res = await vendorApi.getEarnings(token);
      if (res.success) {
        setEarnings(res.data);
      }
    } catch (err) {
      console.error('Error fetching earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBankUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('');
    try {
      const token = localStorage.getItem('vendorToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vendor/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bank: bankDetails })
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('success');
        setTimeout(() => {
           setShowBankModal(false);
           setSaveStatus('');
        }, 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-rose-400 border-t-transparent rounded-full"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculating your success...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Compact Header */}
      <div className="vendor-surface rounded-xl p-4 sm:p-5 relative overflow-hidden bg-[#FDF2F8] border border-rose-100 shadow-sm">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10" style={{
          background: 'radial-gradient(circle, #ed648f, transparent 70%)'
        }}></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ed648f]">Financials</p>
            <h2 className="text-lg font-black text-slate-900 mt-0.5 tracking-tight">Earnings Summary</h2>
          </div>
          <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm border border-rose-50">
             <Icon name="money" size="xs" />
          </div>
        </div>
      </div>

      {/* High Density Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Total Earnings', value: `₹${(earnings.totalEarnings || 0).toLocaleString()}`, sub: 'Lifetime Profit', icon: 'money', bg: '#FFF1F2', text: '#E11D48' },
          { label: 'Pending Payout', value: `₹${(earnings.pendingPayments || 0).toLocaleString()}`, sub: 'In Processing', icon: 'clock', bg: '#FFFBEB', text: '#D97706' },
          { label: 'Platform Fee', value: `₹${(earnings.platformCommission || 0).toLocaleString()}`, sub: '10% Service Charge', icon: 'chart', bg: '#F5F3FF', text: '#7C3AED' }
        ].map((stat) => (
          <div key={stat.label} className="vendor-surface rounded-2xl p-4 border border-black/5 shadow-sm transition-all hover:scale-[1.01]" style={{ backgroundColor: stat.bg }}>
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-lg bg-white/60 flex items-center justify-center shadow-sm" style={{ color: stat.text }}>
                <Icon name={stat.icon} size="xs" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-900/20">Realtime</span>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-900/40 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{stat.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="vendor-surface rounded-2xl p-6 bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <Icon name="chart" size="3xl" />
         </div>
         <div className="relative z-10">
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">Payout Policy</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-md">
               Earnings are processed every Tuesday. A standard 10% platform commission is deducted from each successful booking. Ensure your bank details are verified in the profile section to avoid payment delays.
            </p>
            <button 
               onClick={() => setShowBankModal(true)}
               className="mt-6 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-rose-900/20"
            >
               Verify Bank Account
            </button>
         </div>
      </div>

      {/* Bank Verification Modal */}
      {showBankModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
               <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Verify Bank Account</h3>
                  <button onClick={() => setShowBankModal(false)} className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                     <Icon name="plus" className="rotate-45" size="xs" />
                  </button>
               </div>
               <form onSubmit={handleBankUpdate} className="p-6 space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Account Holder Name</label>
                     <input 
                        required
                        type="text" 
                        value={bankDetails.accountName}
                        onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                        className="w-full h-11 rounded-xl bg-slate-50 border-0 px-4 text-[11px] font-bold focus:ring-1 ring-rose-200 transition-all"
                        placeholder="e.g. John Doe"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Account Number</label>
                     <input 
                        required
                        type="text" 
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                        className="w-full h-11 rounded-xl bg-slate-50 border-0 px-4 text-[11px] font-bold focus:ring-1 ring-rose-200 transition-all"
                        placeholder="0000 0000 0000"
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">IFSC Code</label>
                        <input 
                           required
                           type="text" 
                           value={bankDetails.ifsc}
                           onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value.toUpperCase()})}
                           className="w-full h-11 rounded-xl bg-slate-50 border-0 px-4 text-[11px] font-bold focus:ring-1 ring-rose-200 transition-all"
                           placeholder="SBIN0000..."
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">UPI ID (Optional)</label>
                        <input 
                           type="text" 
                           value={bankDetails.upiId}
                           onChange={(e) => setBankDetails({...bankDetails, upiId: e.target.value})}
                           className="w-full h-11 rounded-xl bg-slate-50 border-0 px-4 text-[11px] font-bold focus:ring-1 ring-rose-200 transition-all"
                           placeholder="name@upi"
                        />
                     </div>
                  </div>

                  <div className="pt-4">
                     {saveStatus === 'success' ? (
                        <div className="w-full h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-[11px] font-black uppercase tracking-widest animate-in slide-in-from-bottom-2">
                           Verification Initiated!
                        </div>
                     ) : (
                        <button 
                           disabled={isSaving}
                           type="submit"
                           className="w-full h-12 bg-[#9D174D] hover:bg-[#831843] text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                           {isSaving ? 'Connecting to Node...' : 'Submit for Verification'}
                        </button>
                     )}
                     {saveStatus === 'error' && (
                        <p className="text-[9px] font-bold text-rose-500 text-center mt-2 uppercase">Packet delivery failed. Try again.</p>
                     )}
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default VendorEarnings;
