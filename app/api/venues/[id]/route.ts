import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: venueId } = await params;

  if (!venueId) {
    return NextResponse.json(
      { error: 'Venue ID is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/venues/${venueId}?apikey=${process.env.TICKETMASTER_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch venue details from Ticketmaster API`);
    }

    const venueData = await response.json();
    const parkingInfo = venueData.parkingDetail || 'Parking info not available';

    return NextResponse.json({ venue: venueData, parkingInfo });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
