const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const Connection = require("./DataBase/Connection.js");
const router = require("./Routes/Routes.js");
const passport = require("passport");
const session = require("express-session");
const userCollections = require("./Models/User.js");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const GoogleMiddleware = require("./Middleware/GoogleMiddleware.js");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

const userName = process.env.MONGODB_UER;
const userPass = process.env.MONGODB_PA;
const userDB = process.env.MONGODB_DB_NAME;

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

Connection(userName, userPass, userDB);

app.use(express.json());
app.use(cookieParser("*"));
app.use(cors("*", {
    origin: true,
    Credential: true,
}));

// app.use(session({
//     secret: "omkaringawaleomkaringawaleomkaringawaleomkaringawale3456",
//     resave: false,
//     saveUninitialized: true,
// }));

// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(
//     new GoogleStrategy({
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_SECREAT,
//         callbackURL: "/google/callback",
//         scope: ["profile", "email"],
//     },
//         async (accessToken, refreshToken, profile, done) => {
//             try {
//                 let userExits = await userCollections.findOne({ email: profile.emails[0].value });

//                 if (!userExits) {
//                     let newuser = new userCollections({
//                         fname: profile.displayName,
//                         email: profile.emails[0].value,
//                         password: profile.emails[0].value,
//                         image: profile.photos[0].value
//                     });

//                     await newuser.save();

//                     const token = jwt.sign({ _id: newuser._id }, process.env.SECREAT_KEY_JWT);

//                     GoogleMiddleware(token);
//                 } else {
//                     const token = jwt.sign({ _id: userExits._id }, process.env.SECREAT_KEY_JWT);

//                     GoogleMiddleware(token);
//                 }

//                 return done(null, profile);
//             } catch (error) {
//                 return done(error, null);
//             }

//         }
//     )
// );

// passport.serializeUser((user, done) => {
//     done(null, user);
// });

// passport.deserializeUser((user, done) => {
//     done(null, user);
// });

// app.get("/google", passport.authenticate("google", { scope: ["profile", "'email"] }));

// app.get("/google/callback", passport.authenticate("google", {
//     successRedirect: "/course",
//     failureRedirect: "/login",
// }));

// app.get("/google/logout", (request, response, next) => {
//     request.logOut(
//         function (err) {
//             if (err) {
//                 return next(err);
//             }
//             response.redirect("/login");
//         }
//     )
// });

app.use(router);

app.use("/public/photos", express.static(path.join(__dirname, "public/photos")));

app.use("/public/videos", express.static(path.join(__dirname, "public/videos")));

app.use(express.static(path.join(__dirname, "./client/build")));

app.get("*", function (request, response) {
    response.sendFile(express.static(path.join(__dirname, "./client/build/index.html")));
});

app.listen(PORT, () => {
    // console.log(`Back End server is running on port ${PORT}`);
});