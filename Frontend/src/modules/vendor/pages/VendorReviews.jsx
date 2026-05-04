import { useState, useEffect } from 'react';
import Icon from '../../../components/ui/Icon';
import { vendorApi } from '../vendorApi';

const VendorReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('vendorToken');
      const res = await vendorApi.getReviews(token);
      if (res.success) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('vendorToken');
      const res = await vendorApi.replyToReview(selectedReview._id, replyText, token);
      if (res.success) {
        setReviews(prev => prev.map(r => r._id === selectedReview._id ? { ...r, reply: replyText } : r));
        setSelectedReview(null);
        setReplyText('');
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateStats = () => {
    if (reviews.length === 0) return { avg: 0, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    const avg = (sum / reviews.length).toFixed(1);
    
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => dist[r.rating]++);
    
    const distPercent = {};
    Object.keys(dist).forEach(k => {
      distPercent[k] = Math.round((dist[k] / reviews.length) * 100);
    });

    return { avg, count: reviews.length, distribution: distPercent };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-rose-400 border-t-transparent rounded-full"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listening to your clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="vendor-surface rounded-xl p-4 sm:p-6 relative overflow-hidden bg-[#FDF2F8] border border-rose-100 shadow-sm">
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full opacity-15" style={{
          background: 'radial-gradient(circle, #ed648f, transparent 70%)'
        }}></div>
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed648f]">Social Proof</p>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Client Feedback</h2>
          <p className="text-xs font-bold text-slate-500 mt-1">Engage with your clients and build your reputation.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="vendor-surface rounded-2xl p-5 border border-rose-100 shadow-sm transition-all hover:scale-[1.02]" style={{ backgroundColor: '#FFF1F2' }}>
           <div className="flex items-start justify-between mb-4">
              <div className="h-9 w-9 rounded-xl bg-white/60 flex items-center justify-center text-rose-500 shadow-sm">
                 <Icon name="star" size="sm" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-400">Average Rating</span>
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest mb-1">Trust Score</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stats.avg}</h3>
              <p className="text-[10px] font-bold text-rose-500 mt-1">Based on {stats.count} reviews</p>
           </div>
        </div>

        <div className="vendor-surface rounded-2xl p-5 border border-purple-100 shadow-sm transition-all hover:scale-[1.02] sm:col-span-2" style={{ backgroundColor: '#F5F3FF' }}>
           <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Rating Distribution</p>
           <div className="space-y-3">
              {[5, 4, 3].map((star) => (
                <div key={star} className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-slate-600 w-8">{star} ★</span>
                   <div className="h-1.5 flex-1 bg-white/40 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full transition-all duration-1000" style={{ width: `${stats.distribution[star]}%` }}></div>
                   </div>
                   <span className="text-[10px] font-black text-purple-600 w-10 text-right">{stats.distribution[star]}%</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid gap-3">
        <div className="flex items-center gap-2 mb-2 px-1">
           <div className="h-2 w-2 rounded-full bg-[#ed648f]"></div>
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Testimonials</h3>
        </div>
        
        {reviews.length === 0 ? (
          <div className="vendor-surface rounded-2xl p-12 text-center bg-slate-50 border border-dashed border-slate-200">
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No reviews yet</p>
             <p className="text-[10px] font-bold text-slate-300 mt-1">Reviews will appear here once clients start sharing their experiences.</p>
          </div>
        ) : (
          reviews.map((review, index) => {
             const pastels = ['#FFF1F2', '#F0F9FF', '#F5F3FF', '#FFFBEB'];
             const bg = pastels[index % pastels.length];
             
             return (
               <div key={review._id} className="vendor-surface rounded-2xl p-5 border border-black/5 transition-all hover:shadow-md" style={{ backgroundColor: bg }}>
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/60 flex items-center justify-center text-rose-500 font-black text-sm shadow-sm">
                           {review.userId?.name?.[0] || 'U'}
                        </div>
                        <div>
                           <h4 className="text-sm font-black text-slate-900 leading-none">{review.userId?.name || 'Customer'}</h4>
                           <div className="flex gap-0.5 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Icon key={i} name="star" size="xs" color={i < review.rating ? '#ed648f' : '#cbd5e1'} />
                              ))}
                           </div>
                        </div>
                     </div>
                     {!review.reply && (
                       <button 
                         onClick={() => setSelectedReview(review)}
                         className="bg-white/60 rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border border-black/5 hover:bg-white transition-all shadow-sm"
                       >
                          Reply
                       </button>
                     )}
                  </div>
                  <div className="bg-white/40 rounded-xl p-4 border border-white/60 italic text-xs font-bold text-slate-600 leading-relaxed shadow-inner">
                     "{review.comment}"
                  </div>
                  {review.reply && (
                    <div className="mt-3 ml-6 p-3 bg-white/60 rounded-xl border-l-4 border-rose-400">
                       <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Your Response</p>
                       <p className="text-xs font-bold text-slate-700">{review.reply}</p>
                    </div>
                  )}
               </div>
             );
          })
        )}
      </div>

      {/* Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedReview(null)}></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Post Reply</h3>
                  <p className="text-xs font-bold text-slate-500">Responding to {selectedReview.userId?.name}</p>
                </div>
                <button onClick={() => setSelectedReview(null)} className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <Icon name="close" size="sm" />
                </button>
             </div>

             <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-xs font-bold text-slate-500">
                   "{selectedReview.comment}"
                </div>
                
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Your Message</label>
                   <textarea 
                     className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-rose-400 transition-all resize-none"
                     placeholder="Say thanks or address their feedback..."
                     value={replyText}
                     onChange={(e) => setReplyText(e.target.value)}
                   />
                </div>

                <div className="pt-2">
                   <button 
                     disabled={isSaving || !replyText.trim()}
                     onClick={handleReplySubmit} 
                     className="w-full vendor-cta h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200 disabled:opacity-50"
                   >
                      {isSaving ? 'Posting...' : 'Send Reply'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorReviews;
