import { NextRequest, NextResponse } from 'next/server';

// Input: GET /api/venues/[id]
// Output: JSON with parking info for the venue
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch venue details from Ticketmaster API: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    const venueData = await response.json();
    const parkingInfo = venueData.parkingDetail || 'Parking info not available';

    return NextResponse.json({ parkingInfo });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
