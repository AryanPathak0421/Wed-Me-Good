import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import { useVendorState } from '../useVendorState';

const VendorTopbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { vendorState } = useVendorState();

  const businessName = vendorState?.businessName || 'Emerald Studio';

  return (
    <div className="bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 h-16 px-4 lg:px-6 border-b border-slate-100 flex items-center justify-between gap-4 transition-all duration-300">
      <style>{`
        .font-serif { font-family: 'Playfair Display', serif; }
      `}</style>

      {/* Left Side: Mobile Menu + Avatar + Brand */}
      <div className="flex items-center gap-3">
        <button 
          className="h-9 w-9 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 active:scale-95 transition-all lg:hidden"
          onClick={onMenuClick}
        >
          <Icon name="menu" size="sm" />
        </button>

        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/vendor/dashboard')}>
          <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
            <img 
              src={vendorState?.logo || '/assets/vendor/logo_theme.png'} 
              alt="Logo" 
              className="h-full w-full object-cover"
              onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + businessName}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-serif font-black text-slate-900 leading-tight">{businessName}</span>
              <Icon name="verified" size="xs" className="text-violet-500" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor Portal</span>
          </div>
        </div>
      </div>

      {/* Right Side: Action Buttons */}
      <div className="flex items-center gap-2">
        <button className="h-10 w-10 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-violet-500 hover:bg-violet-50 transition-all shadow-sm">
          <Icon name="search" size="sm" />
        </button>

        <button 
          className="h-10 w-10 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-violet-500 hover:bg-violet-50 transition-all shadow-sm relative"
          onClick={() => navigate('/vendor/notifications')}
        >
          <Icon name="bell" size="sm" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-sm">3</span>
        </button>
      </div>
    </div>
  );
};

export default VendorTopbar;


