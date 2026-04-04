import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;

  if (!eventId) {
    return NextResponse.json(
      { error: 'Event ID is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events/${eventId}.json?apikey=${process.env.TICKETMASTER_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch event details from Ticketmaster API`);
    }

    const data = await response.json();
    const status = data.dates?.status?.code;
    const cheapestTicket =
      status === 'onsale' && data.priceRanges?.[0]?.min
        ? `$${data.priceRanges[0].min}`
        : 'Tickets not on sale';

    return NextResponse.json({
      cheapestTicket,
      url: data.url || 'URL not available',
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
