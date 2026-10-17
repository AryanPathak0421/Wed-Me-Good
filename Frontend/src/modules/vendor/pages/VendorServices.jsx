import { useState, useEffect, useMemo } from 'react';
import { useVendorState } from '../useVendorState';
import { vendorApi } from '../vendorApi';
import Icon from '../../../components/ui/Icon';

const VendorServices = () => {
  const { vendorState, updateVendorState, refreshData } = useVendorState();
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    image: '',
    features: ['', '']
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = useMemo(() => {
    const list = new Set(['All']);
    if (vendorState?.category) {
      list.add(vendorState.category);
    }
    (vendorState?.services || []).forEach(s => {
      if (s.category) list.add(s.category);
    });
    return Array.from(list);
  }, [vendorState?.category, vendorState?.services]);

  const filteredServices = useMemo(() => {
    return (vendorState?.services || []).filter(service => {
      const matchesSearch = (service.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (service.features || []).some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'All' || (service.category || vendorState?.category || '') === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [vendorState?.services, searchQuery, categoryFilter, vendorState?.category]);

  useEffect(() => {
    if (showModal) { 
      document.body.style.overflow = 'hidden'; 
      document.body.classList.add('modal-open');
    } else { 
      document.body.style.overflow = 'unset'; 
      document.body.classList.remove('modal-open');
    }
    return () => { 
      document.body.style.overflow = 'unset'; 
      document.body.classList.remove('modal-open');
    };
  }, [showModal]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('vendorToken');
      const res = await vendorApi.uploadMedia(file, token);
      if (res.success) {
        setNewService(prev => ({ ...prev, image: res.url }));
      } else {
        alert('Image upload failed');
      }
    } catch (err) {
      console.error('Image upload error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!newService.name) {
      alert('Please fill in service name.');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('vendorToken');
      const serviceData = {
        name: newService.name,
        category: vendorState.category,
        image: newService.image,
        packages: [
          { name: 'Standard', price: 0, features: newService.features.filter(Boolean) },
          { name: 'Premium', price: 0, features: newService.features.filter(Boolean) }
        ],
        features: newService.features.filter(Boolean)
      };

      let updatedServices;
      if (editingId) {
        updatedServices = vendorState.services.map(s => s._id === editingId ? { ...serviceData, _id: editingId } : s);
      } else {
        updatedServices = [...vendorState.services, serviceData];
      }

      const res = await vendorApi.updateProfile({ services: updatedServices }, token);
      if (res.success) {
        updateVendorState(res.data);
        setShowModal(false);
        setEditingId(null);
        setNewService({ name: '', image: '', features: ['', ''] });
        refreshData();
      } else {
        alert(res.message || 'Failed to save service');
      }
    } catch (err) {
      console.error('Error saving service:', err);
      alert('Network error while saving service');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('vendorToken');
      const updatedServices = vendorState.services.filter(s => s._id !== id);
      const res = await vendorApi.updateProfile({ services: updatedServices }, token);
      if (res.success) {
        updateVendorState(res.data);
        refreshData();
      }
    } catch (err) {
      console.error('Error deleting service:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service._id);
    setNewService({
      name: service.name,
      image: service.image || '',
      features: service.features || service.packages?.[0]?.features || ['', '']
    });
    setShowModal(true);
  };

  const getServiceColor = (index) => {
    const colors = [
      { bg: '#F8FAFF', border: '#E0E7FF', text: '#4F46E5', accent: '#EEF2FF' }, // Indigo
      { bg: '#F0FDF4', border: '#DCFCE7', text: '#16A34A', accent: '#F0FDF4' }, // Emerald
      { bg: '#f3e8ff', border: '#ede9fe', text: '#E11D48', accent: '#f3e8ff' }, // Rose
      { bg: '#F5F3FF', border: '#EDE9FE', text: '#7C3AED', accent: '#F5F3FF' }, // Purple
    ];
    return colors[index % colors.length];
  };

  if (!vendorState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-[#7c3aed] border-t-transparent rounded-full"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-500 pb-20 sm:pb-0">
      <style>{`
        .chevron-card {
          clip-path: polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%);
        }
        .chevron-card:first-child {
          clip-path: polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%);
          border-top-left-radius: 12px;
          border-bottom-left-radius: 12px;
        }
        .chevron-card:last-child {
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 10% 50%);
          border-top-right-radius: 12px;
          border-bottom-right-radius: 12px;
        }
        .service-arrow-card {
          clip-path: polygon(0% 0%, 96% 0%, 100% 50%, 96% 100%, 0% 100%, 4% 50%);
        }
        @media (max-width: 640px) {
          .service-arrow-card {
            clip-path: none !important;
            border-radius: 16px;
          }
        }
      `}</style>

      {/* Header Section (Matching Image 2) */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-[#7c3aed] mb-0.5">{vendorState.category?.toUpperCase() || 'CATEGORY'}</p>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">My Services</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 max-w-xs">
              Manage your locked category offerings.
            </p>
          </div>
          <button 
            type="button" 
            disabled={isSaving}
            className="h-8.5 px-4 rounded-lg bg-[#7c3aed] text-white text-[9.5px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-rose-100 active:scale-95 transition-all disabled:opacity-50"
            onClick={() => {
              setEditingId(null);
              setNewService({ name: '', image: '', features: ['', ''] });
              setShowModal(true);
            }}
          >
            <Icon name="plus" size="xs" /> Add Service
          </button>
        </div>
      </div>

      {/* Stats Pipeline Row (Matching Image 1 Card Style) */}
      <div className="flex w-full h-10 sm:h-12 gap-1 overflow-hidden drop-shadow-sm">
        {[
          { label: 'Services', value: vendorState.services?.length || 0, color: '#1E293B', text: '#94A3B8' },
          { label: 'Category', value: vendorState.category || 'N/A', color: '#334155', text: '#CBD5E1' },
          { label: 'Visibility', value: 'High', color: '#7c3aed', text: '#FCE7F3' }
        ].map((stat, i) => (
          <div 
            key={i} 
            className="chevron-card flex-1 flex flex-col items-center justify-center p-1 relative"
            style={{ backgroundColor: stat.color }}
          >
            <p className="text-[7px] sm:text-[8px] font-bold uppercase tracking-widest mb-0.5" style={{ color: stat.text }}>{stat.label}</p>
            <div className="h-4.5 w-auto px-2 bg-white/10 backdrop-blur-md rounded-md flex items-center justify-center border border-white/10 shadow-sm">
               <span className="text-[9.5px] sm:text-[10px] font-bold text-white">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-1.5 px-1 overflow-x-auto no-scrollbar">
        <div className="relative flex-shrink-0">
          <Icon name="search" size="xs" color="#94a3b8" className="absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-32 sm:w-44 h-7.5 pl-8 pr-3 bg-white border border-slate-100 rounded-lg text-[10.5px] font-medium focus:outline-none focus:ring-1 focus:ring-indigo-200 transition-all shadow-sm focus:w-40 sm:focus:w-52"
          />
        </div>
        <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-100 flex-shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-0.5 rounded-md text-[9px] font-semibold whitespace-nowrap transition-all ${categoryFilter === cat ? 'bg-white text-indigo-600 shadow-sm border border-slate-100 scale-105' : 'text-slate-500 hover:text-slate-700 hover:scale-105'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Service List Cards (Professional & Compact) */}
      <div className="grid gap-3 lg:grid-cols-2">
        {filteredServices.length === 0 ? (
          <div className="col-span-full rounded-2xl p-12 text-center bg-slate-50 border border-dashed border-slate-200">
             <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-300">
                <Icon name="grid" size="xs" />
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No matching services found</p>
          </div>
        ) : (
          filteredServices.map((service, i) => {
            const theme = getServiceColor(i);
          return (
            <div 
              key={service._id} 
              className="service-arrow-card overflow-hidden shadow-sm flex flex-row group transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer rounded-xl border border-slate-100/50"
              style={{ backgroundColor: theme.bg }}
              onClick={() => handleEdit(service)}
            >
              {/* Service Image */}
              <div className="w-20 sm:w-32 h-20 sm:h-auto bg-white/40 flex-shrink-0 relative overflow-hidden pl-1 sm:pl-3 py-1 sm:py-0">
                {service.image ? (
                   <img src={service.image} className="h-full w-full object-cover rounded-lg sm:rounded-none transition-transform duration-500 group-hover:scale-110" alt={service.name} />
                ) : (
                   <div className="h-full w-full flex flex-col items-center justify-center text-slate-300">
                      <Icon name="camera" size="xs" />
                   </div>
                )}
                <div className="absolute top-1.5 left-2 sm:left-6 px-1.5 py-0.5 rounded bg-white/90 text-[6px] sm:text-[8px] font-bold uppercase tracking-widest text-slate-900 shadow-sm backdrop-blur-sm">
                   {service.category || vendorState.category}
                </div>
              </div>

              <div className="flex-1 p-2 sm:p-4 sm:pl-5 sm:pr-8 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="text-[11.5px] sm:text-[14px] font-black text-slate-900 uppercase tracking-tight truncate">{service.name}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(service); }} className="h-[22px] w-[22px] sm:h-[26px] sm:w-[26px] rounded-md bg-white flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm transition-all border border-white/40">
                          <Icon name="edit" size="xs" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(service._id); }} className="h-[22px] w-[22px] sm:h-[26px] sm:w-[26px] rounded-md bg-white flex items-center justify-center text-slate-400 hover:text-rose-600 shadow-sm transition-all border border-white/40">
                          <Icon name="trash" size="xs" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-1 sm:mt-1.5">
                    {(service.features || service.packages?.[0]?.features || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-0.5 bg-white/60 rounded px-1.5 py-0.5 text-[7.5px] sm:text-[8.5px] font-bold text-slate-700 shadow-sm">
                        <Icon name="check" size="xs" color={theme.text} className="scale-75 sm:scale-100" />
                        <span className="truncate max-w-[65px] sm:max-w-[100px]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-1.5 sm:mt-2.5 pt-1.5 sm:pt-2 flex items-center justify-between border-t border-black/5">
                   <p className="text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-[0.2em]" style={{ color: theme.text }}>Listing Managed</p>
                   <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full shadow-sm" style={{ backgroundColor: theme.text }}></span>
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-4 sm:p-5 overflow-hidden animate-in fade-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">{editingId ? 'Edit Service' : 'New Service'}</h3>
                  <p className="text-[11px] font-bold text-slate-500">Configure your business offering</p>
                </div>
                <button onClick={() => setShowModal(false)} className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                   <Icon name="close" size="xs" />
                </button>
             </div>

             <div className="space-y-3">
                <div className="relative h-24 w-full rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group">
                   {newService.image ? (
                      <>
                        <img src={newService.image} className="h-full w-full object-cover" alt="Service" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <label className="cursor-pointer bg-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">Change Image</label>
                        </div>
                      </>
                   ) : (
                      <label className="cursor-pointer flex flex-col items-center">
                         <Icon name="camera" size="xs" color="#94a3b8" />
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Display Image</span>
                         <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                   )}
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Service Name</label>
                    <input className="w-full h-9.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-indigo-400 transition-all" placeholder="e.g. Traditional Wedding Stage" value={newService.name} onChange={(e) => setNewService({...newService, name: e.target.value})} />
                </div>

                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Key Features</label>
                   <div className="grid grid-cols-2 gap-1.5">
                      {[0, 1, 2, 3].map(idx => (
                        <input key={idx} className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[9.5px] font-bold focus:outline-none focus:border-indigo-400" placeholder={`Feature ${idx + 1}`} value={newService.features[idx] || ''} onChange={(e) => {
                          const updated = [...newService.features];
                          updated[idx] = e.target.value;
                          setNewService({...newService, features: updated});
                        }} />
                      ))}
                   </div>
                </div>

                <div className="pt-1.5">
                   <button disabled={isSaving} onClick={handleSave} className="w-full h-10 rounded-lg text-xs font-black uppercase tracking-widest bg-[#7c3aed] text-white shadow-lg shadow-rose-100 active:scale-95 transition-all disabled:opacity-50">
                      {isSaving ? 'Saving...' : (editingId ? 'Update Service' : 'Create Service')}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorServices;
