/**
 * Quick test of the updated service
 */
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testUpdatedService() {
  try {
    console.log('Testing updated Football Data Service...\n');
    
    // Import the service using tsx for TypeScript support
    const { FootballDataService } = await import('../src/services/footballDataService.ts');
    const service = new FootballDataService();
    
    // Test 1: Get Betis matches
    console.log('1. Testing getBetisMatches()...');
    const allMatches = await service.getBetisMatches(5);
    console.log(`✅ Found ${allMatches.length} matches`);
    if (allMatches.length > 0) {
      const latest = allMatches[0];
      console.log(`   Latest: ${latest.homeTeam.name} vs ${latest.awayTeam.name} (${latest.status})`);
      console.log(`   Date: ${new Date(latest.utcDate).toLocaleDateString()}`);
      console.log(`   Competition: ${latest.competition.name}`);
    }
    
    // Test 2: Get upcoming matches
    console.log('\n2. Testing getUpcomingBetisMatches()...');
    const upcoming = await service.getUpcomingBetisMatches(3);
    console.log(`✅ Found ${upcoming.length} upcoming matches`);
    if (upcoming.length > 0) {
      const next = upcoming[0];
      console.log(`   Next: ${next.homeTeam.name} vs ${next.awayTeam.name}`);
      console.log(`   Date: ${new Date(next.utcDate).toLocaleDateString()}`);
    }
    
    // Test 3: Get recent results
    console.log('\n3. Testing getRecentBetisResults()...');
    const results = await service.getRecentBetisResults(3);
    console.log(`✅ Found ${results.length} recent results`);
    if (results.length > 0) {
      const latest = results[0];
      const homeScore = latest.score.fullTime.home ?? 'N/A';
      const awayScore = latest.score.fullTime.away ?? 'N/A';
      console.log(`   Latest result: ${latest.homeTeam.name} ${homeScore} - ${awayScore} ${latest.awayTeam.name}`);
    }
    
    console.log('\n✅ Service is working with free tier restrictions!\n');
    
  } catch (error) {
    console.error('❌ Error testing service:', error.message);
    console.error('Stack:', error.stack);
  }
}

testUpdatedService();
