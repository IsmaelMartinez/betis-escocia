/**
 * Quick test of the teams/{id}/matches endpoint
 */
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testTeamEndpoint() {
  try {
    console.log('Testing teams/90/matches endpoint...');
    
    const response = await fetch('https://api.football-data.org/v4/teams/90/matches', {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Rate limit remaining:', response.headers.get('X-Requests-Available-Minute'));
    
    if (!response.ok) {
      const text = await response.text();
      console.log('Error response body:', text);
      
      if (response.status === 403) {
        console.log('\n❌ 403 Forbidden Error - This endpoint may not be available in the free tier');
        console.log('Let\'s try an alternative approach using competitions endpoint...');
        
        // Try alternative approach
        const altResponse = await fetch('https://api.football-data.org/v4/competitions/PD/matches?season=2024', {
          headers: {
            'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
            'Content-Type': 'application/json',
          },
        });
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          const betisMatches = altData.matches?.filter(match => 
            match.homeTeam.id === 90 || match.awayTeam.id === 90
          ) || [];
          
          console.log('✅ Alternative approach works!');
          console.log('Found', betisMatches.length, 'Betis matches via competitions endpoint');
          
          if (betisMatches[0]) {
            console.log('Sample match:', {
              id: betisMatches[0].id,
              date: betisMatches[0].utcDate,
              homeTeam: betisMatches[0].homeTeam.name,
              awayTeam: betisMatches[0].awayTeam.name,
              status: betisMatches[0].status
            });
          }
        }
      }
    } else {
      const data = await response.json();
      console.log('✅ Success! Matches found:', data.matches?.length || 0);
      
      if (data.matches?.[0]) {
        console.log('Sample match:', {
          id: data.matches[0].id,
          date: data.matches[0].utcDate,
          homeTeam: data.matches[0].homeTeam.name,
          awayTeam: data.matches[0].awayTeam.name,
          status: data.matches[0].status
        });
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testTeamEndpoint();
