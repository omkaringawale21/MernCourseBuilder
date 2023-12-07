const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
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

const requestCollection = mongoose.model("requestCollection", requestSchema);

module.exports = requestCollection;