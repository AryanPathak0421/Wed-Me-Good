import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Icon from '../../../components/ui/Icon';
import '../adminTheme.css';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminAuth');
        navigate('/admin/login');
    };

    return (
        <div className="flex min-h-screen bg-[#FFF9F9] admin-theme">
            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar Container */}
            <div
                className={`fixed inset-y-0 left-0 z-[70] transform transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <AdminSidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
                {/* Header */}
                <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-[40]">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2.5 -ml-2 text-slate-500 hover:text-slate-900 lg:hidden bg-slate-50 rounded-xl border border-slate-200 transition-all active:scale-95"
                        >
                            <Icon name="menu" size="sm" />
                        </button>

                        <div className="hidden md:flex items-center gap-3 bg-slate-100/50 border border-slate-200/60 rounded-2xl px-4 py-2 w-80 group focus-within:bg-white focus-within:ring-4 focus-within:ring-[#F9AEAF]/10 focus-within:border-[#F9AEAF]/30 transition-all">
                            <Icon name="search" size="xs" color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="Search dashboard..."
                                className="bg-transparent border-none outline-none text-[13px] font-semibold text-slate-600 placeholder-slate-400 w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-1">
                            <button className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 relative transition-all active:scale-90">
                                <Icon name="bell" size="sm" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#F9AEAF] rounded-full border-2 border-white" />
                            </button>
                            <button className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-all active:scale-90">
                                <Icon name="sparkles" size="sm" color="#F9AEAF" />
                            </button>
                        </div>

                        <div className="h-8 w-px bg-slate-200" />

                        <div className="flex items-center gap-3 pl-1 group cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-black text-slate-900 leading-none">Super Admin</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Main Control</p>
                            </div>
                            <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:border-[#F9AEAF]/30 transition-all shadow-sm text-slate-300">
                                <Icon name="user" size="sm" color="currentColor" />
                            </div>
                        </div>

                        <button 
                            onClick={handleLogout}
                            className="h-10 px-4 flex items-center gap-2 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                        >
                            <Icon name="logout" size="xs" color="white" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-6 relative">
                    <div className="max-w-[1600px] mx-auto w-full">
                        <Outlet />
                    </div>

                    {/* Background Decoration */}
                    <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#F9AEAF]/5 blur-[120px] rounded-full -mr-64 -mb-64 pointer-events-none z-0" />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
