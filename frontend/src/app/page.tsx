'use client';

import { useState, useEffect } from 'react';

interface Game {
  id: string;
  name: string;
  yearpublished: string | null;
  type: 'boardgame' | 'boardgameexpansion';
  image: string | null;
  rank: number | null;
}

interface UserProfile {
  displayName: string;
  photos?: { value: string }[];
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

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
    fetchUser();
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Board Game Swap</h1>
            <div>
              {user ? (
                <div className="flex items-center gap-4">
                  {user.photos && <img src={user.photos[0].value} alt="User" className="w-10 h-10 rounded-full" />}
                  <span className="font-semibold">Welcome, {user.displayName}!</span>
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

        <div className="mb-6">
          <div className="flex">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for a board game..."
              className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {loading && <p className="text-center mt-4">Loading...</p>}
        {error && <p className="text-center mt-4 text-red-500">{error}</p>}
        {hasSearched && !loading && !error && results.length === 0 && (
          <p className="text-center mt-4">No results found for your search.</p>
        )}
        <div className="space-y-4">
          {results.map((game) => (
            <div key={game.id} className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              {game.image && <img src={game.image} alt={game.name} className="w-20 h-20 object-contain mr-4 rounded" />}
              <div className="flex-grow">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{game.name}</h2>
                <div className="flex items-center space-x-4 mt-2">
                  {game.yearpublished && <p className="text-sm text-gray-600 dark:text-gray-400">Published: {game.yearpublished}</p>}
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${game.type === 'boardgame' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>
                    {game.type === 'boardgame' ? 'Base Game' : 'Expansion'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

