const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    customerName: {
        type: String
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    },
    eventDate: {
        type: Date,
        required: [true, 'Please provide event date']
    },
    location: {
        type: String,
        required: [true, 'Please provide event location']
    },
    services: [{
        type: String
    }],
    totalPrice: {
        type: Number,
        required: [true, 'Please provide total price']
    },
    status: {
        type: String,
        enum: ['Confirmed', 'Completed', 'Cancelled'],
        default: 'Confirmed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
