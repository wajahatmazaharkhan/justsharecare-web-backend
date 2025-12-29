import passport from "passport";
import { Strategy as GooglStrategy } from "passport-google-oauth20";
import { User } from "../models/User.models.js";

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      console.error("Error during deserializeUser:", err);
      done(err);
    });
});

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.use(
  new GooglStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    (accessToken, refreshToken, profile, done) => {
      // Data is nested in profile._json
      const { _json } = profile;

      User.findOne({ googleId: profile.id })
        .then((existingUser) => {
          if (existingUser) {
            done(null, existingUser);
          } else {
            new User({
              googleId: profile.id,
              fullname: profile.displayName,
              displayName: profile.displayName,
              email: profile.emails[0].value,
              profilePic: profile.photos[0].value,
              phone_number: _json.phoneNumbers
                ? _json.phoneNumbers[0].value
                : "",
              dob: _json.birthdays ? new Date(_json.birthdays[0].date) : null,
              gender: _json.gender || "unspecified",
              preferred_language: _json.locale || "English",
              isVerified: true,
              passwordOtpVerify: true,
            })
              .save()
              .then((user) => done(null, user))
              .catch((err) => {
                console.error("Error during user creation:", err);
                done(err);
              });
          }
        })
        .catch((err) => {
          console.error("Error during user lookup:", err);
          done(err);
        });
    }
  )
);

export default passport;
