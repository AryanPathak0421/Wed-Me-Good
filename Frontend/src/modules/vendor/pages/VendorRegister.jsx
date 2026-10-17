import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ClipboardList,
  Flower2,
  Camera,
  Sparkles,
  Utensils,
  Music,
  Sun,
  Mail,
  Car,
  Tent,
  Gift,
  Building2,
  Gem,
  ArrowLeft,
  ChevronRight,
  Check,
  User,
  Store,
  Phone,
  CalendarDays,
  ClipboardCheck,
  HelpCircle,
  Video,
  Globe,
  Radio,
  Clapperboard,
  Scissors,
  ShoppingBag,
  ChefHat,
  Wine,
  Cake,
  Sliders,
  Mic2,
  Lock
} from 'lucide-react';
import { useVendorState } from '../useVendorState';
import { vendorApi } from '../vendorApi';
import { adminApi } from '../../admin/services/adminApi';

// Bespoke, high-fidelity vector illustrations matching a premium Lucide/Feather-style icon pack.
const getCategoryMockupDetails = (catName) => {
  switch (catName) {
    case 'Wedding Planners':
    case 'Wedding Planning':
      return {
        label: 'Wedding Planning',
        color: '#7C3AED',
        icon: <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" stroke="#7C3AED" strokeWidth={1.8} fill="#7C3AED" fillOpacity={0.1} />
      };
    case 'Decorators':
    case 'Decoration':
      return {
        label: 'Decoration',
        color: '#0D9488',
        icon: <Flower2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" stroke="#0D9488" strokeWidth={1.8} fill="#0D9488" fillOpacity={0.1} />
      };
    case 'Photographers':
    case 'Photography & Media':
      return {
        label: 'Photography & Media',
        color: '#475569',
        icon: <Camera className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" stroke="#475569" strokeWidth={1.8} fill="#475569" fillOpacity={0.1} />
      };
    case 'Makeup Artists':
    case 'Beauty & Fashion':
      return {
        label: 'Beauty & Fashion',
        color: '#EA580C',
        icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" stroke="#EA580C" strokeWidth={1.8} fill="#EA580C" fillOpacity={0.1} />
      };
    case 'Catering':
    case 'Catering & Food':
      return {
        label: 'Catering & Food',
        color: '#10B981',
        icon: <Utensils className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" stroke="#10B981" strokeWidth={1.8} fill="#10B981" fillOpacity={0.1} />
      };
    case 'Choreographers':
    case 'Entertainment':
      return {
        label: 'Entertainment',
        color: '#6366F1',
        icon: <Music className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" stroke="#6366F1" strokeWidth={1.8} fill="#6366F1" fillOpacity={0.1} />
      };
    case 'Mehendi Artists':
    case 'Traditional Services':
      return {
        label: 'Traditional Services',
        color: '#E11D48',
        icon: <Sun className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" stroke="#E11D48" strokeWidth={1.8} fill="#E11D48" fillOpacity={0.1} />
      };
    case 'Wedding Invitations':
    case 'Invitations & Printing':
      return {
        label: 'Invitations & Printing',
        color: '#E11D48',
        icon: <Mail className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" stroke="#E11D48" strokeWidth={1.8} fill="#E11D48" fillOpacity={0.1} />
      };
    case 'Groom Wear':
    case 'Travel & Hospitality':
      return {
        label: 'Travel & Hospitality',
        color: '#2563EB',
        icon: <Car className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" stroke="#2563EB" strokeWidth={1.8} fill="#2563EB" fillOpacity={0.1} />
      };
    case 'Music & DJs':
    case 'Event Setup & Rentals':
      return {
        label: 'Event Setup & Rentals',
        color: '#4F35C3',
        icon: <Tent className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" stroke="#4F35C3" strokeWidth={1.8} fill="#4F35C3" fillOpacity={0.1} />
      };
    case 'Bridal Wear':
    case 'Gifts & Shopping':
      return {
        label: 'Gifts & Shopping',
        color: '#F43F5E',
        icon: <Gift className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" stroke="#F43F5E" strokeWidth={1.8} fill="#F43F5E" fillOpacity={0.1} />
      };
    case 'Venues':
    case 'Corporate Events':
      return {
        label: 'Corporate Events',
        color: '#0284C7',
        icon: <Building2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" stroke="#0284C7" strokeWidth={1.8} fill="#0284C7" fillOpacity={0.1} />
      };
    case 'Jewellery':
    default:
      return {
        label: 'Jewellery',
        color: '#D97706',
        icon: <Gem className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" stroke="#D97706" strokeWidth={1.8} fill="#D97706" fillOpacity={0.1} />
      };
  }
};

