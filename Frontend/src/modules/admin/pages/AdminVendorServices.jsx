import { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/ui/Icon';
import { adminApi } from '../services/adminApi';

const AdminVendorServices = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const token = localStorage.getItem('adminToken');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getVendors(token);
            if (res.success) {
                // Filter only vendors who have services
                setVendors(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch vendors for services:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const categories = useMemo(() => {
        const cats = new Set(['All']);
        vendors.forEach(v => {
            v.services?.forEach(s => {
                if (s.category) cats.add(s.category);
            });
        });
        return Array.from(cats);
    }, [vendors]);

    const filteredData = useMemo(() => {
        return vendors.map(vendor => {
            const filteredServices = (vendor.services || []).filter(service => {
                const matchCategory = filterCategory === 'All' || service.category === filterCategory;
                const matchSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                   vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase());
                return matchCategory && matchSearch;
            });
            return { ...vendor, filteredServices };
        }).filter(v => v.filteredServices.length > 0);
    }, [vendors, searchQuery, filterCategory]);

    const totalServices = useMemo(() => {
        return vendors.reduce((sum, v) => sum + (v.services?.length || 0), 0);
    }, [vendors]);

    const getCardColor = (index) => {
        const colors = [
            { bg: '#F0F9FF', border: '#E0F2FE', text: '#0284C7' }, // Sky
            { bg: '#FDF2F8', border: '#FCE7F3', text: '#DB2777' }, // Pink
            { bg: '#F5F3FF', border: '#EDE9FE', text: '#7C3AED' }, // Purple
            { bg: '#F0FDF4', border: '#DCFCE7', text: '#16A34A' }, // Green
            { bg: '#FFFBEB', border: '#FEF3C7', text: '#D97706' }, // Amber
            { bg: '#EFF6FF', border: '#DBEAFE', text: '#2563EB' }, // Blue
        ];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-8 w-8 border-4 border-primary-400 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Service Index</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Vendor Offerings & Catalog Oversight</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Icon name="search" size="xs" color="#94a3b8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Grep services or partners..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-semibold focus:ring-4 focus:ring-primary-400/5 outline-none w-64 transition-all"
                        />
                    </div>
                    <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary-400/5"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Active Services</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{totalServices}</h3>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Participating Partners</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{vendors.filter(v => v.services?.length > 0).length}</h3>
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
                {filteredData.length > 0 ? filteredData.map(vendor => (
                    <div key={vendor._id} className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                                <Icon name="user" size="xs" color="white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">{vendor.businessName}</h2>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{vendor.category} • {vendor.city}</p>
                            </div>
                            <div className="ml-auto flex items-center gap-4">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100 hidden md:inline-block">
                                    {vendor.filteredServices.length} Services Shown
                                </span>
                                <button 
                                    onClick={() => {
                                        if (window.confirm('Delete this vendor and all their services?')) {
                                            adminApi.deleteVendor(vendor._id, token).then(res => {
                                                if (res.success) fetchData();
                                            });
                                        }
                                    }}
                                    className="h-8 w-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100 flex items-center justify-center transition-all"
                                    title="Erase Partner Node"
                                >
                                    <Icon name="logout" size="xs" color="currentColor" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {vendor.filteredServices.map((service, idx) => {
                                const theme = getCardColor(idx);
                                return (
                                    <div key={service._id || idx} className="rounded-[2.5rem] p-0 border transition-all group hover:shadow-xl hover:shadow-slate-200/40 overflow-hidden flex flex-col" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
                                        {/* Service Image */}
                                        <div className="h-32 w-full bg-slate-200/50 relative overflow-hidden flex-shrink-0">
                                            {service.image ? (
                                                <img src={service.image} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt={service.name} />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                    <Icon name="camera" size="sm" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-white/90 text-[8px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                                                Active
                                            </div>
                                        </div>

                                        <div className="p-4 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="h-7 w-7 rounded-lg bg-white/60 border border-white/80 flex items-center justify-center shadow-sm" style={{ color: theme.text }}>
                                                    <Icon name="sparkles" size="xs" color="currentColor" />
                                                </div>
                                                <p className="text-[8px] font-black uppercase tracking-[0.15em]" style={{ color: theme.text }}>{service.category}</p>
                                            </div>

                                            <h3 className="text-[11px] font-black text-slate-900 tracking-tight leading-snug line-clamp-1">{service.name}</h3>

                                            <div className="mt-3 flex-1">
                                                <div className="flex flex-wrap gap-1">
                                                    {(service.features || service.packages?.[0]?.features || []).slice(0, 3).map((feat, fIdx) => (
                                                        <span key={fIdx} className="px-2 py-0.5 rounded-lg bg-white/60 border border-white/80 text-[7px] font-bold text-slate-600 flex items-center gap-1">
                                                            <div className="h-0.5 w-0.5 rounded-full" style={{ backgroundColor: theme.text }}></div>
                                                            {feat}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
                                                <button className="text-[8px] font-black uppercase tracking-widest hover:underline" style={{ color: theme.text }}>
                                                    Audit Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )) : (
                    <div className="bg-white rounded-[3rem] p-20 border border-slate-200 border-dashed text-center">
                        <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <Icon name="search" size="sm" color="#94a3b8" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">No services found</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Try adjusting your filters or search query</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminVendorServices;
