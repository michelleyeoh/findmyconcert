import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };
const testingFilePath = '../app/api/_utils/processEvent';

describe('processEvent', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.BASE_URL = 'http://localhost:3000';
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('combines venue, directions, and event details data', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({
          parkingInfo: 'Garage parking available',
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          routes: [
            {
              legs: [
                { duration: { text: '45 mins' }, distance: { text: '22 mi' } },
              ],
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          routes: [
            {
              legs: [
                { duration: { text: '25 mins' }, distance: { text: '19 mi' } },
              ],
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          cheapestTicket: '$89',
          url: 'https://tickets.example/event-1',
        }),
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    const { processEvent } = await import(testingFilePath);

    const result = await processEvent(
      {
        id: 'event-1',
        name: 'The Concert',
        distance: '15',
        dates: {
          start: {
            localDate: '2026-08-01',
            localTime: '20:00:00',
          },
        },
        _embedded: {
          attractions: [{ name: 'The Band' }],
          venues: [
            {
              id: 'venue-1',
              name: 'Big Arena',
              address: { line1: '123 Main St' },
              city: { name: 'Los Angeles' },
              state: { stateCode: 'CA' },
              postalCode: '90001',
              location: {
                latitude: '34.0522',
                longitude: '-118.2437',
              },
            },
          ],
        },
      },
      '94103'
    );

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3000/api/venues/venue-1'
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3000/api/directions?origin=94103&latitude=34.0522&longitude=-118.2437&mode=transit'
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://localhost:3000/api/directions?origin=94103&latitude=34.0522&longitude=-118.2437&mode=driving'
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      'http://localhost:3000/api/event-details/event-1'
    );

    expect(result).toEqual({
      id: 'event-1',
      concertName: 'The Concert',
      artist: 'The Band',
      date: '2026-08-01',
      time: '20:00:00',
      venue: {
        name: 'Big Arena',
        address: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        location: {
          latitude: '34.0522',
          longitude: '-118.2437',
        },
      },
      ticketUrl: 'https://tickets.example/event-1',
      cheapestTicket: '$89',
      parkingInfo: 'Garage parking available',
      distance: '15',
      directions: {
        transit: {
          routes: [
            {
              legs: [
                {
                  duration: { text: '45 mins' },
                  distance: { text: '22 mi' },
                },
              ],
            },
          ],
        },
        driving: {
          routes: [
            {
              legs: [
                {
                  duration: { text: '25 mins' },
                  distance: { text: '19 mi' },
                },
              ],
            },
          ],
        },
      },
    });
  });

  it('uses fallback values when venue data, directions, or event details are unavailable', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network error'));

    global.fetch = fetchMock as unknown as typeof fetch;

    const { processEvent } = await import(testingFilePath);

    const result = await processEvent(
      {
        id: 'event-2',
        name: 'Fallback Show',
        _embedded: {
          venues: [
            {
              name: 'Unknown Venue',
              city: { name: 'Unknown City' },
              state: { stateCode: 'NA' },
              postalCode: '00000',
            },
          ],
        },
      },
      '10001'
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/event-details/event-2'
    );

    expect(result).toEqual({
      id: 'event-2',
      concertName: 'Fallback Show',
      artist: 'Fallback Show',
      date: undefined,
      time: undefined,
      venue: {
        name: 'Unknown Venue',
        address: undefined,
        city: 'Unknown City',
        state: 'NA',
        postalCode: '00000',
        location: {
          latitude: undefined,
          longitude: undefined,
        },
      },
      ticketUrl: 'https://www.ticketmaster.com/event/event-2',
      cheapestTicket: 'Price TBA',
      parkingInfo: 'Venue info not available',
      distance: null,
      directions: {
        directions: 'Directions not available',
      },
    });
  });
});
