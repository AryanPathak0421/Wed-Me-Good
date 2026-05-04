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
  const [stats, setStats] = useState({
    profileViews: 0,
    inquiries: 0,
    bookings: 0,
    conversionRate: 0,
    reviewsCount: 0
  });
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
      const [bannersRes, statsRes] = await Promise.all([
        vendorApi.getDashboardBanners(token),
        vendorApi.getStats(token)
      ]);

      if (bannersRes.success) setBanners(bannersRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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

  const displayNotifications = vendorState.notifications?.length > 0 ? vendorState.notifications : [
    { id: '1', message: 'Welcome to UtsavChakra!', time: 'Recently' },
    { id: '2', message: 'Complete your profile to start receiving leads.', time: 'System' }
  ];

  const displayBookings = vendorState.bookings?.length > 0 ? vendorState.bookings : [];

  const statCards = [
    { label: 'Views', value: stats.profileViews, icon: 'eye', color: '#9D174D', bgPastel: '#FFF1F2', to: '/vendor/profile' },
    { label: 'Leads', value: stats.inquiries, icon: 'leads', color: '#7C3AED', bgPastel: '#F5F3FF', to: '/vendor/leads' },
    { label: 'Events', value: stats.bookings, icon: 'party', color: '#10b981', bgPastel: '#F0FDF4', to: '/vendor/bookings' },
    { label: 'Rate', value: stats.conversionRate + '%', icon: 'chart', color: '#f59e0b', bgPastel: '#FFFBEB', to: '/vendor/leads' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-20 sm:pb-0">
      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className="vendor-surface rounded-2xl p-4 group cursor-pointer border border-transparent hover:border-slate-200 transition-all hover:scale-[1.02] shadow-sm"
            style={{ 
              animationDelay: `${i * 0.08}s`,
              background: stat.bgPastel,
            }}
            onClick={() => navigate(stat.to)}
          >
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-none mt-1">{stat.value}</h3>
              </div>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ background: stat.color }}>
                <Icon name={stat.icon} size="xs" color="current" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Completion */}
      <div className="vendor-surface rounded-3xl relative overflow-hidden group shadow-sm border border-slate-100 bg-white">
        <div className="absolute top-0 right-[-10px] sm:right-0 h-full w-3/5 sm:w-1/2 z-0 pointer-events-none overflow-hidden">
          <img
            src={weddingImg}
            alt="Wedding Couple"
            className="h-full w-full object-contain object-right-bottom sm:object-right transition-transform duration-700 group-hover:scale-105 opacity-80"
          />
        </div>

        <div className="p-6 sm:p-10 relative z-10">
          <div className="flex flex-col w-3/4 sm:w-3/5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#9D174D]">Profile Strength</p>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${completion > 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                  {completion > 80 ? 'Verified' : 'Action Required'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter leading-tight">{completion}% Complete</h3>
              <p className="text-[11px] sm:text-sm font-bold text-slate-400 mt-2 max-w-xs">
                {completion < 100 ? 'Fill in your business details and bank info to reach maximum visibility.' : 'Your profile is fully optimized for top performance!'}
              </p>
            </div>

            <div className="mt-6 h-2 w-full max-w-md rounded-full overflow-hidden bg-slate-50 border border-slate-100">
              <div className="h-full rounded-full transition-all duration-1000" style={{
                width: completion + '%',
                background: 'linear-gradient(90deg, #ed648f, #9D174D)',
              }}></div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button 
                type="button" 
                className="vendor-cta rounded-xl px-6 h-11 text-[10px] font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all flex items-center gap-2"
                onClick={() => navigate('/vendor/profile')}
              >
                <Icon name="edit" size="xs" /> Optimize Profile
              </button>
              <button
                type="button"
                className="rounded-xl px-6 h-11 text-[10px] font-black uppercase tracking-widest border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 active:scale-95 transition-all"
                onClick={() => refreshData()}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Autoscrolling Banners */}
      {activeBanners.length > 0 && (
        <div className="-mx-4 sm:mx-0 sm:rounded-3xl overflow-hidden relative group shadow-lg">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth"
          >
            {activeBanners.map((ad) => (
              <div key={ad._id} className="min-w-full h-44 sm:h-64 relative snap-center overflow-hidden cursor-pointer" onClick={() => ad.linkUrl && navigate(ad.linkUrl)}>
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

      {/* Activity Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
         <div className="vendor-surface rounded-3xl p-6 bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-rose-50 text-[#9D174D] shadow-sm border border-rose-100">
                     <Icon name="bell" size="xs" color="current" />
                  </div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Feed</h3>
               </div>
               <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">Clear All</button>
            </div>
            <div className="space-y-3">
               {displayNotifications.map((note) => (
                  <div key={note.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-100 cursor-pointer transition-all">
                     <div className="h-2 w-2 rounded-full bg-[#ed648f] shrink-0"></div>
                     <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 leading-snug">{note.message}</p>
                        <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-tighter">{note.time}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="vendor-surface rounded-3xl p-6 bg-[#F8FAFC] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-white text-emerald-500 shadow-sm border border-emerald-100">
                     <Icon name="calendar" size="xs" color="current" />
                  </div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Events</h3>
               </div>
               <button onClick={() => navigate('/vendor/bookings')} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">View All</button>
            </div>
            <div className="space-y-3">
               {displayBookings.length > 0 ? displayBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:scale-[1.01]">
                     <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate leading-none uppercase">{booking.customerName}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-tighter truncate">{booking.eventDate} • {booking.location}</p>
                     </div>
                     <div className="flex flex-col items-end gap-1">
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 shrink-0">Confirmed</span>
                     </div>
                  </div>
               )) : (
                 <div className="py-10 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No upcoming events</p>
                    <p className="text-[9px] font-bold text-slate-300 mt-1 italic">Keep your services updated to get booked!</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
