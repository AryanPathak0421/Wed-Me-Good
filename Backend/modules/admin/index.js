const express = require('express');
const {
    getAllVendors,
    updateVendorStatus,
    getStats,
    getAllSubscriptionPlans,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllReviews,
    deleteReview,
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    getAllLogs,
    clearLogs,
    getProfile,
    updateProfile,
    changePassword,
    getAllBookings,
    getAnalytics,
    getPayments
} = require('./adminController');

const router = express.Router();

const { protect, authorize } = require('../../middleware/auth.middleware');
const { upload } = require('../../utils/cloudinary');

// Public Category Route (for vendor registration)
router.get('/categories', getAllCategories);

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/vendors', getAllVendors);
router.put('/vendors/:id/status', updateVendorStatus);
router.get('/stats', getStats);
router.get('/subscription-plans', getAllSubscriptionPlans);
router.post('/subscription-plans', createSubscriptionPlan);
router.put('/subscription-plans/:id', updateSubscriptionPlan);
router.delete('/subscription-plans/:id', deleteSubscriptionPlan);

// Admin Category Management
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Admin Review Management
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// Admin Banner Management
router.get('/banners', getAllBanners);
router.post('/banners', upload.single('image'), createBanner);
router.put('/banners/:id', upload.single('image'), updateBanner);
router.delete('/banners/:id', deleteBanner);

// Admin Audit Logs
router.get('/logs', getAllLogs);
router.delete('/logs', clearLogs);

// Admin Profile Management
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', changePassword);

// Admin Global Bookings
router.get('/bookings', getAllBookings);
router.get('/analytics', getAnalytics);
router.get('/payments', getPayments);

module.exports = router;
