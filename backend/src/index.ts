import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport'; // Your Passport configuration
import dotenv from 'dotenv';
import bggRoutes from './routes/bgg';
import authRoutes from './routes/auth';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using https
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bgg', bggRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Board Game Swap API is running!');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
