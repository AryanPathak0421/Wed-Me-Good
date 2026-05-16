import { useState, useEffect } from 'react';
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
      { bg: '#FFF1F2', border: '#FFE4E6', text: '#E11D48', accent: '#FFF1F2' }, // Rose
      { bg: '#F5F3FF', border: '#EDE9FE', text: '#7C3AED', accent: '#F5F3FF' }, // Purple
    ];
    return colors[index % colors.length];
  };

  if (!vendorState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-[#ed648f] border-t-transparent rounded-full"></div>
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
            clip-path: polygon(0% 0%, 100% 0%, 100% 92%, 50% 100%, 0% 92%);
          }
        }
      `}</style>

      {/* Header Section (Matching Image 2) */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#ed648f] mb-1">{vendorState.category?.toUpperCase() || 'CATEGORY'}</p>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">My Services</h2>
            <p className="text-[11px] font-bold text-slate-400 mt-1 max-w-xs">
              Manage your locked category offerings.
            </p>
          </div>
          <button 
            type="button" 
            disabled={isSaving}
            className="h-10 px-6 rounded-lg bg-[#ed648f] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-100 active:scale-95 transition-all disabled:opacity-50"
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
      <div className="flex w-full h-12 sm:h-14 gap-1 overflow-hidden drop-shadow-sm">
        {[
          { label: 'Services', value: vendorState.services?.length || 0, color: '#1E293B', text: '#94A3B8' },
          { label: 'Category', value: vendorState.category || 'N/A', color: '#334155', text: '#CBD5E1' },
          { label: 'Visibility', value: 'High', color: '#ed648f', text: '#FCE7F3' }
        ].map((stat, i) => (
          <div 
            key={i} 
            className="chevron-card flex-1 flex flex-col items-center justify-center p-1 relative"
            style={{ backgroundColor: stat.color }}
          >
            <p className="text-[7px] sm:text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: stat.text }}>{stat.label}</p>
            <div className="h-5 w-auto px-2.5 bg-white/10 backdrop-blur-md rounded-md flex items-center justify-center border border-white/10 shadow-sm">
               <span className="text-[10px] sm:text-[11px] font-bold text-white">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Service List Cards (Professional & Compact) */}
      <div className="grid gap-4 lg:grid-cols-2">
        {vendorState.services?.map((service, i) => {
          const theme = getServiceColor(i);
          return (
            <div 
              key={service._id} 
              className="service-arrow-card overflow-hidden shadow-sm flex flex-col sm:flex-row group transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ backgroundColor: theme.bg }}
            >
              {/* Service Image */}
              <div className="w-full sm:w-36 h-36 sm:h-auto bg-white/40 flex-shrink-0 relative overflow-hidden pl-0 sm:pl-3">
                {service.image ? (
                   <img src={service.image} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt={service.name} />
                ) : (
                   <div className="h-full w-full flex flex-col items-center justify-center text-slate-300">
                      <Icon name="camera" size="sm" />
                   </div>
                )}
                <div className="absolute top-2 left-4 sm:left-6 px-2 py-0.5 rounded bg-white/90 text-[8px] font-bold uppercase tracking-widest text-slate-900 shadow-sm backdrop-blur-sm">
                   {service.category || vendorState.category}
                </div>
              </div>

              <div className="flex-1 p-4 sm:p-5 sm:pl-6 sm:pr-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-[14px] sm:text-[16px] font-semibold text-slate-900 uppercase tracking-tight">{service.name}</h3>
                    <div className="flex items-center gap-1.5 ml-2">
                      <button onClick={() => handleEdit(service)} className="h-7 w-7 rounded-md bg-white flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm transition-all border border-white/40">
                          <Icon name="edit" size="xs" />
                      </button>
                      <button onClick={() => handleDelete(service._id)} className="h-7 w-7 rounded-md bg-white flex items-center justify-center text-slate-400 hover:text-rose-600 shadow-sm transition-all border border-white/40">
                          <Icon name="trash" size="xs" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(service.features || service.packages?.[0]?.features || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-white/60 rounded px-2 py-1 text-[9px] font-medium text-slate-700 shadow-sm">
                        <Icon name="check" size="xs" color={theme.text} />
                        <span className="truncate max-w-[100px]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 pt-3 flex items-center justify-between border-t border-black/5">
                   <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: theme.text }}>Listing Managed</p>
                   <span className="h-1.5 w-1.5 rounded-full shadow-sm" style={{ backgroundColor: theme.text }}></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{editingId ? 'Edit Service' : 'New Service'}</h3>
                  <p className="text-xs font-bold text-slate-500">Configure your business offering</p>
                </div>
                <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                   <Icon name="close" size="sm" />
                </button>
             </div>

             <div className="space-y-4">
                <div className="relative h-32 w-full rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group">
                   {newService.image ? (
                      <>
                        <img src={newService.image} className="h-full w-full object-cover" alt="Service" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <label className="cursor-pointer bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Change Image</label>
                        </div>
                      </>
                   ) : (
                      <label className="cursor-pointer flex flex-col items-center">
                         <Icon name="camera" size="sm" color="#94a3b8" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Display Image</span>
                         <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                   )}
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Name</label>
                    <input className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black focus:outline-none focus:border-indigo-400 transition-all" placeholder="e.g. Traditional Wedding Stage" value={newService.name} onChange={(e) => setNewService({...newService, name: e.target.value})} />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Features</label>
                   <div className="grid grid-cols-2 gap-2">
                      {[0, 1, 2, 3].map(idx => (
                        <input key={idx} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold focus:outline-none focus:border-indigo-400" placeholder={`Feature ${idx + 1}`} value={newService.features[idx] || ''} onChange={(e) => {
                          const updated = [...newService.features];
                          updated[idx] = e.target.value;
                          setNewService({...newService, features: updated});
                        }} />
                      ))}
                   </div>
                </div>

                <div className="pt-2">
                   <button disabled={isSaving} onClick={handleSave} className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-[#ed648f] text-white shadow-lg shadow-rose-100 active:scale-95 transition-all disabled:opacity-50">
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
