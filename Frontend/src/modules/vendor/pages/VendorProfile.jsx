import { useState, useEffect } from 'react';
import { useVendorState } from '../useVendorState';
import { vendorApi } from '../vendorApi';
import { computeProfileCompletion } from '../vendorStore';
import Icon from '../../../components/ui/Icon';

const VendorProfile = () => {
  const { vendorState, updateVendorState, refreshData } = useVendorState();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showApprovedCelebration, setShowApprovedCelebration] = useState(false);
  
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

  // Profile breakdown logic
  const getBreakdown = () => {
    const info = (vendorState.businessName && vendorState.category && vendorState.city) ? 40 : 10;
    const payout = (vendorState.bank?.accountNumber) ? 20 : 0;
    const portfolio = (vendorState.portfolio?.length > 0) ? 30 : 5;
    const docs = (vendorState.documents?.idProof) ? 20 : 0;
    const reviews = (vendorState.reviews?.length > 0) ? 10 : 0;
    
    return [
      { label: 'Business Information', value: info, icon: 'store', color: 'indigo' },
      { label: 'Payout Information', value: payout, icon: 'money', color: 'emerald' },
      { label: 'Service & Portfolio', value: portfolio, icon: 'image', color: 'violet' },
      { label: 'Verification & Documents', value: docs, icon: 'shield', color: 'blue' },
      { label: 'Customer Reviews', value: reviews, icon: 'star', color: 'amber' }
    ];
  };

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [vendorState]);

  return (
    <div className="max-w-2xl mx-auto space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }

        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-active {
          opacity: 1;
          transform: translateY(0);
        }
        .section-box {
          background: #F8FAFF;
          border-radius: 1rem;
          padding: 1rem;
          border: 1px solid #E2E8F0;
        }
        .detail-card {
          background: white;
          border-radius: 0.6rem;
          padding: 0.85rem;
          border: 1px solid #F1F5F9;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);
        }
        .detail-label {
          font-size: 8px;
          font-weight: 800;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          margin-bottom: 0.2rem;
          display: block;
        }
        .detail-value {
          font-size: 13px;
          font-weight: 800;
          color: #0F172A;
          line-height: 1.1;
          letter-spacing: -0.01em;
        }
      `}</style>

      {/* Ultra-Compact Header Card */}
      <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex items-center justify-between gap-2.5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[7.5px] font-black uppercase tracking-wider text-[#7C3AED] bg-[#F5F3FF] px-1.5 py-0.5 rounded-sm">Management</span>
            <span className="text-[7.5px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm border border-emerald-100">Live</span>
          </div>
          <div>
            <h1 className="text-lg font-serif font-black text-slate-900 leading-none">Business Profile</h1>
            <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Verified Identity & Operational Details</p>
          </div>
        </div>
        
        <button 
          disabled={isSaving}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="h-8 px-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg flex items-center justify-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider transition-all active:scale-[0.97] shadow-md shadow-violet-100 disabled:opacity-50"
        >
          {isSaving ? (
            <Icon name="loader" size="xs" className="animate-spin" />
          ) : (
            <Icon name={isEditing ? 'check' : 'star'} size="xs" />
          )}
          {isSaving ? 'Saving...' : (isEditing ? 'Save' : 'Edit Business')}
        </button>
      </div>


      {/* Metrics Row (Ultra Compact with Darker Contrast) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#EEF2FF] rounded-xl p-2.5 border border-indigo-200 reveal-on-scroll">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[7.5px] font-black text-indigo-400 uppercase tracking-tighter">Strength</span>
            <div className="h-4.5 w-4.5 rounded-md bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Icon name="star" size="xs" />
            </div>
          </div>
          <h3 className="text-base font-black text-slate-900 font-serif leading-none">{completion}%</h3>
          <div className="h-0.5 w-full bg-indigo-100 rounded-full overflow-hidden mt-1.5">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${completion}%` }}></div>
          </div>
        </div>

        <div className="bg-[#ECFDF5] rounded-xl p-2.5 border border-emerald-200 reveal-on-scroll">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[7.5px] font-black text-emerald-500 uppercase tracking-tighter">Visibility</span>
            <div className="h-4.5 w-4.5 rounded-md bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
              <Icon name="chart" size="xs" />
            </div>
          </div>
          <h3 className="text-[11px] font-black text-slate-900 font-serif leading-tight">Optimization</h3>
          <div className="flex items-center gap-1 mt-0.5">
             <div className="h-1 w-1 rounded-full bg-emerald-600"></div>
             <span className="text-[7.5px] font-black text-emerald-700 uppercase">Live</span>
          </div>
        </div>

        {vendorState.status === 'Approved' ? (
          <div 
            onClick={() => setShowApprovedCelebration(true)}
            className="relative overflow-hidden rounded-xl p-2.5 border border-emerald-200 bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] reveal-on-scroll transition-all duration-500 hover:shadow-[0_8px_30px_rgb(209,250,229,0.4)] group flex flex-col justify-between cursor-pointer active:scale-[0.98]"
          >
            <style>{`
              @keyframes bounceMini {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
              }
              .animate-bounce-mini {
                animation: bounceMini 2s infinite ease-in-out;
              }
            `}</style>
            <div className="absolute top-0 right-0 h-8 w-8 bg-emerald-400/10 rounded-full blur-md pointer-events-none group-hover:scale-150 transition-all duration-700"></div>
            
            <div className="flex items-center justify-between mb-0.5 relative z-10">
              <span className="text-[7.5px] font-black text-emerald-600 uppercase tracking-tighter animate-pulse">Status</span>
              <div className="h-4.5 w-4.5 rounded-md bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50 animate-bounce-mini flex-shrink-0">
                <Icon name="check" size="xs" />
              </div>
            </div>
            
            <div>
              <h3 className="text-[11px] font-black text-emerald-950 font-serif leading-tight uppercase relative z-10">
                {vendorState.status}
              </h3>
              <p className="text-[7.5px] font-black text-emerald-700 uppercase mt-0.5 relative z-10 tracking-wider flex items-center gap-1">
                 <span className="relative flex h-1.5 w-1.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                 </span>
                 Portal Verified
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#FFF7ED] rounded-xl p-2.5 border border-orange-200 reveal-on-scroll flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[7.5px] font-black text-orange-400 uppercase tracking-tighter">Status</span>
              <div className="h-4.5 w-4.5 rounded-md bg-white flex items-center justify-center text-orange-600 shadow-sm border border-orange-100 flex-shrink-0">
                <Icon name="clock" size="xs" />
              </div>
            </div>
            <div>
              <h3 className="text-[11px] font-black text-slate-900 font-serif leading-tight uppercase">{vendorState.status || 'Pending'}</h3>
              <p className="text-[7.5px] font-black text-orange-700 uppercase mt-0.5">Needs Action</p>
            </div>
          </div>
        )}
      </div>

      {/* Section 01: Business Overview (Refined - Image 2 Style) */}
      <div className="section-box !bg-[#F8FAFF] !p-3 reveal-on-scroll">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-sm">
              <Icon name="store" size="xs" />
            </div>
            <h2 className="text-[12px] font-sans font-semibold text-slate-800 tracking-tight">Business Overview</h2>
          </div>
          <span className="text-[7.5px] font-medium text-indigo-400 uppercase tracking-widest">Section 01</span>
        </div>

        <div className="space-y-1">
          <div className="detail-card !p-2">
            <label className="detail-label !text-[7px] !font-medium">Legal Business Name</label>
            {isEditing ? (
              <input className="w-full bg-slate-50 border-none rounded-md px-2 py-0.5 text-[11.5px] font-medium text-slate-900 outline-none" value={tempProfile.businessName} onChange={(e) => handleChange('businessName', e.target.value)} />
            ) : (
              <p className="detail-value !text-[11.5px] !font-semibold !text-slate-700">{tempProfile.businessName || 'Not Provided'}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1">
            <div className="detail-card !p-2">
              <label className="detail-label !text-[7px] !font-medium">Operating Category</label>
              <p className="detail-value !text-[11.5px] !font-semibold !text-slate-700">{tempProfile.category || 'N/A'}</p>
            </div>
            <div className="detail-card !p-2">
              <label className="detail-label !text-[7px] !font-medium">Base City</label>
              <p className="detail-value !text-[11.5px] !font-semibold !text-slate-700">{tempProfile.city || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <div className="detail-card !p-2">
              <label className="detail-label !text-[7px] !font-medium">Exp. (Years)</label>
              <p className="detail-value !text-[11.5px] !font-semibold !text-slate-700">{tempProfile.businessDetails.years || '0'} Years</p>
            </div>
            <div className="detail-card !p-2">
              <label className="detail-label !text-[7px] !font-medium">Core Team Size</label>
              <p className="detail-value !text-[11.5px] !font-semibold !text-slate-700">{tempProfile.businessDetails.teamSize || '1'} Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 02: Payout Information */}
      <div className="section-box !bg-[#F1FCF8] !border-[#DCFCE7] !p-3 reveal-on-scroll">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Icon name="money" size="xs" />
            </div>
            <h2 className="text-[12px] font-sans font-semibold text-slate-800 tracking-tight">Payout Information</h2>
          </div>
          <span className="text-[7.5px] font-medium text-emerald-500 uppercase tracking-widest">Section 02</span>
        </div>

        <div className="space-y-1">
          <div className="detail-card !p-2">
            <label className="detail-label !text-[7px] !font-medium">Settlement Account Name</label>
            <p className="detail-value !text-[11.5px] !font-semibold !text-slate-700">{tempProfile.bank.accountName || 'Not Set'}</p>
          </div>

          <div className="detail-card !p-2">
            <label className="detail-label !text-[7px] !font-medium">Bank Account Number</label>
            <p className="detail-value !text-[11.5px] !font-semibold !text-slate-700 tracking-wider">{tempProfile.bank.accountNumber || 'Not Set'}</p>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <div className="detail-card !p-2">
              <label className="detail-label !text-[7px] !font-medium">IFSC Routing Code</label>
              <p className="detail-value !text-[11.5px] !font-semibold !text-slate-700">{tempProfile.bank.ifsc || 'Not Set'}</p>
            </div>
            <div className="detail-card !p-2">
              <label className="detail-label !text-[7px] !font-medium">UPI ID for Quick Payout</label>
              <p className="detail-value !text-[11.5px] !font-semibold !text-indigo-600 lowercase">{tempProfile.bank.upiId || 'Not Set'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Strength Breakdown (Refined - Medium Weight) */}
      <div className="section-box !bg-white !p-4 border-slate-100 reveal-on-scroll">
        <div className="flex items-center justify-between mb-4 px-0.5">
          <h2 className="text-[14px] font-sans font-bold text-slate-800 tracking-tight">Profile Strength Breakdown</h2>
          <span className="text-[7.5px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">{completion}% Complete</span>
        </div>

        <div className="space-y-3">
          {getBreakdown().map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-6 w-6 rounded-md bg-${item.color}-50/50 flex items-center justify-center text-${item.color}-500 border border-${item.color}-100/50`}>
                    <Icon name={item.icon} size="xs" />
                  </div>
                  <span className="text-[12px] font-medium text-slate-500 tracking-normal">{item.label}</span>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-[11px] font-semibold text-slate-700 w-8 text-right">{item.value}%</span>
                   <div className="h-1 w-28 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                    <div 
                      className="h-full bg-violet-500 rounded-full transition-all duration-1000 delay-200" 
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Celebration Popup Modal */}
      {showApprovedCelebration && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => setShowApprovedCelebration(false)}
          ></div>
          <div className="relative w-full max-w-sm bg-gradient-to-b from-white to-emerald-50/10 rounded-2xl border border-emerald-100 shadow-2xl p-6 overflow-hidden text-center animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center">
            {/* Spinning decorative background */}
            <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute inset-0 border border-dashed border-emerald-300/40 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
              <div className="h-16 w-16 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 relative z-10 scale-in duration-500">
                <Icon name="check" size="lg" />
              </div>
            </div>

            <h3 className="text-[17px] font-sans font-black text-slate-800 tracking-tight leading-tight">
              Portal Verified & Approved
            </h3>
            <p className="text-[10.5px] font-sans font-medium text-slate-500 mt-2 max-w-[280px] leading-relaxed">
              Congratulations! Your business is officially verified and approved by the WedMeGood editorial team. You now enjoy maximum operational perks:
            </p>

            <div className="mt-4 w-full bg-white/80 rounded-xl p-3 border border-slate-100 space-y-2.5 text-left">
              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-700">
                <span className="h-4 w-4 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 flex-shrink-0 text-[8px]">✓</span>
                <span>Verified Badge on Live Listing</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-700">
                <span className="h-4 w-4 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 flex-shrink-0 text-[8px]">✓</span>
                <span>Priority in Search Results & Filters</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-700">
                <span className="h-4 w-4 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 flex-shrink-0 text-[8px]">✓</span>
                <span>Unlimited Customer Quote Requests</span>
              </div>
            </div>

            <button 
              onClick={() => setShowApprovedCelebration(false)} 
              className="mt-5 w-full h-9 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md hover:bg-emerald-700 active:scale-[0.98] transition-all"
            >
              Great
            </button>
          </div>
        </div>
      )}
      {/* Sign Out Card */}
      <div className="section-box !bg-rose-50/40 !border-rose-100/60 !p-3 flex items-center justify-between gap-3 reveal-on-scroll">
        <div className="space-y-0.5">
          <h2 className="text-[11.5px] font-sans font-bold text-slate-800 tracking-tight">Active Session</h2>
          <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Securely sign out of your Utsavo Vendor portal</p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('vendorToken');
            window.location.href = '/vendor/login';
          }}
          className="h-8 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-lg flex items-center justify-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider transition-all active:scale-[0.97] shadow-md shadow-rose-100/50"
        >
          <Icon name="logout" size="xs" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default VendorProfile;
