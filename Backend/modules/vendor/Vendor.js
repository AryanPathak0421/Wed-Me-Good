const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema({
    // Initial Registration
    fullName: {
        type: String,
        required: [true, 'Please provide your full name'],
        trim: true
    },
    businessName: {
        type: String,
        required: [true, 'Please provide your business name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Please provide your phone number'],
        unique: true,
        minlength: [10, 'Phone number must be exactly 10 digits'],
        maxlength: [10, 'Phone number must be exactly 10 digits']
    },
    city: {
        type: String,
        required: [true, 'Please provide your city']
    },
    category: {
        type: String,
        required: [true, 'Please provide a service category']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },

    // Onboarding Progress
    onboardingStep: {
        type: String,
        enum: ['business', 'services', 'pricing', 'portfolio', 'documents', 'bank', 'completed'],
        default: 'business'
    },

    // Business Details
    businessDetails: {
        description: String,
        years: String,
        teamSize: String,
        languages: [String],
        serviceCities: [String]
    },

    // Services
    services: [{
        name: String,
        category: String,
        basePrice: Number,
        packages: [{
            name: String,
            price: Number,
            features: [String]
        }]
    }],

    // Pricing
    pricing: {
        range: String,
        notes: String
    },

    // Portfolio
    portfolio: [{
        type: { type: String, enum: ['Photo', 'Video'], default: 'Photo' },
        title: String,
        tag: String,
        url: String
    }],

    // Documents
    documents: {
        idProof: { type: String, default: null },
        gst: { type: String, default: null },
        contract: { type: String, default: null }
    },

    // Bank Details
    bank: {
        accountName: String,
        accountNumber: String,
        ifsc: String,
        upiId: String
    },

    role: {
        type: String,
        default: 'vendor'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profileViews: {
        type: Number,
        default: 0
    },
    subscription: {
        planId: String,
        planName: String,
        amount: Number,
        status: { type: String, enum: ['Pending', 'Active', 'Expired'], default: 'Pending' },
        paymentId: String,
        orderId: String,
        startDate: Date,
        endDate: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
vendorSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
vendorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
