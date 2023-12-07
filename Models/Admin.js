const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    courseid: {
        type: String,
        required: true,
        trim: true,
    },
    courseTitle: {
        type: String,
        required: true,
        trim: true,
    },
    courseDescription: {
        type: String,
        required: true,
        trim: true,
    },
    courseCreater: {
        type: String,
        required: true,
        trim: true,
    },
    courseCategory: {
        type: String,
        required: true,
        trim: true,
    },
    coursePrice: {
        type: Number,
        required: true,
        trim: true,
    },
    courseDiscount: {
        type: Number,
        required: true,
        trim: true,
    },
    courseImg: {
        type: String,
        trim: true,
    },
    videolist: [
        {
            videoTitle: {
                type: String,
                required: true,
            },
            videoUrl: {
                type: String,
                trim: true,
            },
            videoid: {
                type: String,
                required: true,
            }
        }
    ]
}, {
    timestamps: true
});

const adminCollection = mongoose.model("adminCollection", adminSchema);

module.exports = adminCollection;