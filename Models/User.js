const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const secretkey = process.env.SECREAT_KEY_JWT;

const UserSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true,
    },
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
    mobNum: {
        type: Number,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
    },
    role: {
        type: String,
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ],
    playlist: Array,
    payment: Array,
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }

    next();
});

UserSchema.methods.genUserAuthentication = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, secretkey);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        console.log(error);
    }
}

const userCollections = mongoose.model("userCollections", UserSchema);

module.exports = userCollections;