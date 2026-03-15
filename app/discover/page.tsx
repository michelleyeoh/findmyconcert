'use client'

import styles from "./page.module.scss";
import { useEffect, useState } from "react";
import { TbBrowserShare } from "react-icons/tb";

type EventItem = {
    id: string;
    concertName: string;
    artist: string;
    date: string;
    cheapestTicket: string;
    parkingInfo: string;
    ticketUrl?: string;
    venue: {
        name: string;
        city: string;
        state: string;
        postalCode: string;
        location: {
            latitude: string;
            longitude: string;
        };
    };
    directions?: {
        routes?: Array<{
            legs?: Array<{
                duration: { text: string };
                distance: { text: string };
            }>;
        }>;
    };
};

export default function Discover() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [originZipcode, setOriginZipcode] = useState('');

    useEffect(() => {
        const eventData = sessionStorage.getItem('eventData');
        const savedOriginZipcode = sessionStorage.getItem('originZipcode');
        if (eventData) {
            setEvents(JSON.parse(eventData));
            sessionStorage.removeItem('eventData');
        }
        if (savedOriginZipcode) {
            setOriginZipcode(savedOriginZipcode);
            sessionStorage.removeItem('originZipcode');
        }
    }, []);

    return (
        <div className={styles.page}>
            {events.length > 0 ? (
                events.map((event: EventItem) => (
                    <section key={event.id} className={styles.eventRow}>
                        <div className={styles.detailsPanel}>
                            <h2 className={styles.divider}>{event.concertName}</h2>
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
                                        href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originZipcode || event.venue.postalCode)}&destination=${event.venue.location.latitude},${event.venue.location.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.mapLink}
                                    >
                                        <TbBrowserShare /> {' '}
                                        View Full Directions on Google Maps
                                    </a>
                                </div>
                            ) : (
                                <p><strong>Directions:</strong> Directions unavailable</p>
                            )}
                        </div>
                        <div className={styles.mapPanel}>
                            {event.directions?.routes?.[0]?.legs?.[0] ? (
                                <iframe
                                    className={styles.mapFrame}
                                    style={{ border: 0 }}
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps?q=${encodeURIComponent(`${originZipcode || event.venue.postalCode} to ${event.venue.location.latitude},${event.venue.location.longitude}`)}&output=embed`}
                                    allowFullScreen
                                    loading="lazy"
                                    title={`Directions to ${event.venue.name}`}
                                />
                            ) : (
                                <p className={styles.noMap}>Map unavailable for this event.</p>
                            )}
                        </div>
                    </section>
                ))
            ) : (
                <p>No events found.</p>
            )}
        </div>
    );
}