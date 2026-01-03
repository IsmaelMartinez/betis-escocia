#!/usr/bin/env npx tsx
/**
 * Debug script for Clasificación feature
 * Run with: npx tsx scripts/debug-clasificacion.ts
 */

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';
const currentYear = new Date().getFullYear();

async function debugClasificacion() {
  console.log('=== Clasificación Debug Report ===\n');

  // 1. Check feature flag
  console.log('1. Feature Flag Check:');
  const featureFlag = process.env.NEXT_PUBLIC_FEATURE_CLASIFICACION;
  if (featureFlag === 'true') {
    console.log('   ✅ NEXT_PUBLIC_FEATURE_CLASIFICACION=true');
  } else {
    console.log('   ⚠️  NEXT_PUBLIC_FEATURE_CLASIFICACION is not set to "true"');
    console.log('   → The clasificación page will not be visible');
  }

  // 2. Check API key
  console.log('\n2. API Key Check:');
  if (!API_KEY) {
    console.log('   ❌ FOOTBALL_DATA_API_KEY is NOT SET');
    console.log('   → Set it in .env.local');
    console.log('\n   To get an API key:');
    console.log('   1. Go to https://www.football-data.org/');
    console.log('   2. Register for a free account');
    console.log('   3. Copy your API token from the account page');
    return;
  }

  const maskedKey = API_KEY.substring(0, 8) + '...' + API_KEY.substring(API_KEY.length - 4);
  console.log('   ✅ API Key present: ' + maskedKey);

  // 3. Test API connection
  console.log('\n3. Testing Football-Data.org API...');
  const url = `${BASE_URL}/competitions/PD/standings?season=${currentYear}`;
  console.log('   URL: ' + url);
  console.log('   Season: ' + currentYear);

  try {
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': API_KEY,
        'User-Agent': 'Betis-Escocia-Debug/1.0'
      }
    });

    console.log('\n4. Response Status: ' + response.status + ' ' + response.statusText);

    // Check rate limit headers
    const remaining = response.headers.get('X-Requests-Available-Minute');
    const limit = response.headers.get('X-RequestCounter-Reset');
    if (remaining) {
      console.log('   Requests remaining this minute: ' + remaining);
    }

    const data = await response.json();

    if (!response.ok) {
      console.log('\n   ❌ API Error:');
      console.log('   Message: ' + (data.message || JSON.stringify(data)));

      if (response.status === 403) {
        console.log('\n   Possible causes for 403 Forbidden:');
        console.log('   - API key is invalid or expired');
        console.log('   - Free tier: La Liga (PD) may require paid plan');
        console.log('   - Account has been suspended');
        console.log('\n   Action: Check your account at https://www.football-data.org/client/home');
      } else if (response.status === 429) {
        console.log('\n   Cause: Rate limit exceeded (10 requests/minute on free tier)');
        console.log('   Action: Wait 60 seconds and try again');
      } else if (response.status === 400) {
        console.log('\n   Cause: Bad request - possibly invalid season');
        console.log('   Current season value: ' + currentYear);
      }
      return;
    }

    console.log('\n   ✅ API Connection Successful!');

    // 5. Check standings data
    console.log('\n5. Standings Data:');
    if (data.standings && data.standings[0]?.table) {
      const table = data.standings[0].table;
      console.log('   Total teams: ' + table.length);

      interface TeamEntry {
        position: number;
        points: number;
        playedGames: number;
        won: number;
        draw: number;
        lost: number;
        team: { id: number; name: string };
      }

      const betis = table.find((t: TeamEntry) => t.team.id === 90);
      if (betis) {
        console.log('\n   📊 Real Betis Status:');
        console.log('   Position: ' + betis.position + '°');
        console.log('   Points: ' + betis.points);
        console.log('   Played: ' + betis.playedGames);
        console.log('   W/D/L: ' + betis.won + '/' + betis.draw + '/' + betis.lost);
      } else {
        console.log('   ⚠️  Real Betis (ID: 90) not found in standings');
      }

      // Show top 5
      console.log('\n   Top 5:');
      table.slice(0, 5).forEach((t: TeamEntry) => {
        console.log('   ' + t.position + '. ' + t.team.name + ' - ' + t.points + ' pts');
      });
    } else {
      console.log('   ⚠️  No standings data in response');
      console.log('   Response keys: ' + Object.keys(data).join(', '));
    }

    console.log('\n=== Debug Complete ===');

  } catch (error) {
    console.log('\n   ❌ Network Error:');
    if (error instanceof Error) {
      console.log('   ' + error.message);
      if (error.cause) {
        console.log('   Cause: ' + JSON.stringify(error.cause));
      }
    }
    console.log('\n   Possible causes:');
    console.log('   - No internet connection');
    console.log('   - Football-Data.org is down');
    console.log('   - Firewall/proxy blocking the request');
  }
}

debugClasificacion();
