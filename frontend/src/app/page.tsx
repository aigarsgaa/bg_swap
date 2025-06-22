'use client';

import React, { useState, useEffect } from 'react';

interface Game {
  id: string;
  name: string;
  yearpublished: string | null;
  type: 'boardgame' | 'boardgameexpansion';
  image: string | null;
  rank: number | null;
}

interface UserProfile {
  id: string;
  name: string;
  photo?: string;
}

interface Listing {
  id: string;
  bggId: string;
  gameName: string;
  condition: string;
  price: number;
  notes: string | null;
  seller: {
    name: string;
    photo: string;
  };
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  // State for the new listing form
  const [newListingGameName, setNewListingGameName] = useState('');
  const [newListingBggId, setNewListingBggId] = useState('');
  const [newListingCondition, setNewListingCondition] = useState('Like New');
  const [newListingPrice, setNewListingPrice] = useState('');
  const createListingFormRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // We need to include credentials to send the session cookie
        const res = await fetch('http://localhost:3001/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // User is not logged in
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
      }
    };

    const fetchListings = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/listings', { credentials: 'include' });
        if (res.ok) {
          const listingsData = await res.json();
          setListings(listingsData);
        }
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      }
    };

    fetchUser();
    fetchListings();
  }, []);

  const handleSearch = async () => {
    if (!query) return;
    
    setResults([]); // Clear previous results
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await fetch(`http://localhost:3001/api/bgg/search?query=${query}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListingGameName || !newListingBggId || !newListingPrice) {
      alert('Please fill out all fields for the listing.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important to send session cookie
        body: JSON.stringify({
          gameName: newListingGameName,
          bggId: newListingBggId,
          condition: newListingCondition,
          price: parseFloat(newListingPrice),
        }),
      });

      if (res.ok) {
        const createdListing = await res.json();
        setListings([createdListing, ...listings]); // Add new listing to the top
        // Clear form
        setNewListingGameName('');
        setNewListingBggId('');
        setNewListingPrice('');
        setNewListingCondition('Like New');
      } else {
        const errorData = await res.json();
        alert(`Failed to create listing: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to create listing:', error);
      alert('An error occurred while creating the listing.');
    }
  };

  const handleSelectListGame = (game: Game) => {
    if (!user) {
      alert('Please log in to create a listing.');
      return;
    }
    setNewListingBggId(game.id);
    setNewListingGameName(game.name);
    createListingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Board Game Swap</h1>
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                {user.photo && <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full" />}
                <span className="font-semibold">Welcome, {user.name}!</span>
                <a href="http://localhost:3001/api/auth/logout" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Logout
                </a>
              </div>
            ) : (
              <a href="http://localhost:3001/api/auth/google" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Login with Google
              </a>
            )}
          </div>
        </div>

        {/* BGG Search Section */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Search for a Game to List or Buy</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for a board game..."
              className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <button 
              onClick={handleSearch}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 sm:w-auto w-full"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Create Listing Form */}
        {user && (
          <div ref={createListingFormRef} className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Create a New Listing</h2>
            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">BGG ID</label>
                <input type="text" placeholder="e.g., 174430" value={newListingBggId} onChange={(e) => setNewListingBggId(e.target.value)} className="w-full p-2 border rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Game Name</label>
                <input type="text" placeholder="e.g., Gloomhaven" value={newListingGameName} onChange={(e) => setNewListingGameName(e.target.value)} className="w-full p-2 border rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Condition</label>
                <select value={newListingCondition} onChange={(e) => setNewListingCondition(e.target.value)} className="w-full p-2 border rounded bg-gray-200 dark:bg-gray-700">
                  <option>Like New</option>
                  <option>Very Good</option>
                  <option>Good</option>
                  <option>Acceptable</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold">Price ($)</label>
                <input type="number" placeholder="e.g., 80.00" value={newListingPrice} onChange={(e) => setNewListingPrice(e.target.value)} className="w-full p-2 border rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Create Listing</button>
            </form>
          </div>
        )}

        {/* Main Content Area: Search Results and Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* BGG Search Results Column */}
          <div>
            <h2 className="text-2xl font-bold mb-4">BGG Search Results</h2>
            {loading && <p>Loading search results...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {hasSearched && !loading && results.length === 0 && <p>No games found for your query.</p>}
            <div className="space-y-4">
              {results.map(game => (
                <div key={game.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {game.image && <img src={game.image} alt={game.name} className="w-16 h-16 object-contain rounded" />}
                    <div>
                      <p className="font-bold text-lg">{game.name} ({game.yearpublished})</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">BGG ID: {game.id}</p>
                    </div>
                  </div>
                  <button onClick={() => handleSelectListGame(game)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                    List this Game
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Current Listings Column */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Current Listings</h2>
            {listings.length === 0 && <p>No one is selling any games right now. Be the first!</p>}
            <div className="space-y-4">
              {listings.map(listing => (
                <div key={listing.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <p className="font-bold text-lg">{listing.gameName}</p>
                  <p className="text-xl font-semibold text-green-500">${listing.price.toFixed(2)}</p>
                  <p><span className="font-semibold">Condition:</span> {listing.condition}</p>
                  {listing.notes && <p className="text-sm italic text-gray-600 dark:text-gray-400">Notes: {listing.notes}</p>}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <img src={listing.seller.photo} alt={listing.seller.name} className="w-8 h-8 rounded-full" />
                    <span className="text-sm">Sold by {listing.seller.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

