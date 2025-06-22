import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { prisma } from '../lib/db';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { googleId: profile.id },
        });

        if (user) {
            return done(null, user);
        }

        const newUser = await prisma.user.create({
            data: {
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails![0].value,
                photo: profile.photos![0].value,
            },
        });

        return done(null, newUser);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;
