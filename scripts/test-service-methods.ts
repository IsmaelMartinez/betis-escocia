/**
 * Test script for Football-Data.org Service Methods
 * Tests all the methods added in Task T2.2
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { join } from 'path';

// Load .env.local file
config({ path: join(process.cwd(), '.env.local') });

import { FootballDataService } from '../src/services/footballDataService';

async function testServiceMethods() {
  console.log('🧪 Testing Football-Data.org Service Methods');
  console.log('='.repeat(50));

  // Create service instance after environment is loaded
  const footballDataService = new FootballDataService();

  try {
    // Test 1: Get Betis matches
    console.log('\n1. Testing getBetisMatches()...');
    const allMatches = await footballDataService.getBetisMatches(5);
    console.log(`✅ Found ${allMatches.length} matches`);
    if (allMatches.length > 0) {
      const latest = allMatches[0];
      console.log(`   Latest: ${latest.homeTeam.name} vs ${latest.awayTeam.name} (${latest.status})`);
    }

    // Test 2: Get upcoming matches
    console.log('\n2. Testing getUpcomingBetisMatches()...');
    const upcoming = await footballDataService.getUpcomingBetisMatches(3);
    console.log(`✅ Found ${upcoming.length} upcoming matches`);
    if (upcoming.length > 0) {
      const next = upcoming[0];
      console.log(`   Next: ${next.homeTeam.name} vs ${next.awayTeam.name} on ${new Date(next.utcDate).toLocaleDateString()}`);
    }

    // Test 3: Get recent results
    console.log('\n3. Testing getRecentBetisResults()...');
    const results = await footballDataService.getRecentBetisResults(3);
    console.log(`✅ Found ${results.length} recent results`);
    if (results.length > 0) {
      const latest = results[0];
      console.log(`   Latest result: ${latest.homeTeam.name} ${latest.score.fullTime.home} - ${latest.score.fullTime.away} ${latest.awayTeam.name}`);
    }

    // Test 4: Get La Liga standings
    console.log('\n4. Testing getLaLigaStandings()...');
    const standings = await footballDataService.getLaLigaStandings();
    if (standings) {
      console.log(`✅ La Liga standings retrieved (${standings.table.length} teams)`);
      const betisEntry = standings.table.find(entry => entry.team.name.includes('Betis'));
      if (betisEntry) {
        console.log(`   Betis position: ${betisEntry.position} (${betisEntry.points} points)`);
      }
    }

    // Test 5: Get Betis team info
    console.log('\n5. Testing getBetisTeamInfo()...');
    const teamInfo = await footballDataService.getBetisTeamInfo();
    if (teamInfo) {
      console.log(`✅ Team info retrieved: ${teamInfo.name} (${teamInfo.shortName})`);
      console.log(`   Team ID: ${teamInfo.id}, TLA: ${teamInfo.tla}`);
    }

    // Test 6: Get Betis league position
    console.log('\n6. Testing getBetisLeaguePosition()...');
    const position = await footballDataService.getBetisLeaguePosition();
    if (position) {
      console.log(`✅ Betis league position: ${position.position} with ${position.points} points`);
      console.log(`   Recent form: ${position.form}`);
    }

    // Test 7: Check if Betis is playing today
    console.log('\n7. Testing isBetisPlayingToday()...');
    const playingToday = await footballDataService.isBetisPlayingToday();
    console.log(`✅ Is Betis playing today? ${playingToday.isPlaying ? 'Yes' : 'No'}`);
    if (playingToday.match) {
      console.log(`   Match: ${playingToday.match.homeTeam.name} vs ${playingToday.match.awayTeam.name}`);
    }

    // Test 8: Get season summary
    console.log('\n8. Testing getBetisSeasonSummary()...');
    const summary = await footballDataService.getBetisSeasonSummary();
    if (summary) {
      console.log(`✅ Season summary: ${summary.played} games played`);
      console.log(`   Record: ${summary.won}W - ${summary.drawn}D - ${summary.lost}L`);
      console.log(`   Goals: ${summary.goalsFor} for, ${summary.goalsAgainst} against (${summary.goalDifference > 0 ? '+' : ''}${summary.goalDifference})`);
    }

    // Test 9: Get next fixtures
    console.log('\n9. Testing getNextFixtures()...');
    const fixtures = await footballDataService.getNextFixtures(3);
    console.log(`✅ Found ${fixtures.length} upcoming fixtures`);
    fixtures.forEach((fixture, index) => {
      console.log(`   ${index + 1}. ${fixture.homeTeam.name} vs ${fixture.awayTeam.name} - ${new Date(fixture.utcDate).toLocaleDateString()}`);
    });

    console.log('\n='.repeat(50));
    console.log('🎉 All service methods tested successfully!');
    console.log('✅ Task T2.2 completed - Service layer is ready for integration');

  } catch (error) {
    console.error('❌ Error testing service methods:', error);
    process.exit(1);
  }
}

// Run the test
testServiceMethods();
