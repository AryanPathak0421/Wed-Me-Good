import { useRef, useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import { useVendorState } from '../useVendorState';
import { vendorApi } from '../vendorApi';

const steps = [
  { id: 'business', label: 'Business Details' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'documents', label: 'Documents' },
  { id: 'bank', label: 'Bank Details' },
  { id: 'subscription', label: 'Subscription' }
];

const VendorOnboarding = () => {
  const { stepId } = useParams();
  const navigate = useNavigate();
  const { vendorState, updateVendorState, loading } = useVendorState();
  const currentStepIndex = Math.max(0, steps.findIndex((step) => step.id === stepId));

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ show: true, message, type });
    if (duration > 0) {
      setTimeout(() => setToast((prev) => (prev.message === message ? { ...prev, show: false } : prev)), duration);
    }
  }, []);

  const [newItem, setNewItem] = useState({ title: '', tag: '' });
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    category: '',
    basePrice: '',
    inclusions: ['', '']
  });
  const fileInputRef = useRef(null);
  const docInputRefs = {
    idProof: useRef(null),
    gst: useRef(null),
    contract: useRef(null)
  };

  const [activePlans, setActivePlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      const token = localStorage.getItem('vendorToken');
      if (token) {
        try {
          const res = await vendorApi.getSubscriptionPlans(token);
          if (res.success) {
            setActivePlans(res.data);
            if (vendorState.subscription?.planId) {
              setSelectedPlanId(vendorState.subscription.planId);
            } else if (res.data.length > 0) {
              const firstPlanId = res.data[0]._id;
              setSelectedPlanId(firstPlanId);
              updateVendorState({ subscription: { ...vendorState.subscription, planId: firstPlanId } });
            }
          }
        } catch (err) {
          console.error('Failed to fetch plans:', err);
        }
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    // Scroll to top on step change
    window.scrollTo(0, 0);

    // If already subscribed, don't show subscription page
    if (!loading && vendorState.subscription?.status === 'Active' && stepId === 'subscription') {
      navigate('/vendor/dashboard');
    }
  }, [stepId, loading, vendorState.subscription?.status, navigate]);

  useEffect(() => {
    if (showServiceModal) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, [showServiceModal]);

  const handleSaveService = () => {
    if (!newService.name || !newService.category || !newService.basePrice) {
      alert('Please fill in all basic fields.');
      return;
    }
    const serviceToAdd = {
      id: `s-${Date.now()}`,
      name: newService.name,
      category: newService.category,
      basePrice: Number(newService.basePrice),
      packages: [
        { name: 'Standard', price: Number(newService.basePrice) },
        { name: 'Premium', price: Number(newService.basePrice) * 1.5 }
      ],
      inclusions: newService.inclusions.filter(Boolean)
    };
    updateVendorState({ services: [...vendorState.services, serviceToAdd] });
    setShowServiceModal(false);
    setNewService({ name: '', category: '', basePrice: '', inclusions: ['', ''] });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDocClick = (key) => {
    docInputRefs[key].current?.click();
  };

  const handleDocChange = async (key, event) => {
    const file = event.target.files?.[0];
    const token = localStorage.getItem('vendorToken');
    if (file && token) {
      showToast(`Uploading ${key === 'idProof' ? 'ID Proof' : key === 'gst' ? 'GST' : 'Agreement'}...`, 'loading', 0);
      try {
        const res = await vendorApi.uploadMedia(file, token);
        if (res.success && res.url) {
          updateVendorState({ documents: { ...vendorState.documents, [key]: res.url } });
          showToast('Document uploaded successfully! ✨', 'success');
          event.target.value = '';
        } else {
          showToast(res.message || 'Upload failed', 'error');
        }
      } catch (err) {
        showToast('Server error during document upload', 'error');
      }
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    const token = localStorage.getItem('vendorToken');
    if (file && newItem.title && token) {
      showToast('Uploading to portfolio...', 'loading', 0);
      try {
        const res = await vendorApi.uploadMedia(file, token);
        if (res.success && res.url) {
          updateVendorState({
            portfolio: [
              ...vendorState.portfolio,
              { id: Date.now().toString(), type: 'Photo', title: newItem.title, tag: newItem.tag || 'General', url: res.url }
            ]
          });
          setNewItem({ title: '', tag: '' });
          showToast('Portfolio item added! ✨', 'success');
          event.target.value = '';
        } else {
          showToast(res.message || 'Upload failed', 'error');
        }
      } catch (err) {
        showToast('Server error during upload', 'error');
      }
    } else if (!newItem.title) {
      showToast('Please enter a project title first', 'info');
    }
  };

  const isStepComplete = (id) => {
    switch (id) {
      case 'business':
        const { description, years, teamSize, languages, serviceCities } = vendorState.businessDetails;
        return description && years && teamSize && languages.some(l => l.trim()) && serviceCities.some(l => l.trim());
      case 'services':
        return vendorState.services.length > 0;
      case 'pricing':
        return !!vendorState.pricing.range;
      case 'portfolio':
        return vendorState.portfolio.length > 0;
      case 'documents':
        return vendorState.documents.idProof && vendorState.documents.gst;
      case 'bank':
        return vendorState.bank.accountName && vendorState.bank.accountNumber && vendorState.bank.ifsc;
      case 'subscription':
        return !!vendorState.subscription.planId;
      default:
        return true;
    }
  };

  const canNavigateTo = (targetIndex) => {
    if (targetIndex <= currentStepIndex) return true;
    for (let i = 0; i < targetIndex; i++) {
      if (!isStepComplete(steps[i].id)) {
        return { complete: false, stepLabel: steps[i].label };
      }
    }
    return { complete: true };
  };

  const handleStepClick = (e, index, id) => {
    if (index === currentStepIndex) {
      e.preventDefault();
      return;
    }
    const check = canNavigateTo(index);
    if (!check.complete) {
      e.preventDefault();
      alert(`⚠️ Please complete "${check.stepLabel}" before moving forward.`);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleNext = async () => {
    if (stepId === 'business') {
      const desc = vendorState.businessDetails.description || '';
      if (desc.length < 100) {
        showToast(`Description too short (${desc.length}/100). Please provide more detail about your services.`, 'error');
        return;
      }
    }

    const check = canNavigateTo(currentStepIndex + 1);
    const token = localStorage.getItem('vendorToken');

    if (!check.complete && stepId !== 'subscription') {
      alert(`⚠️ Requirement Missing: Please finish "${check.stepLabel}" to continue.`);
      return;
    }

    // Razorpay Integration for Subscription
    if (stepId === 'subscription') {
      if (!vendorState.subscription.planId) {
        alert('Please select a plan to continue.');
        return;
      }

      showToast('Initializing secure payment...', 'loading', 0);
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        showToast('Razorpay SDK failed to load. Please check your connection.', 'error');
        return;
      }

      try {
        const res = await vendorApi.createSubscriptionOrder({ planId: selectedPlanId }, token);

        if (res.success) {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: res.order.amount,
            currency: res.order.currency,
            name: 'UtsavChakra',
            description: `Subscription: ${res.plan.name}`,
            order_id: res.order.id,
            handler: async (response) => {
              showToast('Verifying payment...', 'loading', 0);
              console.log('Payment Success Response:', response);
              const verifyRes = await vendorApi.verifySubscriptionPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }, token);

              if (verifyRes.success) {
                showToast('Payment successful! Your profile is now under review. ✨', 'success');
                updateVendorState({ 
                  status: 'Pending', 
                  subscription: { ...vendorState.subscription, status: 'Active' } 
                });
                setTimeout(() => navigate('/vendor/dashboard'), 2000);
              } else {
                showToast('Payment verification failed. Please contact support.', 'error');
                console.error('Verification Error:', verifyRes);
              }
            },
            prefill: {
              name: vendorState.vendor?.fullName || vendorState.registration?.fullName,
              email: vendorState.vendor?.email || vendorState.registration?.email,
              contact: vendorState.vendor?.phone || vendorState.registration?.phone
            },
            theme: { color: '#ed648f' },
            modal: {
              ondismiss: () => showToast('Payment cancelled', 'info')
            }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        } else {
          showToast(orderRes.message || 'Failed to create payment order', 'error');
          console.error('Order Creation Failed:', orderRes);
        }
      } catch (err) {
        showToast('Failed to initialize payment gateway', 'error');
        console.error('Razorpay Init Error:', err);
        return;
      }
    }

    const stepData = vendorState[stepId] || vendorState.businessDetails;

    if (token) {
      try {
        const res = await vendorApi.updateOnboarding(stepId, stepData, token);
        if (res.success) {
          updateVendorState({ vendor: res.data });
        }
      } catch (err) {
        console.error('Failed to sync onboarding step with backend:', err);
      }
    }

    if (currentStepIndex === steps.length - 1) {
      navigate('/vendor/dashboard');
    } else {
      navigate('/vendor/onboarding/' + steps[currentStepIndex + 1].id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-4 px-1 sm:px-2 relative z-10">
      <div className="rounded-3xl p-4 sm:p-6 min-h-[60vh] sm:min-h-0 flex flex-col shadow-[0_20px_60px_rgba(237,100,143,0.15)] relative overflow-hidden transition-all duration-700" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(237, 100, 143, 0.1)'
      }}>
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-2 rounded-t-[2.5rem]" style={{
          background: 'linear-gradient(90deg, #ed648f, #f182a5, #f4a0bb, #ed648f)',
          backgroundSize: '200% 100%',
          animation: 'gradient-shift 4s ease infinite'
        }}></div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] drop-shadow-sm" style={{ color: '#ed648f' }}>Vendor Onboarding</p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 drop-shadow-md">Complete your profile</h2>
            <p className="text-xs sm:text-sm font-semibold mt-0.5" style={{ color: '#1e293b' }}>Finish setup to boost visibility and unlock leads.</p>
          </div>
          <div className="relative">
            <img src="/assets/vendor/success.png" alt="Celebration" className="h-20 sm:h-32 w-auto absolute -top-12 sm:-top-20 -right-2 sm:-right-8 animate-[pulse-glow_4s_ease-in-out_infinite] img-transparent-fix" />
          </div>
        </div>

        {/* Responsive Space-Optimized Step Navigation */}
        {/* Responsive Space-Optimized Step Navigation */}
        <div className="mt-4 flex justify-between items-center w-full px-2 sm:px-4 max-w-full mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : 'flex-none'}`}>
              <NavLink
                to={'/vendor/onboarding/' + step.id}
                onClick={(e) => handleStepClick(e, index, step.id)}
                className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all shadow-md z-10"
                style={index === currentStepIndex
                  ? { background: 'linear-gradient(135deg, #ed648f, #ed648f)', color: 'white', border: '2px solid white', boxShadow: '0 4px 15px rgba(159, 18, 57, 0.4)', transform: 'scale(1.15)' }
                  : index < currentStepIndex
                    ? { background: 'white', color: '#ed648f', border: '2px solid #ed648f' }
                    : { background: 'rgba(255, 255, 255, 0.9)', color: '#64748b', border: '2px dashed #cbd5e1' }
                }
              >
                {index < currentStepIndex ? '✓' : index + 1}
              </NavLink>
              {index < steps.length - 1 && (
                <div className="h-0.5 rounded w-full flex-1 shrink mx-1.5 sm:mx-3 transition-all shadow-inner" style={{
                  background: index < currentStepIndex ? 'linear-gradient(90deg, #ed648f, #ed648f)' : 'rgba(255, 255, 255, 0.5)'
                }}></div>
              )}
            </div>
          ))}
        </div>

        {/* Dynamic Centered Step Heading */}
        <div className="mt-1 mb-2 flex flex-col items-center justify-center text-center px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {steps[currentStepIndex]?.label}
          </h2>
          <div className="h-1 w-12 rounded-full mt-2" style={{ background: '#ed648f' }}></div>
        </div>

        <div className="mt-3 flex-1">
          {stepId === 'business' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              {/* 1. Description */}
              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>
                  Business description <span style={{ color: '#ed648f' }}>*</span>
                </label>
                <textarea
                  autoFocus
                  className="w-full rounded-2xl px-5 py-4 text-sm font-semibold transition-all focus:ring-2 focus:ring-rose-500/20 resize-none"
                  style={{
                    border: '1px solid rgba(237, 100, 143, 0.15)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    minHeight: '120px'
                  }}
                  value={vendorState.businessDetails.description}
                  onChange={(event) => updateVendorState({
                    businessDetails: { ...vendorState.businessDetails, description: event.target.value }
                  })}
                  placeholder="Describe your journey, specialized skills, and what makes your service exceptional..."
                />
                <div className="flex justify-end mt-1 px-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${vendorState.businessDetails.description?.length >= 100 ? 'text-emerald-500' : 'text-rose-400'}`}>
                    {vendorState.businessDetails.description?.length || 0} / 100 Characters
                  </span>
                </div>
              </div>

              {/* 2. Experience & Team - Reveal when description has content */}
              {vendorState.businessDetails.description?.length > 10 && (
                <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>
                      Years of experience <span style={{ color: '#ed648f' }}>*</span>
                    </label>
                    <input
                      className="w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all focus:ring-2 focus:ring-rose-500/20"
                      style={{
                        border: '1px solid rgba(237, 100, 143, 0.15)',
                        background: 'rgba(255, 255, 255, 0.95)'
                      }}
                      value={vendorState.businessDetails.years}
                      placeholder="e.g. 5"
                      onKeyDown={(e) => {
                        if (e.key.length === 1 && !/[0-9]/.test(e.key)) e.preventDefault();
                      }}
                      onChange={(event) => updateVendorState({
                        businessDetails: { ...vendorState.businessDetails, years: event.target.value.replace(/[^0-9]/g, '') }
                      })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>
                      Team size <span style={{ color: '#ed648f' }}>*</span>
                    </label>
                    <input
                      className="w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all focus:ring-2 focus:ring-rose-500/20"
                      style={{
                        border: '1px solid rgba(237, 100, 143, 0.15)',
                        background: 'rgba(255, 255, 255, 0.95)'
                      }}
                      value={vendorState.businessDetails.teamSize}
                      placeholder="e.g. 8"
                      onKeyDown={(e) => {
                        if (e.key.length === 1 && !/[0-9]/.test(e.key)) e.preventDefault();
                      }}
                      onChange={(event) => updateVendorState({
                        businessDetails: { ...vendorState.businessDetails, teamSize: event.target.value.replace(/[^0-9]/g, '') }
                      })}
                    />
                  </div>
                </div>
              )}

              {/* 3. Professional Details - Reveal when stats are filled */}
              {vendorState.businessDetails.years && vendorState.businessDetails.teamSize && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>
                      Languages spoken <span style={{ color: '#ed648f' }}>*</span>
                    </label>
                    <input
                      className="w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all focus:ring-2 focus:ring-rose-500/20"
                      style={{
                        border: '1px solid rgba(237, 100, 143, 0.15)',
                        background: 'rgba(255, 255, 255, 0.95)'
                      }}
                      value={vendorState.businessDetails.languages.join(', ')}
                      onKeyDown={(e) => {
                        if (e.key >= '0' && e.key <= '9') e.preventDefault();
                      }}
                      onChange={(event) => {
                        const val = event.target.value.replace(/[0-9]/g, '');
                        updateVendorState({
                          businessDetails: { ...vendorState.businessDetails, languages: val.split(',').map(s => s.trimStart()) }
                        });
                      }}
                      placeholder="e.g. Hindi, English"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>
                      Service cities <span style={{ color: '#ed648f' }}>*</span>
                    </label>
                    <input
                      className="w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all focus:ring-2 focus:ring-rose-500/20"
                      style={{
                        border: '1px solid rgba(237, 100, 143, 0.15)',
                        background: 'rgba(255, 255, 255, 0.95)'
                      }}
                      value={vendorState.businessDetails.serviceCities.join(', ')}
                      onKeyDown={(e) => {
                        if (e.key >= '0' && e.key <= '9') e.preventDefault();
                      }}
                      onChange={(event) => {
                        const val = event.target.value.replace(/[0-9]/g, '');
                        updateVendorState({
                          businessDetails: { ...vendorState.businessDetails, serviceCities: val.split(',').map(s => s.trimStart()) }
                        });
                      }}
                      placeholder="e.g. Indore, Bhopal"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {stepId === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/85 backdrop-blur-md shadow-sm p-4 sm:p-6 rounded-3xl border border-[#F4DFDF]">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide drop-shadow-sm">Manage Services</p>
                  <p className="text-[10px] sm:text-sm font-bold mt-1" style={{ color: '#475569' }}>Add your business offerings.</p>
                </div>
                <button
                  type="button"
                  className="vendor-cta rounded-2xl px-4 py-2.5 text-[10px] sm:text-xs font-bold tracking-wide shrink-0 ml-2"
                  onClick={() => setShowServiceModal(true)}
                >
                  ➕ Add service
                </button>
              </div>

              {showServiceModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto" style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)'
                }}>
                  <div className="w-full max-w-xl rounded-[2.5rem] p-8 sm:p-10 shadow-3xl relative my-8 overflow-hidden" style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.55)), url("/assets/vendor/download (2).jpeg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid rgba(237, 100, 143, 0.2)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                  }}>
                    {/* Glassmorphic inner container for content */}
                    <div className="absolute inset-0 backdrop-blur-md -z-10"></div>

                    <div className="flex items-center justify-between mb-8">
                      <div className="relative">
                        <h3 className="text-2xl font-bold text-slate-900 leading-none drop-shadow-sm">Add New Service</h3>
                        <p className="text-sm font-bold mt-2" style={{ color: '#1e293b' }}>Create a new service listing for your profile.</p>
                      </div>
                      <button
                        onClick={() => setShowServiceModal(false)}
                        className="h-10 w-10 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-600 transition-all active:scale-95 bg-white/80 border border-white"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>Service Name</label>
                          <input
                            className="w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all focus:ring-2 focus:ring-rose-500/20"
                            style={{
                              border: '1px solid rgba(237, 100, 143, 0.2)',
                              background: 'rgba(255, 255, 255, 0.95)'
                            }}
                            placeholder="e.g. Royal Stage Decor"
                            value={newService.name}
                            onKeyDown={(e) => {
                              if (e.key >= '0' && e.key <= '9') e.preventDefault();
                            }}
                            onChange={(e) => setNewService({ ...newService, name: e.target.value.replace(/[0-9]/g, '') })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>Category</label>
                          <div className="relative">
                            <div
                              className="w-full rounded-2xl px-5 py-3.5 text-sm font-semibold border transition-all cursor-pointer flex items-center justify-between gap-2 shadow-sm"
                              style={{
                                borderColor: 'rgba(237, 100, 143, 0.2)',
                                background: 'rgba(255, 255, 255, 0.95)',
                                color: '#ed648f'
                              }}
                              onClick={() => setOpenDropdown(!openDropdown)}
                            >
                              {newService.category || 'Select Category'}
                              <Icon name="chevronDown" size="xs" color="#ed648f" className={`transition-transform duration-300 ${openDropdown ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Custom Dropdown Menu */}
                            {openDropdown && (
                              <>
                                <div className="fixed inset-0 z-[90]" onClick={() => setOpenDropdown(false)}></div>
                                <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-2xl border border-[#ed648f20] transition-all z-[100] overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                                  {['Decoration', 'Photography', 'Catering', 'Venue'].map((cat) => (
                                    <div
                                      key={cat}
                                      className={`px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors flex items-center gap-3 ${newService.category === cat ? 'bg-[#ed648f10] text-[#ed648f]' : 'text-slate-600 hover:bg-[#ed648f08] hover:text-[#ed648f]'
                                        }`}
                                      onClick={() => {
                                        setNewService({ ...newService, category: cat });
                                        setOpenDropdown(false);
                                      }}
                                    >
                                      <div className={`w-1.5 h-1.5 rounded-full transition-all ${newService.category === cat ? 'bg-[#ed648f] scale-100' : 'bg-transparent scale-0'}`}></div>
                                      {cat}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>Starting Price (₹)</label>
                        <input
                          type="number"
                          className="w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all focus:ring-2 focus:ring-rose-500/20"
                          style={{
                            border: '1px solid rgba(237, 100, 143, 0.2)',
                            background: 'rgba(255, 255, 255, 0.95)'
                          }}
                          placeholder="e.g. 50000"
                          value={newService.basePrice}
                          onChange={(e) => setNewService({ ...newService, basePrice: e.target.value })}
                        />
                      </div>

                      <div className="space-y-3 pt-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>Key Inclusions</p>
                        <div className="space-y-3">
                          {newService.inclusions.map((inc, idx) => (
                            <input
                              key={idx}
                              placeholder={`Service Feature ${idx + 1}`}
                              className="w-full rounded-2xl px-5 py-3 text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-rose-500/20"
                              style={{
                                border: '1px solid rgba(237, 100, 143, 0.15)',
                                background: 'rgba(255, 255, 255, 0.95)'
                              }}
                              value={inc}
                              onChange={(e) => {
                                const incs = [...newService.inclusions];
                                incs[idx] = e.target.value;
                                setNewService({ ...newService, inclusions: incs });
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        className="vendor-cta w-full rounded-2xl py-5 font-bold text-lg mt-6 active:scale-95 transition-all shadow-xl"
                        style={{ background: 'linear-gradient(135deg, #ed648f, #ed648f)' }}
                        onClick={handleSaveService}
                      >
                        ✨ Save Service
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {vendorState.services.length === 0 ? (
                <div className="rounded-3xl border border-dashed p-8 sm:p-16 text-center shadow-inner" style={{
                  borderColor: 'rgba(159, 18, 57, 0.4)',
                  background: 'rgba(255, 255, 255, 0.95)'
                }}>
                  <div className="text-3xl mb-3">✨</div>
                  <p className="text-xs sm:text-sm font-bold" style={{ color: '#ed648f' }}>No services added yet. Click &quot;Add service&quot; to get started.</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {vendorState.services.map((service) => (
                    <div key={service.id} className="rounded-3xl p-6 relative group transition-all hover:scale-[1.02]" style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(237, 100, 143, 0.1)',
                      boxShadow: '0 4px 20px rgba(210, 138, 140, 0.05)'
                    }}>
                      <button
                        onClick={() => updateVendorState({ services: vendorState.services.filter(s => s.id !== service.id) })}
                        className="absolute -top-3 -right-3 h-8 w-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        style={{
                          background: 'linear-gradient(135deg, #FAF2F2, #F4DFDF)',
                          border: '1px solid rgba(237, 100, 143, 0.2)',
                          color: '#ed648f'
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-lg">{service.name}</h4>
                        <span className="rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{
                          background: 'linear-gradient(135deg, #FAF2F2, #F4DFDF)', color: '#ed648f'
                        }}>{service.category}</span>
                      </div>
                      <p className="mt-3 text-sm font-bold" style={{ color: '#ed648f' }}>Base price: ₹{service.basePrice.toLocaleString()}</p>
                      <div className="mt-4 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#334155' }}>Packages: <span style={{ color: '#64748b' }}>{service.packages.map((pkg) => pkg.name).join(', ')}</span></div>
                      {service.inclusions && service.inclusions.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {service.inclusions.map((inc, i) => (
                            <span key={i} className="px-3 py-1 rounded-full text-[10px] font-bold" style={{
                              background: 'rgba(253, 242, 248, 0.5)',
                              border: '1px solid rgba(210, 138, 140, 0.08)',
                              color: '#64748b'
                            }}>{inc}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {stepId === 'pricing' && (
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#334155' }}>
                  Price range <span style={{ color: '#ed648f' }}>*</span>
                </label>
                <input
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all"
                  style={{
                    border: '1px solid rgba(237, 100, 143, 0.15)',
                    background: 'rgba(255, 255, 255, 0.9)'
                  }}
                  value={vendorState.pricing.range}
                  placeholder="e.g. ₹50k - ₹2L"
                  onChange={(event) => updateVendorState({ pricing: { ...vendorState.pricing, range: event.target.value } })}
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#334155' }}>Pricing notes</label>
                <textarea
                  className="h-32 w-full rounded-2xl px-5 py-4 text-sm font-semibold transition-all resize-none"
                  style={{
                    border: '1px solid rgba(237, 100, 143, 0.15)',
                    background: 'rgba(255, 255, 255, 0.9)'
                  }}
                  value={vendorState.pricing.notes}
                  placeholder="Any additional details about your pricing approach or travel charges..."
                  onChange={(event) => updateVendorState({ pricing: { ...vendorState.pricing, notes: event.target.value } })}
                />
              </div>
            </div>
          )}

          {stepId === 'portfolio' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/85 backdrop-blur-md shadow-sm p-4 sm:p-6 rounded-3xl border border-[#F4DFDF]">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide drop-shadow-sm">Manage Portfolio</p>
                  <p className="text-[10px] sm:text-xs font-bold mt-1" style={{ color: '#475569' }}>Upload your work samples.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="rounded-[2.5rem] border border-white/40 p-5 sm:p-8 shadow-xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(244,223,223,0.5))' }}>
                    <div className="absolute inset-0 backdrop-blur-sm -z-10"></div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#ed648f' }}>Add new showcase</p>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>Project Title</label>
                        <input
                          className="w-full rounded-2xl px-5 py-2 text-sm font-semibold transition-all focus:ring-2 focus:ring-rose-500/10"
                          style={{ border: '1px solid rgba(237, 100, 143, 0.2)', background: 'rgba(255, 255, 255, 0.95)' }}
                          placeholder="e.g. Royal Palace Wedding"
                          value={newItem.title}
                          onKeyDown={(e) => {
                            if (e.key >= '0' && e.key <= '9') e.preventDefault();
                          }}
                          onChange={(e) => setNewItem({ ...newItem, title: e.target.value.replace(/[0-9]/g, '') })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#1e293b' }}>Category Tag</label>
                        <input
                          className="w-full rounded-2xl px-5 py-2 text-sm font-semibold transition-all focus:ring-2 focus:ring-rose-500/10"
                          style={{ border: '1px solid rgba(237, 100, 143, 0.2)', background: 'rgba(255, 255, 255, 0.95)' }}
                          placeholder="e.g. Reception, Ceremony"
                          value={newItem.tag}
                          onKeyDown={(e) => {
                            if (e.key >= '0' && e.key <= '9') e.preventDefault();
                          }}
                          onChange={(e) => setNewItem({ ...newItem, tag: e.target.value.replace(/[0-9]/g, '') })}
                        />
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <button
                        type="button"
                        className="vendor-cta w-full rounded-2xl py-2.5 font-bold text-sm mt-2 active:scale-95 transition-all"
                        onClick={handleUploadClick}
                      >
                        Select & Upload Media
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-2 h-fit">
                  {vendorState.portfolio.length === 0 ? (
                    <div className="col-span-2 rounded-[2rem] border-2 border-dashed p-12 text-center flex flex-col items-center justify-center shadow-inner" style={{
                      borderColor: 'rgba(159, 18, 57, 0.3)',
                      background: 'rgba(255, 255, 255, 0.95)'
                    }}>
                      <div className="text-4xl mb-3">📷</div>
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ed648f' }}>Your portfolio is empty</p>
                    </div>
                  ) : (
                    vendorState.portfolio.map((item) => (
                      <div key={item.id} className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#FAF2F2]">
                        <img src={item.url} alt={item.title} className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                          <p className="text-sm font-bold text-white truncate">{item.title}</p>
                          <p className="text-[10px] text-[#E6B3B4] font-bold mt-0.5 tracking-wider uppercase">{item.tag}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {stepId === 'documents' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="lg:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/85 backdrop-blur-md shadow-sm p-4 sm:p-6 rounded-3xl border border-[#F4DFDF]">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide drop-shadow-sm">Required Uploads</p>
                  <p className="text-[10px] sm:text-xs font-bold mt-1" style={{ color: '#475569' }}>Identity and business verification.</p>
                </div>
              </div>
              {['idProof', 'gst', 'contract'].map((docKey) => (
                <div key={docKey} className="flex items-center justify-between rounded-3xl p-6 transition-all hover:scale-[1.02]" style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(237, 100, 143, 0.1)',
                  boxShadow: '0 4px 20px rgba(210, 138, 140, 0.05)'
                }}>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #ed648f, #ed648f)' }}>
                        {docKey === 'idProof' ? '1' : docKey === 'gst' ? '2' : '3'}
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {docKey === 'idProof' ? 'ID Proof (Aadhar/PAN)' : docKey === 'gst' ? 'GST Certificate' : 'Service Agreement'}
                      </p>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider ml-9" style={{ color: '#334155' }}>PDF, JPG (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    ref={(el) => (docInputRefs[docKey].current = el)}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleDocChange(docKey, e)}
                  />
                  <button
                    type="button"
                    className="rounded-2xl px-5 py-3 text-xs font-bold transition-all active:scale-95 whitespace-nowrap"
                    style={vendorState.documents[docKey]
                      ? { background: 'linear-gradient(135deg, #ed648f, #ed648f)', color: 'white', boxShadow: '0 4px 15px rgba(210, 138, 140, 0.3)' }
                      : { background: 'linear-gradient(135deg, #FAF2F2, #F4DFDF)', color: '#ed648f', border: '1px solid rgba(237, 100, 143, 0.15)' }}
                    onClick={() => handleDocClick(docKey)}
                  >
                    {vendorState.documents[docKey] ? '✓ Uploaded' : 'Upload File'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {stepId === 'bank' && (
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="lg:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/85 backdrop-blur-md shadow-sm p-6 rounded-3xl border border-[#F4DFDF]">
                <div>
                  <p className="text-sm font-bold text-slate-900 uppercase tracking-wide drop-shadow-sm">Payment Information</p>
                  <p className="text-xs sm:text-sm font-bold mt-1" style={{ color: '#334155' }}>Provide your banking information for secure payments.</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#334155' }}>Account name <span style={{ color: '#ed648f' }}>*</span></label>
                <input
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all"
                  style={{ border: '1px solid rgba(237, 100, 143, 0.15)', background: 'rgba(255, 255, 255, 0.9)' }}
                  value={vendorState.bank.accountName}
                  placeholder="Name as per bank records"
                  onChange={(event) => updateVendorState({
                    bank: { ...vendorState.bank, accountName: event.target.value.replace(/[^a-zA-Z ]/g, '') }
                  })}
                  onKeyDown={(e) => {
                    if (e.key >= '0' && e.key <= '9') e.preventDefault();
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#334155' }}>Account number <span style={{ color: '#ed648f' }}>*</span></label>
                <input
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all"
                  style={{ border: '1px solid rgba(237, 100, 143, 0.15)', background: 'rgba(255, 255, 255, 0.9)' }}
                  value={vendorState.bank.accountNumber}
                  placeholder="Enter 12-16 digit account number"
                  onChange={(event) => updateVendorState({ bank: { ...vendorState.bank, accountNumber: event.target.value.replace(/[^0-9]/g, '') } })}
                  onKeyDown={(e) => {
                    if (e.key.length === 1 && !/[0-9]/.test(e.key)) e.preventDefault();
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#334155' }}>IFSC Code <span style={{ color: '#ed648f' }}>*</span></label>
                <input
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all"
                  style={{ border: '1px solid rgba(237, 100, 143, 0.15)', background: 'rgba(255, 255, 255, 0.9)' }}
                  value={vendorState.bank.ifsc}
                  placeholder="e.g. SBIN0001234"
                  onChange={(event) => updateVendorState({ bank: { ...vendorState.bank, ifsc: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') } })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider ml-1" style={{ color: '#334155' }}>UPI ID</label>
                <input
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all"
                  style={{ border: '1px solid rgba(237, 100, 143, 0.15)', background: 'rgba(255, 255, 255, 0.9)' }}
                  value={vendorState.bank.upiId}
                  placeholder="e.g. name@upi"
                  onChange={(event) => updateVendorState({ bank: { ...vendorState.bank, upiId: event.target.value.toLowerCase().replace(/[^a-z0-9.@-]/g, '') } })}
                />
              </div>
            </div>
          )}

          {stepId === 'subscription' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Select Your Business Tier</h3>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Choose the acceleration path that fits your growth</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activePlans.map((plan) => (
                  <div 
                    key={plan._id}
                    onClick={() => {
                      setSelectedPlanId(plan._id);
                      updateVendorState({ subscription: { ...vendorState.subscription, planId: plan._id } });
                    }}
                    className={`group relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col ${
                      selectedPlanId === plan._id 
                      ? 'border-[#ed648f] bg-white shadow-[0_20px_50px_rgba(237,100,143,0.2)]' 
                      : 'border-slate-200 bg-white/70 hover:border-[#ed648f]/40 hover:shadow-xl'
                    }`}
                  >
                    {/* Decorative Background Element */}
                    <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full transition-all duration-700 ${selectedPlanId === plan._id ? 'bg-[#ed648f]/10 scale-150' : 'bg-slate-50 group-hover:bg-[#ed648f]/5 group-hover:scale-110'}`}></div>

                    {selectedPlanId === plan._id && (
                      <div className="absolute top-6 right-6">
                        <div className="h-7 w-7 rounded-full bg-[#ed648f] text-white flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}

                    <div className="relative z-10 flex-1 flex flex-col">
                      <div className="mb-8">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${selectedPlanId === plan._id ? 'bg-[#ed648f] text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {plan.name}
                        </span>
                        <div className="flex items-baseline gap-1 mt-6">
                          <span className="text-4xl font-black text-slate-900">₹{plan.price.toLocaleString()}</span>
                          <span className="text-xs font-bold text-slate-400">/ {plan.durationValue} {plan.durationUnit}(s)</span>
                        </div>
                      </div>

                      <div className="space-y-4 py-8 border-y border-slate-100 flex-1">
                        {(plan.features || []).map((feature, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-slate-700 leading-tight">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <button 
                        className={`w-full mt-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 transform active:scale-95 ${
                          selectedPlanId === plan._id 
                          ? 'bg-[#ed648f] text-white shadow-[0_10px_25px_rgba(237,100,143,0.3)]' 
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {selectedPlanId === plan._id ? 'Current Selection' : 'Choose This Plan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-center font-black text-slate-400 uppercase tracking-widest">
                * Secured by Razorpay • Instant Verification • Auto-Renewal Options
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-6" style={{ borderColor: 'rgba(237, 100, 143, 0.1)' }}>
          <div className="flex items-center gap-2 text-[#ed648f]">
            <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Progress is saved automatically</span>
          </div>
          <button
            type="button"
            className="w-full sm:w-auto rounded-2xl px-16 py-4 text-sm font-black uppercase tracking-[0.15em] text-white shadow-2xl transition-all active:scale-95 hover:shadow-[#ed648f]/40 hover:-translate-y-0.5"
            style={{ 
              background: 'linear-gradient(135deg, #ed648f 0%, #d84d77 100%)',
              boxShadow: '0 12px 35px -8px rgba(237, 100, 143, 0.4)'
            }}
            onClick={handleNext}
          >
            {(currentStepIndex === steps.length - 1 ? 'Complete Setup ✨' : 'Continue to Next Step →')}
          </button>
        </div>

        {/* Global Toast Notification */}
        {toast.show && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 min-w-max"
              style={{
                background: toast.type === 'error'
                  ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                  : 'linear-gradient(135deg, #ed648f, #ed648f, #a855f7)',
                color: 'white',
                boxShadow: '0 20px 40px -10px rgba(237, 100, 143, 0.4)'
              }}>
              {toast.type === 'loading' ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : toast.type === 'success' ? (
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-white/20 text-xs text-white">✓</div>
              ) : (
                <div className="text-xl">✨</div>
              )}
              <p className="font-bold text-xs sm:text-sm uppercase tracking-wider">{toast.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOnboarding;
