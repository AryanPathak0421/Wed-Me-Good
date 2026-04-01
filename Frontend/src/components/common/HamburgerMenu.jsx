import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import Icon from '../ui/Icon';

const HamburgerMenu = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartState } = useCart();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({});

  // Simple body scroll lock when menu is open
  useEffect(() => {
    if (isOpen) {
      // Store original overflow
      const originalOverflow = document.body.style.overflow;

      // Lock background scroll
      document.body.style.overflow = 'hidden';

      // Cleanup function
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Safely access cart items from cartState
  const cartItems = cartState?.items || [];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Get vendors from cart for chat functionality
  const cartVendors = cartItems.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    lastMessage: "Hi! I'm interested in your services for my wedding.",
    timestamp: "2 hours ago",
    unread: Math.random() > 0.5 // Random for demo
  }));

  const menuSections = [
    {
      id: 'planning',
      title: 'Wedding Planning Tools',
      icon: 'calendar',
      items: [
        { title: 'Budget Planner', path: '/user/budget-planner', icon: 'money' },
        { title: 'Wedding Checklist', path: '/user/checklist', icon: 'checkList' },
        { title: 'Guest List Manager', path: '/user/guest-list', icon: 'users' },
        { title: 'Wedding Timeline', path: '/user/timeline', icon: 'clock' },
        { title: 'Vendor Comparison', path: '/user/vendor-comparison', icon: 'compare' },
        { title: 'Digital E-Invites', path: '/user/e-invites', icon: 'mail' },
        { title: 'Saved Inspirations', path: '/user/inspirations', icon: 'heart' }
      ]
    },
    {
      id: 'addons',
      title: 'Premium Services',
      icon: 'star',
      items: [
        { title: 'Hire Wedding Planner', path: '/user/hire-planner', icon: 'user' },
        { title: 'Destination Wedding', path: '/user/destination-wedding', icon: 'location' },
        { title: 'Decor Consultation', path: '/user/decor-consultation', icon: 'palette' },
        { title: 'Makeup Trial Booking', path: '/user/makeup-trial', icon: 'makeup' },
        { title: 'Pre-Wedding Shoot', path: '/user/pre-wedding-shoot', icon: 'camera' }
      ]
    },
    {
      id: 'support',
      title: 'Support & Settings',
      icon: 'settings',
      items: [
        { title: 'Help & Support', path: '/user/help', icon: 'help' },
        { title: 'FAQs', path: '/user/faqs', icon: 'question' },
        { title: 'Contact Support', path: '/user/contact-support', icon: 'phone' },
        { title: 'Notifications', path: '/user/notifications', icon: 'bell' },
        { title: 'Language', path: '/user/language', icon: 'globe' },
        { title: 'Privacy & Terms', path: '/user/privacy', icon: 'shield' }
      ]
    }
  ];
  return (
    <>
      {/* 1. Backdrop with Deep Blur */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* 2. Editorial Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[70] w-[85%] max-w-[400px] shadow-2xl transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ backgroundColor: '#EAE1D8' }}
      >
        {/* Arched Header */}
        <div className="bg-white px-8 pt-12 pb-10 rounded-b-[3rem] shadow-sm flex items-center justify-between border-b border-[#3D2B2B]/5">
           <div>
              <h2 className="text-3xl font-bold text-[#3D2B2B]" style={{ fontFamily: '"Playfair Display", serif' }}>Menu</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#3D2B2B]/30">The Utsav Collection</p>
           </div>
           <button 
             onClick={onClose}
             className="w-12 h-12 rounded-full flex items-center justify-center bg-[#EAE1D8]/30 border border-[#EAE1D8] active:scale-90 transition-all"
           >
              <Icon name="close" size="sm" style={{ color: '#3D2B2B' }} />
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-[calc(100vh-140px)] p-8 space-y-10 scrollbar-hide">
           {/* Section 1: Member Card */}
           {isAuthenticated && (
             <div className="bg-white rounded-[2.5rem] p-8 space-y-6 shadow-sm border border-black/5">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#EAE1D8] shadow-sm">
                      <img 
                        src={user.profileImage} 
                        className="w-full h-full object-cover" 
                        alt={user.name} 
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80'; }}
                      />
                   </div>
                   <div className="min-w-0">
                      <h3 className="text-xl font-bold text-[#3D2B2B] truncate" style={{ fontFamily: '"Playfair Display", serif' }}>{user.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#BE185D] underline">{user.city || 'Indore'}</p>
                   </div>
                </div>
                <button 
                  onClick={() => handleNavigation('/user/account')}
                  className="w-full py-4 rounded-full bg-[#3D2B2B] text-white text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                >
                   Guest Profile
                </button>
             </div>
           )}

           {/* Section 2: Conversational Hub */}
           <div 
             onClick={() => handleNavigation('/user/chats')}
             className="bg-white rounded-[2rem] p-6 flex items-center justify-between shadow-sm cursor-pointer border border-black/5 active:scale-95 transition-all"
           >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-[#EAE1D8]/30 flex items-center justify-center">
                    <Icon name="chat" size="sm" style={{ color: '#3D2B2B' }} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-[#3D2B2B]" style={{ fontFamily: '"Playfair Display", serif' }}>My Chats</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#3D2B2B]/40">Internal Messengers</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-[#BE185D] text-white flex items-center justify-center text-[10px] font-bold">{cartVendors.length}</span>
                 <Icon name="chevronDown" size="xs" className="-rotate-90" style={{ color: '#3D2B2B/20' }} />
              </div>
           </div>

           {/* Section 3: Tiered Collections */}
           <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3D2B2B]/40 px-2">Curation Tools</h5>
              <div className="space-y-3">
                 {[
                   { title: 'My Cart', path: '/user/cart', icon: 'cart' },
                   { title: 'Bookings', path: '/user/bookings', icon: 'calendar' },
                   { title: 'Shortlist', path: '/user/shortlist', icon: 'bookmark' },
                   { title: 'Favourites', path: '/user/favourites', icon: 'heart' }
                 ].map((item, i) => (
                   <button 
                     key={i}
                     onClick={() => handleNavigation(item.path)}
                     className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-white shadow-sm border border-black/5 hover:bg-gray-50 active:scale-98 transition-all"
                   >
                     <div className="flex items-center gap-4">
                        <Icon name={item.icon} size="sm" style={{ color: '#3D2B2B/60' }} />
                        <span className="text-sm font-bold text-[#3D2B2B]" style={{ fontFamily: '"Playfair Display", serif' }}>{item.title}</span>
                     </div>
                     <Icon name="chevronDown" size="xs" className="-rotate-90" style={{ color: '#3D2B2B/20' }} />
                   </button>
                 ))}
              </div>
           </div>

           {/* Section 4: Global Settings */}
           <div className="pt-8 border-t border-[#3D2B2B]/10 flex items-center justify-between">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 text-[#BE185D]"
              >
                 <Icon name="logout" size="sm" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
              </button>
              <div className="flex gap-4">
                 <Icon name="settings" size="xs" style={{ color: '#3D2B2B/40' }} />
                 <Icon name="help" size="xs" style={{ color: '#3D2B2B/40' }} />
              </div>
           </div>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;