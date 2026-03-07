'use client'

import styles from "./page.module.scss";
import { useEffect, useState } from "react";

export default function Discover() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const eventData = sessionStorage.getItem('eventData');
        if (eventData) {
            setEvents(JSON.parse(eventData));
            sessionStorage.removeItem('eventData');
        }
    }, []);

    return (
        <div className={styles.page}>
            <h1>Concert Results</h1>
            {events.length > 0 ? (
                events.map((event: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                    <div key={event.id}>
                        <h2>{event.concertName}</h2>
                        <p><strong>Artist:</strong> {event.artist}</p>
                        <p><strong>Date:</strong> {event.date}</p>
                        <p><strong>Venue:</strong> {event.venue.name}</p>
                        <p><strong>Location:</strong> {event.venue.city}, {event.venue.state}</p>
                        <p><strong>Tickets:</strong> {event.cheapestTicket}</p>
                        <p><strong>Parking:</strong> {event.parkingInfo}</p>
                        {event.cheapestTicket !== 'Tickets not on sale' && event.cheapestTicket !== 'Price TBA' && (
                            <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                                Buy Tickets
                            </a>
                        )}
                        {event.directions?.routes?.[0]?.legs?.[0] ? (
                            <div className={styles.routeSummary}>
                                <p>🚗 <strong>{event.directions.routes[0].legs[0].duration.text}</strong> drive ({event.directions.routes[0].legs[0].distance.text}): </p>
                                <a 
                                href={`https://www.google.com/maps/dir/?api=1&origin=${event.venue.postalCode}&destination=${event.venue.location.latitude},${event.venue.location.longitude}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.mapLink}
                                >
                                View Full Directions on Google Maps
                                </a>
                            </div>
                            ) : (
                            <p><strong>Directions:</strong> Directions unavailable</p>
                        )}
                    </div>
                ))
            ) : (
                <p>No events found.</p>
            )}
        </div>
    );
}