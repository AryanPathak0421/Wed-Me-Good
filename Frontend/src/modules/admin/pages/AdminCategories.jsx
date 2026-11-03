import { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/ui/Icon';
import { adminApi } from '../services/adminApi';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const token = localStorage.getItem('adminToken');

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getCategories();
            if (res.success) {
                setCategories(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = useMemo(() => {
        return categories.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categories, searchQuery]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!formData.name) return alert('Label required');

        try {
            setActionLoading(true);
            let res;
            if (selectedCategory) {
                res = await adminApi.updateCategory(selectedCategory._id, formData, token);
            } else {
                res = await adminApi.createCategory(formData, token);
            }

            if (res.success) {
                fetchCategories();
                setIsEditing(false);
                setSelectedCategory(null);
                setFormData({ name: '', description: '' });
            } else {
                alert(res.message || 'Error');
            }
        } catch (err) {
            console.error('Submit error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = (cat) => {
        setSelectedCategory(cat);
        setFormData({ name: cat.name, description: cat.description || '' });
        setIsEditing(true);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Terminate node?')) return;
        try {
            const res = await adminApi.deleteCategory(id, token);
            if (res.success) {
                fetchCategories();
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            {/* Minimalist Top Nav */}
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-1 bg-primary-400 rounded-full"></div>
                    <div>
                        <h1 className="text-[14px] font-black text-slate-900 tracking-tight uppercase leading-none">Catalog Architecture</h1>
                        <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest mt-1">Registry Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Icon name="search" size="xs" color="#cbd5e1" className="absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="FIND NODE..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-9 pr-4 bg-slate-50 border-none rounded-lg text-[9px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary-400/10 focus:bg-white outline-none w-40 transition-all placeholder:text-slate-300"
                        />
                    </div>
                    <button 
                        onClick={() => { setIsEditing(true); setSelectedCategory(null); setFormData({ name: '', description: '' }); }}
                        className="h-8 px-4 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                        <Icon name="plus" size="xs" color="white" />
                        Deploy
                    </button>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                
                {/* Compact Nodes */}
                <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                    {loading ? (
                        [1,2,3,4,5].map(i => (
                            <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-xl animate-pulse"></div>
                        ))
                    ) : filteredCategories.length > 0 ? filteredCategories.map((cat) => (
                        <div 
                            key={cat._id} 
                            onClick={() => handleEdit(cat)}
                            className="group p-4 bg-white rounded-xl border border-slate-100 hover:border-primary-400/40 hover:shadow-lg hover:shadow-slate-100 transition-all cursor-pointer relative"
                        >
                            <div className="flex items-center justify-between">
                                <div className="h-6 w-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary-50 group-hover:text-primary-400 transition-all">
                                    <Icon name="palette" size="xs" color="currentColor" />
                                </div>
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                            </div>

                            <div className="mt-3">
                                <h3 className="text-[11px] font-black text-slate-900 truncate tracking-tight">{cat.name}</h3>
                                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 tracking-tighter">NODE_{cat._id.slice(-4).toUpperCase()}</span>
                                    <button onClick={(e) => handleDelete(e, cat._id)} className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                                        <Icon name="logout" size="xs" color="currentColor" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-16 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl text-center">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No active nodes in registry</p>
                        </div>
                    )}

                    {/* Highly Visible Add Trigger */}
                    <button 
                        onClick={() => { setIsEditing(true); setSelectedCategory(null); setFormData({ name: '', description: '' }); }}
                        className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-primary-400/60 hover:bg-primary-50/30 transition-all flex flex-col items-center justify-center gap-2 min-h-[120px] group shadow-sm shadow-slate-100"
                    >
                        <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-primary-500 group-hover:border-primary-400 group-hover:scale-110 transition-all duration-300 shadow-sm">
                            <Icon name="plus" size="xs" color="currentColor" />
                        </div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-primary-500 transition-colors">Append Node</span>
                    </button>
                </div>

                {/* Narrow Config Sidebar */}
                <div className="lg:col-span-3 sticky top-4">
                    {isEditing ? (
                        <div className="bg-white p-5 rounded-2xl border border-slate-900 shadow-2xl space-y-5 animate-in slide-in-from-right-2 duration-300">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase">Configuration</h3>
                                <button onClick={() => setIsEditing(false)} className="h-6 w-6 flex items-center justify-center rounded hover:bg-slate-50 transition-all">
                                    <Icon name="logout" size="xs" color="#cbd5e1" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Label</label>
                                    <input 
                                        className="w-full h-9 bg-slate-50 border border-slate-100 rounded-lg px-3 text-[11px] font-bold text-slate-900 outline-none focus:border-primary-400 transition-all"
                                        placeholder="Category Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Scope</label>
                                    <textarea 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-900 outline-none focus:border-primary-400 transition-all min-h-[80px] resize-none"
                                        placeholder="Description..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>

                                <button 
                                    onClick={handleSubmit}
                                    disabled={actionLoading}
                                    className="w-full h-9 rounded-lg bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? '...' : <Icon name="sparkles" size="xs" color="white" />}
                                    {selectedCategory ? 'Update' : 'Deploy'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-primary-400 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden min-h-[220px] flex flex-col justify-end">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-black tracking-tight uppercase leading-none">Catalog<br/>Master</h3>
                                <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-3 leading-relaxed">
                                    Select a node to configure or deploy new taxonomy.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCategories;
