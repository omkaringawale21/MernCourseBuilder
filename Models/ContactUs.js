const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    coursename: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});

const contactCollection = mongoose.model("contactCollection", contactSchema);

module.exports = contactCollection;