import {
  EventDetails,
  ProcessEventInput,
  Venue,
  EventDirections,
  EventItem,
} from '../../_types/event';

// Helper function to structure event data return
function eventData(
  event: ProcessEventInput,
  venue: Venue | undefined,
  parkingInfo: string,
  directions: EventDirections,
  eventDetails: EventDetails
): EventItem {
  return {
    id: event.id,
    concertName: event.name,
    artist: event._embedded?.attractions?.[0]?.name || event.name,
    date: event.dates?.start?.localDate || 'Date not available',
    time: event.dates?.start?.localTime,
    venue: {
      name: venue?.name || 'Venue not available',
      address: venue?.address?.line1,
      city: venue?.city?.name || 'City not available',
      state: venue?.state?.stateCode || 'State not available',
      postalCode: venue?.postalCode || 'Postal code not available',
      location: {
        latitude: venue?.location?.latitude || 'Latitude not available',
        longitude: venue?.location?.longitude || 'Longitude not available',
      },
    },
    ticketUrl: eventDetails.url,
    cheapestTicket: eventDetails.cheapestTicket,
    parkingInfo,
    distance: event.distance,
    directions,
  };
}

// Helper function to fetch event details including cheapest ticket info based on event ID
async function fetchEventDetails(eventId: string): Promise<EventDetails> {
  try {
    const baseUrl = process.env.BASE_URL;
    const response = await fetch(`${baseUrl}/api/event-details/${eventId}`);
    return await response.json();
  } catch {
    return {
      cheapestTicket: 'Price TBA',
      url: `https://www.ticketmaster.com/event/${eventId}`,
    };
  }
}

// Helper function to fetch directions data based on user's zipcode and venue location
async function fetchDirections(
  zipcode: string,
  latitude?: string,
  longitude?: string
): Promise<EventDirections> {
  if (!latitude || !longitude) return {};

  try {
    const baseUrl = process.env.BASE_URL;
    const [transitResponse, drivingResponse] = await Promise.all([
      fetch(
        `${baseUrl}/api/directions?origin=${zipcode}&latitude=${latitude}&longitude=${longitude}&mode=transit`
      ),
      fetch(
        `${baseUrl}/api/directions?origin=${zipcode}&latitude=${latitude}&longitude=${longitude}&mode=driving`
      ),
    ]);

    const [transitDirections, drivingDirections] = await Promise.all([
      transitResponse.json(),
      drivingResponse.json(),
    ]);

    return {
      transit: transitDirections,
      driving: drivingDirections,
    };
  } catch {
    return {};
  }
}

// Helper function to fetch parking info based on venue ID
async function fetchVenueData(venueId?: string): Promise<string> {
  if (!venueId) return 'Venue info not available';

  try {
    const baseUrl = process.env.BASE_URL;
    const response = await fetch(`${baseUrl}/api/venues/${venueId}`);
    const venueData = await response.json();

    // If response is a string, return it directly, otherwise extract parkingInfo from the object
    return typeof venueData === 'string'
      ? venueData
      : venueData?.parkingInfo || 'Parking info not available';
  } catch {
    return 'Parking info not available';
  }
}

// Main function to process event data, fetch venue details, directions, and ticket info
export async function processEvent(event: ProcessEventInput, zipcode: string) {
  const venue = event._embedded?.venues?.[0];

  const [parkingInfo, directionsData, eventDetails] = await Promise.all([
    fetchVenueData(venue?.id),
    fetchDirections(
      zipcode,
      venue?.location?.latitude,
      venue?.location?.longitude
    ),
    fetchEventDetails(event.id),
  ]);

  return eventData(event, venue, parkingInfo, directionsData, eventDetails);
}
