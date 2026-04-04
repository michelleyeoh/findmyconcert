import { NextRequest, NextResponse } from 'next/server';
import { EventDetails } from '@/app/_types/event';

// Input: GET /api/event-details/[id]
// Output: JSON with event details including cheapest ticket and URL
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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
    const payload: EventDetails = {
      cheapestTicket,
      url: data.url || 'URL not available',
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
