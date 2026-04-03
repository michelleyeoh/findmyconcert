import { NextRequest, NextResponse } from 'next/server';
import { processEvent } from '../_utils/processEvent';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const zipcode = searchParams.get('zipcode');

  if (!artist || !latitude || !longitude || !zipcode) {
    return NextResponse.json(
      { error: 'Valid zipcode and artist are required' },
      { status: 400 }
    );
  }

  try {
    // Get events from Ticketmaster API
    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?size=1&radius=500&unit=miles&latlong=${latitude},${longitude}&keyword=${artist}&apikey=${process.env.TICKETMASTER_KEY}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch events from Ticketmaster API: ${response.statusText}`
      );
    }
    const data = await response.json();
    const events = data._embedded?.events;

    if (!events || events.length === 0) {
      return NextResponse.json({ event: null });
    }

    // Process event
    const processedEvent = await processEvent(events[0], zipcode);

    return NextResponse.json({ events: [processedEvent] });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
