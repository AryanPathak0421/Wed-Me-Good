const Vendor = require('../vendor/Vendor');
const User = require('../user/user.model');
const SubscriptionPlan = require('./SubscriptionPlan');

// @desc    Get all subscription plans
// @route   GET /api/admin/subscription-plans
// @access  Private/Admin
exports.getAllSubscriptionPlans = async (req, res, next) => {
    try {
        const plans = await SubscriptionPlan.find().sort('-createdAt');

        if (plans.length === 0) {
            // Create initial default plan
            const defaultPlan = await SubscriptionPlan.create({
                name: 'Premium Partner',
                price: 4999,
                durationValue: 1,
                durationUnit: 'year',
                features: ['All Features']
            });
            return res.status(200).json({ success: true, data: [defaultPlan] });
        }

        res.status(200).json({
            success: true,
            data: plans
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create subscription plan
// @route   POST /api/admin/subscription-plans
// @access  Private/Admin
exports.createSubscriptionPlan = async (req, res, next) => {
    try {
        const { name, price, features, durationValue, durationUnit } = req.body;

        const plan = await SubscriptionPlan.create({
            name,
            price,
            features: features || ['Full Access'],
            durationValue,
            durationUnit,
            lastUpdatedBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: plan
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update subscription plan
// @route   PUT /api/admin/subscription-plans/:id
// @access  Private/Admin
exports.updateSubscriptionPlan = async (req, res, next) => {
    try {
        const { name, price, features, durationValue, durationUnit, isActive } = req.body;

        const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, {
            name,
            price,
            features,
            durationValue,
            durationUnit,
            isActive,
            lastUpdatedBy: req.user.id
        }, { new: true });

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        res.status(200).json({
            success: true,
            data: plan
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete subscription plan
// @route   DELETE /api/admin/subscription-plans/:id
// @access  Private/Admin
exports.deleteSubscriptionPlan = async (req, res, next) => {
    try {
        const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Plan deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private/Admin
exports.getAllVendors = async (req, res, next) => {
    try {
        const vendors = await Vendor.find().sort('-createdAt');

        res.status(200).json({
            success: true,
            count: vendors.length,
            data: vendors
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update vendor status (Approve/Reject)
// @route   PUT /api/admin/vendors/:id/status
// @access  Private/Admin
exports.updateVendorStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const vendor = await Vendor.findByIdAndUpdate(req.params.id, {
            status,
            isVerified: status === 'Approved'
        }, {
            new: true,
            runValidators: true
        });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (err) {
        next(err);
    }
};

const Category = require('./Category');
const Review = require('./Review');
const Banner = require('./Banner');
const AdminLog = require('./AdminLog');

// Helper to create logs (Internal use)
const createAdminLog = async ({ user, action, target, level, ip, adminId }) => {
    try {
        await AdminLog.create({ user, action, target, level, ip, adminId });
    } catch (err) {
        console.error('Failed to create admin log:', err);
    }
};

// @desc    Get all audit logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getAllLogs = async (req, res, next) => {
    try {
        const logs = await AdminLog.find().sort('-createdAt').limit(100);
        res.status(200).json({ success: true, data: logs });
    } catch (err) {
        next(err);
    }
};

// @desc    Clear log buffer
// @route   DELETE /api/admin/logs
// @access  Private/Admin
exports.clearLogs = async (req, res, next) => {
    try {
        await AdminLog.deleteMany({});
        res.status(200).json({ success: true, message: 'Logs cleared' });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all banners
// @route   GET /api/admin/banners
// @access  Private/Admin
exports.getAllBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find().sort('-createdAt');
        res.status(200).json({ success: true, data: banners });
    } catch (err) {
        next(err);
    }
};

// @desc    Create banner
// @route   POST /api/admin/banners
// @access  Private/Admin
exports.createBanner = async (req, res, next) => {
    try {
        const bannerData = { ...req.body };
        if (req.file) {
            bannerData.imageUrl = req.file.path; // Cloudinary URL
        }
        const banner = await Banner.create(bannerData);
        
        // Log action
        await createAdminLog({
            user: req.user?.fullName || 'Admin',
            adminId: req.user?.id,
            action: `Created new banner: ${banner.title}`,
            target: 'Banners',
            level: 'Success',
            ip: req.ip || 'Local'
        });

        res.status(201).json({ success: true, data: banner });
    } catch (err) {
        next(err);
    }
};

// @desc    Update banner
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res, next) => {
    try {
        const bannerData = { ...req.body };
        if (req.file) {
            bannerData.imageUrl = req.file.path;
        }
        const banner = await Banner.findByIdAndUpdate(req.params.id, bannerData, {
            new: true,
            runValidators: true
        });
        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        // Log action
        await createAdminLog({
            user: req.user?.fullName || 'Admin',
            adminId: req.user?.id,
            action: `Updated banner: ${banner.title}`,
            target: 'Banners',
            level: 'Info',
            ip: req.ip || 'Local'
        });

        res.status(200).json({ success: true, data: banner });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete banner
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        // Log action
        await createAdminLog({
            user: req.user?.fullName || 'Admin',
            adminId: req.user?.id,
            action: `Deleted banner: ${banner.title}`,
            target: 'Banners',
            level: 'Warning',
            ip: req.ip || 'Local'
        });

        res.status(200).json({ success: true, message: 'Banner deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'fullName email')
            .populate('vendor', 'businessName')
            .sort('-createdAt');
        res.status(200).json({ success: true, data: reviews });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (err) {
        next(err);
    }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/categories
// @access  Public (for registration) / Admin
exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true }).sort('name');
        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        next(err);
    }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }
        const category = await Category.create({ name, description });
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        next(err);
    }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
    try {
        const { name, description, isActive } = req.body;
        const category = await Category.findByIdAndUpdate(req.params.id, {
            name,
            description,
            isActive
        }, { new: true, runValidators: true });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (err) {
        next(err);
    }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
exports.getProfile = async (req, res, next) => {
    try {
        const admin = await User.findById(req.user.id).select('-password');
        res.status(200).json({ success: true, data: admin });
    } catch (err) {
        next(err);
    }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private/Admin
exports.updateProfile = async (req, res, next) => {
    try {
        const { fullName, email, bio, phone } = req.body;
        const admin = await User.findByIdAndUpdate(req.user.id, {
            fullName,
            email,
            bio,
            phone
        }, { new: true, runValidators: true }).select('-password');

        res.status(200).json({ success: true, data: admin });
    } catch (err) {
        next(err);
    }
};

// @desc    Change admin password
// @route   PUT /api/admin/profile/password
// @access  Private/Admin
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new passwords' });
        }

        const admin = await User.findById(req.user.id);
        
        // Verify current password
        const isMatch = await admin.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid current password' });
        }

        // Update password
        admin.password = newPassword;
        await admin.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res, next) => {
    try {
        const Booking = require('../vendor/Booking');
        const bookings = await Booking.find()
            .populate('vendorId', 'businessName')
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
    try {
        const Booking = require('../vendor/Booking');
        const Vendor = require('../vendor/Vendor');
        const Review = require('../vendor/Review');
        const User = require('../user/user.model');

        const [bookings, activeVendors, totalVendors, usersCount, reviewsCount] = await Promise.all([
            Booking.find({ status: { $ne: 'Cancelled' } }),
            Vendor.countDocuments({ status: 'Approved' }),
            Vendor.countDocuments(),
            User.countDocuments(),
            Review.countDocuments()
        ]);

        const totalRevenue = bookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                vendorsCount: activeVendors,
                totalVendors,
                usersCount,
                reviewsCount,
                recentBookingsCount: bookings.length
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get detailed analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
    try {
        const Booking = require('../vendor/Booking');
        const Vendor = require('../vendor/Vendor');
        const User = require('../user/user.model');
        
        // 1. Revenue Trajectory (Last 15 days)
        const trajectory = [];
        for (let i = 14; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const start = new Date(date.setHours(0,0,0,0));
            const end = new Date(date.setHours(23,59,59,999));

            const dayBookings = await Booking.find({
                createdAt: { $gte: start, $lte: end },
                status: { $ne: 'Cancelled' }
            });

            trajectory.push({
                day: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                revenue: dayBookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0)
            });
        }

        // 2. Category Distribution
        const categories = await Vendor.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const distribution = categories.map(cat => ({
            label: cat._id || 'Uncategorized',
            count: cat.count,
            percentage: 0 // Will calculate below
        }));

        const totalVendors = await Vendor.countDocuments();
        distribution.forEach(d => {
            d.percentage = totalVendors > 0 ? Math.round((d.count / totalVendors) * 100) : 0;
        });

        // 3. Growth Metrics (Current Month vs Previous Month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const [currMonthUsers, prevMonthUsers, currMonthVendors, prevMonthVendors] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: startOfMonth } }),
            User.countDocuments({ createdAt: { $gte: startOfPrevMonth, $lt: startOfMonth } }),
            Vendor.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Vendor.countDocuments({ createdAt: { $gte: startOfPrevMonth, $lt: startOfMonth } })
        ]);

        const userGrowth = prevMonthUsers > 0 ? ((currMonthUsers - prevMonthUsers) / prevMonthUsers * 100).toFixed(1) : '+100';
        const vendorGrowth = prevMonthVendors > 0 ? ((currMonthVendors - prevMonthVendors) / prevMonthVendors * 100).toFixed(1) : '+100';

        res.status(200).json({
            success: true,
            data: {
                trajectory,
                distribution,
                metrics: {
                    userGrowth: `${userGrowth}%`,
                    vendorGrowth: `${vendorGrowth}%`,
                    totalRevenue: trajectory.reduce((acc, curr) => acc + curr.revenue, 0),
                    conversionLift: '3.2%' // Mocked for now
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all payments/transactions
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getPayments = async (req, res, next) => {
    try {
        const Booking = require('../vendor/Booking');
        
        const bookings = await Booking.find()
            .populate('vendorId', 'businessName')
            .sort('-createdAt');

        const payments = bookings.map(b => ({
            id: `TXN-${b._id.toString().slice(-6).toUpperCase()}`,
            vendor: b.vendorId?.businessName || 'Platform Service',
            amount: `₹${(b.totalPrice || 0).toLocaleString()}`,
            date: b.createdAt.toISOString().split('T')[0],
            status: b.status === 'Completed' ? 'Settled' : 'Pending',
            rawStatus: b.status,
            bookingId: b._id
        }));

        const totalSettled = bookings
            .filter(b => b.status === 'Completed')
            .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

        const pendingSettlement = bookings
            .filter(b => b.status !== 'Completed' && b.status !== 'Cancelled')
            .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                payments,
                stats: {
                    totalSettled: `₹${(totalSettled / 100000).toFixed(2)}L`,
                    pendingPayouts: `₹${pendingSettlement.toLocaleString()}`,
                    pendingCount: bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').length
                }
            }
        });
    } catch (err) {
        next(err);
    }
};
