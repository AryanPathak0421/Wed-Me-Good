import { NavLink } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';

const navItems = [
  { label: 'Dashboard', to: '/vendor/dashboard', icon: 'home' },
  { label: 'Leads', to: '/vendor/leads', icon: 'users', badge: 28 },
  { label: 'Bookings', to: '/vendor/bookings', icon: 'calendar' },
  { label: 'Services', to: '/vendor/services', icon: 'store' },
  { label: 'Profile', to: '/vendor/profile', icon: 'user' },
];

const VendorBottomNav = ({ isApproved }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-5 pointer-events-none">
      <nav className="mx-auto max-w-md bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(15,23,42,0.15)] rounded-[2.5rem] border border-white/50 px-3 py-2 flex items-center justify-between pointer-events-auto">
        {navItems.map((item) => {
          const isHome = item.label === 'Dashboard';
          const isDisabled = !isApproved && !isHome;

          return (
            <NavLink
              key={item.to}
              to={isDisabled ? '#' : item.to}
              onClick={(e) => isDisabled && e.preventDefault()}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all duration-400 relative flex-1 ${
                  isActive ? 'text-violet-600' : 'text-slate-400'
                } ${isDisabled ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:bg-slate-50'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`relative transition-all duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                    <Icon 
                      name={item.icon} 
                      size="sm" 
                      className={isActive ? 'text-violet-600' : 'text-slate-400'}
                    />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] font-bold tracking-tight ${isActive ? 'text-violet-600' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-violet-600 animate-pulse"></div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default VendorBottomNav;
