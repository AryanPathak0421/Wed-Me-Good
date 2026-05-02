import { useState, useMemo, useEffect } from 'react';
import Icon from '../../../components/ui/Icon';
import { adminApi } from '../services/adminApi';

const AdminVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const token = localStorage.getItem('adminToken');

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getVendors(token);
            if (res.success) {
                setVendors(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch vendors:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const filteredVendors = useMemo(() => {
        return vendors.filter(v => {
            const statusMap = {
                'Verified': 'Approved',
                'Pending': 'Pending',
                'Rejected': 'Rejected'
            };
            const targetStatus = statusMap[filter] || filter;
            const matchStatus = filter === 'All' || v.status === targetStatus;
            const matchSearch = (v.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (v.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (v.category || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchStatus && matchSearch;
        });
    }, [vendors, filter, searchQuery]);

    const handleAction = async (id, status) => {
        try {
            setActionLoading(true);
            const res = await adminApi.updateVendorStatus(id, status, token);
            if (res.success) {
                setVendors(prev => prev.map(v => v._id === id ? res.data : v));
                setModalOpen(false);
                setSelectedVendor(null);
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'Approved' ? 'Pending' : 'Approved';
        await handleAction(id, nextStatus);
    };

    const openDetails = (vendor) => {
        setSelectedVendor(vendor);
        setModalOpen(true);
    };

    const deleteVendor = (id) => {
        if (window.confirm('Are you sure you want to decouple this vendor node?')) {
            // Delete logic can be added later
            setVendors(prev => prev.filter(v => v._id !== id));
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Partners Console</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Vendor Ecosystem Oversight</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Icon name="search" size="xs" color="#94a3b8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Grep partners..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold focus:ring-2 focus:ring-primary-400/10 outline-none w-56 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                        {['All', 'Pending', 'Verified'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${filter === status
                                        ? 'bg-primary-400 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-900'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Partner Details</th>
                                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Portfolio</th>
                                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Service</th>
                                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">City</th>
                                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Stat</th>
                                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Verify</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredVendors.length > 0 ? filteredVendors.map((vendor) => (
                                <tr key={vendor._id} className="group hover:bg-primary-50/10 transition-colors">
                                     <td className="px-6 py-3">
                                         <div className="flex items-center gap-3">
                                             <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 p-0.5 flex-shrink-0 overflow-hidden shadow-sm">
                                                 <img 
                                                     src={vendor.portfolio?.[0]?.url || `https://api.dicebear.com/7.x/identicon/svg?seed=${vendor.businessName}`} 
                                                     className="h-full w-full object-cover rounded-lg" 
                                                     alt={vendor.businessName} 
                                                 />
                                             </div>
                                             <div className="min-w-0">
                                                 <p className="text-[12px] font-black text-slate-900 leading-tight truncate">{vendor.businessName}</p>
                                                 <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase truncate">{vendor.fullName}</p>
                                             </div>
                                         </div>
                                     </td>
                                     <td className="px-5 py-3">
                                         <div className="flex -space-x-2 overflow-hidden">
                                             {(vendor.portfolio || []).slice(0, 3).map((img, i) => (
                                                 <div key={i} className="inline-block h-7 w-7 rounded-lg ring-2 ring-white overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                                                     <img src={img.url} alt="" className="h-full w-full object-cover" />
                                                 </div>
                                             ))}
                                             {vendor.portfolio?.length > 3 && (
                                                 <div className="inline-block h-7 w-7 rounded-lg ring-2 ring-white bg-slate-50 flex items-center justify-center border border-slate-200">
                                                     <span className="text-[8px] font-black text-slate-400">+{vendor.portfolio.length - 3}</span>
                                                 </div>
                                             )}
                                             {(!vendor.portfolio || vendor.portfolio.length === 0) && (
                                                 <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">No Media</span>
                                             )}
                                         </div>
                                     </td>
                                     <td className="px-5 py-3">
                                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{vendor.category}</span>
                                     </td>
                                     <td className="px-5 py-3 text-[11px] font-bold text-slate-600">{vendor.city}</td>
                                     <td className="px-5 py-3">
                                         <p className="text-[11px] font-black text-slate-900">₹{(vendor.subscription?.amount || 0).toLocaleString()}</p>
                                     </td>
                                     <td className="px-5 py-3">
                                         <button
                                             onClick={() => toggleStatus(vendor._id, vendor.status)}
                                             className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                                         >
                                             <div className={`h-1 w-1 rounded-full ${vendor.status === 'Approved' ? 'bg-emerald-500' :
                                                     vendor.status === 'Pending' ? 'bg-amber-500' :
                                                         'bg-rose-500'
                                                 }`} />
                                             <span className={`text-[9px] font-black uppercase tracking-widest ${vendor.status === 'Approved' ? 'text-emerald-600' :
                                                     vendor.status === 'Pending' ? 'text-amber-600' :
                                                         'text-rose-600'
                                                 }`}>
                                                 {vendor.status === 'Approved' ? 'Verified' : vendor.status}
                                             </span>
                                         </button>
                                     </td>
                                     <td className="px-6 py-3 text-right">
                                         <div className="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                             {vendor.status === 'Pending' && (
                                                 <>
                                                     <button 
                                                         onClick={() => handleAction(vendor._id, 'Approved')}
                                                         title="Approve Partner"
                                                         className="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                                                     >
                                                         <Icon name="check" size="xs" color="current" />
                                                     </button>
                                                     <button 
                                                         onClick={() => handleAction(vendor._id, 'Rejected')}
                                                         title="Reject Partner"
                                                         className="h-7 w-7 flex items-center justify-center rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                                     >
                                                         <Icon name="close" size="xs" color="current" />
                                                     </button>
                                                 </>
                                             )}
                                             <button 
                                                 onClick={() => openDetails(vendor)}
                                                 title="View Full Details"
                                                 className="h-7 w-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:border-primary-400 hover:text-primary-400 transition-all"
                                             >
                                                 <Icon name="eye" size="xs" />
                                             </button>
                                             <button
                                                 onClick={() => deleteVendor(vendor._id)}
                                                 title="Decouple Node"
                                                 className="h-7 w-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:border-rose-500 hover:text-rose-500 transition-all"
                                             >
                                                 <Icon name="logout" size="xs" />
                                             </button>
                                         </div>
                                     </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No nodes match your query</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Verification Modal */}
            {modalOpen && selectedVendor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setModalOpen(false)}></div>
                    <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 p-1">
                                    <img src={selectedVendor.portfolio?.[0]?.url || `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedVendor.businessName}`} alt="" className="w-full h-full object-cover rounded-xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedVendor.businessName}</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Application Review</p>
                                </div>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="h-10 w-10 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors">
                                <Icon name="close" size="sm" color="#64748b" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Info */}
                                <div className="lg:col-span-1 space-y-8">
                                    <section className="space-y-4">
                                        <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-widest pb-2 border-b border-primary-100">Business Profile</h4>
                                        <div className="space-y-4">
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                                                <p className="text-[13px] font-bold text-slate-900">{selectedVendor.fullName}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                                <p className="text-[13px] font-bold text-slate-900">{selectedVendor.email}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category & Location</p>
                                                <p className="text-[13px] font-bold text-slate-900">{selectedVendor.category} • {selectedVendor.city}</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-4">
                                        <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-widest pb-2 border-b border-primary-100">Performance Metrics</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                                <p className="text-xl font-black text-slate-900">{selectedVendor.businessDetails?.years || '0'}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Exp. Years</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                                <p className="text-xl font-black text-slate-900">{selectedVendor.businessDetails?.teamSize || '1'}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Team Size</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-4">
                                        <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-widest pb-2 border-b border-primary-100">Documents</h4>
                                        <div className="space-y-3">
                                            {selectedVendor.documents?.idProof ? (
                                                <a href={selectedVendor.documents.idProof} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl group transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <Icon name="shield" size="xs" color="#10b981" />
                                                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">ID Proof Uploaded</span>
                                                    </div>
                                                    <Icon name="eye" size="xs" color="#10b981" />
                                                </a>
                                            ) : (
                                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                                                    <Icon name="shield" size="xs" color="#94a3b8" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No ID Proof</span>
                                                </div>
                                            )}
                                            
                                            {selectedVendor.documents?.gst ? (
                                                <a href={selectedVendor.documents.gst} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl group transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <Icon name="sparkles" size="xs" color="#10b981" />
                                                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">GST Registered</span>
                                                    </div>
                                                    <Icon name="eye" size="xs" color="#10b981" />
                                                </a>
                                            ) : (
                                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                                                    <Icon name="sparkles" size="xs" color="#94a3b8" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No GST Record</span>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: Content & Media */}
                                <div className="lg:col-span-2 space-y-8">
                                    <section className="space-y-4">
                                        <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-widest pb-2 border-b border-primary-100">About the Business</h4>
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <p className="text-[13px] font-medium text-slate-600 leading-relaxed italic">
                                                "{selectedVendor.businessDetails?.description || 'No description provided yet.'}"
                                            </p>
                                        </div>
                                    </section>

                                    <section className="space-y-4">
                                        <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-widest pb-2 border-b border-primary-100">Work Portfolio</h4>
                                        {selectedVendor.portfolio && selectedVendor.portfolio.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {selectedVendor.portfolio.map((item, idx) => (
                                                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative group">
                                                        <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                            <p className="text-[8px] font-black text-white uppercase tracking-widest truncate">{item.title}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 p-10 rounded-3xl border border-dashed border-slate-200 text-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No portfolio media uploaded</p>
                                            </div>
                                        )}
                                    </section>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                            <button 
                                onClick={() => handleAction(selectedVendor._id, 'Rejected')}
                                disabled={actionLoading}
                                className="px-8 py-4 rounded-2xl border border-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all disabled:opacity-50"
                            >
                                Reject Application
                            </button>
                            <button 
                                onClick={() => handleAction(selectedVendor._id, 'Approved')}
                                disabled={actionLoading}
                                className="flex-1 max-w-sm py-4 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
                            >
                                {actionLoading ? 'Processing...' : selectedVendor.status === 'Approved' ? 'Already Verified' : 'Approve & Activate Partner'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVendors;
