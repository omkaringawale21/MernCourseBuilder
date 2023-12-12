const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECREAT,
    callbackURL: "/google/callback",
    passReqToCallback: true,
},
    function (accessToken, refreshToken, profile, cb) {
        console.log("Profile", profile);
        return cb(null, profile);
    }
));