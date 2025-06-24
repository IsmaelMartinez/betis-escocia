/**
 * API-Football Integration Test
 * Tests comprehensive football data available through API-Football (RapidAPI)
 * 
 * Run this script with: npm run test-api-football
 */

// Load environment variables from .env.local
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

interface ApiTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

interface LeagueInfo {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
}

interface TeamInfo {
  id: number;
  name: string;
  code: string;
  country: string;
  founded: number;
  national: boolean;
  logo: string;
}

interface FixtureInfo {
  id: number;
  referee: string;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first: number;
    second: number;
  };
  venue: {
    id: number;
    name: string;
    city: string;
  };
  status: {
    long: string;
    short: string;
    elapsed: number;
  };
}

interface MatchData {
  fixture: FixtureInfo;
  league: LeagueInfo;
  teams: {
    home: TeamInfo;
    away: TeamInfo;
  };
  goals: {
    home: number;
    away: number;
  };
  score: {
    halftime: {
      home: number;
      away: number;
    };
    fulltime: {
      home: number;
      away: number;
    };
    extratime: {
      home: number;
      away: number;
    };
    penalty: {
      home: number;
      away: number;
    };
  };
}

/**
 * API-Football configuration
 * Get free API key from: https://dashboard.api-football.com/register
 */
function getApiFootballConfig() {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error(
      'API_FOOTBALL_KEY is required. Please register at https://dashboard.api-football.com/register and add your API key to .env.local'
    );
  }

  return {
    apiKey,
    baseUrl: 'https://v3.football.api-sports.io',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'v3.football.api-sports.io',
    },
  };
}

/**
 * Test API connectivity
 */
