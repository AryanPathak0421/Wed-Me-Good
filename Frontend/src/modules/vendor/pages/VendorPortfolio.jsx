import { useState, useEffect } from 'react';
import { useVendorState } from '../useVendorState';
import { vendorApi } from '../vendorApi';
import Icon from '../../../components/ui/Icon';

const VendorPortfolio = () => {
  const { vendorState, refreshData } = useVendorState();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    tag: 'Wedding',
    type: 'Photo',
    url: ''
  });

  useEffect(() => {
    if (vendorState.portfolio) {
      setPortfolio(vendorState.portfolio);
      setLoading(false);
    } else {
      // If not in global state, it might still be loading or needs a refresh
      const fetchProfile = async () => {
        const token = localStorage.getItem('vendorToken');
        const res = await vendorApi.getProfile(token);
        if (res.success) {
          setPortfolio(res.data.portfolio || []);
        }
        setLoading(false);
      };
      fetchProfile();
    }
  }, [vendorState.portfolio]);

  const handleImageUpload = async (file) => {
    setIsUploading(true);
    try {
      const token = localStorage.getItem('vendorToken');
      const res = await vendorApi.uploadMedia(file, token);
      if (res.success) {
        setNewItem(prev => ({ ...prev, url: res.url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSavePortfolio = async (e) => {
    e.preventDefault();
    if (!newItem.title || !newItem.url) return;

    const updatedPortfolio = [...portfolio, { ...newItem }];
    
    try {
      const token = localStorage.getItem('vendorToken');
      const res = await vendorApi.updatePortfolio(updatedPortfolio, token);
      if (res.success) {
        setPortfolio(res.data);
        setIsModalOpen(false);
        setNewItem({ title: '', tag: 'Wedding', type: 'Photo', url: '' });
        refreshData();
      }
    } catch (err) {
      console.error('Failed to save portfolio:', err);
    }
  };

  const removeItem = async (index) => {
    const updatedPortfolio = portfolio.filter((_, i) => i !== index);
    try {
      const token = localStorage.getItem('vendorToken');
      const res = await vendorApi.updatePortfolio(updatedPortfolio, token);
      if (res.success) {
        setPortfolio(res.data);
        refreshData();
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-rose-400 border-t-transparent rounded-full"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exhibiting your work...</p>
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
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed648f]">Showcase</p>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Portfolio & Media</h2>
            <p className="text-xs font-bold text-slate-500 mt-1">Stunning visuals attract 3x more premium clients.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="vendor-cta rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-100 active:scale-95 transition-all"
          >
            <Icon name="plus" size="xs" /> Add Work
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {portfolio.length === 0 ? (
          <div 
            className="col-span-full vendor-surface rounded-2xl p-20 text-center bg-slate-50 border border-dashed border-slate-200 cursor-pointer group"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="flex justify-center mb-4 text-slate-300 group-hover:scale-110 transition-transform">
              <Icon name="image" size="3xl" color="current" />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Portfolio Items</p>
            <p className="text-xs font-bold text-slate-300 mt-1">Upload your best work to get started.</p>
          </div>
        ) : (
          portfolio.map((item, index) => (
            <div key={index} className="vendor-surface rounded-2xl overflow-hidden group border border-slate-100 shadow-sm relative">
               <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  {item.type === 'Video' ? (
                    <video src={item.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                     <button 
                       onClick={() => removeItem(index)}
                       className="absolute top-3 right-3 h-8 w-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all"
                     >
                        <Icon name="close" size="xs" />
                     </button>
                     <p className="text-[10px] font-black text-white uppercase tracking-widest opacity-70">{item.tag}</p>
                     <p className="text-xs font-black text-white uppercase">{item.title}</p>
                  </div>
               </div>
               <div className="p-3 bg-white flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.type}</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">New Showcase</h3>
                  <p className="text-xs font-bold text-slate-500">Add a stunning piece to your gallery</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                   <Icon name="close" size="sm" />
                </button>
             </div>

             <form onSubmit={handleSavePortfolio} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                   <input 
                     type="text" 
                     className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:outline-none focus:border-rose-400"
                     placeholder="e.g. Dreamy Garden Wedding"
                     value={newItem.title}
                     onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                      <select 
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:outline-none focus:border-rose-400"
                        value={newItem.type}
                        onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                      >
                         <option value="Photo">Photo</option>
                         <option value="Video">Video</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tag</label>
                      <select 
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:outline-none focus:border-rose-400"
                        value={newItem.tag}
                        onChange={(e) => setNewItem({ ...newItem, tag: e.target.value })}
                      >
                         <option>Wedding</option>
                         <option>Reception</option>
                         <option>Pre-Wedding</option>
                         <option>Corporate</option>
                         <option>Other</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Media</label>
                   <div className="relative h-40 w-full bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden group cursor-pointer">
                      {newItem.url ? (
                        <div className="absolute inset-0">
                           {newItem.type === 'Video' ? (
                             <video src={newItem.url} className="w-full h-full object-cover" />
                           ) : (
                             <img src={newItem.url} alt="Preview" className="w-full h-full object-cover" />
                           )}
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-[10px] font-black text-white uppercase tracking-widest">Change</p>
                           </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                           <Icon name={newItem.type === 'Video' ? 'video' : 'image'} size="lg" />
                           <p className="text-[10px] font-black uppercase tracking-widest mt-2">{isUploading ? 'Uploading...' : 'Click to upload'}</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept={newItem.type === 'Video' ? 'video/*' : 'image/*'}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                      />
                   </div>
                </div>

                <button 
                  type="submit"
                  disabled={isUploading || !newItem.url || !newItem.title}
                  className="w-full vendor-cta h-14 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-200 active:scale-95 transition-all disabled:opacity-50"
                >
                   {isUploading ? 'Processing...' : 'Add to Portfolio'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPortfolio;
