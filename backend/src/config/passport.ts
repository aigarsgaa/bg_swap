import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email']
}, (accessToken, refreshToken, profile, done) => {
    // Here you would find or create a user in your database
    console.log('User profile from Google:', profile);
    // For now, just pass the profile to the next step
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    // In a real app, you'd serialize the user ID to the session
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    // In a real app, you'd deserialize the user from the database by ID
    done(null, user);
});

export default passport;
