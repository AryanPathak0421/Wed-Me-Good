import { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/ui/Icon';
import { useVendorState } from '../useVendorState';
import { vendorApi } from '../vendorApi';

const VendorQuotes = () => {
  const { refreshData } = useVendorState();
  const [quotes, setQuotes] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  
  // Form State
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const token = localStorage.getItem('vendorToken');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quotesRes, leadsRes] = await Promise.all([
        vendorApi.getQuotes(token),
        vendorApi.getLeads(token)
      ]);

      if (quotesRes.success) setQuotes(quotesRes.data);
      if (leadsRes.success) setLeads(leadsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      const matchesSearch = (q.userId?.fullName || q.leadId?.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           q._id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchQuery, statusFilter]);

  const handleSaveQuote = async () => {
    if (!selectedLeadId) {
      alert('Please select a lead first');
      return;
    }

    const lead = leads.find(l => l._id === selectedLeadId);
    if (!lead) return;

    setIsSaving(true);
    try {
      const quoteData = {
        leadId: lead._id,
        userId: lead.userId?._id || lead.userId,
        items: [{ service: lead.serviceName || 'Wedding Service', price: 0, quantity: 1 }],
        totalAmount: 0,
        notes: notes
      };

      let res;
      if (isEditing && selectedQuoteId) {
        res = await vendorApi.updateQuote(selectedQuoteId, quoteData, token);
      } else {
        res = await vendorApi.createQuote(quoteData, token);
      }

      if (res.success) {
        fetchData();
        setShowModal(false);
        resetForm();
        refreshData();
      }
    } catch (err) {
      console.error('Error saving quote:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuote = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this proposal?')) return;
    
    try {
      const res = await vendorApi.deleteQuote(id, token);
      if (res.success) {
        setQuotes(prev => prev.filter(q => q._id !== id));
        refreshData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const openEditModal = (quote) => {
    setIsEditing(true);
    setSelectedQuoteId(quote._id);
    setSelectedLeadId(quote.leadId?._id || '');
    setNotes(quote.notes || '');
    setShowModal(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedQuoteId(null);
    setSelectedLeadId('');
    setNotes('');
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Sent': return { bg: '#F0F9FF', text: '#0284C7', border: '#E0F2FE' };
      case 'Accepted': return { bg: '#F0FDF4', text: '#16A34A', border: '#DCFCE7' };
      case 'Rejected': return { bg: '#FFF1F2', text: '#E11D48', border: '#FFE4E6' };
      default: return { bg: '#F8FAFC', text: '#64748B', border: '#F1F5F9' };
    }
  };

  const stats = useMemo(() => {
    const accepted = quotes.filter(q => q.status === 'Accepted').length;
    return { accepted, count: quotes.length };
  }, [quotes]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-rose-400 border-t-transparent rounded-full"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Portfolio Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stat Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="vendor-surface rounded-2xl p-5 border border-slate-100 bg-white flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
               <Icon name="check" size="sm" />
            </div>
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Accepted Proposals</p>
               <p className="text-xl font-black text-slate-900 mt-1">{stats.accepted}</p>
            </div>
         </div>
         <div className="vendor-surface rounded-2xl p-5 border border-slate-100 bg-white flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
               <Icon name="sparkles" size="sm" />
            </div>
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Conversion</p>
               <p className="text-xl font-black text-slate-900 mt-1">{stats.count > 0 ? ((stats.accepted / stats.count) * 100).toFixed(0) : 0}%</p>
            </div>
         </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="vendor-surface rounded-2xl p-4 border border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4">
         <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
               <Icon name="search" size="xs" color="#94a3b8" className="absolute left-3 top-1/2 -translate-y-1/2" />
               <input 
                  type="text"
                  placeholder="Search by client or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-9 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-400/50 w-64 transition-all"
               />
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
               {['All', 'Sent', 'Accepted', 'Rejected'].map(status => (
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
         <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="vendor-cta rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-100 active:scale-95 transition-all"
         >
            <Icon name="plus" size="xs" /> New Proposal
         </button>
      </div>

      {/* Dynamic Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredQuotes.length === 0 ? (
          <div className="col-span-full vendor-surface rounded-3xl p-20 text-center bg-slate-50 border border-dashed border-slate-200">
            <div className="h-16 w-16 rounded-full bg-white mx-auto flex items-center justify-center text-slate-200 mb-6 shadow-sm">
              <Icon name="mail" size="lg" color="current" />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Proposals</p>
            <p className="text-xs font-bold text-slate-300 mt-2">Start sending professional proposals to your leads.</p>
          </div>
        ) : (
          filteredQuotes.map((quote, index) => {
            const status = getStatusStyles(quote.status);
            return (
              <div key={quote._id} className="vendor-surface rounded-3xl p-5 border border-slate-100 bg-white flex flex-col justify-between gap-5 transition-all hover:shadow-xl hover:shadow-slate-200/40 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2 translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={() => openEditModal(quote)}
                      className="h-9 w-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center border border-slate-100 transition-all"
                      title="Edit Proposal"
                    >
                      <Icon name="edit" size="xs" />
                    </button>
                    <button 
                      onClick={() => handleDeleteQuote(quote._id)}
                      className="h-9 w-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center border border-slate-100 transition-all"
                      title="Delete Proposal"
                    >
                      <Icon name="trash" size="xs" />
                    </button>
                </div>

                <div className="flex items-start justify-between">
                   <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-rose-400 border border-slate-100 font-black text-lg shadow-inner">
                         {(quote.userId?.fullName || quote.leadId?.customerName)?.[0] || 'U'}
                      </div>
                      <div>
                         <h3 className="text-sm font-black text-slate-900 leading-none truncate max-w-[120px]">{quote.userId?.fullName || quote.leadId?.customerName || 'Customer'}</h3>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">ID_{quote._id.slice(-6).toUpperCase()}</p>
                      </div>
                   </div>
                   <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm" style={{ backgroundColor: status.bg, color: status.text, borderColor: status.border }}>
                     {quote.status}
                   </span>
                </div>

                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Proposal Intent</p>
                   <p className="text-sm font-black text-slate-700 italic">
                      {quote.leadId?.serviceName || 'General Wedding Service'}
                   </p>
                   <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <Icon name="map" size="xs" color="#94a3b8" />
                      <span className="truncate">{quote.leadId?.eventLocation || 'Location TBD'}</span>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                      <Icon name="calendar" size="xs" />
                      {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                   </div>
                   <button className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                      View Details
                   </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dynamic Action Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{isEditing ? 'Reconfigure Proposal' : 'New Proposal'}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{isEditing ? 'Update existing proposal details' : 'Draft a professional proposal'}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100">
                   <Icon name="close" size="sm" />
                </button>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Active Inquiry</label>
                   <div className="relative group">
                      <select 
                        disabled={isEditing}
                        className="w-full h-14 pl-5 pr-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-400/5 focus:border-rose-400/50 appearance-none transition-all cursor-pointer group-hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        value={selectedLeadId}
                        onChange={(e) => setSelectedLeadId(e.target.value)}
                      >
                         <option value="" className="font-bold">Select a client</option>
                         {leads.map(l => (
                           <option key={l._id} value={l._id} className="font-bold">{l.customerName} — {l.eventLocation || 'General'}</option>
                         ))}
                      </select>
                      {!isEditing && (
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-rose-500 transition-colors">
                           <Icon name="chevron-down" size="xs" />
                        </div>
                      )}
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Message to Client</label>
                   <textarea 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-400/5 focus:border-rose-400/50 transition-all placeholder:text-slate-300 min-h-[120px] resize-none"
                     placeholder="Type your personalized message here..."
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                   />
                </div>

                {selectedLeadId && leads.find(l => l._id === selectedLeadId) && (
                    <div className="p-5 bg-rose-50/30 rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Icon name="calendar" size="xs" color="#ed648f" />
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Target Event Date</span>
                        </div>
                        <p className="text-xs font-bold text-slate-600">
                            {new Date(leads.find(l => l._id === selectedLeadId).eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                )}

                <div className="pt-4">
                   <button 
                     disabled={isSaving}
                     onClick={handleSaveQuote}
                     className="w-full vendor-cta h-16 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-200 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                   >
                      {isSaving ? (
                         <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Synchronizing
                         </>
                      ) : (
                         <>
                            <Icon name="sparkles" size="xs" />
                            {isEditing ? 'Update Proposal' : 'Send Proposal'}
                         </>
                      )}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorQuotes;
