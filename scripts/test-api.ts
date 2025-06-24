/**
 * API Connectivity Test Script
 * Tests Football-Data.org API connection and verifies Real Betis data
 * 
 * Run this script with: npm run test-api
 * or directly with: npx tsx scripts/test-api.ts
 */

// Load environment variables from .env.local
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { getFootballDataConfig } from '../src/lib/config';

interface Competition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

interface ApiTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Test basic API connectivity
 */
async function testApiConnectivity(): Promise<ApiTestResult> {
  try {
    const config = getFootballDataConfig();
    
    const response = await fetch(`${config.apiUrl}/competitions`, {
      headers: {
        'X-Auth-Token': config.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: 'API connectivity failed',
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: 'API connectivity successful',
      data: {
        competitionsFound: data.competitions?.length || 0,
        rateLimitRemaining: response.headers.get('X-Requests-Available-Minute'),
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
 * Test Real Betis in La Liga matches (alternative approach)
 */
async function testRealBetisInLaLiga(): Promise<ApiTestResult> {
  try {
    const config = getFootballDataConfig();
    
    // Get La Liga matches and look for Real Betis
    const response = await fetch(
      `${config.apiUrl}/competitions/${config.competitions.laliga}/matches?season=2024`, 
      {
        headers: {
          'X-Auth-Token': config.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: 'La Liga matches retrieval failed',
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    
    // Find matches with Real Betis
    const betisMatches = data.matches?.filter((match: any) => 
      match.homeTeam.name.toLowerCase().includes('betis') || 
      match.awayTeam.name.toLowerCase().includes('betis')
    ) || [];
    
    if (betisMatches.length === 0) {
      return {
        success: false,
        message: 'No Real Betis matches found in La Liga',
        data: { totalMatches: data.matches?.length || 0 },
      };
    }

    // Get Real Betis team ID from the matches
    const firstMatch = betisMatches[0];
    const betisTeam = firstMatch.homeTeam.name.toLowerCase().includes('betis') 
      ? firstMatch.homeTeam 
      : firstMatch.awayTeam;

    return {
      success: true,
      message: 'Real Betis found in La Liga matches',
      data: {
        teamId: betisTeam.id,
        teamName: betisTeam.name,
        teamShortName: betisTeam.shortName,
        teamTla: betisTeam.tla,
        matchesFound: betisMatches.length,
        recentMatches: betisMatches.slice(0, 3).map((match: any) => ({
          id: match.id,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          status: match.status,
          utcDate: match.utcDate,
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
 * Test La Liga competition access
 */
async function testLaLigaAccess(): Promise<ApiTestResult> {
  try {
    const config = getFootballDataConfig();
    
    const response = await fetch(`${config.apiUrl}/competitions/${config.competitions.laliga}`, {
      headers: {
        'X-Auth-Token': config.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: 'La Liga competition access failed',
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const competition: Competition = await response.json();
    
    return {
      success: true,
      message: 'La Liga competition access successful',
      data: {
        id: competition.id,
        name: competition.name,
        code: competition.code,
        type: competition.type,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'La Liga competition access failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test Teams endpoint (this is the one causing 403 errors)
 */
async function testTeamsEndpoint(): Promise<ApiTestResult> {
  try {
    const config = getFootballDataConfig();
    
    const response = await fetch(
      `${config.apiUrl}/teams/${config.realBetisTeamId}/matches?limit=5`, 
      {
        headers: {
          'X-Auth-Token': config.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: 'Teams endpoint failed',
        error: `HTTP ${response.status}: ${response.statusText} - This endpoint is likely restricted in free tier`,
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      message: 'Teams endpoint works (unexpected!)',
      data: {
        matchesFound: data.matches?.length || 0,
        matches: data.matches?.slice(0, 3).map((match: any) => ({
          id: match.id,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          status: match.status,
          utcDate: match.utcDate,
          competition: match.competition.name,
        })) || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Teams endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test which competitions are available in free tier
 */
async function testAvailableCompetitions(): Promise<ApiTestResult> {
  try {
    const config = getFootballDataConfig();
    
    const competitions = [
      { code: 'PD', name: 'La Liga' },
      { code: 'CDR', name: 'Copa del Rey' },
      { code: 'CL', name: 'Champions League' },
      { code: 'EL', name: 'Europa League' },
      { code: 'ECL', name: 'Conference League' },
    ];

    const results = [];

    for (const comp of competitions) {
      try {
        const response = await fetch(
          `${config.apiUrl}/competitions/${comp.code}`, 
          {
            headers: {
              'X-Auth-Token': config.apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          results.push({ ...comp, available: true, status: 'OK' });
        } else {
          results.push({ ...comp, available: false, status: `${response.status} ${response.statusText}` });
        }
      } catch (error) {
        results.push({ ...comp, available: false, status: `Error: ${error instanceof Error ? error.message : 'Unknown'}` });
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return {
      success: true,
      message: 'Competition availability tested',
      data: {
        availableCompetitions: results.filter(r => r.available),
        restrictedCompetitions: results.filter(r => !r.available),
        allResults: results,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Competition testing failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test which seasons are available for La Liga
 */
async function testAvailableSeasons(): Promise<ApiTestResult> {
  try {
    const config = getFootballDataConfig();
    
    const seasons = ['2024', '2023', '2022', '2021', '2020'];
    const results = [];

    for (const season of seasons) {
      try {
        const response = await fetch(
          `${config.apiUrl}/competitions/PD/matches?season=${season}&limit=1`, 
          {
            headers: {
              'X-Auth-Token': config.apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          results.push({ 
            season, 
            available: true, 
            status: 'OK',
            matchCount: data.resultSet?.count || data.matches?.length || 0
          });
        } else {
          results.push({ 
            season, 
            available: false, 
            status: `${response.status} ${response.statusText}` 
          });
        }
      } catch (error) {
        results.push({ 
          season, 
          available: false, 
          status: `Error: ${error instanceof Error ? error.message : 'Unknown'}` 
        });
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return {
      success: true,
      message: 'Season availability tested',
      data: {
        availableSeasons: results.filter(r => r.available),
        restrictedSeasons: results.filter(r => !r.available),
        allResults: results,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Season testing failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test La Liga matches endpoint with filters
 */
async function testLaLigaMatchesWithFilters(): Promise<ApiTestResult> {
  try {
    const config = getFootballDataConfig();
    
    // Test different filter combinations
    const testCases = [
      { name: 'Current season (2024)', query: '?season=2024', limit: 5 },
      { name: 'Finished matches only', query: '?status=FINISHED&season=2024', limit: 5 },
      { name: 'Scheduled matches only', query: '?status=SCHEDULED&season=2024', limit: 5 },
      { name: 'Recent date range', query: '?dateFrom=2024-01-01&dateTo=2024-12-31', limit: 5 },
    ];

    const results = [];

    for (const testCase of testCases) {
      try {
        const response = await fetch(
          `${config.apiUrl}/competitions/PD/matches${testCase.query}`, 
          {
            headers: {
              'X-Auth-Token': config.apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const betisMatches = data.matches?.filter((match: any) => 
            match.homeTeam.id === config.realBetisTeamId || match.awayTeam.id === config.realBetisTeamId
          ) || [];

          results.push({
            ...testCase,
            success: true,
            totalMatches: data.matches?.length || 0,
            betisMatches: betisMatches.length,
            sampleBetisMatch: betisMatches[0] ? {
              id: betisMatches[0].id,
              homeTeam: betisMatches[0].homeTeam.name,
              awayTeam: betisMatches[0].awayTeam.name,
              status: betisMatches[0].status,
              utcDate: betisMatches[0].utcDate,
            } : null,
          });
        } else {
          results.push({
            ...testCase,
            success: false,
            error: `${response.status} ${response.statusText}`,
          });
        }
      } catch (error) {
        results.push({
          ...testCase,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      success: true,
      message: 'La Liga matches with filters tested',
      data: {
        successfulTests: results.filter(r => r.success),
        failedTests: results.filter(r => !r.success),
        allResults: results,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'La Liga matches filter testing failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Main test runner
 */
async function runApiTests() {
  console.log('🔧 Football-Data.org API Connectivity Test');
  console.log('==========================================\n');

  // Check environment configuration
  try {
    const config = getFootballDataConfig();
    console.log('✅ Environment configuration loaded');
    console.log(`   API URL: ${config.apiUrl}`);
    console.log(`   Team ID: ${config.realBetisTeamId}`);
    console.log(`   API Key: ${config.apiKey.substring(0, 8)}...`);
    console.log('');
  } catch (error) {
    console.error('❌ Environment configuration error:');
    console.error(`   ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }

  // Run tests
  const tests = [
    { name: 'API Connectivity', test: testApiConnectivity },
    { name: 'Teams Endpoint (Expected to Fail)', test: testTeamsEndpoint },
    { name: 'Available Competitions', test: testAvailableCompetitions },
    { name: 'Available Seasons', test: testAvailableSeasons },
    { name: 'Real Betis in La Liga', test: testRealBetisInLaLiga },
    { name: 'La Liga Access', test: testLaLigaAccess },
    { name: 'La Liga Matches with Filters', test: testLaLigaMatchesWithFilters },
  ];

  let allPassed = true;

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
      if (result.data) {
        console.log(`   Data:`, JSON.stringify(result.data, null, 2));
      }
      allPassed = false;
    }
    console.log('');
  }

  // Summary
  console.log('==========================================');
  if (allPassed) {
    console.log('🎉 All tests passed! API integration is ready.');
    console.log('   You can now proceed with implementing the match data integration.');
  } else {
    console.log('⚠️  Some tests failed. Please check your configuration.');
    console.log('   Make sure you have registered for a Football-Data.org API key');
    console.log('   and updated the FOOTBALL_DATA_API_KEY in your .env.local file.');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runApiTests().catch(console.error);
}

export { 
  runApiTests, 
  testApiConnectivity, 
  testRealBetisInLaLiga, 
  testLaLigaAccess, 
  testTeamsEndpoint,
  testAvailableCompetitions,
  testAvailableSeasons,
  testLaLigaMatchesWithFilters
};
