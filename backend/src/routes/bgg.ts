import { Router, Request, Response } from 'express';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const router = Router();

interface GameDetails {
    id: string;
    name: string;
    yearpublished: string | null;
    type: 'boardgame' | 'boardgameexpansion';
    image: string | null;
    rank: number | null;
}

// Search for games by query and fetch details
router.get('/search', async (req: Request, res: Response): Promise<void> => {
    const { query } = req.query;

    if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
    }

    try {
        // Step 1: Search for games to get their IDs
        const searchUrl = `https://boardgamegeek.com/xmlapi2/search?type=boardgame,boardgameexpansion&query=${encodeURIComponent(query as string)}`;
        const searchResponse = await axios.get(searchUrl);
        const parsedSearch = await parseStringPromise(searchResponse.data);

        if (parsedSearch.items.$.total === '0' || !parsedSearch.items.item) {
            res.json([]);
            return;
        }

        // Ensure search results are always an array
        let searchItems = parsedSearch.items.item;
        if (!Array.isArray(searchItems)) {
            searchItems = [searchItems];
        }

        // Limit to 15 results to avoid overly long URLs and improve performance
        const limitedSearchItems = searchItems.slice(0, 15);

        // Get unique game IDs to prevent errors from duplicate search results
        const gameIdArray = limitedSearchItems.map((item: any) => item.$.id);
        const uniqueGameIds = [...new Set(gameIdArray)];
        const gameIds = uniqueGameIds.join(',');

        // Step 2: Fetch detailed information for the found game IDs
        const detailsUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${gameIds}&stats=1`;
        const detailsResponse = await axios.get(detailsUrl);
        const parsedDetails = await parseStringPromise(detailsResponse.data);

        if (!parsedDetails.items || !parsedDetails.items.item) {
            res.json([]);
            return;
        }

        // Ensure thing results are always an array
        let detailItems = parsedDetails.items.item;
        if (!Array.isArray(detailItems)) {
            detailItems = [detailItems];
        }

        const results: GameDetails[] = detailItems.map((item: any) => {
            let rank: number | null = null;
            const stats = item.statistics?.[0]?.ratings?.[0];
            if (stats && stats.ranks?.[0]?.rank) {
                const rankObject = stats.ranks[0].rank.find((r: any) => r.$.name === 'boardgame');
                if (rankObject && rankObject.$.value && !isNaN(parseInt(rankObject.$.value, 10))) {
                    rank = parseInt(rankObject.$.value, 10);
                }
            }

            return {
                id: item.$.id,
                name: item.name?.find((n: any) => n.$.type === 'primary')?.$.value || 'N/A',
                type: item.$.type,
                yearpublished: item.yearpublished?.[0]?.$?.value || null,
                image: item.image?.[0] || null,
                rank: rank,
            };
        });

        // Step 3: Sort results by rank (null ranks go to the end)
        const sortedResults = results.sort((a, b) => {
            if (a.rank === null) return 1;
            if (b.rank === null) return -1;
            return a.rank - b.rank;
        });

        res.json(sortedResults);

    } catch (error) {
        console.error('BGG Search API error:', error);
        res.status(500).json({ error: 'Failed to fetch data from BGG API' });
    }
});

export default router;
