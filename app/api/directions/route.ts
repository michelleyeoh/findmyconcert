import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');

  if (!origin || !latitude || !longitude) {
    return NextResponse.json({ error: 'Origin, latitude, and longitude are required' }, { status: 400 });
  }

  try {
    const directionsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const directionsData = await directionsResponse.json();
    console.log(directionsData);
    return NextResponse.json({ routes: directionsData.routes || [] }); // returns all the routes
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}