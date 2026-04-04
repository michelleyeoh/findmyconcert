import { fetchWebApi } from '../../_utils/spotify';
import { NextResponse } from 'next/server';

//Input: GET /api/spotify/top-artists
//Output: JSON array of user's top artists (currently just michelle's info)
export async function GET(): Promise<NextResponse> {
  try {
    const data = await fetchWebApi('v1/me/top/artists?limit=10');
    return NextResponse.json(data.items);
  } catch (error) {
    console.error('Error fetching top artists:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
