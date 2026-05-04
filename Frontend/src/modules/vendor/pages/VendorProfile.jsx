import { useState, useEffect } from 'react';
import { useVendorState } from '../useVendorState';
import { vendorApi } from '../vendorApi';
import { computeProfileCompletion } from '../vendorStore';
import Icon from '../../../components/ui/Icon';

const VendorProfile = () => {
  const { vendorState, updateVendorState, refreshData } = useVendorState();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [tempProfile, setTempProfile] = useState({ 
    fullName: '',
    businessName: '',
    category: '',
    city: '',
    phone: '',
    businessDetails: {
      years: '',
      teamSize: '',
      description: ''
    },
    bank: {
      accountName: '',
      accountNumber: '',
      ifsc: '',
      upiId: ''
    }
  });

  useEffect(() => {
    if (vendorState) {
      setTempProfile({
        fullName: vendorState.fullName || '',
        businessName: vendorState.businessName || '',
        category: vendorState.category || '',
        city: vendorState.city || '',
        phone: vendorState.phone || '',
        businessDetails: {
          years: vendorState.businessDetails?.years || '',
          teamSize: vendorState.businessDetails?.teamSize || '',
          description: vendorState.businessDetails?.description || ''
        },
        bank: {
          accountName: vendorState.bank?.accountName || '',
          accountNumber: vendorState.bank?.accountNumber || '',
          ifsc: vendorState.bank?.ifsc || '',
          upiId: vendorState.bank?.upiId || ''
        }
      });
    }
  }, [vendorState]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('vendorToken');
      const res = await vendorApi.updateProfile(tempProfile, token);
      if (res.success) {
        updateVendorState(res.data);
        setIsEditing(false);
        refreshData();
      } else {
        alert(res.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Network error while saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (path, value) => {
    const keys = path.split('.');
    if (keys.length === 1) {
      setTempProfile(prev => ({ ...prev, [keys[0]]: value }));
    } else {
      setTempProfile(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value
        }
      }));
    }
  };

  const completion = computeProfileCompletion(vendorState);

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-0">
      {/* Header */}
      <div className="vendor-surface rounded-xl p-4 sm:p-6 relative overflow-hidden bg-white border border-rose-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed648f]">Management</p>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Business Profile</h2>
            <p className="text-xs font-bold text-slate-500 mt-1">Verified details & credentials</p>
          </div>
          <button 
            disabled={isSaving}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="vendor-cta rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-100 active:scale-95 transition-all disabled:opacity-50"
          >
            <Icon name={isSaving ? 'loader' : (isEditing ? 'check' : 'edit')} size="xs" className={isSaving ? 'animate-spin' : ''} />
            {isSaving ? 'Saving...' : (isEditing ? 'Save Profile' : 'Edit Profile')}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* Card 1: Business Overview */}
        <div className="vendor-surface rounded-2xl p-5 relative overflow-hidden border border-rose-100/50 shadow-sm transition-all" style={{ backgroundColor: '#FFF1F2' }}>
           <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-[#ed648f] shadow-sm">
                 <Icon name="store" size="sm" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Business Info</h3>
           </div>
           
           <div className="space-y-4">
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-slate-900/30 uppercase tracking-widest">Business Name</p>
                 {isEditing ? (
                   <input className="w-full bg-white/60 border border-rose-200 rounded-lg px-3 py-1.5 text-xs font-black" value={tempProfile.businessName} onChange={(e) => handleChange('businessName', e.target.value)} />
                 ) : (
                   <p className="text-sm font-black text-slate-900 truncate">{tempProfile.businessName || 'Not Set'}</p>
                 )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-900/30 uppercase tracking-widest">Category</p>
                    <p className="text-[11px] font-black text-slate-900 truncate">{tempProfile.category || 'Not Set'}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-900/30 uppercase tracking-widest">City</p>
                    {isEditing ? (
                      <input className="w-full bg-white/60 border border-rose-200 rounded-lg px-3 py-1.5 text-xs font-black" value={tempProfile.city} onChange={(e) => handleChange('city', e.target.value)} />
                    ) : (
                      <p className="text-[11px] font-black text-slate-900 truncate">{tempProfile.city || 'Not Set'}</p>
                    )}
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-900/30 uppercase tracking-widest">Experience (Yrs)</p>
                    {isEditing ? (
                      <input className="w-full bg-white/60 border border-rose-200 rounded-lg px-3 py-1.5 text-xs font-black" value={tempProfile.businessDetails.years} onChange={(e) => handleChange('businessDetails.years', e.target.value)} />
                    ) : (
                      <p className="text-[11px] font-black text-slate-900">{tempProfile.businessDetails.years || '0'}</p>
                    )}
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-900/30 uppercase tracking-widest">Team Size</p>
                    {isEditing ? (
                      <input className="w-full bg-white/60 border border-rose-200 rounded-lg px-3 py-1.5 text-xs font-black" value={tempProfile.businessDetails.teamSize} onChange={(e) => handleChange('businessDetails.teamSize', e.target.value)} />
                    ) : (
                      <p className="text-[11px] font-black text-slate-900">{tempProfile.businessDetails.teamSize || '1'}</p>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Card 2: Bank Details */}
        <div className="vendor-surface rounded-2xl p-5 relative overflow-hidden border border-blue-100/50 shadow-sm transition-all" style={{ backgroundColor: '#F0F9FF' }}>
           <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm">
                 <Icon name="card" size="sm" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Bank Details</h3>
           </div>
           
           <div className="space-y-4">
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-slate-900/30 uppercase tracking-widest">Account Name</p>
                 {isEditing ? (
                   <input className="w-full bg-white/60 border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-black" value={tempProfile.bank.accountName} onChange={(e) => handleChange('bank.accountName', e.target.value)} />
                 ) : (
                   <p className="text-sm font-black text-slate-900 truncate">{tempProfile.bank.accountName || 'Not Set'}</p>
                 )}
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-slate-900/30 uppercase tracking-widest">Account Number</p>
                 {isEditing ? (
                   <input className="w-full bg-white/60 border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-black" value={tempProfile.bank.accountNumber} onChange={(e) => handleChange('bank.accountNumber', e.target.value)} />
                 ) : (
                   <p className="text-sm font-black text-slate-900 truncate">{tempProfile.bank.accountNumber || 'Not Set'}</p>
                 )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-900/30 uppercase tracking-widest">IFSC Code</p>
                    {isEditing ? (
                      <input className="w-full bg-white/60 border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-black" value={tempProfile.bank.ifsc} onChange={(e) => handleChange('bank.ifsc', e.target.value)} />
                    ) : (
                      <p className="text-[11px] font-black text-slate-900">{tempProfile.bank.ifsc || 'Not Set'}</p>
                    )}
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-900/30 uppercase tracking-widest">UPI ID</p>
                    {isEditing ? (
                      <input className="w-full bg-white/60 border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-black" value={tempProfile.bank.upiId} onChange={(e) => handleChange('bank.upiId', e.target.value)} />
                    ) : (
                      <p className="text-[11px] font-black text-rose-500 truncate">{tempProfile.bank.upiId || 'Not Set'}</p>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Card 3: Strength */}
        <div className="vendor-surface rounded-2xl p-5 relative overflow-hidden border border-purple-100/50 shadow-sm transition-all" style={{ backgroundColor: '#F5F3FF' }}>
           <div className="flex items-center justify-between mb-5">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-purple-600 shadow-sm">
                 <Icon name="star" size="sm" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/60 rounded-lg text-purple-600 border border-purple-100">Live Rating</span>
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest mb-1">Profile Strength</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">{completion}%</h3>
              <div className="h-2 w-full bg-white/60 rounded-full overflow-hidden">
                 <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${completion}%` }}></div>
              </div>
              <p className="text-[9px] font-bold text-slate-500 mt-3 italic leading-tight">
                {completion < 100 ? 'Complete all details for 100% verification.' : 'Your profile is fully optimized!'}
              </p>
           </div>
        </div>

        {/* Card 4: Verification */}
        <div className="vendor-surface rounded-2xl p-5 relative overflow-hidden border border-orange-100/50 shadow-sm transition-all" style={{ backgroundColor: '#FFF7ED' }}>
           <div className="flex items-center justify-between mb-5">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-orange-600 shadow-sm">
                 <Icon name="check" size="sm" />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/60 rounded-lg border ${vendorState.status === 'Approved' ? 'text-emerald-600 border-emerald-100' : 'text-orange-600 border-orange-100'}`}>
                {vendorState.status}
              </span>
           </div>
           <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest mb-1">Credential Status</p>
              <div className="grid grid-cols-2 gap-2">
                 {[
                   { name: 'ID Proof', status: !!vendorState.documents?.idProof },
                   { name: 'GST Cert', status: !!vendorState.documents?.gst },
                   { name: 'Contract', status: !!vendorState.documents?.contract }
                 ].map(doc => (
                   <div key={doc.name} className="bg-white/40 rounded-xl px-3 py-2 border border-orange-100/50 flex items-center gap-2">
                      <Icon name="check" size="xs" color={doc.status ? "#10b981" : "#cbd5e1"} />
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight">{doc.name}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Card 5: Visibility */}
        <div className="vendor-surface rounded-2xl p-5 relative overflow-hidden border border-emerald-100/50 shadow-sm transition-all" style={{ backgroundColor: '#F0FDF4' }}>
           <div className="flex items-center justify-between mb-5">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                 <Icon name="stats" size="sm" />
              </div>
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest mb-1">Market Visibility</p>
              <h3 className="text-xl font-black text-slate-900 truncate">
                {completion > 80 ? 'High Visibility' : (completion > 50 ? 'Moderate' : 'Low Visibility')}
              </h3>
              <div className="flex items-center gap-2 mt-3">
                 <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${completion > 50 ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                 <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Active Ranking</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default VendorProfile;
