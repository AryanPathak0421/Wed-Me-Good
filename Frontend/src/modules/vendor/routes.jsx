import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './vendorTheme.css';
import VendorLayout from './components/VendorLayout';
import VendorPublicLayout from './components/VendorPublicLayout';
import VendorRegister from './pages/VendorRegister';
import VendorLogin from './pages/VendorLogin';
import VendorVerify from './pages/VendorVerify';
import VendorOnboarding from './pages/VendorOnboarding';
import VendorPortfolioOnboarding from './pages/VendorPortfolioOnboarding';
import VendorSubscriptionOnboarding from './pages/VendorSubscriptionOnboarding';
import VendorReviewOnboarding from './pages/VendorReviewOnboarding';
import VendorSubmittedOnboarding from './pages/VendorSubmittedOnboarding';
import VendorDashboard from './pages/VendorDashboard';
import VendorServices from './pages/VendorServices';
import VendorPricing from './pages/VendorPricing';
import VendorPortfolio from './pages/VendorPortfolio';
import VendorLeads from './pages/VendorLeads';
import VendorQuotes from './pages/VendorQuotes';
import VendorBookings from './pages/VendorBookings';
import VendorCalendar from './pages/VendorCalendar';
import VendorChat from './pages/VendorChat';
import VendorEarnings from './pages/VendorEarnings';
import VendorReviews from './pages/VendorReviews';
import VendorProfile from './pages/VendorProfile';
import VendorSupport from './pages/VendorSupport';
import VendorSettings from './pages/VendorSettings';

const VendorRoutes = () => {
  return (
    <Routes>
      <Route element={<VendorPublicLayout />}>
        <Route path="register" element={<Navigate to="/vendor/register/category" replace />} />
        <Route path="register/:stepId" element={<VendorRegister />} />
        <Route path="login" element={<VendorLogin />} />
        <Route path="verify" element={<VendorVerify />} />
        <Route path="onboarding" element={<Navigate to="/vendor/onboarding/portfolio" replace />} />
        <Route path="onboarding/portfolio" element={<VendorPortfolioOnboarding />} />
        <Route path="onboarding/subscription" element={<VendorSubscriptionOnboarding />} />
        <Route path="onboarding/review" element={<VendorReviewOnboarding />} />
        <Route path="onboarding/submitted" element={<VendorSubmittedOnboarding />} />
        <Route path="onboarding/:stepId" element={<VendorOnboarding />} />
      </Route>
      <Route element={<VendorLayout />}>
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="services" element={<VendorServices />} />
        <Route path="pricing" element={<VendorPricing />} />
        <Route path="portfolio" element={<VendorPortfolio />} />
        <Route path="leads" element={<VendorLeads />} />
        <Route path="quotes" element={<VendorQuotes />} />
        <Route path="bookings" element={<VendorBookings />} />
        <Route path="calendar" element={<VendorCalendar />} />
        <Route path="chat" element={<VendorChat />} />
        <Route path="earnings" element={<VendorEarnings />} />
        <Route path="reviews" element={<VendorReviews />} />
        <Route path="profile" element={<VendorProfile />} />
        <Route path="support" element={<VendorSupport />} />
        <Route path="settings" element={<VendorSettings />} />
      </Route>
      <Route path="" element={<Navigate to="/vendor/login" replace />} />
      <Route path="*" element={<Navigate to="/vendor/login" replace />} />
    </Routes>
  );
};

export default VendorRoutes;