async function testApiConnectivity(): Promise<ApiTestResult> {
  try {
    const config = getApiFootballConfig();
    
    const response = await axios.get(`${config.baseUrl}/status`, {
      headers: config.headers,
    });

    if (response.status !== 200) {
      return {
        success: false,
        message: 'API connectivity failed',
        error: `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      message: 'API-Football connectivity successful',
      data: {
        account: response.data.response.account,
        subscription: response.data.response.subscription,
        requests: response.data.response.requests,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'API connectivity failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Find Real Betis team ID and information
 */
async function findRealBetis(): Promise<ApiTestResult> {
  try {
    const config = getApiFootballConfig();
    
    // Search for Real Betis
    const response = await axios.get(`${config.baseUrl}/teams`, {
      headers: config.headers,
      params: {
        search: 'Real Betis',
      },
    });

    if (response.status !== 200 || !response.data.response?.length) {
      return {
        success: false,
        message: 'Real Betis team not found',
        error: `No teams found matching "Real Betis"`,
      };
    }

    const betisTeam = response.data.response[0].team;
    
    return {
      success: true,
      message: 'Real Betis found successfully',
      data: {
        id: betisTeam.id,
        name: betisTeam.name,
        code: betisTeam.code,
        country: betisTeam.country,
        founded: betisTeam.founded,
        logo: betisTeam.logo,
        venue: response.data.response[0].venue,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Real Betis search failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test La Liga fixtures and comprehensive match data
 */
async function testLaLigaMatches(): Promise<ApiTestResult> {
  try {
    const config = getApiFootballConfig();
    
    // Search across multiple seasons to find available data
    const seasonsToCheck = [2024, 2023, 2022, 2021];
    let foundMatches: any[] = [];
    let foundSeason = 0;
    
    for (const season of seasonsToCheck) {
      try {
        const response = await axios.get(`${config.baseUrl}/fixtures`, {
          headers: config.headers,
          params: {
            league: 140, // La Liga league ID
            season: season,
            team: 543, // Real Betis team ID
            status: 'FT', // Only finished matches
          },
        });

        if (response.status === 200 && response.data.response?.length > 0) {
          foundMatches = response.data.response;
          foundSeason = season;
          break;
        }
      } catch (error) {
        // Continue to next season if this one fails
        continue;
      }
    }
    
    if (foundMatches.length === 0) {
      return {
        success: false,
        message: 'No La Liga matches found in any recent season',
        data: {
          seasonsChecked: seasonsToCheck,
          matchesFound: 0,
        },
      };
    }
    
    return {
      success: true,
      message: `La Liga matches retrieved successfully from ${foundSeason} season`,
      data: {
        matchesFound: foundMatches.length,
        season: foundSeason,
        matches: foundMatches.slice(0, 5).map((match: any) => ({
          id: match.fixture.id,
          date: match.fixture.date,
          homeTeam: match.teams.home.name,
          awayTeam: match.teams.away.name,
          homeScore: match.goals.home,
          awayScore: match.goals.away,
          status: match.fixture.status.long,
          venue: match.fixture.venue.name,
          referee: match.fixture.referee,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'La Liga matches retrieval failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test detailed match statistics (the key differentiator)
 */
async function testMatchStatistics(): Promise<ApiTestResult> {
  try {
    const config = getApiFootballConfig();
    
    // Get recent Real Betis matches from multiple seasons
    let matches = [];
    const seasonsToCheck = [2024, 2023, 2022, 2021];
    
    // Try seasons to find finished matches
    for (const season of seasonsToCheck) {
      try {
        const fixturesResponse = await axios.get(`${config.baseUrl}/fixtures`, {
          headers: config.headers,
          params: {
            team: 543, // Real Betis team ID
            season: season,
            status: 'FT', // Finished matches only
            league: 140, // La Liga
          },
        });
        
        matches = fixturesResponse.data.response || [];
        if (matches.length > 0) break;
      } catch {
        continue; // Try next season
      }
    }

    if (!matches.length) {
      return {
        success: false,
        message: 'No finished matches found for statistics test across seasons',
        data: { seasonsChecked: seasonsToCheck },
      };
    }

    const matchId = matches[0].fixture.id;
    
    // Get detailed match statistics
    const statsResponse = await axios.get(`${config.baseUrl}/fixtures/statistics`, {
      headers: config.headers,
      params: {
        fixture: matchId,
      },
    });

    return {
      success: true,
      message: 'Match statistics retrieved successfully',
      data: {
        matchId,
        homeTeam: matches[0].teams.home.name,
        awayTeam: matches[0].teams.away.name,
        matchDate: matches[0].fixture.date,
        statistics: statsResponse.data.response?.map((team: any) => ({
          team: team.team.name,
          statistics: team.statistics.reduce((acc: any, stat: any) => {
            acc[stat.type] = stat.value;
            return acc;
          }, {}),
        })) || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Match statistics retrieval failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test lineups and player data
 */
async function testLineups(): Promise<ApiTestResult> {
  try {
    const config = getApiFootballConfig();
    
    // Get recent Real Betis match for lineups test
    let matches = [];
    const seasonsToCheck = [2024, 2023, 2022, 2021];
    
    for (const season of seasonsToCheck) {
      try {
        const fixturesResponse = await axios.get(`${config.baseUrl}/fixtures`, {
          headers: config.headers,
          params: {
            team: 543, // Real Betis team ID
            season: season,
            status: 'FT',
            league: 140, // La Liga
          },
        });

        matches = fixturesResponse.data.response ?? [];
        if (matches.length > 0) break;
      } catch {
        continue;
      }
    }

    if (!matches.length) {
      return {
        success: false,
        message: 'No matches found for lineups test',
        data: { seasonsChecked: seasonsToCheck },
      };
    }

    const matchId = matches[0].fixture.id;
    
    // Get match lineups
    const lineupsResponse = await axios.get(`${config.baseUrl}/fixtures/lineups`, {
      headers: config.headers,
      params: {
        fixture: matchId,
      },
    });

    return {
      success: true,
      message: 'Match lineups retrieved successfully',
      data: {
        matchId,
        homeTeam: matches[0].teams.home.name,
        awayTeam: matches[0].teams.away.name,
        lineups: lineupsResponse.data.response?.map((team: any) => ({
          team: team.team.name,
          formation: team.formation,
          coach: team.coach.name,
          startXI: team.startXI.slice(0, 3).map((player: any) => ({
            name: player.player.name,
            number: player.player.number,
            position: player.player.pos,
          })),
          substitutes: team.substitutes.slice(0, 3).map((player: any) => ({
            name: player.player.name,
            number: player.player.number,
            position: player.player.pos,
          })),
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Match lineups retrieval failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test match events (goals, cards, substitutions)
 */
async function testMatchEvents(): Promise<ApiTestResult> {
  try {
    const config = getApiFootballConfig();
    
    // Get recent Real Betis match for events test
    let matches = [];
    const seasonsToCheck = [2024, 2023, 2022, 2021];
    
    for (const season of seasonsToCheck) {
      try {
        const fixturesResponse = await axios.get(`${config.baseUrl}/fixtures`, {
          headers: config.headers,
          params: {
            team: 543, // Real Betis team ID
            season: season,
            status: 'FT',
            league: 140, // La Liga
          },
        });

        matches = fixturesResponse.data.response ?? [];
        if (matches.length > 0) break;
      } catch {
        continue;
      }
    }

    if (!matches.length) {
      return {
        success: false,
        message: 'No matches found for events test',
        data: { seasonsChecked: seasonsToCheck },
      };
    }

    const matchId = matches[0].fixture.id;
    
    // Get match events
    const eventsResponse = await axios.get(`${config.baseUrl}/fixtures/events`, {
      headers: config.headers,
      params: {
        fixture: matchId,
      },
    });

    return {
      success: true,
      message: 'Match events retrieved successfully',
      data: {
        matchId,
        homeTeam: matches[0].teams.home.name,
        awayTeam: matches[0].teams.away.name,
        events: eventsResponse.data.response?.slice(0, 5).map((event: any) => ({
          time: event.time.elapsed,
          team: event.team.name,
          player: event.player.name,
          type: event.type,
          detail: event.detail,
          comments: event.comments,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Match events retrieval failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Main test runner
 */
async function runApiFootballTests() {
  console.log('🚀 API-Football Comprehensive Data Test');
  console.log('==========================================\n');

  // Check environment configuration
  try {
    const config = getApiFootballConfig();
    console.log('✅ Environment configuration loaded');
    console.log(`   Base URL: ${config.baseUrl}`);
    console.log(`   API Key: ${config.apiKey.substring(0, 8)}...`);
    console.log('');
  } catch (error) {
    console.error('❌ Environment configuration error:');
    console.error(`   ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('   Please add API_FOOTBALL_KEY to your .env.local file');
    console.error('   Register at: https://dashboard.api-football.com/register');
    process.exit(1);
  }

  // Run comprehensive tests
  const tests = [
    { name: 'API Connectivity & Account', test: testApiConnectivity },
    { name: 'Real Betis Team Search', test: findRealBetis },
    { name: 'La Liga Matches', test: testLaLigaMatches },
    { name: 'Match Statistics', test: testMatchStatistics },
    { name: 'Match Lineups', test: testLineups },
    { name: 'Match Events', test: testMatchEvents },
  ];

  let allPassed = true;
  let comprehensiveDataAvailable = true;

  for (const { name, test } of tests) {
    console.log(`Testing ${name}...`);
    const result = await test();
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      if (result.data) {
        console.log(`   Data:`, JSON.stringify(result.data, null, 2));
      }
    } else {
      console.log(`❌ ${result.message}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      // Mark as failed, but continue testing
      allPassed = false;
      if (name.includes('Statistics') || name.includes('Lineups') || name.includes('Events')) {
        comprehensiveDataAvailable = false;
      }
    }
    console.log('');
    
    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary and recommendation
  console.log('==========================================');
  if (allPassed && comprehensiveDataAvailable) {
    console.log('🎉 ALL TESTS PASSED! API-Football provides comprehensive data.');
    console.log('   ✅ Full PRD implementation possible');
    console.log('   ✅ Player statistics, lineups, and match events available');
    console.log('   ✅ Detailed match information for enhanced user experience');
    console.log('');
    console.log('🚀 RECOMMENDATION: Switch to API-Football for full feature set');
  } else if (allPassed) {
    console.log('✅ Basic tests passed, but some enhanced features may be limited.');
  } else {
    console.log('⚠️  Some tests failed. Please check your API key and account status.');
    console.log('   Make sure you have registered for API-Football at:');
    console.log('   https://dashboard.api-football.com/register');
  }
}

// Export for use in other modules
export {
  runApiFootballTests,
  testApiConnectivity,
  findRealBetis,
  testLaLigaMatches,
  testMatchStatistics,
  testLineups,
  testMatchEvents
};

// Run tests if this script is executed directly
if (require.main === module) {
  runApiFootballTests().catch(console.error);
}
