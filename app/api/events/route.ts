import { NextRequest, NextResponse } from 'next/server';

function eventData(event: any, venue: any, parkingInfo: string, directions: any, eventDetails: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    id: event.id,
    concertName: event.name,
    artist: event._embedded?.attractions?.[0]?.name || event.name,
    date: event.dates?.start?.localDate,
    time: event.dates?.start?.localTime,
    venue: {
      name: venue?.name,
      address: venue?.address?.line1,
      city: venue?.city?.name,
      state: venue?.state?.stateCode,
      postalCode: venue?.postalCode,
      location: {
        latitude: venue?.location?.latitude,
        longitude: venue?.location?.longitude
      }
    },
    ticketUrl: eventDetails.url,
    cheapestTicket: eventDetails.cheapestTicket,
    parkingInfo,
    distance: event.distance || null,
    directions
  };
}

async function fetchEventDetails(eventId: string) {
  try {
    const baseUrl = process.env.BASE_URL;
    const response = await fetch(`${baseUrl}/api/event-details/${eventId}`);
    return await response.json();
  } catch {
    return { cheapestTicket: 'Price TBA', url: `https://www.ticketmaster.com/event/${eventId}` };
  }
}

async function fetchDirections(zipcode: string, latitude: string, longitude: string) {
  if (!latitude || !longitude) return { directions: 'Directions not available' };

  try {
    const baseUrl = process.env.BASE_URL;
    const [transitResponse, drivingResponse] = await Promise.all([
      fetch(`${baseUrl}/api/directions?origin=${zipcode}&latitude=${latitude}&longitude=${longitude}&mode=transit`),
      fetch(`${baseUrl}/api/directions?origin=${zipcode}&latitude=${latitude}&longitude=${longitude}&mode=driving`)
    ]);

    const [transitDirections, drivingDirections] = await Promise.all([
      transitResponse.json(),
      drivingResponse.json()
    ]);

    return {
      transit: transitDirections,
      driving: drivingDirections
    };
  } catch {
  return { directions: 'Direction info not available' };
  }
}

async function fetchVenueData(venueId: string) {
  if (!venueId) return { parkingInfo: 'Venue info not available' };

  try {
    const baseUrl = process.env.BASE_URL;
    const response = await fetch(`${baseUrl}/api/venues/${venueId}`);
    return await response.json();
  } catch {
    return { parkingInfo: 'Parking info not available' };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processEvent(event: any, zipcode: string) {
  const venue = event._embedded?.venues?.[0];

  const [venueData, directionsData, eventDetails] = await Promise.all([
    fetchVenueData(venue?.id),
    fetchDirections(zipcode, venue?.location?.latitude, venue?.location?.longitude),
    fetchEventDetails(event.id)
  ]);

  return eventData(event, venue, venueData.parkingInfo, directionsData, eventDetails)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const zipcode = searchParams.get('zipcode');

  if (!artist || !latitude || !longitude || !zipcode) {
    return NextResponse.json({ error: 'Valid zipcode and artist are required' }, { status: 400 });
  }

  try {
    // Get events from Ticketmaster API
    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?size=1&radius=500&unit=miles&latlong=${latitude},${longitude}&keyword=${artist}&apikey=${process.env.TICKETMASTER_KEY}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch events from Ticketmaster API: ${response.statusText}`);
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}