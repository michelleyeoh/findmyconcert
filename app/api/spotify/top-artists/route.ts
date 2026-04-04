import { fetchWebApi } from '../../_utils/spotify';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await fetchWebApi('v1/me/top/artists?limit=10');
    return NextResponse.json(data.items);
  } catch (error) {
    console.error('Error fetching top artists:', error);
    console.log(
      'Spotify API error details:',
      error instanceof Error ? error.message : error
    );
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
