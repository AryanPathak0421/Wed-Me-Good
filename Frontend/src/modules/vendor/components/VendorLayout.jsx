import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import VendorSidebar from './VendorSidebar';
import VendorTopbar from './VendorTopbar';
import VendorBottomNav from './VendorBottomNav';
import VendorChatbot from './VendorChatbot';
import { useVendorState } from '../useVendorState';

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { vendorState, loading } = useVendorState();

  useEffect(() => {
    if (!loading && vendorState._id && vendorState.subscription?.status !== 'Active') {
      navigate('/vendor/onboarding/subscription');
    }
  }, [loading, vendorState._id, vendorState.subscription?.status, navigate]);

  const isApproved = vendorState.status === 'Approved';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9D174D]"></div>
      </div>
    );
  }

  return (
    <div className="vendor-shell min-h-screen relative overflow-x-hidden">
      {/* Animated Movable Gradient Background */}
      <style>{`
        @keyframes move-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-bg {
          background: linear-gradient(-45deg, #F8FAFC, #F1F5F9, #F8FAFC, #EFF6FF);
          background-size: 400% 400%;
          animation: move-gradient 15s ease infinite;
        }
        .decor-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          animation: blob-move 20s infinite alternate;
        }
        @keyframes blob-move {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(100px, 50px) scale(1.2); }
        }
      `}</style>

      <div className="fixed inset-0 animated-bg z-0"></div>

      {/* Decorative Movable Blobs */}
      <div className="decor-blob w-[500px] h-[500px] bg-slate-200/20 -top-48 -left-48"></div>
      <div className="decor-blob w-[400px] h-[400px] bg-slate-100/30 -bottom-24 -right-24" style={{ animationDelay: '-5s' }}></div>

      <div className="flex min-h-screen relative z-10 flex-col">
        {/* Full width fixed topbar */}
        <VendorTopbar 
          notifications={vendorState.notifications} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />

        {/* Content layout below topbar */}
        <div className="flex flex-1 pt-16 min-w-0">
          {/* Desktop Sidebar placeholder */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <VendorSidebar 
              isApproved={isApproved} 
              onClose={() => setSidebarOpen(false)} 
              counts={{
                leads: (vendorState.leads || []).length,
                chat: (vendorState.notifications || []).length // Using notifications as chat count for now if chat list is missing
              }}
            />
          </div>

          {/* Mobile Sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 flex lg:hidden pt-16">
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs top-16" onClick={() => setSidebarOpen(false)}></div>
              <div className="relative w-64 h-full z-40 flex flex-col shadow-2xl animate-slide-in">
                <VendorSidebar 
                  isApproved={isApproved} 
                  onClose={() => setSidebarOpen(false)} 
                  counts={{
                    leads: (vendorState.leads || []).length,
                    chat: (vendorState.notifications || []).length
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 px-3 py-3 lg:px-8 lg:py-6 mb-20 lg:mb-0 min-w-0">
              {!isApproved ? (
                <div className="h-full flex items-center justify-center min-h-[70vh] p-4">
                  <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-white shadow-2xl text-center space-y-6">
                    <div className="relative inline-block">
                      <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto relative overflow-hidden">
                        <Icon name="shield" size="lg" color="#9D174D" />
                        <div className="absolute inset-0 bg-slate-400/10 animate-pulse"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Under Review</h2>
                      <p className="text-xs font-bold text-slate-400 leading-relaxed">
                        Verifying your profile. You'll get access once approved.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Outlet />
              )}
            </main>
          </div>
        </div>
      </div>
      
      {/* Global AI Chatbot */}
      <VendorChatbot />

      <div className="lg:hidden">
         <VendorBottomNav isApproved={isApproved} />
      </div>
    </div>
  );
};

export default VendorLayout;
