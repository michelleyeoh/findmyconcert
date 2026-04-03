import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

describe('fetchWebApi', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    process.env.SPOTIFY_CLIENT_ID = 'client-id';
    process.env.SPOTIFY_CLIENT_SECRET = 'client-secret';
    process.env.SPOTIFY_REFRESH_TOKEN = 'refresh-token';
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('refreshes token and calls Spotify API with access token', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({ access_token: 'abc123' }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ ok: true }),
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    const { fetchWebApi } = await import('./spotify');
    const result = await fetchWebApi('v1/me/top/artists', 'GET', { limit: 10 });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://accounts.spotify.com/api/token',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from('client-id:client-secret').toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: 'refresh-token',
        }),
      }),
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.spotify.com/v1/me/top/artists',
      {
        headers: {
          Authorization: 'Bearer abc123',
        },
        method: 'GET',
        body: JSON.stringify({ limit: 10 }),
      },
    );
  });

  it('does not send a body when body is not provided', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({ access_token: 'token-2' }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ items: [] }),
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    const { fetchWebApi } = await import('./spotify');
    await fetchWebApi('v1/me', 'GET');

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.spotify.com/v1/me',
      {
        headers: {
          Authorization: 'Bearer token-2',
        },
        method: 'GET',
        body: undefined,
      },
    );
  });
});
