"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const xml2js_1 = require("xml2js");
const router = (0, express_1.Router)();
// Search for games by query and fetch details
router.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
    }
    try {
        // Step 1: Search for games to get their IDs
        const searchUrl = `https://boardgamegeek.com/xmlapi2/search?type=boardgame,boardgameexpansion&query=${encodeURIComponent(query)}`;
        const searchResponse = yield axios_1.default.get(searchUrl);
        const parsedSearch = yield (0, xml2js_1.parseStringPromise)(searchResponse.data);
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
        const gameIdArray = limitedSearchItems.map((item) => item.$.id);
        const uniqueGameIds = [...new Set(gameIdArray)];
        const gameIds = uniqueGameIds.join(',');
        // Step 2: Fetch detailed information for the found game IDs
        const detailsUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${gameIds}&stats=1`;
        const detailsResponse = yield axios_1.default.get(detailsUrl);
        const parsedDetails = yield (0, xml2js_1.parseStringPromise)(detailsResponse.data);
        if (!parsedDetails.items || !parsedDetails.items.item) {
            res.json([]);
            return;
        }
        // Ensure thing results are always an array
        let detailItems = parsedDetails.items.item;
        if (!Array.isArray(detailItems)) {
            detailItems = [detailItems];
        }
        const results = detailItems.map((item) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            let rank = null;
            const stats = (_c = (_b = (_a = item.statistics) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.ratings) === null || _c === void 0 ? void 0 : _c[0];
            if (stats && ((_e = (_d = stats.ranks) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.rank)) {
                const rankObject = stats.ranks[0].rank.find((r) => r.$.name === 'boardgame');
                if (rankObject && rankObject.$.value && !isNaN(parseInt(rankObject.$.value, 10))) {
                    rank = parseInt(rankObject.$.value, 10);
                }
            }
            return {
                id: item.$.id,
                name: ((_g = (_f = item.name) === null || _f === void 0 ? void 0 : _f.find((n) => n.$.type === 'primary')) === null || _g === void 0 ? void 0 : _g.$.value) || 'N/A',
                type: item.$.type,
                yearpublished: ((_k = (_j = (_h = item.yearpublished) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.$) === null || _k === void 0 ? void 0 : _k.value) || null,
                image: ((_l = item.image) === null || _l === void 0 ? void 0 : _l[0]) || null,
                rank: rank,
            };
        });
        // Step 3: Sort results by rank (null ranks go to the end)
        const sortedResults = results.sort((a, b) => {
            if (a.rank === null)
                return 1;
            if (b.rank === null)
                return -1;
            return a.rank - b.rank;
        });
        res.json(sortedResults);
    }
    catch (error) {
        console.error('BGG Search API error:', error);
        res.status(500).json({ error: 'Failed to fetch data from BGG API' });
    }
}));
exports.default = router;
