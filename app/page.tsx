'use client'

import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMapPin, FiSearch } from "react-icons/fi";

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    zipcode: '',
    artist: ''
  });
  const [spotifyArtists, setSpotifyArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSpotifySync = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/spotify/top-artists');
      const data = await res.json();
      setSpotifyArtists(data);
    } catch (err) {
      console.error("Spotify sync failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectArtist = (name: string) => {
    setFormData(prev => ({ ...prev, artist: name }));
    setSpotifyArtists([]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.artist.trim() || !formData.zipcode.trim()) {
      alert('Please enter both artist and zipcode!');
    return;
  }

    let latitude: string = '';
    let longitude: string = '';
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${formData.zipcode}`);
      const data = await response.json();
      latitude = data.places[0].latitude;
      longitude = data.places[0].longitude;
      console.log(latitude, longitude);
    } catch (error) {
      console.error('Error fetching zipcode:', error);
    }

    try {
      const response = await fetch(`/api/events?artist=${formData.artist}&zipcode=${formData.zipcode}&latitude=${latitude}&longitude=${longitude}`);
      const data = await response.json();

      if (data.events && data.events.length > 0) {
        sessionStorage.setItem('eventData', JSON.stringify(data.events));
        sessionStorage.setItem('originZipcode', formData.zipcode);
        router.push('/discover');
      } else {
        console.log('No events found');
        //TODO: display not found popup
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
            onClick={handleSpotifySync}
            className={styles.secondary}
          >
            <Image
              className={styles.logo}
              src="/spotify_logo.png"
              alt="Spotify logo"
              width={20}
              height={20}
            />
            {isLoading ? 'Syncing...' : 'Sync with Spotify'}
          </a>
        </div>

        {spotifyArtists.length > 0 && (
          <div className={styles.artistPicker}>
            <h3>Select an artist:</h3>
            <div className={styles.chipContainer}>
              {spotifyArtists.map(artist => (
                <button 
                type="button"
                  key={artist.id} 
                  onClick={() => selectArtist(artist.name)}
                  className={styles.artistChip}
                >
                  {artist.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <p>or</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.formField}>
            <span className={styles.formLabel}>Artist</span>
            <div className={styles.inputShell}>
              <FiSearch className={styles.inputIcon} aria-hidden="true" />
              <input
                className={styles.formInput}
                type="text"
                placeholder="BTS"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              />
            </div>
          </label>
          <label className={styles.formField}>
            <span className={styles.formLabel}>ZipCode</span>
            <div className={styles.inputShell}>
              <FiMapPin className={styles.inputIcon} aria-hidden="true" />
              <input
                className={styles.formInput}
                type="text"
                inputMode="numeric"
                placeholder="95616"
                value={formData.zipcode}
                onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
              />
            </div>
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
