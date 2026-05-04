import { useState, useEffect } from 'react';
import Icon from '../../../components/ui/Icon';
import { useVendorState } from '../useVendorState';
import { vendorApi } from '../vendorApi';

const VendorSettings = () => {
    const { vendorState, refreshData } = useVendorState();
    const [activeTab, setActiveTab] = useState('account');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [token] = useState(localStorage.getItem('vendorToken'));

    const [settings, setSettings] = useState({
        email: '',
        phone: '',
        fullName: '',
        businessName: '',
        language: 'English (India)',
        notifications: {
            push: true,
            email: true,
            whatsapp: true
        }
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (vendorState) {
            setSettings({
                email: vendorState.email || '',
                phone: vendorState.phone || '',
                fullName: vendorState.fullName || '',
                businessName: vendorState.businessName || '',
                language: vendorState.language || 'English (India)',
                notifications: vendorState.notifications || {
                    push: true,
                    email: true,
                    whatsapp: true
                }
            });
        }
    }, [vendorState]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleUpdate = async (updateObj) => {
        setIsSaving(true);
        try {
            const res = await vendorApi.updateProfile(updateObj, token);
            if (res.success) {
                showMessage('success', 'Intelligence records updated successfully');
                refreshData();
            } else {
                showMessage('error', res.message || 'Update protocol failed');
            }
        } catch (err) {
            console.error('Update failed:', err);
            showMessage('error', 'Transmission failure');
        } finally {
            setIsSaving(false);
        }
    };

    const handleNotificationToggle = (type) => {
        const updatedNotifications = {
            ...settings.notifications,
            [type]: !settings.notifications[type]
        };
        setSettings({ ...settings, notifications: updatedNotifications });
        handleUpdate({ notifications: updatedNotifications });
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const activeToken = localStorage.getItem('vendorToken');
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('Passwords do not match');
            return showMessage('error', 'Passwords do not match');
        }
        if (passwordForm.newPassword.length < 8) {
            alert('Minimum security requirement: 8 characters');
            return showMessage('error', 'Minimum security requirement: 8 characters');
        }

        setIsSaving(true);
        try {
            console.log('Initiating security key rotation...');
            const res = await vendorApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword, activeToken);
            console.log('Rotation response:', res);
            
            if (res.success) {
                alert('Security keys rotated successfully!');
                showMessage('success', 'Security keys rotated successfully');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert(`Security Error: ${res.message || 'Protocol rejection'}`);
                showMessage('error', res.message || 'Security protocol rejection');
            }
        } catch (err) {
            console.error('Password change error:', err);
            alert('Authentication node error. Check console.');
            showMessage('error', 'Authentication node error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeactivate = async () => {
        const confirmMsg = vendorState?.isActive ? 'Deactivate your business node? You will go offline.' : 'Reactivate your business node?';
        if (!window.confirm(confirmMsg)) return;

        setIsSaving(true);
        try {
            const res = await vendorApi.deactivateAccount(token);
            if (res.success) {
                alert(res.message);
                showMessage('success', res.message);
                refreshData();
            } else {
                showMessage('error', res.message || 'Operation failed');
            }
        } catch (err) {
            showMessage('error', 'Transmission error');
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-50 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-2xl bg-[#9D174D] flex items-center justify-center text-white shadow-xl">
                            <Icon name="settings" size="sm" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#9D174D] uppercase tracking-[0.25em]">Core Configuration</p>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1">Vendor Settings</h1>
                        </div>
                    </div>
                    <p className="text-slate-400 text-xs font-bold ml-1">Manage your business credentials, notification protocols, and security layers.</p>
                </div>

                {message.text && (
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-right-4 duration-300 ${
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
                {/* Side Navigation */}
                <div className="space-y-2">
                    {[
                        { id: 'account', label: 'Identity & Profile', icon: 'account', desc: 'Business & Contact info' },
                        { id: 'notifications', label: 'Neural Alerts', icon: 'clock', desc: 'Notification protocols' },
                        { id: 'security', label: 'Security Access', icon: 'lock', desc: 'Password & Auth keys' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left p-4 rounded-3xl transition-all duration-300 group border-2 ${
                                activeTab === tab.id 
                                    ? 'bg-white border-rose-100 shadow-xl shadow-rose-50/50' 
                                    : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-100'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-colors ${
                                    activeTab === tab.id ? 'bg-[#9D174D] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white'
                                }`}>
                                    <Icon name={tab.icon} size="xs" />
                                </div>
                                <div>
                                    <p className={`text-[12px] font-black uppercase tracking-tight ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400'}`}>{tab.label}</p>
                                    <p className="text-[10px] font-bold text-slate-300 mt-0.5">{tab.desc}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Content Panel */}
                <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0 opacity-50" />
                    
                    <div className="relative z-10">
                        {activeTab === 'account' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <section>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#9D174D]" />
                                        Identity Profile
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                                            <input 
                                                type="text" 
                                                value={settings.fullName}
                                                onChange={e => setSettings({...settings, fullName: e.target.value})}
                                                onBlur={() => handleUpdate({ fullName: settings.fullName })}
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-black focus:bg-white focus:border-rose-100 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Designation</label>
                                            <input 
                                                type="text" 
                                                value={settings.businessName}
                                                onChange={e => setSettings({...settings, businessName: e.target.value})}
                                                onBlur={() => handleUpdate({ businessName: settings.businessName })}
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-black focus:bg-white focus:border-rose-100 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Encrypted Email (ReadOnly)</label>
                                            <input 
                                                type="email" 
                                                value={settings.email}
                                                readOnly
                                                className="w-full px-5 py-3.5 bg-slate-100 border-2 border-transparent rounded-2xl text-xs font-black text-slate-400 cursor-not-allowed outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Frequency (Phone)</label>
                                            <input 
                                                type="text" 
                                                value={settings.phone}
                                                onChange={e => setSettings({...settings, phone: e.target.value})}
                                                onBlur={() => handleUpdate({ phone: settings.phone })}
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-black focus:bg-white focus:border-rose-100 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#9D174D]" />
                                        Localization
                                    </h3>
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase">System Interface Language</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1">Select your preferred neural translation</p>
                                        </div>
                                        <select 
                                            value={settings.language}
                                            onChange={e => {
                                                setSettings({...settings, language: e.target.value});
                                                handleUpdate({ language: e.target.value });
                                            }}
                                            className="bg-white border-2 border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#9D174D]/20 transition-all cursor-pointer"
                                        >
                                            <option value="English (India)">English (India)</option>
                                            <option value="Hindi">Hindi (Beta)</option>
                                            <option value="Marathi">Marathi (Beta)</option>
                                        </select>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <section>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#9D174D]" />
                                        Alert Configuration
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'push', label: 'Neural Push Alerts', desc: 'Real-time dashboard notifications for new leads', icon: 'bell' },
                                            { id: 'email', label: 'SMTP Transmission', desc: 'Critical alerts and weekly intelligence reports via email', icon: 'mail' },
                                            { id: 'whatsapp', label: 'Tactical WhatsApp', desc: 'Instant transmission of lead data to your mobile device', icon: 'whatsapp' }
                                        ].map(item => (
                                            <div key={item.id} className="group p-5 rounded-[2rem] bg-slate-50 hover:bg-white border border-transparent hover:border-rose-100 transition-all flex items-center justify-between">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-[#9D174D] shadow-sm transition-colors">
                                                        <Icon name={item.icon} size="xs" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.label}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-1">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleNotificationToggle(item.id)}
                                                    className={`w-12 h-6 rounded-full relative transition-all duration-500 ${
                                                        settings.notifications[item.id] ? 'bg-[#9D174D] shadow-lg shadow-rose-100' : 'bg-slate-200'
                                                    }`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-500 shadow-sm ${
                                                        settings.notifications[item.id] ? 'left-7' : 'left-1'
                                                    }`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <section>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#9D174D]" />
                                        Rotate Security Keys
                                    </h3>
                                    <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                                            <input 
                                                required
                                                type="password" 
                                                placeholder="••••••••"
                                                value={passwordForm.currentPassword}
                                                onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-black focus:bg-white focus:border-rose-100 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Security Phrase</label>
                                            <input 
                                                required
                                                type="password" 
                                                placeholder="••••••••"
                                                value={passwordForm.newPassword}
                                                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-black focus:bg-white focus:border-rose-100 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Phrase</label>
                                            <input 
                                                required
                                                type="password" 
                                                placeholder="••••••••"
                                                value={passwordForm.confirmPassword}
                                                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-black focus:bg-white focus:border-rose-100 outline-none transition-all"
                                            />
                                        </div>
                                        <button 
                                            disabled={isSaving}
                                            type="submit"
                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#9D174D] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? 'Processing...' : 'Rotate Security Keys'}
                                        </button>
                                    </form>
                                </section>

                                <section className="pt-8 border-t-2 border-slate-50">
                                    <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-black text-rose-900 uppercase">{vendorState?.isActive ? 'Account Deactivation' : 'Account Reactivation'}</p>
                                            <p className="text-[10px] font-bold text-rose-400 mt-1">{vendorState?.isActive ? 'Temporarily offline your business node' : 'Bring your business node back online'}</p>
                                        </div>
                                        <button 
                                            onClick={handleDeactivate}
                                            className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
                                        >
                                            {vendorState?.isActive ? 'Initialize' : 'Activate'}
                                        </button>

                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorSettings;
