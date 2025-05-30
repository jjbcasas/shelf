const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const User = require('../models/User')
const passport = require('passport')

module.exports = function(passport){
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback',
    },
    async ( accessToken, refreshToken, profile, done) => {
        try {
            // Check if the user already exists based on their Google ID
            let user = await User.findOne({ googleId: profile.id })
            if (user) {
                done(null, user);
              } else {
                // If the user doesn't exist, create a new user in your database
                const user =  await new User({
                  googleId: profile.id,
                  userName: profile.displayName,
                  email: profile.emails ? profile.emails[0].value : null,
                  profileImage: profile.photos[0].value
                  // Store other profile information as needed
                });
                const savedUser = await user.save();
                return done(null, savedUser);
              }
            } catch (err) {
              return done(err);
            }
        }
    ))
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
      
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
}