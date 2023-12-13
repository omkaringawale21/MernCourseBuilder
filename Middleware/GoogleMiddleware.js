const { request, response } = require("express");
const userCollections = require("../Models/User");
const jwt = require("jsonwebtoken");

const GoogleMiddleware = async (token, next) => {
    try {
        response.cookie("udemycookie", token, {
            expires: new Date(Date.now() + 86400000),
            httpOnly: true,
        });

        const tokenVerify = jwt.verify(token, process.env.SECREAT_KEY_JWT);

        const rootUser = await userCollections.findOne({ _id: tokenVerify._id });

        request.userId = rootUser._id;

        console.log("rootUser", request.userId);

        next();
    } catch (error) {

    }
}

module.exports = GoogleMiddleware;