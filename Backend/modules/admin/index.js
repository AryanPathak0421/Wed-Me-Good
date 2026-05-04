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
    getPayments,
    deleteVendor,
    deleteUser,
    getAllUsers,
    getVendorLedger,
    getPolicy,
    updatePolicy,
    getAllTickets,
    updateTicketStatus,
    replyToTicket,
    deleteTicket,
    getAllFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    getSupportConfig,
    updateSupportConfig
} = require('./adminController');



const router = express.Router();

const { protect, authorize } = require('../../middleware/auth.middleware');
const { upload } = require('../../utils/cloudinary');

// Public Category Route (for vendor registration)
// Public Support Routes
router.get('/categories', getAllCategories);
router.get('/faqs', getAllFAQs);
router.get('/support-config', getSupportConfig);


// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));


router.get('/vendors', getAllVendors);
router.get('/users', getAllUsers);
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
router.get('/vendor-ledger', getVendorLedger);
router.get('/analytics', getAnalytics);
router.get('/payments', getPayments);

// Admin Deletion Protocol
router.delete('/vendors/:id', deleteVendor);
router.delete('/users/:id', deleteUser);

// Admin Legal Policy Management
router.get('/policies/:type', getPolicy);
router.put('/policies/:type', updatePolicy);

// Admin Support Ticket Management
router.get('/tickets', getAllTickets);
router.put('/tickets/:id/status', updateTicketStatus);
router.post('/tickets/:id/reply', replyToTicket);
router.delete('/tickets/:id', deleteTicket);

// Admin FAQ Management
router.post('/faqs', createFAQ);
router.put('/faqs/:id', updateFAQ);
router.delete('/faqs/:id', deleteFAQ);

// Admin Support Config
router.put('/support-config', updateSupportConfig);


module.exports = router;


