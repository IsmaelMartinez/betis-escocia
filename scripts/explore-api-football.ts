/**
 * API-Football Data Explorer
 * Explores what data is actually available for Real Betis
 */

import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function exploreApiFootball() {
  const config = {
    apiKey: process.env.API_FOOTBALL_KEY!,
    baseUrl: 'https://v3.football.api-sports.io',
    headers: {
      'X-RapidAPI-Key': process.env.API_FOOTBALL_KEY!,
      'X-RapidAPI-Host': 'v3.football.api-sports.io',
    },
  };

  console.log('🔍 API-Football Data Explorer');
  console.log('===============================\n');

  try {
    // 1. Check available seasons for La Liga
    console.log('1. Checking available La Liga seasons...');
    const seasonsResponse = await axios.get(`${config.baseUrl}/leagues/seasons`, {
      headers: config.headers,
    });
    const seasons = seasonsResponse.data.response;
    console.log(`   Available seasons: ${seasons.slice(-5).join(', ')} (showing last 5)`);
    
    // 2. Get La Liga info
    console.log('\n2. Checking La Liga league info...');
    const leagueResponse = await axios.get(`${config.baseUrl}/leagues`, {
      headers: config.headers,
      params: {
        id: 140, // La Liga
        season: 2024,
      },
    });
    console.log(`   La Liga 2024: ${leagueResponse.data.response[0]?.league?.name}`);
    console.log(`   Current season: ${leagueResponse.data.response[0]?.seasons?.[0]?.year}`);

    // 3. Try to find ANY Real Betis matches
    console.log('\n3. Searching for Real Betis matches across seasons...');
    const recentSeasons = [2024, 2023, 2022];
    
    for (const season of recentSeasons) {
      try {
        const matchesResponse = await axios.get(`${config.baseUrl}/fixtures`, {
          headers: config.headers,
          params: {
            team: 543,
            season: season,
            last: 5,
          },
        });
        
        const matches = matchesResponse.data.response;
        console.log(`   Season ${season}: ${matches?.length || 0} matches found`);
        
        if (matches && matches.length > 0) {
          const latestMatch = matches[0];
          console.log(`   Latest match: ${latestMatch.teams.home.name} vs ${latestMatch.teams.away.name}`);
          console.log(`   Date: ${latestMatch.fixture.date}`);
          console.log(`   Status: ${latestMatch.fixture.status.long}`);
          
          // Try to get statistics for this match
          const statsResponse = await axios.get(`${config.baseUrl}/fixtures/statistics`, {
            headers: config.headers,
            params: { fixture: latestMatch.fixture.id },
          });
          
          if (statsResponse.data.response?.length) {
            console.log(`   ✅ Statistics available for match ${latestMatch.fixture.id}`);
            const stats = statsResponse.data.response[0].statistics;
            console.log(`   Sample stats: ${stats.slice(0, 3).map((s: any) => s.type).join(', ')}`);
          } else {
            console.log(`   ❌ No statistics available for match ${latestMatch.fixture.id}`);
          }
          
          break; // Found matches, stop searching
        }
      } catch (error) {
        console.log(`   Season ${season}: Error - ${error instanceof Error ? error.message : 'Unknown'}`);
      }
      
      // Delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 4. Check what endpoints are available with free plan
    console.log('\n4. Testing endpoint availability...');
    
    const endpoints = [
      { name: 'Teams', url: '/teams', params: { search: 'Real Betis' } },
      { name: 'Leagues', url: '/leagues', params: { id: 140 } },
      { name: 'Standings', url: '/standings', params: { league: 140, season: 2024 } },
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${config.baseUrl}${endpoint.url}`, {
          headers: config.headers,
          params: endpoint.params,
        });
        
        console.log(`   ✅ ${endpoint.name}: ${response.data.response?.length || 0} results`);
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: Failed`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 5. Check account usage
    console.log('\n5. Checking API usage...');
    const statusResponse = await axios.get(`${config.baseUrl}/status`, {
      headers: config.headers,
    });
    
    const usage = statusResponse.data.response.requests;
    console.log(`   Requests used: ${usage.current}/${usage.limit_day}`);
    console.log(`   Requests remaining: ${usage.limit_day - usage.current}`);

  } catch (error) {
    console.error('❌ Explorer failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

if (require.main === module) {
  exploreApiFootball().catch(console.error);
}
