import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import weddingImg from '../../../assets/wedding.png';
import { useVendorState } from '../useVendorState';
import { vendorApi } from '../vendorApi';
import { computeProfileCompletion } from '../vendorStore';
import VendorPendingApproval from '../components/VendorPendingApproval';

// Advertisement Banner Images
import ads1 from '../../../assets/vendor/ads1.png';
import ads2 from '../../../assets/vendor/ads2.png';
import ads3 from '../../../assets/vendor/ads3.png';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { vendorState, refreshData, loading } = useVendorState();
  const [banners, setBanners] = useState([]);
  const stats = vendorState.analytics || {
    profileViews: 0,
    inquiries: 0,
    bookings: 0,
    conversionRate: 0,
    reviewsCount: 0
  };
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const scrollRef = useRef(null);

  // Fallback banners in case backend is empty
  const sampleBanners = [
    { _id: 's1', imageUrl: ads1, title: 'Grow Business', description: 'Reach more couples' },
    { _id: 's2', imageUrl: ads2, title: 'Premium Leads', description: 'Verified inquiries' },
    { _id: 's3', imageUrl: ads3, title: 'Top Visibility', description: 'Featured listing' },
  ];

  const activeBanners = banners.length > 0 ? banners : sampleBanners;
  
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('vendorToken');
      const bannersRes = await vendorApi.getDashboardBanners(token);
      if (bannersRes.success) setBanners(bannersRes.data);
    } catch (err) {
      console.error('Error fetching dashboard banners:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Autoscroll Logic
  useEffect(() => {
    if (activeBanners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * currentAdIndex;
      scrollRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [currentAdIndex]);

  // Scroll Reveal Logic
  useEffect(() => {
    if (loading) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          // Once revealed, we can stop observing this element
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealedElements = document.querySelectorAll('.reveal-on-scroll');
    revealedElements.forEach(el => observer.observe(el));

    return () => {
      revealedElements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, [loading, vendorState]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-rose-400 border-t-transparent rounded-full"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waking up your dashboard...</p>
      </div>
    );
  }

  if (vendorState.status === 'Pending') {
    return <VendorPendingApproval />;
  }

  const completion = computeProfileCompletion(vendorState);

  const statCards = [
    { 
      label: "Views", 
      value: stats.profileViews, 
      sub: "Total Views",
      icon: "eye", 
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
      iconBg: "#7C3AED", 
      watermarkColor: "rgba(124, 58, 237, 0.08)",
      to: "/vendor/profile" 
    },
    { 
      label: "Leads", 
      value: stats.inquiries, 
      sub: "Inquiries",
      icon: "envelope", 
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      iconBg: "#F59E0B", 
      watermarkColor: "rgba(245, 158, 11, 0.1)",
      to: "/vendor/leads" 
    },
    { 
      label: "Events", 
      value: stats.bookings, 
      sub: "Active Bookings",
      icon: "calendar", 
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      iconBg: "#10B981", 
      watermarkColor: "rgba(16, 185, 129, 0.1)",
      to: "/vendor/bookings" 
    },
    { 
      label: "Rate", 
      value: stats.conversionRate + "%", 
      sub: "Conversion Rate",
      icon: "chart", 
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      iconBg: "#3B82F6", 
      watermarkColor: "rgba(59, 130, 246, 0.1)",
      to: "/vendor/leads" 
    }
  ];

  const quickActions = [
    { label: "Add Service", icon: "plus", circleBg: "#7C3AED", bg: "bg-purple-50", to: "/vendor/services" },
    { label: "Update Availability", icon: "calendar", circleBg: "#10B981", bg: "bg-emerald-50", to: "/vendor/calendar" },
    { label: "Upload Portfolio", icon: "image", circleBg: "#F59E0B", bg: "bg-amber-50", to: "/vendor/portfolio" },
    { label: "View Leads", icon: "users", circleBg: "#3B82F6", bg: "bg-blue-50", to: "/vendor/inquiries" },
    { label: "Create Quotation", icon: "checkList", circleBg: "#8B5CF6", bg: "bg-violet-50", to: "/vendor/quotes" },
    { label: "Chat with Customers", icon: "chat", circleBg: "#EC4899", bg: "bg-pink-50", to: "/vendor/chat" },
    { label: "Request Payment", icon: "money", circleBg: "#06B6D4", bg: "bg-cyan-50", to: "/vendor/earnings" },
    { label: "Mark Event Completed", icon: "check", circleBg: "#10B981", bg: "bg-emerald-50", to: "/vendor/bookings" },
  ];

  return (
    <div className="space-y-3 sm:space-y-5 animate-in fade-in duration-500 pb-20 sm:pb-0">
      <style>{`
        .font-heading { font-family: 'Poppins', sans-serif; }
        .font-sans { font-family: 'Poppins', sans-serif; }

        @keyframes flipIn {
          0% {
            opacity: 0;
            transform: perspective(1000px) rotateY(90deg) scale(0.95);
          }
          70% {
            transform: perspective(1000px) rotateY(-10deg) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: perspective(1000px) rotateY(0deg) scale(1);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-active {
          opacity: 1;
          transform: translateY(0);
        }
        
        .card-premium {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
      `}</style>
      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className={`rounded-xl p-2 sm:p-3 h-16 sm:h-20 group cursor-pointer border transition-all duration-300 hover:scale-[1.02] hover:shadow-md relative overflow-hidden flex items-center justify-between shadow-2xs ${stat.bgColor} ${stat.borderColor}`}
            style={{ 
              animation: 'flipIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              animationDelay: `${i * 0.12}s`,
              opacity: 0
            }}
            onClick={() => navigate(stat.to)}
          >
            {/* Concentric Circle Waves in Background */}
            <div className="absolute -right-6 -bottom-6 w-28 sm:w-32 h-28 sm:h-32 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500" style={{ background: stat.watermarkColor }}></div>
            <div className="absolute -right-12 -bottom-12 w-36 sm:w-44 h-36 sm:h-44 rounded-full pointer-events-none" style={{ background: stat.watermarkColor }}></div>

            {/* Left Content: Title + Value + Subtitle */}
            <div className="relative z-10 flex flex-col justify-center min-w-0 flex-1 py-0.5">
              <h3 className="text-[11px] sm:text-sm font-heading font-extrabold text-slate-700 tracking-tight leading-none mb-1 sm:mb-1.5 truncate">{stat.label}</h3>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5 min-w-0 mt-0.5 sm:mt-0">
                <span className="text-lg sm:text-2xl font-heading font-black text-slate-900 tracking-tight truncate leading-none">{stat.value}</span>
                <span className="text-[9px] sm:text-[11px] font-sans font-bold text-slate-500 truncate leading-none mt-0.5 sm:mt-0 uppercase tracking-wider">{stat.sub}</span>
              </div>
            </div>

            {/* Right Content: Solid Icon Badge */}
            <div 
              className="relative z-10 ml-1.5 sm:ml-2 h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-xs flex-shrink-0 group-hover:rotate-6 transition-transform duration-300"
              style={{ background: stat.iconBg }}
            >
              <Icon name={stat.icon} size="sm" color="currentColor" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Card (Professional - Black Typography) */}
      <div 
        className="reveal-on-scroll rounded-2xl !px-1.5 !py-3 bg-white border border-slate-100 shadow-sm font-sans"
      >
        <div className="flex items-center justify-between mb-4 px-3">
          <h3 className="text-[12px] font-sans font-bold text-black tracking-[0.05em] uppercase">Quick Actions</h3>
          <span className="text-[10px] font-semibold text-[#7C3AED] hover:underline cursor-pointer tracking-wide">View All</span>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-1 pb-1 pt-0.5 px-1 items-start">
          {[
            { label: "ADD\nSERVICE", icon: "plus", circleBg: "#7C3AED", bg: "bg-purple-50", to: "/vendor/services" },
            { label: "UPDATE\nAVAIL", icon: "calendar", circleBg: "#10B981", bg: "bg-emerald-50", to: "/vendor/calendar" },
            { label: "UPLOAD\nPORTFOLIO", icon: "image", circleBg: "#F59E0B", bg: "bg-amber-50", to: "/vendor/portfolio" },
            { label: "VIEW\nLEADS", icon: "users", circleBg: "#3B82F6", bg: "bg-blue-50", to: "/vendor/inquiries" },
            { label: "CREATE\nQUOTE", icon: "checkList", circleBg: "#8B5CF6", bg: "bg-violet-50", to: "/vendor/quotes" },
            { label: "CHAT\nCUSTOMERS", icon: "chat", circleBg: "#EC4899", bg: "bg-pink-50", to: "/vendor/chat" },
          ].map((act, i) => (
            <div 
              key={act.label}
              className="flex flex-col items-center cursor-pointer group flex-shrink-0 min-w-[72px]"
              style={{ animation: 'scaleIn 0.5s ease-out both', animationDelay: `${0.5 + i * 0.05}s` }}
              onClick={() => navigate(act.to)}
            >
              <div 
                className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 active:scale-95 shadow-sm ${act.bg} border border-slate-100/50`}
              >
                <div 
                  className="h-7 w-7 rounded-full flex items-center justify-center text-white shadow-xs"
                  style={{ background: act.circleBg }}
                >
                  <Icon name={act.icon} size="sm" color="currentColor" />
                </div>
              </div>
              <span className="text-[8px] font-bold text-black mt-2 text-center leading-[1.1] whitespace-pre-line uppercase tracking-tight">
                {act.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Autoscrolling Banners */}
      {activeBanners.length > 0 && (
        <div 
          className="reveal-on-scroll rounded-xl overflow-hidden relative group shadow-lg"
        >
          <div
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth"
          >
            {activeBanners.map((ad) => (
              <div key={ad._id} className="min-w-full h-40 sm:h-56 relative snap-center overflow-hidden cursor-pointer" onClick={() => ad.linkUrl && navigate(ad.linkUrl)}>
                <img src={ad.imageUrl} alt={ad.title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent p-8 flex flex-col justify-end">
                  <h4 className="text-white text-xl sm:text-3xl font-black tracking-tight leading-none uppercase italic">{ad.title}</h4>
                  <p className="text-white/80 text-[11px] font-bold uppercase tracking-widest mt-2">{ad.description}</p>
                </div>
                <div className="absolute top-6 right-6">
                  <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[9px] font-black text-white uppercase tracking-widest shadow-sm">Utsav Special</div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {activeBanners.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentAdIndex ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/40'}`}></div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Completion */}
      <div 
        className="reveal-on-scroll rounded-2xl relative overflow-hidden group shadow-md border border-slate-100 bg-gradient-to-br from-[#FFF5F7] to-white"
      >
        <div className="absolute top-0 right-[-20px] sm:right-0 h-full w-3/5 sm:w-1/2 z-0 pointer-events-none overflow-hidden">
          <img
            src={weddingImg}
            alt="Wedding Couple"
            className="h-full w-full object-contain object-right-bottom sm:object-right transition-transform duration-700 group-hover:scale-110 opacity-90"
          />
        </div>

        <div className="p-4 sm:p-7 relative z-10">
          <div className="flex flex-col w-3/4 sm:w-3/5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-[9px] font-sans font-black uppercase tracking-[0.2em] text-[#9D174D]">Profile Strength</p>
                <span className={`text-[8px] font-sans font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${completion > 80 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                  {completion > 80 ? 'Verified' : 'Action Required'}
                </span>
              </div>
              <h3 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 tracking-tighter leading-none mt-2">{completion}% Complete</h3>
              <p className="text-[11px] sm:text-xs font-sans font-medium text-slate-500 mt-4 max-w-xs leading-relaxed">
                {completion < 100 ? 'Complete your business profile and bank details to unlock higher visibility and trust with customers.' : 'Your profile is 100% complete. You are getting maximum exposure!'}
              </p>
            </div>

            <div className="mt-6 h-2 w-full max-w-md rounded-full overflow-hidden bg-slate-50 border border-slate-100">
              <div className="h-full rounded-full transition-all duration-1000" style={{
                width: completion + '%',
                background: 'linear-gradient(90deg, #ed648f, #9D174D)',
              }}></div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button 
                type="button" 
                className="vendor-cta rounded-full px-8 h-12 text-[10px] font-heading font-black uppercase tracking-[0.15em] text-white shadow-lg active:scale-95 transition-all flex items-center gap-2 bg-gradient-to-r from-[#9D174D] to-[#ed648f]"
                onClick={() => navigate('/vendor/profile')}
              >
                <Icon name="edit" size="xs" /> Optimize Profile
              </button>
              <button
                type="button"
                className="rounded-full px-8 h-12 text-[10px] font-heading font-black uppercase tracking-[0.15em] border border-slate-200 text-slate-700 bg-white/50 backdrop-blur-md hover:bg-white active:scale-95 transition-all"
                onClick={() => refreshData()}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Grid: Enquiries & Bookings */}
      <div className="grid gap-3 sm:gap-5 lg:grid-cols-2">
        {/* New Enquiries Section */}
        <div 
          className="reveal-on-scroll bg-gradient-to-br from-indigo-50/40 to-white rounded-2xl p-3 sm:p-5 border border-indigo-100 shadow-sm font-sans"
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm sm:text-base font-heading font-extrabold text-slate-900 tracking-tight uppercase">New Enquiries</h3>
            <span className="text-xs font-sans font-bold text-[#7C3AED] hover:underline cursor-pointer tracking-wide">View All</span>
          </div>
          <div className="space-y-3">
            {(vendorState.leads || []).slice(0, 3).map((enq, idx) => {
              const realImages = [
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", // Female
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150", // Male
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150"  // Female
              ];
              const profileImg = enq.img || realImages[idx % realImages.length];
              
              return (
              <div key={enq._id || enq.id} className="group relative flex items-start gap-2.5 p-1.5 sm:p-2 rounded-lg border border-white bg-white shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-300">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-100">
                  <img src={profileImg} alt={enq.customerName} className="h-full w-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[14px] sm:text-[16px] font-heading font-extrabold text-slate-900 truncate leading-none tracking-tight">{enq.customerName}</h4>
                    <span className={`text-[9px] font-sans font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${enq.status === 'New' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{enq.status}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] sm:text-[12px] font-sans font-bold text-slate-500 truncate leading-none uppercase tracking-wider">{enq.category || 'Wedding Inquiry'}</p>
                    <p className="text-[13px] sm:text-[14px] font-heading font-black text-[#7C3AED] leading-none">{enq.budget || '₹' + (enq.totalAmount || 'TBD')}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] sm:text-[11px] text-slate-400 font-semibold">
                    <Icon name="calendar" size="xs" />
                    <span>{new Date(enq.eventDate).toLocaleDateString()}</span>
                    <span className="opacity-50">•</span>
                    <Icon name="location" size="xs" />
                    <span>{enq.eventLocation}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <button className="h-6 px-3 rounded-md bg-emerald-500 text-white text-[9px] font-bold hover:bg-emerald-600 active:scale-95 transition-all">Accept</button>
                    <button className="h-6 px-3 rounded-md bg-violet-50 text-violet-600 text-[9px] font-bold border border-violet-100 hover:bg-violet-100 active:scale-95 transition-all">Send Quote</button>
                    <button className="h-6 w-6 rounded-md bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 hover:text-violet-500 transition-colors">
                      <Icon name="chat" size="xs" />
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-50">
            <button className="text-[10px] font-bold text-slate-400 hover:text-[#7C3AED] transition-colors flex items-center justify-center gap-1 w-full group">
              View All Enquiries <Icon name="chevronRight" size="xs" className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Upcoming Bookings Section */}
        <div 
          className="reveal-on-scroll bg-gradient-to-br from-emerald-50/40 to-white rounded-2xl p-3 sm:p-5 border border-emerald-100 shadow-sm font-sans"
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm sm:text-base font-heading font-extrabold text-slate-900 tracking-tight uppercase">Upcoming Bookings</h3>
            <span className="text-xs font-sans font-bold text-[#7C3AED] hover:underline cursor-pointer tracking-wide">View All</span>
          </div>
          <div className="space-y-3">
            {(vendorState.bookings || []).slice(0, 3).map((book) => {
              const d = new Date(book.eventDate);
              const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
              const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              return (
              <div key={book._id || book.id} className="group flex items-center gap-2.5 p-1.5 sm:p-2 rounded-lg border border-white bg-white shadow-sm hover:border-emerald-300 hover:shadow-md transition-all duration-300">
                <div className="h-10 w-8 sm:h-12 sm:w-10 bg-slate-50 rounded-lg flex flex-col items-center justify-center border border-slate-100 flex-shrink-0">
                  <span className="text-[7px] font-bold text-slate-400 leading-none uppercase">{months[d.getMonth()]}</span>
                  <span className="text-[13px] sm:text-[14px] font-black text-slate-700 leading-none my-0.5">{d.getDate()}</span>
                  <span className="text-[7px] font-bold text-slate-400 leading-none">{days[d.getDay()]}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[14px] sm:text-[16px] font-heading font-extrabold text-slate-900 leading-tight truncate tracking-tight">{book.customerName}</h4>
                      <p className="text-[11px] sm:text-[12px] font-sans font-bold text-slate-500 truncate leading-none mt-1 uppercase tracking-wider">{book.services?.join(', ') || 'Wedding Event'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[14px] sm:text-[16px] font-heading font-black text-slate-900 leading-none tracking-tight">₹{(book.totalPrice || 0) / 1000}k</p>
                      <p className={`text-[10px] font-sans font-black leading-none mt-1 uppercase tracking-widest ${book.status === 'Confirmed' ? 'text-emerald-600' : 'text-slate-400'}`}>{book.status}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 font-semibold truncate max-w-[120px] sm:max-w-none">
                      <Icon name="location" size="xs" />
                      <span className="truncate">{book.location}</span>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${book.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{book.status}</span>
                  </div>
                </div>
              </div>
            )})}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-50">
            <button className="text-[10px] font-bold text-slate-400 hover:text-[#7C3AED] transition-colors flex items-center justify-center gap-1 w-full group">
              View All Bookings <Icon name="chevronRight" size="xs" className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
