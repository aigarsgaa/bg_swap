import { Router, Request, Response } from 'express';
import { prisma } from '../lib/db';

const router = Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'User not authenticated' });
};

// GET all listings
router.get('/', async (req: Request, res: Response) => {
    try {
        const listings = await prisma.listing.findMany({
            include: {
                seller: {
                    select: {
                        name: true,
                        photo: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(listings);
    } catch (error) {
        console.error('Failed to fetch listings:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

// POST a new listing
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const { bggId, gameName, condition, price, notes } = req.body;
        const user = req.user as any;

        if (!user || !user.id) {
            res.status(401).json({ error: 'User not properly authenticated' });
            return;
        }

        if (!bggId || !gameName || !condition || price === undefined) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const newListing = await prisma.listing.create({
            data: {
                bggId,
                gameName,
                condition,
                price,
                notes,
                sellerId: user.id,
            },
        });
        res.status(201).json(newListing);
    } catch (error) {
        console.error('Failed to create listing:', error);
        res.status(500).json({ error: 'Failed to create listing' });
    }
});

export default router;
