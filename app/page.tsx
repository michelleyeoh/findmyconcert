'use client'

import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    zipcode: '',
    artist: ''
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(`/api/events?zipcode=${formData.zipcode}&artist=${formData.artist}`);
      const data = await response.json();

      if (data.events && data.events.length > 0) {
        const event = data.events[0]; // test get first event
        console.log('Artist:', event.artist)
        console.log('Concert:', event.concertName);
        console.log('Date:', event.date);
        console.log('Venue:', event.venue.name);
        console.log('Cheapest ticket:', event.cheapestTicket);
        console.log('Parking:', event.parkingInfo);
        console.log('Ticket Details:', event.ticketUrl);
      } else {
        console.log('No events found');
      }
    } catch (error) {
      console.error('Error:', error);
    }

    //reset form
    setFormData({ zipcode: '', artist: '' });
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>
          <h1>Find My Concert</h1>
          <p>Discover concerts near you!</p>
        </div>

        <div className={styles.ctas}>
          <a
            href="https://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            <Image
              className={styles.logo}
              src="/spotify_logo.png"
              alt="Spotify logo"
              width={20}
              height={20}
            />
            Sync with Spotify
          </a>
        </div>

        <p>or</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Artist:
            <input type="text"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })} />
          </label>
          <label>
            ZipCode:
            <input type="text"
              value={formData.zipcode}
              onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })} />
          </label>
          <button type="submit" className={styles.primary}>Find Now!</button>
        </form>
      </main>
      <footer className={styles.footer}>
        <p>made with &lt;3 by michelle</p>
      </footer>
    </div>
  );
}
