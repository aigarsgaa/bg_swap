import { NextResponse } from 'next/server';
import xml2js from 'xml2js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://www.boardgamegeek.com/xmlapi2/search?type=boardgame&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch from BGG API');
    }

    const xmlText = await response.text();
    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false, mergeAttrs: true });
    const result = await parser.parseStringPromise(xmlText);

    let games: any[] = [];
    if (result.items && result.items.item) {
        games = Array.isArray(result.items.item) ? result.items.item : [result.items.item];
        games = games.map(game => ({
            id: game.id,
            name: game.name.value,
            yearPublished: game.yearpublished?.value
        }));
    }

    return NextResponse.json({ games });

  } catch (error: any) {
    console.error('BGG API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data from BoardGameGeek API.' }, { status: 500 });
  }
}
