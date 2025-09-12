const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// This file must export a function that takes 'passport' as an argument
module.exports = function(passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                // This function is called after the user successfully authenticates with Google.
                const newUser = {
                    googleId: profile.id,
                    displayName: profile.displayName,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    image: profile.photos[0].value,
                    email: profile.emails[0].value
                };

                try {
                    // Check if the user already exists in our database
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        // If user exists, pass the user object to the next step
                        done(null, user);
                    } else {
                        // If user does not exist, create a new user in our database
                        user = await User.create(newUser);
                        done(null, user);
                    }
                } catch (err) {
                    console.error(err);
                    done(err, null);
                }
            }
        )
    );
};

