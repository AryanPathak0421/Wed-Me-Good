import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import { useVendorState } from '../useVendorState';
import { vendorApi } from '../vendorApi';
import { adminApi } from '../../admin/services/adminApi';

import loginImg from '../../../assets/login (2).png';

const VendorRegister = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const { vendorState, updateVendorState } = useVendorState();
  const [formState, setFormState] = useState({
    fullName: vendorState?.registration?.fullName || '',
    businessName: vendorState?.registration?.businessName || '',
    email: vendorState?.registration?.email || '',
    phone: vendorState?.registration?.phone || '',
    city: vendorState?.registration?.city || '',
    category: vendorState?.registration?.category || '',
    password: vendorState?.registration?.password || '',
    emailOtp: '',
    phoneOtp: ''
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await adminApi.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error("Categories fetch failed", err);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (field, value) => {
    const updated = { ...formState, [field]: value };
    setFormState(updated);
    updateVendorState({ registration: updated });
  };

  const requiredFields = ['fullName', 'businessName', 'email', 'phone', 'city', 'category', 'password', 'emailOtp', 'phoneOtp'];
  const progressCount = requiredFields.filter(f => formState[f] && formState[f].length > 0).length;
  const progressPercent = Math.round((progressCount / 9) * 100);

  return (
    <div className="relative overflow-hidden py-4 px-1" style={{ background: 'transparent' }}>
      <div className="max-w-2xl mx-auto py-2 px-1">
        <div className="rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(237,100,143,0.2)] relative overflow-hidden vendor-surface" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(237, 100, 143, 0.1)'
        }}>
          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[2.5rem]" style={{
            background: 'linear-gradient(90deg, #ed648f, #f182a5, #f4a0bb, #ed648f)',
            backgroundSize: '200% 100%',
            animation: 'gradient-shift 4s ease infinite'
          }}></div>

          <div className="text-center mb-4">
            <div className="inline-flex h-16 sm:h-24 w-auto items-center justify-center mb-3 transition-all duration-500 hover:scale-110">
              <img src={loginImg} alt="Branding" className="h-full w-auto rounded-2xl" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight drop-shadow-md">Vendor Registration</h2>
          </div>

          <div className="mb-4 p-4 sm:p-5 rounded-2xl" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(237, 100, 143, 0.15)',
            boxShadow: '0 4px 15px rgba(237, 100, 143, 0.05)'
          }}>
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#1e293b' }}>
              <span>Onboarding Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(237, 100, 143, 0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #ed648f, #da4f7a, #c43e69)'
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>Full name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors" style={{ color: '#64748b' }}>
                  <Icon name="user" size="sm" color="current" />
                </div>
                <input
                  autoFocus
                  className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold transition-all focus:ring-2 focus:ring-rose-500/20 outline-none"
                  style={{ border: '1px solid rgba(237, 100, 143, 0.15)', background: 'rgba(255, 255, 255, 0.95)' }}
                  value={formState.fullName}
                  onChange={(event) => handleChange('fullName', event.target.value.replace(/[^a-zA-Z ]/g, ''))}
                  placeholder="e.g. Aditi Kapoor"
                />
              </div>
            </div>

            {/* Business Name */}
            {formState.fullName.length > 2 && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>Business name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors" style={{ color: '#64748b' }}>
                    <Icon name="store" size="sm" color="current" />
                  </div>
                  <input
                    className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold transition-all focus:ring-2 focus:ring-rose-500/20 outline-none"
                    style={{ border: '1px solid rgba(237, 100, 143, 0.15)', background: 'rgba(255, 255, 255, 0.95)' }}
                    value={formState.businessName}
                    onChange={(event) => handleChange('businessName', event.target.value)}
                    placeholder="e.g. Emerald Studio"
                  />
                </div>
              </div>
            )}

            {/* Email & OTP */}
            {formState.businessName.length > 2 && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>Email address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors" style={{ color: '#64748b' }}>
                    <Icon name="envelope" size="sm" color="current" />
                  </div>
                  <input
                    type="email"
                    className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold transition-all focus:ring-2 focus:ring-rose-500/20 outline-none"
                    style={{ border: '1px solid rgba(237, 100, 143, 0.15)', background: 'rgba(255, 255, 255, 0.95)' }}
                    value={formState.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    placeholder="hello@emeraldstudio.in"
                  />
                </div>
                {/* OTP UI Simplified */}
                {formState.email.includes('@') && (
                  <div className="flex gap-2 mt-2">
                    <input
                      maxLength="4"
                      className="flex-1 rounded-xl px-4 py-3 text-sm font-bold tracking-widest border-rose-100 border outline-none"
                      value={formState.emailOtp}
                      onChange={(e) => handleChange('emailOtp', e.target.value)}
                      placeholder="0000"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Phone & OTP */}
            {formState.emailOtp === '0000' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>Phone number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors" style={{ color: '#64748b' }}>
                    <Icon name="phone" size="sm" color="current" />
                  </div>
                  <input
                    className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold transition-all focus:ring-2 focus:ring-rose-500/20 outline-none"
                    style={{ border: '1px solid rgba(237, 100, 143, 0.15)', background: 'rgba(255, 255, 255, 0.95)' }}
                    value={formState.phone}
                    onChange={(event) => {
                        const val = event.target.value.replace(/\D/g, '').slice(0, 10);
                        handleChange('phone', val);
                    }}
                    placeholder="9876543210"
                  />
                </div>
                {formState.phone.length >= 10 && (
                  <div className="flex gap-2 mt-2">
                    <input
                      maxLength="4"
                      className="flex-1 rounded-xl px-4 py-3 text-sm font-bold tracking-widest border-rose-100 border outline-none"
                      value={formState.phoneOtp}
                      onChange={(e) => handleChange('phoneOtp', e.target.value)}
                      placeholder="1234"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Location & Category Dropdown */}
            {formState.phoneOtp === '1234' && (
              <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>Location</label>
                  <input
                    className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all border-rose-100 border outline-none"
                    value={formState.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="e.g. Indore"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>Category</label>
                  <select
                    className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all border-rose-100 border outline-none bg-white"
                    value={categories.some(c => c.name === formState.category) ? formState.category : (formState.category === '' ? '' : 'Other')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Other') handleChange('category', '');
                      else handleChange('category', val);
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  {(formState.category !== '' && !categories.some(c => c.name === formState.category)) || (formState.category === '' && categories.length > 0) ? (
                    <input
                      className="w-full rounded-xl px-4 py-2 mt-2 text-xs font-semibold border-rose-100 border outline-none"
                      placeholder="Type category..."
                      value={formState.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                    />
                  ) : null}
                </div>
              </div>
            )}

            {/* Password */}
            {formState.city.length > 2 && formState.category && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>Password</label>
                <input
                  type="password"
                  className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all border-rose-100 border outline-none"
                  value={formState.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-6">
            <button onClick={() => navigate('/vendor/login')} className="text-sm font-bold text-rose-500 hover:underline">
              Already have an account? Sign In
            </button>
            <button
              className={`rounded-2xl px-12 py-4 text-base font-bold bg-rose-500 text-white shadow-xl transition-all ${formState.password.length < 8 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
              onClick={async () => {
                if (formState.password.length < 8) return;
                try {
                  const res = await vendorApi.register(formState);
                  if (res.success) {
                    localStorage.setItem('vendorToken', res.token);
                    updateVendorState({ vendor: res.vendor });
                    navigate('/vendor/onboarding/business');
                  } else alert(res.message);
                } catch (err) { alert('Server error'); }
              }}
            >
              Get Started ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;
