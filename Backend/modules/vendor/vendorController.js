const Vendor = require('./Vendor');
const Lead = require('./Lead');
const Booking = require('./Booking');
const Review = require('./Review');
const Notification = require('./Notification');
const Quote = require('./Quote');
const Conversation = require('./Conversation');
const Message = require('./Message');
const SupportTicket = require('./SupportTicket');
const SubscriptionPlan = require('../admin/SubscriptionPlan');
const Banner = require('../admin/Banner');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Register vendor
// @route   POST /api/vendor/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { fullName, businessName, email, phone, city, category, password } = req.body;

        // Phone validation
        if (!phone || phone.length !== 10) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be exactly 10 digits'
            });
        }

        // Check if vendor exists
        const vendorExists = await Vendor.findOne({ $or: [{ email }, { phone }] });

        if (vendorExists) {
            return res.status(400).json({
                success: false,
                message: 'Vendor with this email or phone already exists'
            });
        }

        // Create vendor
        const vendor = await Vendor.create({
            fullName,
            businessName,
            email,
            phone,
            city,
            category,
            password
        });

        sendTokenResponse(vendor, 201, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Login vendor
// @route   POST /api/vendor/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email and password'
            });
        }

        // Check for vendor
        const vendor = await Vendor.findOne({ email }).select('+password');

        if (!vendor) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await vendor.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        sendTokenResponse(vendor, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Update onboarding details
// @route   PUT /api/vendor/onboarding/:step
// @access  Private
exports.updateOnboarding = async (req, res, next) => {
    try {
        const { step } = req.params;
        const vendorId = req.vendor.id;

        let updateData = {};
        let nextStep = '';

        switch (step) {
            case 'business':
                updateData.businessDetails = req.body;
                nextStep = 'services';
                break;
            case 'services':
                updateData.services = req.body;
                nextStep = 'pricing';
                break;
            case 'pricing':
                updateData.pricing = req.body;
                nextStep = 'portfolio';
                break;
            case 'portfolio':
                updateData.portfolio = req.body;
                nextStep = 'documents';
                break;
            case 'documents':
                updateData.documents = req.body;
                nextStep = 'bank';
                break;
            case 'bank':
                updateData.bank = req.body;
                nextStep = 'completed';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid onboarding step'
                });
        }

        updateData.onboardingStep = nextStep;

        const vendor = await Vendor.findByIdAndUpdate(vendorId, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get current logged in vendor
// @route   GET /api/vendor/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);

        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Upload media to Cloudinary
// @route   POST /api/vendor/upload
// @access  Private
exports.uploadMedia = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        res.status(200).json({
            success: true,
            url: req.file.path, // Cloudinary URL
            public_id: req.file.filename
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get vendor dashboard stats
// @route   GET /api/vendor/stats
// @access  Private
exports.getStats = async (req, res, next) => {
    try {
        const vendorId = req.vendor.id;

        const [leadsCount, bookingsCount, reviewsCount, vendor] = await Promise.all([
            Lead.countDocuments({ vendorId }),
            Booking.countDocuments({ vendorId }),
            Review.countDocuments({ vendorId }),
            Vendor.findById(vendorId).select('profileViews')
        ]);

        // Calculate conversion rate (leads to bookings)
        const conversionRate = leadsCount > 0 ? ((bookingsCount / leadsCount) * 100).toFixed(1) : 0;

        res.status(200).json({
            success: true,
            data: {
                profileViews: vendor.profileViews || 0,
                inquiries: leadsCount,
                bookings: bookingsCount,
                conversionRate: parseFloat(conversionRate),
                reviewsCount
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get banners for vendor dashboard
// @route   GET /api/vendor/banners
// @access  Private
exports.getDashboardBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find({
            status: 'Active',
            target: { $in: ['All', 'Vendor'] },
            category: { $in: ['All', req.vendor.category] }
        }).sort('-createdAt');

        res.status(200).json({
            success: true,
            data: banners
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get vendor leads
// @route   GET /api/vendor/leads
// @access  Private
exports.getLeads = async (req, res, next) => {
    try {
        const leads = await Lead.find({ vendorId: req.vendor.id }).sort('-createdAt');

        res.status(200).json({
            success: true,
            data: leads
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update lead status
// @route   PUT /api/vendor/leads/:id
// @access  Private
exports.updateLeadStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const lead = await Lead.findOneAndUpdate(
            { _id: req.params.id, vendorId: req.vendor.id },
            { status },
            { new: true, runValidators: true }
        );

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get vendor bookings
// @route   GET /api/vendor/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ vendorId: req.vendor.id }).sort('-eventDate');

        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update booking status
// @route   PUT /api/vendor/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, vendorId: req.vendor.id },
            { status },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create manual booking/event
// @route   POST /api/vendor/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
    try {
        const { customerName, eventDate, location, services, totalAmount } = req.body;

        const booking = await Booking.create({
            vendorId: req.vendor.id,
            customerName,
            eventDate,
            location,
            services: services || ['Manual Entry'],
            totalPrice: totalAmount || 0,
            status: 'Confirmed'
        });

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get vendor reviews
// @route   GET /api/vendor/reviews
// @access  Private
exports.getReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ vendorId: req.vendor.id }).populate('userId', 'name profileImage').sort('-createdAt');

        res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Reply to review
// @route   PUT /api/vendor/reviews/:id/reply
// @access  Private
exports.replyToReview = async (req, res, next) => {
    try {
        const { reply } = req.body;
        const review = await Review.findOneAndUpdate(
            { _id: req.params.id, vendorId: req.vendor.id },
            { reply },
            { new: true, runValidators: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get vendor notifications
// @route   GET /api/vendor/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ vendorId: req.vendor.id }).sort('-createdAt').limit(20);

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Mark notification as read
// @route   PUT /api/vendor/notifications/:id/read
// @access  Private
exports.markNotificationRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, vendorId: req.vendor.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all active subscription plans
// @route   GET /api/vendor/subscription/plans
// @access  Private
exports.getSubscriptionPlans = async (req, res, next) => {
    try {
        const plans = await SubscriptionPlan.find({ isActive: true });

        if (plans.length === 0) {
            const defaultPlan = await SubscriptionPlan.create({
                name: 'Premium Partner',
                price: 4999,
                durationValue: 1,
                durationUnit: 'year',
                features: ['Full Access']
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

// @desc    Create Razorpay Order for Subscription
// @route   POST /api/vendor/subscription/order
// @access  Private
exports.createSubscriptionOrder = async (req, res, next) => {
    try {
        const { planId } = req.body;

        const plan = await SubscriptionPlan.findById(planId);

        if (!plan || !plan.isActive) {
            return res.status(404).json({ success: false, message: 'Active plan not found' });
        }

        const options = {
            amount: plan.price * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: `sub_${req.vendor._id.toString().slice(-10)}_${Date.now().toString().slice(-8)}`,
            notes: {
                vendorId: req.vendor._id,
                planId: plan._id
            }
        };

        const order = await razorpay.orders.create(options);

        // Update vendor with pending order details
        await Vendor.findByIdAndUpdate(req.vendor.id, {
            'subscription.planId': plan._id,
            'subscription.planName': plan.name,
            'subscription.amount': plan.price,
            'subscription.orderId': order.id,
            'subscription.status': 'Pending'
        });

        res.status(200).json({
            success: true,
            order,
            plan
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Verify Razorpay Payment and Update Subscription
// @route   POST /api/vendor/subscription/verify
// @access  Private
exports.verifySubscriptionPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Fetch plan to get duration
            const plan = await SubscriptionPlan.findOne({ isActive: true });
            const durationValue = plan?.durationValue || 1;
            const durationUnit = plan?.durationUnit || 'year';

            const startDate = new Date();
            const endDate = new Date();

            if (durationUnit === 'year') {
                endDate.setFullYear(startDate.getFullYear() + durationValue);
            } else {
                endDate.setMonth(startDate.getMonth() + durationValue);
            }

            // Payment success
            const vendor = await Vendor.findByIdAndUpdate(req.vendor.id, {
                'subscription.status': 'Active',
                'subscription.paymentId': razorpay_payment_id,
                'subscription.startDate': startDate,
                'subscription.endDate': endDate
            }, { new: true });

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                data: vendor
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid signature'
            });
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Get current subscription plan
// @route   GET /api/vendor/subscription/plan
// @access  Private
exports.getSubscriptionPlan = async (req, res, next) => {
    try {
        let plan = await SubscriptionPlan.findOne({ isActive: true });

        if (!plan) {
            plan = await SubscriptionPlan.create({
                name: 'Premium Partner',
                price: 4999,
                features: [
                    'Receive unlimited verified leads',
                    'Priority ranking in search results',
                    'Full portfolio & video showcase',
                    'Exclusive verified vendor badge',
                    'Direct customer chat access',
                    'Premium 24/7 dedicated support'
                ]
            });
        }

        res.status(200).json({
            success: true,
            data: plan
        });
    } catch (err) {
        next(err);
    }
};


// @desc    Get earnings summary
// @route   GET /api/vendor/earnings
// @access  Private
exports.getEarningsSummary = async (req, res, next) => {
    try {
        const vendorId = req.vendor.id;
        const bookings = await Booking.find({ vendorId });

        const totalEarnings = bookings
            .filter(b => b.status === 'Completed')
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        const pendingPayments = bookings
            .filter(b => b.status === 'Confirmed')
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        // Assume 10% commission for now
        const platformCommission = totalEarnings * 0.1;

        res.status(200).json({
            success: true,
            data: {
                totalEarnings,
                pendingPayments,
                platformCommission,
                currency: 'INR'
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get quotes
// @route   GET /api/vendor/quotes
// @access  Private
exports.getQuotes = async (req, res, next) => {
    try {
        const quotes = await Quote.find({ vendorId: req.vendor.id })
            .populate('userId', 'fullName email phone')
            .populate('leadId')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: quotes
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a quote
// @route   PUT /api/vendor/quotes/:id
// @access  Private
exports.updateQuote = async (req, res, next) => {
    try {
        const { totalAmount, items } = req.body;
        const quote = await Quote.findOneAndUpdate(
            { _id: req.params.id, vendorId: req.vendor.id },
            { totalAmount, items },
            { new: true, runValidators: true }
        );

        if (!quote) {
            return res.status(404).json({ success: false, message: 'Quote not found' });
        }

        res.status(200).json({
            success: true,
            data: quote
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a quote
// @route   DELETE /api/vendor/quotes/:id
// @access  Private
exports.deleteQuote = async (req, res, next) => {
    try {
        const quote = await Quote.findOneAndDelete({
            _id: req.params.id,
            vendorId: req.vendor.id
        });

        if (!quote) {
            return res.status(404).json({ success: false, message: 'Quote not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Quote removed'
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create quote
// @route   POST /api/vendor/quotes
// @access  Private
exports.createQuote = async (req, res, next) => {
    try {
        const vendorId = req.vendor.id;
        const { leadId, userId, items, taxAmount, discountAmount, validUntil, notes, terms } = req.body;

        const totalAmount = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) + (taxAmount || 0) - (discountAmount || 0);

        const quote = await Quote.create({
            vendorId,
            leadId,
            userId,
            items,
            totalAmount,
            taxAmount,
            discountAmount,
            validUntil,
            notes,
            terms,
            status: 'Sent'
        });

        // Update lead status
        await Lead.findByIdAndUpdate(leadId, { status: 'Quote Sent' });

        res.status(201).json({
            success: true,
            data: quote
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update vendor portfolio
// @route   PUT /api/vendor/portfolio
// @access  Private
exports.updatePortfolio = async (req, res, next) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(
            req.vendor.id,
            { portfolio: req.body.portfolio },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: vendor.portfolio
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get chat conversations
// @route   GET /api/vendor/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
    try {
        const conversations = await Conversation.find({
            'participants.participantId': req.vendor.id
        }).sort('-updatedAt');

        res.status(200).json({
            success: true,
            data: conversations
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get messages for a conversation
// @route   GET /api/vendor/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId
        }).sort('createdAt');

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Send a message
// @route   POST /api/vendor/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
    try {
        const { conversationId, text, attachments } = req.body;

        const message = await Message.create({
            conversationId,
            senderId: req.vendor.id,
            senderModel: 'Vendor',
            text,
            attachments
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: {
                text,
                senderId: req.vendor.id,
                createdAt: new Date()
            }
        });

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get support tickets
// @route   GET /api/vendor/support
// @access  Private
exports.getSupportTickets = async (req, res, next) => {
    try {
        const tickets = await SupportTicket.find({ vendorId: req.vendor.id }).sort('-createdAt');

        res.status(200).json({
            success: true,
            data: tickets
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create support ticket
// @route   POST /api/vendor/support
// @access  Private
exports.createSupportTicket = async (req, res, next) => {
    try {
        const { subject, category, message, priority } = req.body;

        const ticket = await SupportTicket.create({
            vendorId: req.vendor.id,
            subject,
            category,
            message,
            priority
        });

        res.status(201).json({
            success: true,
            data: ticket
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Change password
// @route   PUT /api/vendor/settings/password
// @access  Private
exports.changePassword = async (req, res, next) => {
    try {
        console.log('🔄 Password Rotation Request Received for Vendor:', req.vendor.id);
        const { currentPassword, newPassword } = req.body;


        const vendor = await Vendor.findById(req.vendor.id).select('+password');

        if (!(await vendor.matchPassword(currentPassword))) {
            return res.status(401).json({ success: false, message: 'Current password incorrect' });
        }

        vendor.password = newPassword;
        await vendor.save();

        res.status(200).json({ success: true, message: 'Password updated' });
    } catch (err) {
        next(err);
    }
};

// @desc    Deactivate/Toggle account status
// @route   PUT /api/vendor/settings/deactivate
// @access  Private
exports.deactivateAccount = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);
        vendor.isActive = !vendor.isActive;
        await vendor.save();

        res.status(200).json({ 
            success: true, 
            message: vendor.isActive ? 'Account activated' : 'Account deactivated',
            isActive: vendor.isActive 
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update profile settings


// @route   PUT /api/vendor/settings
// @access  Private
exports.updateSettings = async (req, res, next) => {
    try {
        // Prevent sensitive fields from being updated via this route
        const forbiddenFields = ['password', 'role', 'status', 'isVerified', 'subscription', 'email'];
        const updateData = { ...req.body };

        forbiddenFields.forEach(field => delete updateData[field]);

        const vendor = await Vendor.findByIdAndUpdate(req.vendor.id, {
            $set: updateData
        }, { new: true, runValidators: true });

        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (err) {
        next(err);
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (vendor, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    const options = {
        expires: new Date(
            Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE) || 30) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .json({
            success: true,
            token,
            vendor: {
                id: vendor._id,
                fullName: vendor.fullName,
                businessName: vendor.businessName,
                email: vendor.email,
                onboardingStep: vendor.onboardingStep
            }
        });
};
