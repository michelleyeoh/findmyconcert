export type TravelMode = 'transit' | 'driving';

export interface RouteLeg {
	duration: { text: string };
	distance: { text: string };
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
