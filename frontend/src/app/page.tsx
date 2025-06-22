'use client';

import { useState } from 'react';

interface Game {
  id: string;
  name: string;
  yearpublished: string | null;
  type: 'boardgame' | 'boardgameexpansion';
  image: string | null;
  rank: number | null;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    setResults([]);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/bgg/search?query=${query}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred');
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-6">Board Game Swap</h1>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a board game..."
            className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 dark:disabled:bg-gray-600"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && <p className="text-red-500 text-center">Error: {error}</p>}

        <div className="space-y-4">
          {results.map((game) => (
                        <div key={game.id} className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              {game.image && <img src={game.image} alt={game.name} className="w-20 h-20 object-contain mr-4 rounded" />}
              <div className="flex-grow">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{game.name}</h2>
                <div className="flex items-center space-x-4">
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
    </main>
  );
}

