import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminVendors from './pages/AdminVendors';
import AdminUsers from './pages/AdminUsers';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminPayments from './pages/AdminPayments';
import AdminEditorial from './pages/AdminEditorial';
import AdminSettings from './pages/AdminSettings';
import AdminLogs from './pages/AdminLogs';
import AdminBookings from './pages/AdminBookings';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminBanners from './pages/AdminBanners';
import AdminProfile from './pages/AdminProfile';
import AdminLogin from './pages/AdminLogin';
import AdminGateways from './pages/AdminGateways';
import AdminVendorVerification from './pages/AdminVendorVerification';
import AdminCategories from './pages/AdminCategories';
import AdminReviews from './pages/AdminReviews';

// Simple placeholder page component
const PlaceholderPage = ({ title }) => (
  <div className="space-y-4">
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="text-slate-500 mt-1">This module is currently under development.</p>
    </div>
  </div>
);

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="verification" element={<AdminVendorVerification />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="checkout" element={<AdminGateways />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="security" element={<PlaceholderPage title="Privacy & Security Access" />} />
      </Route>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;