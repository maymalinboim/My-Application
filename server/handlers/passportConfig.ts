import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { User } from "../db/dbUtils";

dotenv.config();

const PORT = process.env.PORT || 3000;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `http://localhost:${PORT}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let userId;
        const email = profile.emails?.[0]?.value;
        const username = email?.split("@")[0];

        const existingUser = await User.findOne({
          $or: [{ username }, { email }],
        });

        const user = {
          username,
          email,
        };

        if (!existingUser) {
          const newUser = new User(user);
          await newUser.save();
          userId = newUser._id.toString();
        } else {
          userId = existingUser._id.toString();
        }

        return done(null, { ...user, userId });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user as Express.User);
});

export default passport;
