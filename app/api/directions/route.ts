import { NextRequest, NextResponse } from 'next/server';
import { RouteInfo } from '@/app/_types/event';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const mode = searchParams.get('mode') || 'transit';
  const validMode = mode === 'driving' ? 'driving' : 'transit';

  if (!origin || !latitude || !longitude) {
    return NextResponse.json(
      { error: 'Origin, latitude, and longitude are required' },
      { status: 400 }
    );
  }

  try {
    const transitDepartureTime =
      validMode === 'transit' ? '&departure_time=now' : '';
    const directionsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${latitude},${longitude}&mode=${validMode}${transitDepartureTime}&alternatives=true&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const directionsData = await directionsResponse.json();
    const payload: { routes: RouteInfo[] } = {
      routes: directionsData.routes || [],
    };

    return NextResponse.json(payload); // returns all the routes
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
