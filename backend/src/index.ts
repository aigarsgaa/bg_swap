import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport'; // Your Passport configuration
import dotenv from 'dotenv';
import bggRoutes from './routes/bgg';
import authRoutes from './routes/auth';
import listingRoutes from './routes/listings';

dotenv.config();

// Diagnostic logging for environment variables
console.log('--- Environment Variable Check ---');
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL ? 'Loaded' : 'MISSING'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Loaded' : 'MISSING'}`);
console.log(`SESSION_SECRET: ${process.env.SESSION_SECRET ? 'Loaded' : 'MISSING'}`);
console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? 'Loaded' : 'MISSING'}`);
console.log(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? 'Loaded' : 'MISSING'}`);
console.log('----------------------------------');

const app: Express = express();
const port = process.env.PORT || 3001;

const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

if (isProduction) {
    app.set('trust proxy', 1); // Trust first proxy, needed for secure cookies behind a proxy
}

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: isProduction, // Use secure cookies in production (HTTPS)
        httpOnly: true, // Prevent client-side JS from accessing the cookie
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site, 'lax' for local
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/bgg', bggRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Board Game Swap API is running!');
});

export default app;
