const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const userCollections = require("../Models/User.js");

dotenv.config();

const secretkey = process.env.SECREAT_KEY_JWT;

const TokenAuthenMiddleware = async (request, response, next) => {
    try {
        const token = request.cookies.udemycookie;

        const verifyToken = jwt.verify(token, secretkey);
        // console.log("verifyToken", verifyToken);

        const rootUser = await userCollections.findOne({ _id: verifyToken._id, "tokens.token": token });
        // console.log("rootUser", rootUser);

        if (!rootUser) {
            response.status(422).json({ error: "User not Found! Please Login", status: 422, thisAdmin: false, profile: false });
        }

        request.token = token;
        request.rootUser = rootUser;
        request.userId = rootUser._id;

        next();
    } catch (error) {
        response.status(404).json({ error: "User not Found! Please Login! Invalid user", status: 404, thisAdmin: false });
    }
}

module.exports = TokenAuthenMiddleware;