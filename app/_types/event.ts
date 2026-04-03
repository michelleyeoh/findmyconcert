export type TravelMode = 'transit' | 'driving';

export interface RouteLeg {
  duration: {
    text: string;
  };
  distance: {
    text: string;
  };
}

export interface RouteInfo {
  legs?: RouteLeg[];
}

export interface ModeDirections {
  routes?: RouteInfo[];
}

export interface EventDirections {
  transit?: ModeDirections;
  driving?: ModeDirections;
}

export interface EventDetails {
  url: string;
  cheapestTicket: string;
}

export interface Venue {
  name?: string;
  address?: {
    line1?: string;
  };
  city?: {
    name?: string;
  };
  state?: {
    stateCode?: string;
  };
  postalCode?: string;
  location?: {
    latitude?: string;
    longitude?: string;
  };
}

export interface EventItem {
  id: string;
  concertName: string;
  artist: string;
  date: string;
  time?: string;
  cheapestTicket: string;
  parkingInfo: string;
  distance?: string | null;
  ticketUrl?: string;
  venue: {
    name: string;
    address?: string;
    city: string;
    state: string;
    postalCode: string;
    location: {
      latitude: string;
      longitude: string;
    };
  };
  directions?: EventDirections;
}

export interface ProcessEventInput {
  id: string;
  name: string;
  distance?: string;
  dates?: {
    start?: {
      localDate?: string;
      localTime?: string;
    };
  };
  _embedded?: {
    attractions?: Array<{
      name?: string;
    }>;
    venues?: Array<{
      id?: string;
      name?: string;
      address?: { line1?: string };
      city?: { name?: string };
      state?: { stateCode?: string };
      postalCode?: string;
      location?: {
        latitude?: string;
        longitude?: string;
      };
    }>;
  };
}
