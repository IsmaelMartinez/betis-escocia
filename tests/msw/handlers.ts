import { http, HttpResponse } from 'msw';

// Example handlers for external APIs used in tests
// Extend this file with more endpoints as needed.

export const footballApiHandlers = [
  // Football Data API standings endpoint (example)
  http.get('https://api.football-data.org/v4/competitions/PD/standings', ({ request }) => {
    const url = new URL(request.url);
    const season = url.searchParams.get('season') || '2024';
    // Minimal plausible shape as used by the service
    return HttpResponse.json({
      standings: [
        {
          table: [
            { position: 1, team: { id: 86, name: 'Real Madrid' } },
            { position: 2, team: { id: 81, name: 'FC Barcelona' } },
            { position: 7, team: { id: 90, name: 'Real Betis' } },
          ],
          season,
        },
      ],
    });
  }),
];

// Notifications endpoints are handled via OneSignal/browser APIs in-app; no MSW handlers needed

export const errorHandlers = [
  http.get('https://api.football-data.org/v4/competitions/PD/standings', () =>
    HttpResponse.json({ message: 'Rate limit' }, { status: 429 })
  ),
];

export const handlers = [...footballApiHandlers];
