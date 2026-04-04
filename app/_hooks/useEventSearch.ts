'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useEventSearch() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    zipcode: '',
    artist: '',
  });
  const [spotifyArtists, setSpotifyArtists] = useState<
    { id: string; name: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: 'artist' | 'zipcode', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSpotifySync = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/spotify/top-artists');
      const data = await res.json();
      setSpotifyArtists(data);
    } catch (err) {
      console.error('Spotify sync failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectArtist = (name: string) => {
    setFormData((prev) => ({ ...prev, artist: name }));
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
      const response = await fetch(
        `https://api.zippopotam.us/us/${formData.zipcode}`
      );
      const data = await response.json();
      latitude = data.places[0].latitude;
      longitude = data.places[0].longitude;
      console.log(latitude, longitude);
    } catch (error) {
      console.error('Error fetching zipcode:', error);
    }

    try {
      const response = await fetch(
        `/api/events?artist=${formData.artist}&zipcode=${formData.zipcode}&latitude=${latitude}&longitude=${longitude}`
      );
      const data = await response.json();

      if (data.events && data.events.length > 0) {
        sessionStorage.setItem('eventData', JSON.stringify(data.events));
        sessionStorage.setItem('originZipcode', formData.zipcode);
        router.push('/discover');
      } else {
        console.log('No events found');
        router.push('/discover');
      }
    } catch (error) {
      console.error('Error:', error);
    }

    //reset form
    setFormData({ zipcode: '', artist: '' });
  };

  return {
    formData,
    spotifyArtists,
    isLoading,
    handleInputChange,
    handleSpotifySync,
    selectArtist,
    handleSubmit,
  };
}
