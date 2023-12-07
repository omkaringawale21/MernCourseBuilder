const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    razorpayPaymentId: {
        type: String,
        required: true,
        trim: true,
    },
    razorpayOrderId: {
        type: String,
        required: true,
        trim: true,
    },
    razorpaySignature: {
        type: String,
        required: true,
        trim: true,
    },
    userId: {
        type: String,
        required: true,
        trim: true,
    },
    courseid: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});

const paymentCollection = mongoose.model("paymentCollection", paymentSchema);

module.exports = paymentCollection;