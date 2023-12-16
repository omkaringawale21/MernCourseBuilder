const mongoose = require("mongoose");
const validator = require("validator");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Not Valid Email Address");
            }
        }
    },
    otp: {
        type: String,
        required: true,
        trim: true,
    }
});

const otpCollections = mongoose.model("otpCollections", otpSchema);

module.exports = otpCollections;