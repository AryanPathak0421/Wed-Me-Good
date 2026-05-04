import { useState, useEffect } from 'react';
import { useVendorState } from '../useVendorState';
import { vendorApi } from '../vendorApi';
import Icon from '../../../components/ui/Icon';

const VendorCalendar = () => {
  const { refreshData } = useVendorState();
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ customerName: '', eventDate: '', location: '' });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

  const handlePrev = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNext = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDayClick = (day) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    
    const existing = bookings.find(b => {
        const bd = new Date(b.eventDate);
        return bd.getFullYear() === d.getFullYear() && 
               bd.getMonth() === d.getMonth() && 
               bd.getDate() === d.getDate();
    });

    if (existing) {
        setNewEvent({
            customerName: existing.customerName,
            eventDate: dateStr,
            location: existing.location || '',
            isExisting: true
        });
    } else {
        setNewEvent({
            customerName: '',
            eventDate: dateStr,
            location: '',
            isExisting: false
        });
    }
    setShowAddModal(true);
  };

  const handleAddEvent = async () => {
    if (newEvent.isExisting) {
        setShowAddModal(false);
        return;
    }

    if (!newEvent.customerName || !newEvent.eventDate) {
        alert('Please fill in Customer Name and Date');
        return;
    }

    try {
        setIsSubmitting(true);
        const token = localStorage.getItem('vendorToken');
        const res = await vendorApi.createBooking({
            customerName: newEvent.customerName,
            eventDate: newEvent.eventDate,
            location: newEvent.location,
            services: ['Manual Calendar Entry'],
            status: 'Confirmed'
        }, token);

        if (res.success) {
            await fetchBookings();
            setShowAddModal(false);
            setNewEvent({ customerName: '', eventDate: '', location: '' });
        }
    } catch (err) {
        console.error('Failed to save event:', err);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-rose-400 border-t-transparent rounded-full"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20 sm:pb-0">
      
      {/* Header */}
      <div className="vendor-surface rounded-xl p-3.5 sm:p-5 relative overflow-hidden bg-white border border-slate-100 shadow-sm">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-5 bg-[#9D174D]"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-[#9D174D] shadow-sm">
                <Icon name="calendar" size="xs" />
             </div>
             <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Timeline</p>
                <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mt-0.5">Event Schedule</h2>
             </div>
          </div>
          <button 
            onClick={() => {
                setNewEvent({ customerName: '', eventDate: '', location: '', isExisting: false });
                setShowAddModal(true);
            }}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
            style={{ background: 'linear-gradient(135deg, #9D174D, #831843)' }}
          >
             <Icon name="plus" size="xs" />
          </button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[380px_1fr]">
        
        {/* Calendar Card */}
        <div className="vendor-surface rounded-2xl p-4 sm:p-5 bg-white border border-slate-100 shadow-sm flex flex-col w-full h-fit">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tighter">
                 {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex gap-1">
                 <button onClick={handlePrev} className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all text-slate-400">
                    <Icon name="chevron-down" className="rotate-90" size="xs" />
                 </button>
                 <button onClick={handleNext} className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all text-slate-400">
                    <Icon name="chevron-down" className="-rotate-90" size="xs" />
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-7 gap-1 mb-1.5">
              {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
                <div key={day} className="h-7 flex items-center justify-center text-[8px] font-black text-slate-300">
                   {day}
                </div>
              ))}
           </div>

           <div className="grid grid-cols-7 gap-1">
              {[...Array(adjustedStartDay)].map((_, i) => <div key={`off-${i}`} className="h-9"></div>)}
              
              {[...Array(daysInMonth(currentDate.getMonth(), currentDate.getFullYear()))].map((_, i) => {
                const day = i + 1;
                const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                
                const hasEvent = bookings.some(b => {
                    const bd = new Date(b.eventDate);
                    return bd.getFullYear() === currentDate.getFullYear() && 
                           bd.getMonth() === currentDate.getMonth() && 
                           bd.getDate() === day;
                });

                const isSelected = selectedDate === dateStr;
                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div key={day} className="relative flex justify-center items-center h-9">
                    <button 
                      onClick={() => handleDayClick(day)}
                      className={`h-8 w-8 flex items-center justify-center rounded-xl text-[10px] font-black transition-all border ${
                        isSelected 
                          ? 'bg-[#9D174D] text-white border-[#9D174D] shadow-lg shadow-rose-100 scale-105' 
                          : isToday 
                            ? 'bg-slate-100 text-[#9D174D] border-slate-200'
                            : 'bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:text-[#9D174D]'
                      }`}
                    >
                       {day}
                       {hasEvent && !isSelected && (
                         <div className="absolute top-1 right-1 h-1 w-1 rounded-full bg-emerald-500 border border-white"></div>
                       )}
                    </button>
                  </div>
                );
              })}
           </div>

           <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2">
              <button 
                onClick={() => {
                    setNewEvent({ customerName: '', eventDate: '', location: '', isExisting: false });
                    setShowAddModal(true);
                }}
                className="flex-1 text-white h-10 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-100 active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #9D174D, #831843)' }}
              >
                 Add Event
              </button>
              <button onClick={fetchBookings} className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#9D174D] transition-all"><Icon name="clock" size="xs" /></button>
           </div>
        </div>

        {/* Schedule View */}
        <div className="space-y-3">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Schedule Overview</h3>
           </div>
           
           <div className="space-y-2">
             {bookings.length > 0 ? (
                [...bookings].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)).map((booking, index) => (
                  <div key={booking._id || index} className="vendor-surface rounded-2xl p-3 bg-white border border-slate-100 shadow-sm transition-all hover:translate-x-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                           <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-[#9D174D] border border-white shadow-sm">
                              <Icon name="party" size="xs" />
                           </div>
                           <div>
                              <h4 className="text-[11px] font-black text-slate-900 tracking-tight leading-none">{booking.customerName}</h4>
                              <p className={`text-[8px] font-black mt-1 uppercase tracking-widest ${booking.status === 'Confirmed' ? 'text-emerald-500' : 'text-amber-500'}`}>{booking.status}</p>
                           </div>
                        </div>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                            {new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                      <p className="text-[9px] font-bold text-slate-400 flex items-center gap-2 truncate">
                          <Icon name="map" size="xs" /> {booking.location || 'Venue TBD'}
                      </p>
                    </div>
                  </div>
                ))
             ) : (
                <div className="vendor-surface rounded-2xl p-8 text-center bg-white border border-dashed border-slate-100">
                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">No Events Found</p>
                </div>
             )}
           </div>
        </div>

      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
           <div className="bg-white rounded-[2rem] p-5 sm:p-6 max-w-[340px] w-full relative z-[110] shadow-2xl animate-in fade-in zoom-in-95 duration-300 border border-white">
              <div className="flex items-center gap-3 mb-4">
                 <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-[#9D174D]">
                    <Icon name="calendar" size="xs" />
                 </div>
                 <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight leading-none">
                        {newEvent.isExisting ? 'Event Details' : 'Add New Event'}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {newEvent.isExisting ? 'Snapshot of scheduled booking' : 'Schedule a manual entry'}
                    </p>
                 </div>
              </div>
              
              <div className="space-y-3">
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase px-1">Customer Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rahul Sharma"
                      readOnly={newEvent.isExisting}
                      value={newEvent.customerName}
                      onChange={(e) => setNewEvent({ ...newEvent, customerName: e.target.value })}
                      className={`w-full h-10 rounded-xl bg-slate-50 border-0 px-4 text-xs font-bold transition-all ${newEvent.isExisting ? 'opacity-70' : 'focus:ring-2 ring-[#9D174D]/10'}`} 
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase px-1">Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mumbai, Taj Mahal Hotel"
                      readOnly={newEvent.isExisting}
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className={`w-full h-10 rounded-xl bg-slate-50 border-0 px-4 text-xs font-bold transition-all ${newEvent.isExisting ? 'opacity-70' : 'focus:ring-2 ring-[#9D174D]/10'}`} 
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase px-1">Event Date</label>
                    <input 
                      type="date" 
                      readOnly={newEvent.isExisting}
                      value={newEvent.eventDate}
                      onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                      className={`w-full h-10 rounded-xl bg-slate-50 border-0 px-4 text-xs font-bold transition-all ${newEvent.isExisting ? 'opacity-70' : 'focus:ring-2 ring-[#9D174D]/10'}`} 
                    />
                 </div>

                 <button 
                   onClick={handleAddEvent}
                   disabled={isSubmitting}
                   className={`w-full h-11 rounded-xl text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-100 active:scale-95 transition-all mt-3 flex items-center justify-center ${isSubmitting ? 'opacity-50 grayscale' : ''}`}
                   style={{ background: 'linear-gradient(135deg, #9D174D, #831843)' }}
                 >
                   {isSubmitting ? 'Saving...' : (newEvent.isExisting ? 'Close Details' : 'Save Event')}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default VendorCalendar;