// Custom sub-categories lists mapped for all possible main categories, matching the Photography & Media mockup exactly.
const subCategoriesData = {
  'Wedding Planners': [
    { name: 'Full Wedding Planner', desc: 'Vendor bookings, decor curation & complete sangeet execution.', icon: 'plan' },
    { name: 'Partial Wedding Planner', desc: 'Day-of guest management, coordinator helper & checklist helper.', icon: 'checkList' },
    { name: 'Wedding Consultant', desc: 'Budget allocation advisor, expert review sessions.', icon: 'help' }
  ],
  'Decorators': [
    { name: 'Floral Designer', desc: 'Traditional mandaps, entrance florals & stage setup.', icon: 'decoration' },
    { name: 'Thematic Decorator', desc: 'Premium LED backdrops, customized seating & designer sets.', icon: 'star' },
    { name: 'Audio & Truss Stage Rentals', desc: 'Line arrays, DJ setups, heavy trussing setups.', icon: 'store' }
  ],
  'Photographers': [
    { name: 'Photographer', desc: 'Candid, Traditional, Pre-wedding etc.', icon: 'camera' },
    { name: 'Videographer', desc: 'Wedding Films, Cinematic Videos etc.', icon: 'video' },
    { name: 'Drone Photography', desc: 'Aerial Photography & Videography', icon: 'globe' },
    { name: 'Live Streaming', desc: 'Live Telecast, Multi Camera Setup', icon: 'chat' },
    { name: 'Wedding Reel Creator', desc: 'Short Videos, Reels, Highlights', icon: 'play' }
  ],
  'Makeup Artists': [
    { name: 'Bridal Makeup Artist', desc: 'Airbrush setups, high-definition makeup, hairdressing.', icon: 'makeup' },
    { name: 'Groom Styling Stylist', desc: 'Groom shaves, designer haircuts & clothing fitting support.', icon: 'user' },
    { name: 'Sari & Dupatta Drapist', desc: 'Classic draping, saree patterns, and entry adjustments.', icon: 'bag' }
  ],
  'Catering': [
    { name: 'Buffet Wedding Caterer', desc: 'Premium multi-cuisine counters, live stations & cocktails.', icon: 'cart' },
    { name: 'Fine Dining Planner', desc: 'Sit-down silver service, custom menu prints & luxury staff.', icon: 'bank' },
    { name: 'Baker & Sweets Creator', desc: 'Multi-tier floral wedding cakes & traditional dessert platters.', icon: 'star' }
  ],
  'Choreographers': [
    { name: 'Sangeet Choreographer', desc: 'First sangeet couples dance, group dances, background audio edits.', icon: 'party' },
    { name: 'Wedding DJ & Lighting', desc: 'Sizzling beats, dance floor setups, custom laser projections.', icon: 'settings' },
    { name: 'Live Wedding Band', desc: 'Acoustic welcome players, Sufi sangeet players & classic shehnai.', icon: 'bell' }
  ]
};

const getSubCategoriesForMain = (mainCat) => {
  const normalized = mainCat === 'Photography & Media' ? 'Photographers' : mainCat;
  return subCategoriesData[normalized] || [
    { name: `${mainCat} Lead Planner`, desc: 'Bespoke high-quality setups and professional assistance.', icon: 'star' },
    { name: `${mainCat} Standard Vendor`, desc: 'Standard wedding support, basic equipment package.', icon: 'checkList' },
    { name: `${mainCat} Independent Consultant`, desc: 'Remote consultations, budget assistance, basic reviews.', icon: 'help' }
  ];
};

