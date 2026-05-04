import { useState, useEffect } from 'react';
import Icon from '../../../components/ui/Icon';
import { vendorApi } from '../vendorApi';

const VendorSupport = () => {
    const [faqs, setFaqs] = useState([]);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFaq, setActiveFaq] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [faqRes, configRes] = await Promise.all([
                    vendorApi.getFAQs(),
                    vendorApi.getSupportConfig()
                ]);
                if (faqRes.success) setFaqs(faqRes.data);
                if (configRes.success) setConfig(configRes.data);
            } catch (err) {
                console.error('Support fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredFaqs = faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-8 w-8 border-4 border-[#9D174D] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-50 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
                            <Icon name="help" size="sm" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#9D174D] uppercase tracking-[0.25em]">Partner Support</p>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1">Help Desk</h1>
                        </div>
                    </div>
                    <p className="text-slate-400 text-xs font-bold ml-1">Access our dynamic knowledge base and direct support channels.</p>
                </div>
                
                <div className="relative group min-w-[280px]">
                    <Icon name="search" size="xs" color="#94a3b8" className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#9D174D] transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search the intelligence registry..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black focus:border-[#9D174D]/20 focus:ring-4 focus:ring-[#9D174D]/5 outline-none transition-all placeholder:text-slate-300"
                    />
                </div>
            </div>

            {/* Support Metrics/Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Support Email', val: config?.supportEmail, icon: 'envelope', color: 'text-blue-500', bg: 'bg-blue-50/50' },
                    { label: 'WhatsApp Protocol', val: config?.socialLinks?.whatsapp || config?.supportPhone, icon: 'whatsapp', color: 'text-emerald-500', bg: 'bg-emerald-50/50' },
                    { label: 'Active Window', val: config?.workingHours, icon: 'clock', color: 'text-amber-500', bg: 'bg-amber-50/50' }
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border-2 border-slate-50 flex items-center gap-5 hover:border-slate-200 transition-all group shadow-sm">
                        <div className={`h-12 w-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <Icon name={item.icon} size="sm" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                            <p className="text-[13px] font-black text-slate-900 truncate mt-1">{item.val || 'support@utsavchakra.com'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Address & Direct Connection */}
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-50 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-3xl bg-[#1A0F0F] flex items-center justify-center shadow-2xl">
                        <Icon name="location" size="sm" className="text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[#9D174D] uppercase tracking-[0.2em]">Operational Base</p>
                        <p className="text-sm font-black text-slate-700 mt-1.5 leading-relaxed">{config?.officeAddress || 'UtsavChakra Intelligence Plaza, Mumbai'}</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <a href={`mailto:${config?.supportEmail}`} className="flex-1 md:flex-none px-8 py-4 bg-[#9D174D] hover:bg-[#831843] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all text-center shadow-lg shadow-rose-100 active:scale-95">Send Transmission</a>
                </div>
            </div>

            {/* Registry Accordion */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Intelligence Registry (FAQs)</h3>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{filteredFaqs.length} Records</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {filteredFaqs.length > 0 ? filteredFaqs.map((faq, idx) => (
                        <div 
                            key={faq._id}
                            className={`rounded-3xl border-2 transition-all duration-300 ${
                                activeFaq === idx ? 'bg-white border-rose-100 shadow-xl scale-[1.01]' : 'bg-white border-slate-50 hover:border-slate-200'
                            }`}
                        >
                            <button 
                                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-6 text-left outline-none"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-colors ${
                                        activeFaq === idx ? 'bg-[#9D174D] text-white' : 'bg-slate-50 text-slate-400'
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <h4 className="text-[14px] font-black text-slate-800 tracking-tight">{faq.question}</h4>
                                </div>
                                <Icon 
                                    name="chevronDown" 
                                    size="xs" 
                                    className={`transition-transform duration-500 ${activeFaq === idx ? 'rotate-180 text-[#9D174D]' : 'text-slate-300'}`} 
                                />
                            </button>
                            
                            <div className={`transition-all duration-500 overflow-hidden ${activeFaq === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-6 pb-8 ml-12">
                                    <div className="h-px bg-slate-50 w-full mb-6" />
                                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
                                        <p className="text-[13px] text-slate-500 leading-relaxed font-bold italic">
                                            "{faq.answer}"
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-3">
                                        <span className="px-3 py-1 bg-rose-50 text-[9px] font-black uppercase text-[#9D174D] rounded-full tracking-widest">{faq.category}</span>
                                        <span className="text-[10px] text-slate-200">•</span>
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Protocol Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                            <Icon name="noResults" size="xl" color="#e2e8f0" className="mx-auto mb-4" />
                            <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Neural Registry Empty</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Minimal Footer */}
            <div className="pt-10 flex flex-col items-center gap-4 opacity-40">
                <div className="flex gap-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-1 w-8 bg-slate-200 rounded-full" />)}
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">UtsavChakra Support Core v2.0</p>
            </div>
        </div>
    );
};

export default VendorSupport;
