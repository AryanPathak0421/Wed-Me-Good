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
        category: vendorState.category, // Always use vendor's registration category
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
      { bg: '#FFF1F2', border: '#FFE4E6', text: '#E11D48' }, // Rose
      { bg: '#F0F9FF', border: '#E0F2FE', text: '#0284C7' }, // Sky
      { bg: '#F5F3FF', border: '#EDE9FE', text: '#7C3AED' }, // Purple
      { bg: '#FFFBEB', border: '#FEF3C7', text: '#D97706' }, // Amber
      { bg: '#F0FDF4', border: '#DCFCE7', text: '#16A34A' }  // Emerald
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="vendor-surface rounded-xl p-3 sm:p-5 relative overflow-hidden bg-[#FDF2F8] border border-rose-100">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed648f]">{vendorState.category || 'Vendor'}</p>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">My Services</h2>
            <p className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5">All services are locked to your registered category.</p>
          </div>
          <button 
            type="button" 
            disabled={isSaving}
            className="vendor-cta rounded-lg px-5 py-2.5 text-[11px] sm:text-xs font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-rose-200 disabled:opacity-50"
            onClick={() => {
              setEditingId(null);
              setNewService({ name: '', image: '', features: ['', ''] });
              setShowModal(true);
            }}
          >
            <Icon name="plus" size="xs" /> Add service
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Services', value: vendorState.services?.length || 0, bg: '#F0F9FF', border: '#E0F2FE' },
          { label: 'Category', value: vendorState.category || 'N/A', bg: '#FFFBEB', border: '#FEF3C7' },
          { label: 'Visibility', value: 'High', bg: '#F0FDF4', border: '#DCFCE7' }
        ].map((stat, i) => (
          <div key={i} className="vendor-surface rounded-xl p-2 sm:p-3 border shadow-none flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]" style={{ background: stat.bg, borderColor: stat.border }}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{stat.label}</p>
            <p className="text-[10px] sm:text-xs font-black text-slate-900 tracking-tight leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Service Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {vendorState.services?.map((service, i) => {
          const theme = getServiceColor(i);
          return (
            <div key={service._id} className="vendor-surface rounded-2xl p-0 relative overflow-hidden transition-all hover:shadow-md border flex flex-col sm:flex-row" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
              {/* Service Image */}
              <div className="w-full sm:w-40 h-40 sm:h-auto bg-slate-100 flex-shrink-0 relative overflow-hidden">
                {service.image ? (
                   <img src={service.image} className="h-full w-full object-cover" alt={service.name} />
                ) : (
                   <div className="h-full w-full flex flex-col items-center justify-center text-slate-300">
                      <Icon name="camera" size="sm" />
                      <span className="text-[8px] font-black uppercase mt-1">No Image</span>
                   </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-white/90 text-[8px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                   {service.category || vendorState.category}
                </div>
              </div>

              <div className="flex-1 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{service.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-40">Primary Listing</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(service)} className="h-8 w-8 rounded-lg bg-white/60 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                        <Icon name="edit" size="xs" />
                    </button>
                    <button onClick={() => handleDelete(service._id)} className="h-8 w-8 rounded-lg bg-white/60 flex items-center justify-center text-rose-400 hover:text-rose-600 transition-colors">
                        <Icon name="trash" size="xs" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="px-1">
                    <p className="text-[9px] font-black text-slate-900/30 uppercase tracking-widest mb-2">Highlights</p>
                    <div className="flex flex-wrap gap-2">
                      {(service.features || service.packages?.[0]?.features || []).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-white/60 rounded-lg px-2 py-1 border border-white/80 text-[9px] font-bold text-slate-600">
                          <Icon name="check" size="xs" color="#10b981" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{editingId ? 'Edit Service' : 'New Service'}</h3>
                  <p className="text-xs font-bold text-slate-500">Define your offering details</p>
                </div>
                <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                   <Icon name="close" size="sm" />
                </button>
             </div>

             <div className="space-y-4">
                {/* Image Upload */}
                <div className="relative h-32 w-full rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group">
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
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Upload Display Image</span>
                         <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                   )}
                   {newService.image && <input type="file" className="hidden" id="service-img-change" accept="image/*" onChange={handleImageUpload} />}
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Service Name</label>
                    <input 
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black focus:outline-none focus:border-rose-400 transition-all"
                      placeholder="e.g. Traditional Wedding Stage"
                      value={newService.name}
                      onChange={(e) => setNewService({...newService, name: e.target.value})}
                    />
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Auto-Assigned Category</p>
                    <p className="text-xs font-black text-slate-900 mt-1">{vendorState.category}</p>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Key Features (Max 4)</label>
                   <div className="grid grid-cols-2 gap-2">
                      {[0, 1, 2, 3].map(idx => (
                        <input 
                          key={idx}
                          className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold focus:outline-none focus:border-rose-400"
                          placeholder={`Feature ${idx + 1}`}
                          value={newService.features[idx] || ''}
                          onChange={(e) => {
                            const updated = [...newService.features];
                            updated[idx] = e.target.value;
                            setNewService({...newService, features: updated});
                          }}
                        />
                      ))}
                   </div>
                </div>

                <div className="pt-2">
                   <button 
                     disabled={isSaving}
                     onClick={handleSave} 
                     className="w-full vendor-cta h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200 disabled:opacity-50"
                   >
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