const renderSubCategoryIcon = (iconName, isSelected) => {
  const iconProps = { 
    className: `w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 flex-shrink-0 transition-colors duration-200 ${
      isSelected ? 'text-[#4F35C3]' : 'text-slate-600'
    }`, 
    strokeWidth: 1.8 
  };
  switch (iconName) {
    case 'camera':
      return <Camera {...iconProps} />;
    case 'video':
      return <Video {...iconProps} />;
    case 'globe':
      return <Globe {...iconProps} />;
    case 'chat':
      return <Radio {...iconProps} />;
    case 'play':
      return <Clapperboard {...iconProps} />;
    case 'plan':
      return <CalendarDays {...iconProps} />;
    case 'checkList':
      return <ClipboardCheck {...iconProps} />;
    case 'decoration':
      return <Flower2 {...iconProps} />;
    case 'makeup':
      return <Sparkles {...iconProps} />;
    case 'cart':
      return <ChefHat {...iconProps} />;
    case 'party':
      return <Music {...iconProps} />;
    case 'settings':
      return <Sliders {...iconProps} />;
    case 'bell':
      return <Mic2 {...iconProps} />;
    case 'user':
      return <User {...iconProps} />;
    case 'bag':
      return <ShoppingBag {...iconProps} />;
    case 'bank':
      return <Wine {...iconProps} />;
    case 'star':
      return <Cake {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />;
  }
};

const VendorRegister = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const { vendorState, updateVendorState } = useVendorState();
  const hasToken = !!localStorage.getItem('vendorToken');
  const [formState, setFormState] = useState({
    fullName: vendorState?.registration?.fullName || vendorState?.fullName || '',
    businessName: vendorState?.registration?.businessName || vendorState?.businessName || '',
    email: vendorState?.registration?.email || vendorState?.email || '',
    phone: vendorState?.registration?.phone || vendorState?.phone || '',
    city: vendorState?.registration?.city || vendorState?.city || '',
    category: vendorState?.registration?.category || vendorState?.category || '',
    subCategory: vendorState?.registration?.subCategory || vendorState?.subCategory || '',
    password: vendorState?.registration?.password || (hasToken ? '••••••••' : ''),
    emailOtp: hasToken ? '0000' : '',
    phoneOtp: hasToken ? '1234' : ''
  });
  
  const [selectedCategory, setSelectedCategory] = useState(vendorState?.registration?.category || vendorState?.category || '');
  const [selectedSubCategory, setSelectedSubCategory] = useState(vendorState?.registration?.subCategory || vendorState?.subCategory || '');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileSynced, setProfileSynced] = useState(false);

  // Synchronize state when vendorState loads/changes
  useEffect(() => {
    if (vendorState?._id && !profileSynced) {
      const hasToken = !!localStorage.getItem('vendorToken');
      const syncedForm = {
        fullName: vendorState.fullName || formState.fullName,
        businessName: vendorState.businessName || formState.businessName,
        email: vendorState.email || formState.email,
        phone: vendorState.phone || formState.phone,
        city: vendorState.city || formState.city,
        category: vendorState.category || formState.category,
        subCategory: vendorState.subCategory || formState.subCategory,
        password: '••••••••',
        emailOtp: hasToken ? '0000' : formState.emailOtp,
        phoneOtp: hasToken ? '1234' : formState.phoneOtp
      };
      setFormState(syncedForm);
      if (vendorState.category) setSelectedCategory(vendorState.category);
      if (vendorState.subCategory) setSelectedSubCategory(vendorState.subCategory);
      setProfileSynced(true);
    }
  }, [vendorState, profileSynced]);
  
  // Refs for auto-scrolling to newly revealed fields
  const businessNameRef = useRef(null);
  const emailRef = useRef(null);
  const emailOtpRef = useRef(null);
  const phoneRef = useRef(null);
  const phoneOtpRef = useRef(null);
  const locationRef = useRef(null);
  const passwordRef = useRef(null);

  const scrollToRef = (ref) => {
    if (ref?.current) {
      setTimeout(() => {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    }
  };

  // Auto-scroll to newly revealed fields
  useEffect(() => {
    if (formState.fullName.length > 2) scrollToRef(businessNameRef);
  }, [formState.fullName.length > 2]);

  useEffect(() => {
    if (formState.businessName.length > 2) scrollToRef(emailRef);
  }, [formState.businessName.length > 2]);

  useEffect(() => {
    if (formState.email.includes('@')) scrollToRef(emailOtpRef);
  }, [formState.email.includes('@')]);

  useEffect(() => {
    if (formState.emailOtp === '0000') scrollToRef(phoneRef);
  }, [formState.emailOtp === '0000']);

  useEffect(() => {
    if (formState.phone.length >= 10) scrollToRef(phoneOtpRef);
  }, [formState.phone.length >= 10]);

  useEffect(() => {
    if (formState.phoneOtp === '1234') scrollToRef(locationRef);
  }, [formState.phoneOtp === '1234']);

  useEffect(() => {
    if (formState.city.length > 2 && formState.category) scrollToRef(passwordRef);
  }, [formState.city.length > 2, formState.category]);

  const { stepId } = useParams();
  
  // Clean multi-step navigation controller:
  // Step 1: Main Category Selection
  // Step 2: Sub Category Selection (Same as user's first image!)
  // Step 3: Registration Profile Details Form
  const currentStep = stepId === 'subcategory' ? 2 : stepId === 'details' ? 3 : 1;

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

  // Validate that selectedSubCategory is a valid option under selectedCategory.
  // If it is not (e.g., loaded from historical cache), clear it so Next is correctly disabled.
  useEffect(() => {
    if (selectedCategory) {
      const validSubCats = getSubCategoriesForMain(selectedCategory);
      const isValid = validSubCats.some(sub => sub.name === selectedSubCategory);
      if (!isValid && selectedSubCategory !== '') {
        setSelectedSubCategory('');
        const updated = { ...formState, subCategory: '' };
        setFormState(updated);
        updateVendorState({ registration: updated });
      }
    }
  }, [selectedCategory, selectedSubCategory]);

  const handleChange = (field, value) => {
    const updated = { ...formState, [field]: value };
    setFormState(updated);
    updateVendorState({ registration: updated });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory('');
    
    // Update both fields in a single atomic update to clear subCategory
    const updated = { ...formState, category, subCategory: '' };
    setFormState(updated);
    updateVendorState({ registration: updated });
  };

  const handleSubCategorySelect = (subCategory) => {
    handleChange('subCategory', subCategory);
    setSelectedSubCategory(subCategory);
  };

  const handleBackNavigation = () => {
    if (currentStep === 3) {
      navigate('/vendor/register/subcategory');
    } else if (currentStep === 2) {
      navigate('/vendor/register/category');
    } else {
      navigate(-1);
    }
  };

  const requiredFields = ['fullName', 'businessName', 'email', 'phone', 'city', 'category', 'subCategory', 'password', 'emailOtp', 'phoneOtp'];
  const progressCount = requiredFields.filter(f => formState[f] && formState[f].length > 0).length;
  const progressPercent = Math.round((progressCount / 10) * 100);

  return (
    <div className="w-full min-h-[100dvh] sm:h-auto sm:max-w-xl sm:mx-auto flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Super Compact Card wrapper */}
      <div className="bg-white min-h-[100dvh] sm:min-h-0 sm:h-auto w-full rounded-none sm:rounded-[28px] shadow-none sm:shadow-[0_12px_40px_rgba(124,58,237,0.08)] border-0 sm:border border-slate-100 flex flex-col transition-all duration-300">
        
        {/* Logo inside card */}
        <div className="flex flex-col items-center justify-center pt-2.5 pb-1 select-none flex-shrink-0">
          <div className="pointer-events-auto flex items-center gap-1.5 cursor-pointer group" onClick={() => window.location.href = '/'}>
            <div className="relative">
              <img src="/assets/vendor/logo_theme.png" alt="Utsavo Logo" className="h-8 sm:h-11 w-auto rounded-lg shadow-sm transition-all duration-300 group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-lg sm:text-2xl font-black italic tracking-tighter bg-clip-text text-transparent leading-none" style={{
                fontFamily: "'Playfair Display', serif",
                backgroundImage: 'linear-gradient(135deg, #7c3aed, #6d28d9, #5b21b6)'
              }}>Utsavo</h1>
              <div className="mt-0.5 flex items-center gap-0.5">
                <div className="h-[1px] w-4 bg-gradient-to-r from-rose-700/40 to-transparent"></div>
                <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.25em] text-rose-800/80 leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Elite Wedding Network
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Mockup Navigation Bar */}
        <div className="flex items-center justify-between px-4 pt-2.5 pb-1 mt-1 relative select-none flex-shrink-0">
          <button 
            type="button"
            onClick={handleBackNavigation} 
            className="p-0.5 rounded-lg text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center"
          >
            {/* Elegant Back Arrow matching mockup */}
            <ArrowLeft className="w-5.5 h-5.5 text-slate-900" strokeWidth={2.5} />
          </button>
          <h2 className="text-[15px] sm:text-[17px] text-slate-800 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
            Vendor Registration
          </h2>
          <div className="w-8" />
        </div>

        {/* Mockup Connected Stepper Circles 1-2-3-4-5-6-7 */}
        <div className="relative flex-shrink-0 flex items-center justify-between w-full max-w-[260px] mx-auto mt-2 mb-3 px-1 select-none">
          {/* Horizontal Line behind */}
          <div className="absolute top-1/2 left-3 right-3 h-[1px] bg-slate-200 -translate-y-1/2 z-0" />
          
          {[1, 2, 3, 4, 5, 6, 7].map((num) => {
            const isActive = currentStep === num;
            const isCompleted = currentStep > num;

            return (
              <div key={num} className="relative z-10 flex items-center justify-center">
                <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#4F35C3] text-white shadow-sm ring-4 ring-[#4F35C3]/10 scale-105'
                    : isCompleted
                      ? 'bg-violet-100 text-[#4F35C3] border border-violet-200'
                      : 'bg-white text-slate-800 border border-slate-200'
                }`}>
                  {num}
                </div>
              </div>
            );
          })}
        </div>

        {/* Form Content Wrapper with natural scrolling */}
        <div className="px-4 sm:px-6 pb-6 sm:pb-8 flex-1">
          {currentStep === 1 ? (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              {/* Titles Step 1 */}
              <div className="text-center px-3 mb-1 select-none flex-shrink-0">
                <h2 className="text-[17px] sm:text-2xl text-slate-900 tracking-tight leading-snug max-w-[320px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 750 }}>
                  Choose Your Main Category
                </h2>
                <p className="mt-0.5 text-[8.5px] sm:text-[10px] text-slate-400 max-w-[320px] mx-auto font-semibold leading-normal">
                  Select the category that best describes your business
                </p>
              </div>

              {/* 3-Column Grid matching mockup exactly */}
              <div className="grid gap-1.5 grid-cols-3">
                {categories.length > 0 ? (
                  categories.map((cat) => {
                    const details = getCategoryMockupDetails(cat.name);
                    const isSelected = selectedCategory === cat.name;

                    // Dynamically override/clone the icon to scale it up and color it unified purple matching the mockup style
                    const enlargedIcon = details.icon ? React.cloneElement(details.icon, {
                      className: "w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
                      stroke: "#4F35C3",
                      strokeOpacity: isSelected ? 1 : 0.75,
                      fill: "#4F35C3",
                      fillOpacity: isSelected ? 0.15 : 0.08
                    }) : null;

                    return (
                      <button
                        key={cat._id || cat.name}
                        type="button"
                        onClick={() => handleCategorySelect(cat.name)}
                        className={`group relative flex flex-col items-center justify-center gap-1 rounded-[12px] border-2 p-1.5 sm:p-2 text-center transition-all duration-300 aspect-[1.3/1] sm:aspect-[1.15/1] ${
                          isSelected 
                            ? 'border-[#4F35C3] bg-[#EBE9FF] shadow-[0_4px_16px_rgba(79,53,195,0.08)] scale-[1.03]' 
                            : 'border-[#E5E2FF] bg-[#F7F6FF] hover:border-[#D5D1FF] hover:bg-[#F2F0FF]'
                        }`}
                      >
                        {/* Mockup-matched top-right checkmark badge overlapping the border intersection */}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-[#4F35C3] text-white rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-150 z-10 border-2 border-white">
                            <Check className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={4.5} />
                          </div>
                        )}

                        <div className="flex-shrink-0 flex items-center justify-center">
                          {enlargedIcon}
                        </div>
                        <div className="min-w-0 w-full text-center">
                          <p className={`text-[8px] sm:text-[9.5px] font-extrabold leading-tight tracking-tight text-slate-800 transition-colors break-words ${
                            isSelected ? 'text-[#4F35C3]' : ''
                          }`}>
                            {details.label}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-3 rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-500 font-semibold text-xs">
                    <div className="w-5 h-5 rounded-full border-2 border-[#4F35C3]/30 border-t-[#4F35C3] animate-spin mx-auto mb-2" />
                    Loading categories...
                  </div>
                )}
              </div>

              {/* Next Button for Step 1 */}
              <div className="mt-2.5 flex-shrink-0 flex flex-col items-center gap-2">
                <button
                  type="button"
                  disabled={!selectedCategory}
                  onClick={() => navigate('/vendor/register/subcategory')}
                  className={`w-full rounded-xl py-2 text-xs sm:text-sm font-extrabold text-white shadow-sm transition-all duration-200 ${
                    !selectedCategory 
                      ? 'bg-[#4F35C3]/40 cursor-not-allowed text-white/80' 
                      : 'bg-[#4F35C3] hover:shadow-[0_4px_12px_rgba(79,53,195,0.15)] hover:brightness-105 active:scale-95'
                  }`}
                >
                  Next
                </button>

                <button 
                  type="button"
                  onClick={() => navigate('/vendor/login')} 
                  className="text-[10px] sm:text-xs font-extrabold text-[#4F35C3] hover:text-[#3f2aa6] transition-colors leading-none py-1"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </div>
          ) : currentStep === 2 ? (
            <div className="flex flex-col h-full animate-in fade-in duration-300 select-none">
              
              {/* Central circular category badge matching mockup */}
              <div className="flex justify-center mb-2.5 flex-shrink-0">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-[#EEECFF] flex items-center justify-center relative border-4 border-[#F5F3FF] transition-all duration-300">
                  <div className="flex items-center justify-center">
                    {React.cloneElement(getCategoryMockupDetails(selectedCategory)?.icon || <Sparkles />, {
                      className: "w-6.5 h-6.5 sm:w-8 sm:h-8 text-[#4F35C3]",
                      stroke: "#4F35C3",
                      strokeWidth: 1.8,
                      fill: "#4F35C3",
                      fillOpacity: 0.15
                    })}
                  </div>
                </div>
              </div>

              {/* Dynamic Header titles matching mockup */}
              <div className="text-center px-3 mb-4 flex-shrink-0">
                <h2 className="text-[18px] sm:text-[22px] text-slate-900 tracking-tight font-bold leading-tight max-w-[280px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {getCategoryMockupDetails(selectedCategory)?.label || selectedCategory}
                </h2>
                <p className="mt-1 text-[10.5px] sm:text-[12.5px] text-slate-500 max-w-[320px] mx-auto font-medium leading-normal">
                  Select the option that best matches your business
                </p>
              </div>

              {/* Sub-categories Vertical List matching mockup image perfectly */}
              <div className="space-y-2.5 max-w-md mx-auto w-full">
                {getSubCategoriesForMain(selectedCategory).map((subOption) => {
                  const isSelected = selectedSubCategory === subOption.name;

                  return (
                    <button
                      key={subOption.name}
                      type="button"
                      onClick={() => handleSubCategorySelect(subOption.name)}
                      className={`w-full text-left rounded-[16px] border p-3 sm:p-4 flex items-center gap-3 transition-all duration-200 ${
                        isSelected 
                          ? 'border-[#4F35C3] border-2 bg-[#F5F3FF]/20 shadow-[0_4px_16px_rgba(79,53,195,0.06)] scale-[1.01]' 
                          : 'border-slate-100/90 bg-white hover:border-slate-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.01)]'
                      }`}
                    >
                      {/* Left colored high-fidelity icon */}
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        {renderSubCategoryIcon(subOption.icon, isSelected)}
                      </div>

                      {/* Middle description texts */}
                      <div className="min-w-0 flex-1 pl-1">
                        <h4 className={`text-[12px] sm:text-[14px] font-bold transition-colors duration-200 ${
                          isSelected ? 'text-[#4F35C3]' : 'text-slate-800'
                        }`}>
                          {subOption.name}
                        </h4>
                        <p className="text-[10px] sm:text-[11.5px] text-slate-500 font-normal leading-normal mt-0.5 break-words">
                          {subOption.desc}
                        </p>
                      </div>

                      {/* Right Chevron arrow */}
                      <div className="flex-shrink-0">
                        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isSelected ? 'text-[#4F35C3] translate-x-0.5' : 'text-slate-400'}`} strokeWidth={2.5} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Next Button for Step 2 */}
              <div className="mt-4 max-w-md mx-auto w-full px-1 flex-shrink-0 flex flex-col items-center gap-2.5">
                <button
                  type="button"
                  disabled={!selectedSubCategory}
                  onClick={() => navigate('/vendor/register/details')}
                  className={`w-full rounded-xl py-2.5 sm:py-3 text-[13px] sm:text-[15px] font-extrabold text-white shadow-sm transition-all duration-200 ${
                    !selectedSubCategory 
                      ? 'bg-[#4F35C3]/40 cursor-not-allowed text-white/80' 
                      : 'bg-[#4F35C3] hover:shadow-[0_4px_16px_rgba(79,53,195,0.2)] hover:brightness-105 active:scale-95'
                  }`}
                >
                  Next
                </button>

                <button 
                  type="button"
                  onClick={() => navigate('/vendor/login')} 
                  className="text-[10.5px] sm:text-xs font-bold text-[#4F35C3] hover:text-[#3f2aa6] transition-colors leading-none py-1"
                >
                  Already have an account? Sign In
                </button>
              </div>

            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300 pb-2">
              
              {/* Title Step 3 */}
              <div className="text-center px-3 mt-4 sm:mt-5 mb-2 sm:mb-2.5 select-none flex-shrink-0">
                <h2 className="text-[17px] sm:text-xl text-slate-800 tracking-tight leading-snug" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                  Register Your Business
                </h2>
                <p className="mt-0.5 text-[9px] sm:text-[11px] text-slate-400 max-w-[280px] mx-auto font-semibold leading-normal">
                  Enter your professional details to set up your profile.
                </p>
              </div>

              {/* Dynamic Compact Progress Bar */}
              <div className="mb-2 mx-1 flex items-center gap-2 bg-slate-50/50 p-1 rounded-lg border border-slate-100/80 flex-shrink-0">
                <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider pl-1 select-none">Progress</span>
                <div className="h-1 flex-1 rounded-full overflow-hidden bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(90deg, #4F35C3, #db2777)'
                    }}
                  />
                </div>
                <span className="text-[8px] font-extrabold text-[#4F35C3] pr-1 select-none">{progressPercent}%</span>
              </div>

              {/* Selected Main and Sub Category Info Pill */}
              <div 
                className="rounded-[16px] border border-slate-100/90 p-2.5 sm:p-3 bg-slate-50/50 flex items-center justify-between gap-3 shadow-sm mb-2.5 flex-shrink-0"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EEECFF] flex items-center justify-center flex-shrink-0 border border-violet-100">
                    {getCategoryMockupDetails(selectedCategory)?.icon ? React.cloneElement(getCategoryMockupDetails(selectedCategory).icon, {
                      className: "w-5 h-5 sm:w-5.5 sm:h-5.5 flex-shrink-0"
                    }) : <Sparkles className="w-5 h-5 sm:w-5.5 sm:h-5.5 flex-shrink-0" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] sm:text-[9.5px] font-bold uppercase tracking-wider text-slate-400 leading-normal">
                      Selected Role
                    </p>
                    <h3 className="text-[11.5px] sm:text-[13px] font-bold text-slate-800 mt-0.5 leading-normal break-words">
                      {getCategoryMockupDetails(selectedCategory)?.label || selectedCategory} • {selectedSubCategory}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubCategory('');
                    handleChange('subCategory', '');
                    setCurrentStep(2);
                  }}
                  className="text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[#4F35C3] hover:bg-slate-50 transition-colors shadow-sm flex-shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Inline Error Banner */}
              {submitError && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 animate-in fade-in duration-200">
                  <div className="flex-shrink-0 w-4 h-4 mt-0.5 rounded-full bg-rose-500 flex items-center justify-center">
                    <span className="text-white text-[8px] font-black">!</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-rose-700 leading-snug">{submitError}</p>
                    {submitError.toLowerCase().includes('email') && (
                      <button
                        type="button"
                        onClick={() => navigate('/vendor/login')}
                        className="mt-1 text-[10px] font-extrabold text-[#4F35C3] underline"
                      >
                        Sign in instead →
                      </button>
                    )}
                    {submitError.toLowerCase().includes('phone') && (
                      <button
                        type="button"
                        onClick={() => navigate('/vendor/login')}
                        className="mt-1 text-[10px] font-extrabold text-[#4F35C3] underline"
                      >
                        Sign in instead →
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitError('')}
                    className="flex-shrink-0 text-rose-400 hover:text-rose-600 text-[14px] font-black leading-none"
                  >×</button>
                </div>
              )}

              {/* Full Name */}
              <div className="flex flex-col">
                <label className="text-[10px] sm:text-[11.5px] font-bold uppercase tracking-wider ml-1 text-slate-500 mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Full name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#4F35C3]">
                    <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
                  </div>
                  <input
                    autoFocus
                    className="w-full rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border border-slate-200 bg-slate-50/20 focus:border-[#4F35C3] focus:bg-white focus:ring-2 focus:ring-[#4F35C3]/5 outline-none transition-all duration-150"
                    value={formState.fullName}
                    onChange={(event) => handleChange('fullName', event.target.value.replace(/[^a-zA-Z ]/g, ''))}
                    placeholder="e.g. Aditi Kapoor"
                  />
                </div>
              </div>

              {/* Business Name */}
              {formState.fullName.length > 2 && (
                <div ref={businessNameRef} className="flex flex-col animate-in fade-in duration-150">
                  <label className="text-[10px] sm:text-[11.5px] font-bold uppercase tracking-wider ml-1 text-slate-500 mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Business name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#4F35C3]">
                      <Store className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
                    </div>
                    <input
                      className="w-full rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border border-slate-200 bg-slate-50/20 focus:border-[#4F35C3] focus:bg-white focus:ring-2 focus:ring-[#4F35C3]/5 outline-none transition-all duration-150"
                      value={formState.businessName}
                      onChange={(event) => handleChange('businessName', event.target.value)}
                      placeholder="e.g. Emerald Studio"
                    />
                  </div>
                </div>
              )}

              {/* Email & OTP */}
              {formState.businessName.length > 2 && (
                <div ref={emailRef} className="flex flex-col animate-in fade-in duration-150">
                  <label className="text-[10px] sm:text-[11.5px] font-bold uppercase tracking-wider ml-1 text-slate-500 mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Email address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#4F35C3]">
                      <Mail className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
                    </div>
                    <input
                      type="email"
                      className="w-full rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border border-slate-200 bg-slate-50/20 focus:border-[#4F35C3] focus:bg-white focus:ring-2 focus:ring-[#4F35C3]/5 outline-none transition-all duration-150"
                      value={formState.email}
                      onChange={(event) => handleChange('email', event.target.value)}
                      placeholder="hello@emeraldstudio.in"
                    />
                  </div>
                  {/* OTP Verification Box */}
                  {formState.email.includes('@') && (
                    <div ref={emailOtpRef} className="flex flex-col mt-3.5 animate-in fade-in duration-150">
                      <label className="text-[10px] sm:text-[11.5px] font-bold uppercase tracking-wider ml-1 text-[#4F35C3] mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Email Verification OTP</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#4F35C3]">
                          <Lock className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
                        </div>
                        <input
                          maxLength="4"
                          className="w-full rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold tracking-widest border border-rose-200/80 bg-rose-50/5 focus:border-[#4F35C3] focus:bg-white focus:ring-2 focus:ring-[#4F35C3]/5 outline-none transition-all duration-150"
                          value={formState.emailOtp}
                          onChange={(e) => handleChange('emailOtp', e.target.value)}
                          placeholder="Enter 4-digit Email OTP (Type 0000)"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Phone & OTP */}
              {formState.emailOtp === '0000' && (
                <div ref={phoneRef} className="flex flex-col animate-in fade-in duration-150">
                  <label className="text-[10px] sm:text-[11.5px] font-bold uppercase tracking-wider ml-1 text-slate-500 mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Phone number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#4F35C3]">
                      <Phone className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
                    </div>
                    <input
                      className="w-full rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border border-slate-200 bg-slate-50/20 focus:border-[#4F35C3] focus:bg-white focus:ring-2 focus:ring-[#4F35C3]/5 outline-none transition-all duration-150"
                      value={formState.phone}
                      onChange={(event) => {
                          const val = event.target.value.replace(/\D/g, '').slice(0, 10);
                          handleChange('phone', val);
                      }}
                      placeholder="9876543210"
                    />
                  </div>
                  {/* Phone OTP Verification Box */}
                  {formState.phone.length >= 10 && (
                    <div ref={phoneOtpRef} className="flex flex-col mt-3.5 animate-in fade-in duration-150">
                      <label className="text-[10px] sm:text-[11.5px] font-bold uppercase tracking-wider ml-1 text-[#4F35C3] mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Phone Verification OTP</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#4F35C3]">
                          <Lock className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
                        </div>
                        <input
                          maxLength="4"
                          className="w-full rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold tracking-widest border border-rose-200/80 bg-rose-50/5 focus:border-[#4F35C3] focus:bg-white focus:ring-2 focus:ring-[#4F35C3]/5 outline-none transition-all duration-150"
                          value={formState.phoneOtp}
                          onChange={(e) => handleChange('phoneOtp', e.target.value)}
                          placeholder="Enter 4-digit Phone OTP (Type 1234)"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Location & Category */}
              {formState.phoneOtp === '1234' && (
                <div ref={locationRef} className="grid sm:grid-cols-2 gap-3.5 animate-in fade-in duration-150">
                  <div className="flex flex-col">
                    <label className="text-[10px] sm:text-[11.5px] font-bold uppercase tracking-wider ml-1 text-slate-500 mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Location</label>
                    <input
                      className="w-full rounded-xl px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border border-slate-200 bg-slate-50/20 focus:border-[#4F35C3] focus:bg-white focus:ring-2 focus:ring-[#4F35C3]/5 outline-none transition-all duration-150"
                      value={formState.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="e.g. Indore"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] sm:text-[11.5px] font-bold uppercase tracking-wider ml-1 text-slate-500 mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Category</label>
                    <input
                      readOnly
                      className="w-full rounded-xl px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border border-slate-200 outline-none bg-slate-100 text-slate-400"
                      value={selectedSubCategory}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              {formState.city.length > 2 && formState.category && (
                <div ref={passwordRef} className="flex flex-col animate-in fade-in duration-150">
                  <label className="text-[10px] sm:text-[11.5px] font-bold uppercase tracking-wider ml-1 text-slate-500 mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Password</label>
                  <input
                    type="password"
                    className="w-full rounded-xl px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border border-slate-200 bg-slate-50/20 focus:border-[#4F35C3] focus:bg-white focus:ring-2 focus:ring-[#4F35C3]/5 outline-none transition-all duration-150"
                    value={formState.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>
              )}

              {/* Action Buttons for Step 3 */}
              <div className="mt-3 flex flex-col items-center gap-2 select-none">
                <button
                  type="button"
                  disabled={formState.password.length < 8 || isSubmitting}
                  className={`w-full rounded-xl py-2 text-xs sm:text-sm font-extrabold text-white shadow-sm transition-all duration-200 ${
                    formState.password.length < 8 || isSubmitting
                      ? 'bg-slate-300 opacity-70 cursor-not-allowed shadow-none text-white/80' 
                      : 'bg-[#4F35C3] hover:shadow-[0_4px_12px_rgba(79,53,195,0.15)] hover:brightness-105 active:scale-95'
                  }`}
                  onClick={async () => {
                    if (formState.password.length < 8) return;
                    setIsSubmitting(true);
                    setSubmitError('');
                    
                    if (localStorage.getItem('vendorToken')) {
                      navigate('/vendor/onboarding/portfolio');
                      setIsSubmitting(false);
                      return;
                    }
                    
                    try {
                      const res = await vendorApi.register(formState);
                      if (res.success) {
                        localStorage.setItem('vendorToken', res.token);
                        // Sync both the backend vendor object AND the registration fields
                        // so the onboarding guards (which check vendorState.registration.category/subCategory) pass correctly
                        updateVendorState({
                          ...res.vendor,
                          registration: {
                            fullName: formState.fullName,
                            businessName: formState.businessName,
                            email: formState.email,
                            phone: formState.phone,
                            city: formState.city,
                            category: formState.category,
                            subCategory: formState.subCategory,
                            password: formState.password
                          }
                        });
                        navigate('/vendor/onboarding/portfolio');
                      } else {
                        setSubmitError(res.message || 'Registration failed. Please try again.');
                        // Auto-clear error after 6 seconds
                        setTimeout(() => setSubmitError(''), 6000);
                      }
                    } catch (err) {
                      setSubmitError('Unable to connect to server. Please check your internet and try again.');
                      setTimeout(() => setSubmitError(''), 6000);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  Get Started {isSubmitting ? '⏳' : '✨'}
                </button>

                <button 
                  type="button"
                  onClick={() => navigate('/vendor/login')} 
                  className="text-[10px] sm:text-xs font-extrabold text-[#4F35C3] hover:text-[#3f2aa6] transition-colors leading-none py-1"
                >
                  Already have an account? Sign In
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default VendorRegister;
