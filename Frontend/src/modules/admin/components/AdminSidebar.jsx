import { NavLink, useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';

const navigation = [
    {
        title: 'Overview',
        items: [
            { path: '/admin/dashboard', icon: 'dashboard', label: 'Command Center' },
            { path: '/admin/analytics', icon: 'chart', label: 'Growth Insights' },
        ]
    },
    {
        title: 'Monetization',
        items: [
            { path: '/admin/subscriptions', icon: 'money', label: 'Vendor Plans' },
            { path: '/admin/payments', icon: 'money', label: 'Payout Registry' },
            { path: '/admin/checkout', icon: 'plan', label: 'Checkout Protocol' },
        ]
    },
    {
        title: 'Ecosystem',
        items: [
            { path: '/admin/verification', icon: 'shield', label: 'Verification Desk' },
            { path: '/admin/vendors', icon: 'user', label: 'Partners Console' },
            { path: '/admin/users', icon: 'users', label: 'Client Directory' },
            { path: '/admin/bookings', icon: 'calendar', label: 'Global Bookings' },
            { path: '/admin/reviews', icon: 'shield', label: 'Review Hub' },
        ]
    },
    {
        title: 'Editorial',
        items: [
            { path: '/admin/categories', icon: 'sparkles', label: 'Catalog' },
            { path: '/admin/banners', icon: 'sparkles', label: 'Banners' },
        ]
    },
    {
        title: 'System',
        items: [
            { path: '/admin/logs', icon: 'dashboard', label: 'Audit Trail' },
            { path: '/admin/settings', icon: 'sparkles', label: 'Settings' },
            { path: '/admin/profile', icon: 'user', label: 'My Identity' },
        ]
    }
];

const AdminSidebar = ({ onClose }) => {
    const navigate = useNavigate();

    const handleLogout = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        localStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminAuth');
        navigate('/admin/login');
    };

    return (
        <aside className="h-full w-60 bg-[#1A0F0F] text-slate-400 flex flex-col border-r border-white/5 shadow-xl transition-all duration-300">
            {/* Header - Compact */}
            <div className="h-16 flex items-center px-6 flex-shrink-0 border-b border-white/5">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-primary-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
                        <Icon name="sparkles" size="xs" color="white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-[14px] font-black text-white tracking-widest leading-none uppercase">Utsav<span className="text-primary-400">Chakra</span></h1>
                    </div>
                </div>
            </div>

            {/* Navigation - Dense */}
            <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
                {navigation.map((group) => (
                    <div key={group.title} className="space-y-1">
                        <h3 className="px-3 text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">
                            {group.title}
                        </h3>
                        <div className="space-y-0.5">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative
                    ${isActive
                                            ? 'bg-primary-400/10 text-white shadow-[0_1px_1px_rgba(0,0,0,0.1)]'
                                            : 'hover:bg-white/5 hover:text-slate-200'}
                  `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className={`transition-all ${isActive ? 'text-primary-400' : 'text-white/20 group-hover:text-primary-400'}`}>
                                                <Icon name={item.icon} size="xs" color="current" />
                                            </div>
                                            <span className={`text-[11px] font-black tracking-wide transition-colors ${isActive ? 'text-white' : 'text-white/40'}`}>
                                                {item.label}
                                            </span>
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary-400 rounded-r-full shadow-[0_0_10px_rgba(249,174,175,0.8)]" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer - Professional */}
            <div className="p-3 flex-shrink-0 mt-auto border-t border-white/5">
                <div className="bg-white/5 rounded-xl p-2.5 flex items-center justify-between border border-white/5 transition-all group">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-white/40">
                            <Icon name="user" size="xs" color="currentColor" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-white truncate leading-tight">Super Admin</p>
                            <p className="text-[8px] text-primary-400/70 font-black tracking-widest mt-0.5 uppercase">Master</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="text-white/20 hover:text-primary-400 transition-colors p-2 hover:bg-white/5 rounded-lg"
                        title="Logout from System"
                    >
                        <Icon name="logout" size="xs" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
