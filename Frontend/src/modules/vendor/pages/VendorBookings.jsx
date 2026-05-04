import { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/ui/Icon';
import { useVendorState } from '../useVendorState';
import { vendorApi } from '../vendorApi';

const VendorBookings = () => {
  const { refreshData } = useVendorState();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('vendorToken');
      const res = await vendorApi.getBookings(token);
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('vendorToken');
      const res = await vendorApi.updateBookingStatus(bookingId, newStatus, token);
      if (res.success) {
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: res.data.status } : b));
        setOpenMenu(null);
        refreshData();
      }
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = (b.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (b._id || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'Pending').length,
      confirmed: bookings.filter(b => b.status === 'Confirmed' || b.status === 'Accepted').length,
      revenue: bookings.reduce((acc, b) => acc + (b.totalPrice || b.totalAmount || 0), 0)
    };
  }, [bookings]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return { bg: '#F0FDF4', color: '#16A34A', border: '#DCFCE7' };
      case 'Rejected': return { bg: '#FFF1F2', color: '#E11D48', border: '#FFE4E6' };
      case 'Confirmed': return { bg: '#F0F9FF', color: '#0284C7', border: '#E0F2FE' };
      case 'Pending': return { bg: '#FFFBEB', color: '#D97706', border: '#FEF3C7' };
      default: return { bg: '#F8FAFC', color: '#64748B', border: '#F1F5F9' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-rose-400 border-t-transparent rounded-full"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Streaming Event Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Strip */}
      <div className="vendor-surface rounded-[2rem] p-6 sm:p-8 relative overflow-hidden bg-white border border-slate-100 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Management</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Overseeing {stats.total} Secured Engagements</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Booked Volume</p>
                <p className="text-xl font-black text-slate-900 tracking-tight">₹{stats.revenue.toLocaleString()}</p>
             </div>
             <button
                onClick={fetchBookings}
                className="h-11 w-11 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center active:scale-95 shadow-sm"
             >
                <Icon name="clock" size="xs" />
             </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
         {[
            { label: 'Active Schedule', value: stats.total, color: 'blue', icon: 'calendar' },
            { label: 'Pending Confirm', value: stats.pending, color: 'amber', icon: 'clock' },
            { label: 'Confirmed Events', value: stats.confirmed, color: 'emerald', icon: 'check' }
         ].map((stat, i) => (
            <div key={i} className="vendor-surface rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
               <div className={`h-10 w-10 rounded-xl mb-3 flex items-center justify-center
                  ${stat.color === 'blue' ? 'bg-blue-50 text-blue-500' : ''}
                  ${stat.color === 'amber' ? 'bg-amber-50 text-amber-500' : ''}
                  ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : ''}
               `}>
                  <Icon name={stat.icon} size="xs" />
               </div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
               <p className="text-xl font-black text-slate-900 mt-1.5">{stat.value}</p>
            </div>
         ))}
      </div>

      {/* Search & Filter */}
      <div className="vendor-surface rounded-2xl p-4 border border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4">
         <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
               <Icon name="search" size="xs" color="#94a3b8" className="absolute left-3 top-1/2 -translate-y-1/2" />
               <input 
                  type="text"
                  placeholder="Search by customer or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-9 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-400/50 w-64 transition-all"
               />
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
               {['All', 'Pending', 'Accepted', 'Confirmed', 'Rejected'].map(status => (
                  <button
                     key={status}
                     onClick={() => setStatusFilter(status)}
                     className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-white text-rose-500 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     {status}
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* Dynamic Booking Grid */}
      <div className="grid gap-4">
        {filteredBookings.length === 0 ? (
          <div className="vendor-surface rounded-[2.5rem] p-24 text-center bg-slate-50 border border-dashed border-slate-200">
             <div className="h-20 w-20 rounded-full bg-white mx-auto flex items-center justify-center text-slate-200 mb-6 shadow-sm">
                <Icon name="checkList" size="lg" />
             </div>
             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No active bookings</p>
             <p className="text-[11px] font-bold text-slate-300 mt-2 italic">Your event calendar is currently open for new opportunities.</p>
          </div>
        ) : (
          filteredBookings.map((booking, index) => {
            const status = getStatusColor(booking.status);
            return (
              <div key={booking._id} className="vendor-surface rounded-[2rem] p-6 bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/40 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: status.color }}></div>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex-1 flex flex-col sm:flex-row gap-6">
                    <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-rose-400 shadow-inner">
                       <Icon name="party" size="md" />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                       <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{booking.customerName}</h3>
                          <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm border" style={{ background: status.bg, color: status.color, borderColor: status.border }}>
                             {booking.status}
                          </span>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                             <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                <Icon name="calendar" size="xs" color="#94a3b8" />
                             </div>
                             {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                             <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                <Icon name="map" size="xs" color="#94a3b8" />
                             </div>
                             <span className="truncate max-w-[150px]">{booking.location || 'Venue TBD'}</span>
                          </div>
                       </div>

                       <div className="flex flex-wrap gap-2 pt-2">
                          {booking.services?.map(s => (
                             <span key={s} className="bg-slate-50 rounded-lg px-3 py-1.5 text-[9px] font-black text-slate-500 border border-slate-100 uppercase tracking-widest">
                                {s}
                             </span>
                          )) || <span className="text-[9px] font-bold text-slate-400 italic">Core Service Package</span>}
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-6 lg:min-w-[200px] border-t lg:border-t-0 lg:border-l border-slate-50 pt-6 lg:pt-0 lg:pl-8">
                     <div className="text-left lg:text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contract Value</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{(booking.totalPrice || booking.totalAmount || 0).toLocaleString()}</p>
                     </div>
                     
                     <div className="flex items-center gap-3 relative">
                        {booking.status === 'Pending' && (
                          <button 
                            onClick={() => handleStatusUpdate(booking._id, 'Accepted')}
                            className="h-11 px-6 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all flex items-center gap-2"
                          >
                             <Icon name="check" size="xs" /> Accept
                          </button>
                        )}
                        
                        <div className="relative">
                           <button 
                             className="h-11 w-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all active:scale-95 shadow-sm"
                             onClick={(e) => {
                               e.stopPropagation();
                               setOpenMenu(openMenu === booking._id ? null : booking._id);
                             }}
                           >
                              <Icon name="more" size="sm" />
                           </button>

                           {openMenu === booking._id && (
                             <>
                               <div className="fixed inset-0 z-[120]" onClick={() => setOpenMenu(null)}></div>
                               <div className="absolute right-0 bottom-full mb-3 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 z-[130] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 p-2">
                                  <button 
                                    onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
                                    className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all flex items-center gap-3 group/opt"
                                  >
                                     <Icon name="check" size="xs" /> Confirm Event
                                  </button>
                                  <button 
                                    onClick={() => handleStatusUpdate(booking._id, 'Rejected')}
                                    className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all flex items-center gap-3 text-rose-500 group/opt"
                                  >
                                     <Icon name="logout" size="xs" /> Cancel Booking
                                  </button>
                               </div>
                             </>
                           )}
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VendorBookings;
