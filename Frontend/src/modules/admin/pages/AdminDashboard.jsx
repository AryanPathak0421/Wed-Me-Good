import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        vendorsCount: 0,
        usersCount: 0,
        reviewsCount: 0,
        recentBookingsCount: 0
    });
    const [analytics, setAnalytics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchDashboardData(token);
    }, []);

    const fetchDashboardData = async (token) => {
        try {
            const [statsRes, analyticsRes] = await Promise.all([
                fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/analytics', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (statsRes.status === 401 || analyticsRes.status === 401) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                navigate('/admin/login');
                return;
            }

            const statsResult = await statsRes.json();
            const analyticsResult = await analyticsRes.json();

            if (statsResult.success) setStats(statsResult.data);
            if (analyticsResult.success) setAnalytics(analyticsResult.data.trajectory || []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatValue = (val) => {
        if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
        return `₹${val}`;
    };

    const pendingVendors = stats.totalVendors - stats.vendorsCount;

    const dashboardStats = [
        { label: 'Platform Revenue', value: formatValue(stats.totalRevenue), change: '+14%', icon: 'money' },
        { label: 'Active Vendors', value: stats.vendorsCount.toString(), change: pendingVendors > 0 ? `${pendingVendors} Pending` : 'Stable', icon: 'user' },
        { label: 'Total Base Users', value: stats.usersCount.toLocaleString(), change: '+12%', icon: 'users' },
        { label: 'Pending Reviews', value: stats.reviewsCount.toString(), change: 'Urgent', icon: 'bell' },
    ];

    // Chart logic
    const safeAnalytics = Array.isArray(analytics) ? analytics : [];
    const maxRevenue = Math.max(...safeAnalytics.map(d => d.revenue || 0), 1);
    const chartHeight = 240;
    const chartWidth = 800;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header - Professional */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Console Overview</h1>
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mt-2">Real-time Platform Operational Status</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="h-9 px-4 rounded-xl bg-white border border-slate-200 text-[9px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all">
                        Export CSV
                    </button>
                    <button className="h-9 px-4 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">
                        Platform Map
                    </button>
                </div>
            </div>

            {/* Stats - Grid Dense */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
                    ))
                ) : dashboardStats.map((stat) => (
                    <div key={stat.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary-400 opacity-[0.02] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                        
                        <div className="flex items-center justify-between relative z-10">
                            <div className="h-8 w-8 rounded-lg bg-primary-400/10 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
                                <Icon name={stat.icon} size="xs" color="current" />
                            </div>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${stat.change.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-500'}`}>
                                {stat.change}
                            </span>
                        </div>
                        
                        <div className="mt-3 relative z-10">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-lg font-black text-slate-900 mt-0.5 tracking-tighter">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Analytics - Professional Density */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm group relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Market Analytics</h3>
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Daily Revenue Trajectory (7D)</p>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button className="px-3 h-8 rounded-md text-[9px] font-black bg-white text-primary-500 shadow-sm transition-all uppercase tracking-widest">Revenue Flow</button>
                        </div>
                    </div>

                    <div className="h-64 w-full relative group/chart">
                        {isLoading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <div className="h-6 w-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* SVG Chart */}
                                <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#F9AEAF" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#F9AEAF" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    
                                    {/* Area */}
                                    <path 
                                        d={`M 0 ${chartHeight} ${safeAnalytics.map((d, i) => `L ${(i / (safeAnalytics.length - 1)) * chartWidth} ${chartHeight - (d.revenue / maxRevenue) * (chartHeight - 40) - 20}`).join(' ')} L ${chartWidth} ${chartHeight} Z`}
                                        fill="url(#chartGradient)"
                                        className="animate-in fade-in duration-1000"
                                    />

                                    {/* Line */}
                                    <path 
                                        d={safeAnalytics.map((d, i) => `${i === 0 ? 'M' : 'L'} ${(i / (safeAnalytics.length - 1)) * chartWidth} ${chartHeight - (d.revenue / maxRevenue) * (chartHeight - 40) - 20}`).join(' ')}
                                        fill="none"
                                        stroke="#F9AEAF"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="animate-in slide-in-from-left duration-1000"
                                    />

                                    {/* Points */}
                                    {safeAnalytics.map((d, i) => (
                                        <circle 
                                            key={i}
                                            cx={(i / (safeAnalytics.length - 1)) * chartWidth}
                                            cy={chartHeight - (d.revenue / maxRevenue) * (chartHeight - 40) - 20}
                                            r="5"
                                            fill="white"
                                            stroke="#F9AEAF"
                                            strokeWidth="3"
                                            className="hover:r-8 transition-all cursor-pointer"
                                        />
                                    ))}
                                </svg>
                                
                                {/* Labels */}
                                <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-1">
                                    {safeAnalytics.map((d, i) => (
                                        <span key={i} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.day}</span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Audit Log - Professional Density */}
                <div className="lg:col-span-4 bg-[#1A0F0F] rounded-3xl p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400 opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="text-sm font-black text-white tracking-widest uppercase">System Pulse</h3>
                        <div className="h-2 w-2 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(249,174,175,1)] animate-pulse" />
                    </div>

                    <div className="space-y-6 relative z-10">
                        {[
                            { u: 'Admin', a: 'Update ACL', t: '1m', c: 'border-primary-400/30' },
                            { u: 'Sys', a: 'DB Backup', t: '5m', c: 'border-emerald-400/30' },
                            { u: 'Partner', a: 'New Sub', t: '12m', c: 'border-blue-400/30' },
                            { u: 'Bot', a: 'Grep Clean', t: '1h', c: 'border-white/10' },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-4 group/item items-start">
                                <div className={`h-8 w-1 rounded-full bg-slate-800 border-l-2 ${log.c} transition-all group-hover/item:h-10`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] text-white/50 font-medium leading-none">
                                        <span className="text-white font-black">{log.u}</span> {log.a}
                                    </p>
                                    <p className="text-[8px] font-black text-white/10 uppercase tracking-widest mt-1.5">{log.t} ago • node_02</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-8 py-3 rounded-xl bg-white/5 border border-white/5 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all relative z-10">
                        Full System Trace
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
