import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchWebApiMock = vi.fn();
const jsonMock = vi.fn((data: unknown, init?: { status?: number }) => ({ data, init }));

const routeFilePath = '../app/api/spotify/top-artists/route';

vi.mock('../app/api/_utils/spotify', () => ({
  fetchWebApi: fetchWebApiMock,
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: jsonMock,
  },
}));

describe('GET /api/spotify/top-artists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns top artists when spotify call succeeds', async () => {
    fetchWebApiMock.mockResolvedValue({
      items: [{ id: 'artist-1' }, { id: 'artist-2' }],
    });

    const { GET } = await import(routeFilePath);

    const response = await GET();

    expect(fetchWebApiMock).toHaveBeenCalledWith('v1/me/top/artists?limit=10', 'GET');
    expect(jsonMock).toHaveBeenCalledWith([{ id: 'artist-1' }, { id: 'artist-2' }]);
    expect(response).toEqual({
      data: [{ id: 'artist-1' }, { id: 'artist-2' }],
      init: undefined,
    });
  });

  it('returns 500 when spotify call fails', async () => {
    fetchWebApiMock.mockRejectedValue(new Error('spotify failed'));

    const { GET } = await import(routeFilePath);

    const response = await GET();

    expect(fetchWebApiMock).toHaveBeenCalledWith('v1/me/top/artists?limit=10', 'GET');
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to fetch' }, { status: 500 });
    expect(response).toEqual({
      data: { error: 'Failed to fetch' },
      init: { status: 500 },
    });
  });
});
