import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorState } from '../useVendorState';
import { vendorApi } from '../vendorApi';
import Icon from '../../../components/ui/Icon';

const statusOptions = ['New', 'Contacted', 'Quoted', 'Confirmed', 'Not converted'];

const VendorLeads = () => {
  const { refreshData } = useVendorState();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('vendorToken');
      const res = await vendorApi.getLeads(token);
      if (res.success) {
        setLeads(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateStatus = async (leadId, status) => {
    try {
      const token = localStorage.getItem('vendorToken');
      const res = await vendorApi.updateLeadStatus(leadId, status, token);
      if (res.success) {
        setLeads(prev => prev.map(l => (l._id === leadId ? { ...l, status: res.data.status } : l)));
        setOpenDropdown(null);
        refreshData(); 
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = (l.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (l.customerPhone || l.phone || '').includes(searchQuery);
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      new: leads.filter(l => l.status === 'New').length,
      contacted: leads.filter(l => l.status === 'Contacted').length,
      confirmed: leads.filter(l => l.status === 'Confirmed').length,
      total: leads.length
    };
  }, [leads]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return { bg: '#FFFBEB', border: '#FEF3C7', text: '#D97706' };
      case 'Contacted': return { bg: '#F5F3FF', border: '#EDE9FE', text: '#7C3AED' };
      case 'Quoted': return { bg: '#F0F9FF', border: '#E0F2FE', text: '#0284C7' };
      case 'Confirmed': return { bg: '#F0FDF4', border: '#DCFCE7', text: '#16A34A' };
      case 'Not converted': return { bg: '#FEF2F2', border: '#FEE2E2', text: '#EF4444' };
      default: return { bg: '#F8FAFC', border: '#F1F5F9', text: '#64748B' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-rose-400 border-t-transparent rounded-full"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Streaming Pipeline Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Strip */}
      <div className="vendor-surface rounded-[2rem] p-6 sm:p-8 relative overflow-hidden bg-white border border-slate-100 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inquiry Pipeline</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Managing {stats.total} Live Client Opportunities</p>
          </div>
          <div className="flex items-center gap-3">
             <button
                onClick={fetchLeads}
                className="h-11 px-5 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white hover:text-rose-500 transition-all flex items-center gap-2 active:scale-95"
             >
                <Icon name="clock" size="xs" /> Refresh Stream
             </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
            { label: 'Unread Leads', value: stats.new, color: 'amber', icon: 'mail' },
            { label: 'In Outreach', value: stats.contacted, color: 'violet', icon: 'phone' },
            { label: 'Conversion', value: stats.confirmed, color: 'emerald', icon: 'check' },
            { label: 'Total Volume', value: stats.total, color: 'slate', icon: 'money' }
         ].map((stat, i) => (
            <div key={i} className="vendor-surface rounded-3xl p-5 bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
               <div className={`h-10 w-10 rounded-xl mb-3 flex items-center justify-center
                  ${stat.color === 'amber' ? 'bg-amber-50 text-amber-500' : ''}
                  ${stat.color === 'violet' ? 'bg-violet-50 text-violet-500' : ''}
                  ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : ''}
                  ${stat.color === 'slate' ? 'bg-slate-50 text-slate-500' : ''}
               `}>
                  <Icon name={stat.icon} size="xs" />
               </div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
               <p className="text-xl font-black text-slate-900 mt-1.5">{stat.value}</p>
            </div>
         ))}
      </div>

      {/* Filter Bar */}
      <div className="vendor-surface rounded-2xl p-4 border border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4">
         <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
               <Icon name="search" size="xs" color="#94a3b8" className="absolute left-3 top-1/2 -translate-y-1/2" />
               <input 
                  type="text"
                  placeholder="Search by client or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-9 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-400/50 w-64 transition-all"
               />
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto max-w-full no-scrollbar">
               {['All', ...statusOptions].map(status => (
                  <button
                     key={status}
                     onClick={() => setStatusFilter(status)}
                     className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === status ? 'bg-white text-rose-500 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     {status}
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* Dynamic Lead List */}
      <div className="space-y-4">
        {filteredLeads.length === 0 ? (
          <div className="vendor-surface rounded-[2.5rem] p-24 text-center bg-slate-50 border border-dashed border-slate-200">
             <div className="h-20 w-20 rounded-full bg-white mx-auto flex items-center justify-center text-slate-200 mb-6 shadow-sm">
                <Icon name="mail" size="lg" />
             </div>
             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching leads</p>
             <p className="text-[11px] font-bold text-slate-300 mt-2 italic">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const colors = getStatusColor(lead.status);
            const leadId = lead._id;
            return (
              <div key={leadId} className="vendor-surface rounded-[2rem] p-5 sm:p-6 bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/40 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: colors.text }}></div>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 font-black text-xl shadow-inner">
                          {lead.customerName?.[0] || 'U'}
                       </div>
                       <div>
                          <div className="flex items-center gap-3">
                             <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{lead.customerName}</h3>
                             <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm border" style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}>
                                {lead.status}
                             </span>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">Lead Node: #{leadId.slice(-6).toUpperCase()}</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Event Identity</p>
                          <div className="flex items-center gap-2 text-[11px] font-black text-slate-700">
                             <Icon name="calendar" size="xs" color="#94a3b8" />
                             {lead.eventDate ? new Date(lead.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                          </div>
                       </div>
                       <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Target Location</p>
                          <div className="flex items-center gap-2 text-[11px] font-black text-slate-700 truncate">
                             <Icon name="map" size="xs" color="#94a3b8" />
                             {lead.eventLocation || 'Location TBD'}
                          </div>
                       </div>
                       <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Direct Access</p>
                          <div className="flex items-center gap-2 text-[11px] font-black text-slate-700">
                             <Icon name="phone" size="xs" color="#94a3b8" />
                             {lead.customerPhone || lead.phone}
                          </div>
                       </div>
                    </div>

                    <div className="mt-4 p-4 bg-rose-50/30 rounded-2xl border border-rose-100/50 relative overflow-hidden group/req">
                       <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/req:opacity-30 transition-opacity">
                          <Icon name="chat" size="lg" />
                       </div>
                       <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          Client Requirement Specification
                       </p>
                       <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic relative z-10">"{lead.message || 'I am interested in your services and would like to receive a proposal.'}"</p>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col items-stretch gap-3 lg:min-w-[180px]">
                    <a
                      href={`tel:${lead.customerPhone || lead.phone}`}
                      className="flex-1 lg:flex-none px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-xl shadow-emerald-200 active:scale-95 transition-all text-center flex items-center justify-center gap-3 group/call"
                    >
                      <Icon name="phone" size="xs" className="group-hover/call:animate-bounce" /> Reach Client
                    </a>
                    
                    <button
                       onClick={() => navigate('/vendor/quotes', { state: { prefillLeadId: leadId } })}
                       className="flex-1 lg:flex-none px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-xl shadow-slate-200 active:scale-95 transition-all text-center flex items-center justify-center gap-3 group/prop"
                    >
                       <Icon name="sparkles" size="xs" className="group-hover/prop:animate-pulse" /> Draft Proposal
                    </button>

                    <div className="relative flex-1 lg:flex-none">
                      <button
                        className="w-full h-14 px-5 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center justify-between gap-3 hover:border-rose-400/30 transition-all shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === leadId ? null : leadId);
                        }}
                      >
                        <span className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.text }}></div>
                           {lead.status}
                        </span>
                        <Icon name="chevron-down" size="xs" className={`transition-transform duration-300 ${openDropdown === leadId ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdown === leadId && (
                        <>
                          <div className="fixed inset-0 z-[120]" onClick={() => setOpenDropdown(null)}></div>
                          <div className="absolute left-0 lg:left-auto lg:right-0 bottom-full mb-3 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 z-[130] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 p-2">
                             {statusOptions.map((opt) => (
                               <button 
                                 key={opt}
                                 className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all flex items-center gap-3 group/opt"
                                 onClick={() => updateStatus(leadId, opt)}
                                >
                                 <div className={`h-1.5 w-1.5 rounded-full transition-all group-hover/opt:scale-150 ${lead.status === opt ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
                                 {opt}
                               </button>
                             ))}
                          </div>
                        </>
                      )}
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

export default VendorLeads;
