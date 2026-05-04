import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import Icon from '../../../components/ui/Icon';

const AdminVendorPortfolios = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [selectedVendor, setSelectedVendor] = useState(null);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const res = await adminApi.getVendors(token);
                if (res.success) {
                    setVendors(res.data);
                }
            } catch (err) {
                console.error('Error fetching vendors:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const categories = ['All', ...new Set(vendors.map(v => v.category))];

    const filteredVendors = vendors.filter(v => {
        const matchesSearch = v.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             v.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || v.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="animate-spin h-10 w-10 border-4 border-primary-400 border-t-transparent rounded-full shadow-lg shadow-primary-400/20"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Curating Portfolio Gallery...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header - Glassmorphism */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Icon name="image" size="3xl" />
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-2">Ecosystem Oversight</p>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Portfolio Gallery</h1>
                    <p className="text-sm font-medium text-slate-500 mt-2">Audit and monitor vendor creative showcases across the platform.</p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[300px]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors">
                            <Icon name="search" size="xs" />
                        </div>
                        <input 
                            type="text"
                            placeholder="Search by vendor or business name..."
                            className="w-full h-14 pl-12 pr-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/5 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                    filterCategory === cat 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-primary-400 hover:text-primary-400'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Vendor Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredVendors.map((vendor, i) => {
                    const portfolioCount = vendor.portfolio?.length || 0;
                    return (
                        <div 
                            key={vendor._id}
                            className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group relative flex flex-col h-full"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary-400 border border-slate-100 shadow-inner font-black text-xl overflow-hidden">
                                    {vendor.portfolio?.[0]?.url ? (
                                        <img src={vendor.portfolio[0].url} className="h-full w-full object-cover" />
                                    ) : (
                                        vendor.businessName?.[0] || 'V'
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                                        vendor.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                        {vendor.status === 'Approved' ? 'Verified' : 'Pending'}
                                    </span>
                                    <div className="mt-2 flex items-center justify-end gap-1">
                                        <Icon name="eye" size="xs" color="#94a3b8" />
                                        <span className="text-[10px] font-black text-slate-400">{vendor.profileViews || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-primary-400 transition-colors uppercase truncate">{vendor.businessName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{vendor.category}</p>
                                    <span className="h-1 w-1 rounded-full bg-slate-200"></span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{vendor.city}</p>
                                </div>

                                <div className="mt-4 flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Icon name="mail" size="xs" color="currentColor" />
                                        <span className="text-[9px] font-bold truncate">{vendor.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Icon name="phone" size="xs" color="currentColor" />
                                        <span className="text-[9px] font-bold">{vendor.phone}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Icon name="image" size="xs" color="#94a3b8" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showcase Items</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{portfolioCount}</span>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {vendor.portfolio?.slice(0, 4).map((item, idx) => (
                                            <div key={idx} className="h-8 w-8 rounded-lg border-2 border-white overflow-hidden shadow-sm">
                                                {item.type === 'Video' ? (
                                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[6px] text-white">V</div>
                                                ) : (
                                                    <img src={item.url} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                        ))}
                                        {portfolioCount > 4 && (
                                            <div className="h-8 w-8 rounded-lg bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-600 shadow-sm">
                                                +{portfolioCount - 4}
                                            </div>
                                        )}
                                        {portfolioCount === 0 && (
                                            <div className="text-[9px] font-bold text-slate-300 italic">Empty Portfolio</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 flex gap-3">
                                <button 
                                    onClick={() => setSelectedVendor(vendor)}
                                    className="flex-1 h-12 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-400 shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Icon name="eye" size="xs" /> Showcase
                                </button>
                                <button 
                                    onClick={() => {
                                        if (window.confirm('Erase this partner node and all associated creative assets?')) {
                                            adminApi.deleteVendor(vendor._id, localStorage.getItem('adminToken'))
                                                .then(res => {
                                                    if (res.success) {
                                                        setVendors(prev => prev.filter(v => v._id !== vendor._id));
                                                    }
                                                });
                                        }
                                    }}
                                    className="h-12 w-12 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100 transition-all flex items-center justify-center shadow-sm"
                                    title="Deactivate Node"
                                >
                                    <Icon name="logout" size="xs" color="currentColor" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredVendors.length === 0 && (
                <div className="bg-white rounded-[3rem] p-20 border border-slate-200 border-dashed text-center">
                    <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Icon name="search" size="sm" color="current" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">No Vendors Found</h3>
                    <p className="text-sm font-medium text-slate-500 mt-2">Adjust your search or filters to see more results.</p>
                </div>
            )}

            {/* Detailed Portfolio Modal */}
            {selectedVendor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedVendor(null)}></div>
                    <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-primary-50 text-primary-400 flex items-center justify-center font-black text-xl border border-primary-100">
                                    {selectedVendor.businessName?.[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 leading-none uppercase">{selectedVendor.businessName}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{selectedVendor.category} • {selectedVendor.fullName} • {selectedVendor.phone}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedVendor(null)} className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                                <Icon name="close" size="sm" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {selectedVendor.portfolio?.map((item, idx) => (
                                    <div key={idx} className="bg-slate-50 rounded-3xl overflow-hidden group border border-slate-100 transition-all hover:shadow-xl hover:translate-y-[-4px]">
                                        <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                                            {item.type === 'Video' ? (
                                                <video src={item.url} className="w-full h-full object-cover" controls />
                                            ) : (
                                                <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            )}
                                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[8px] font-black text-white uppercase tracking-widest shadow-sm">
                                                {item.type}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white">
                                            <p className="text-[9px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">{item.tag}</p>
                                            <h4 className="text-xs font-black text-slate-900 uppercase truncate">{item.title || 'Untitled Work'}</h4>
                                        </div>
                                    </div>
                                ))}
                                {(!selectedVendor.portfolio || selectedVendor.portfolio.length === 0) && (
                                    <div className="col-span-full py-20 text-center">
                                        <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No showcase items available for this vendor.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-between">
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Profile Views</p>
                                    <p className="text-sm font-black text-slate-900">{selectedVendor.profileViews || 0}</p>
                                </div>
                                <div className="w-px h-8 bg-slate-200 mx-2"></div>
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                    <p className={`text-sm font-black ${selectedVendor.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'}`}>{selectedVendor.status}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedVendor(null)}
                                className="h-12 px-8 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-400 transition-all shadow-lg"
                            >
                                Close Overview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVendorPortfolios;
