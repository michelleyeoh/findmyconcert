'use client';

import Image from 'next/image';
import styles from './page.module.css';
import { FiMapPin, FiSearch } from 'react-icons/fi';
import { useEventSearch } from './_hooks/useEventSearch';

export default function Home() {
  const {
    formData,
    spotifyArtists,
    isLoading,
    handleInputChange,
    handleSpotifySync,
    selectArtist,
    handleSubmit,
  } = useEventSearch();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>
          <h1>Find My Concert</h1>
          <p>Discover concerts near you!</p>
        </div>

        <div className={styles.ctas}>
          <a onClick={handleSpotifySync} className={styles.secondary}>
            <Image
              className={styles.logo}
              src="/spotify_logo.png"
              alt="Spotify logo"
              width={20}
              height={20}
            />
            {isLoading ? 'Syncing...' : "Sync with michelle's Spotify"}
          </a>
        </div>

        {spotifyArtists.length > 0 && (
          <div className={styles.artistPicker}>
            <h3>Select an artist:</h3>
            <div className={styles.chipContainer}>
              {spotifyArtists.map((artist) => (
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
                onChange={(e) => handleInputChange('artist', e.target.value)}
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
                onChange={(e) => handleInputChange('zipcode', e.target.value)}
              />
            </div>
          </label>
          <button type="submit" className={styles.primary}>
            Find Now!
          </button>
        </form>
      </main>
      <footer className={styles.footer}>
        <p>made with &lt;3 by michelle</p>
      </footer>
    </div>
  );
}
