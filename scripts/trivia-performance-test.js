#!/usr/bin/env node
/**
 * Trivia API Performance Testing Script
 * 
 * Tests the consolidated trivia API performance across different scenarios:
 * - Anonymous question fetching
 * - Authenticated score operations
 * - Load testing with concurrent requests
 * - Database query performance validation
 */

const { performance } = require('perf_hooks');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const CONCURRENT_REQUESTS = parseInt(process.env.CONCURRENT_REQUESTS) || 10;
const TEST_ITERATIONS = parseInt(process.env.TEST_ITERATIONS) || 5;

// Mock authentication token for testing (in real scenario, use valid test token)
const MOCK_AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || 'mock-token-for-testing';

/**
 * Performance test scenarios
 */
const scenarios = {
  // Test question fetching (anonymous users)
  questionFetching: {
    name: 'Question Fetching (Anonymous)',
    url: `${BASE_URL}/api/trivia`,
    method: 'GET',
    headers: {},
    expectedStatus: 200,
    timeout: 5000
  },

  // Test question fetching with action parameter
  questionFetchingExplicit: {
    name: 'Question Fetching (Explicit Action)',
    url: `${BASE_URL}/api/trivia?action=questions`,
    method: 'GET', 
    headers: {},
    expectedStatus: 200,
    timeout: 5000
  },

  // Test daily score retrieval (requires auth)
  dailyScoreRetrieval: {
    name: 'Daily Score Retrieval (Authenticated)',
    url: `${BASE_URL}/api/trivia?action=score`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
      'Cookie': `__session=${MOCK_AUTH_TOKEN}`
    },
    expectedStatus: [200, 401], // 401 is acceptable for mock token
    timeout: 3000
  },

  // Test total score retrieval (requires auth)  
  totalScoreRetrieval: {
    name: 'Total Score Retrieval (Authenticated)',
    url: `${BASE_URL}/api/trivia?action=total`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
      'Cookie': `__session=${MOCK_AUTH_TOKEN}`
    },
    expectedStatus: [200, 401], // 401 is acceptable for mock token
    timeout: 3000
  },

  // Test score submission (requires auth)
  scoreSubmission: {
    name: 'Score Submission (Authenticated)',
    url: `${BASE_URL}/api/trivia`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
      'Cookie': `__session=${MOCK_AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ score: 85 }),
    expectedStatus: [200, 401, 409], // 409 = already played today
    timeout: 3000
  }
};

/**
 * Execute a single request and measure performance
 */
async function executeRequest(scenario) {
  const startTime = performance.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), scenario.timeout);

    const response = await fetch(scenario.url, {
      method: scenario.method,
      headers: scenario.headers,
      body: scenario.body,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Check if status is expected
    const statusOk = Array.isArray(scenario.expectedStatus) 
      ? scenario.expectedStatus.includes(response.status)
      : response.status === scenario.expectedStatus;

    const result = {
      success: statusOk,
      status: response.status,
      duration,
      size: response.headers.get('content-length') || 'unknown'
    };

    // Try to get response body for additional info
    try {
      const responseText = await response.text();
      result.hasContent = responseText.length > 0;
      result.contentLength = responseText.length;
    } catch (e) {
      result.hasContent = false;
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    return {
      success: false,
      duration: endTime - startTime,
      error: error.message,
      timeout: error.name === 'AbortError'
    };
  }
}

/**
 * Run performance test for a single scenario
 */
async function testScenario(scenario) {
  console.log(`\n📊 Testing: ${scenario.name}`);
  console.log(`   URL: ${scenario.method} ${scenario.url}`);
  
  const results = [];
  
  // Sequential tests for baseline measurement
  console.log(`   Running ${TEST_ITERATIONS} sequential requests...`);
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    const result = await executeRequest(scenario);
    results.push(result);
    process.stdout.write('.');
  }

  // Concurrent tests for load testing
  console.log(`\n   Running ${CONCURRENT_REQUESTS} concurrent requests...`);
  const concurrentPromises = Array(CONCURRENT_REQUESTS)
    .fill()
    .map(() => executeRequest(scenario));
  
  const concurrentResults = await Promise.all(concurrentPromises);
  results.push(...concurrentResults);

  // Calculate statistics
  const successfulResults = results.filter(r => r.success);
  const durations = successfulResults.map(r => r.duration);
  
  const stats = {
    totalRequests: results.length,
    successfulRequests: successfulResults.length,
    failedRequests: results.length - successfulResults.length,
    successRate: (successfulResults.length / results.length * 100).toFixed(1),
    averageTime: durations.length > 0 ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2) : 0,
    minTime: durations.length > 0 ? Math.min(...durations).toFixed(2) : 0,
    maxTime: durations.length > 0 ? Math.max(...durations).toFixed(2) : 0,
    p95Time: durations.length > 0 ? percentile(durations, 0.95).toFixed(2) : 0,
    timeouts: results.filter(r => r.timeout).length
  };

  // Display results
  console.log('\n   📈 Results:');
  console.log(`      Success Rate: ${stats.successRate}% (${stats.successfulRequests}/${stats.totalRequests})`);
  console.log(`      Average Time: ${stats.averageTime}ms`);
  console.log(`      Min/Max Time: ${stats.minTime}ms / ${stats.maxTime}ms`);
  console.log(`      95th Percentile: ${stats.p95Time}ms`);
  
  if (stats.timeouts > 0) {
    console.log(`      ⚠️  Timeouts: ${stats.timeouts}`);
  }

  if (stats.failedRequests > 0) {
    const errorTypes = {};
    results.filter(r => !r.success).forEach(r => {
      const key = r.error || `HTTP ${r.status}` || 'Unknown';
      errorTypes[key] = (errorTypes[key] || 0) + 1;
    });
    console.log(`      ❌ Errors:`, errorTypes);
  }

  return stats;
}

/**
 * Calculate percentile from array of numbers
 */
function percentile(arr, p) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const index = (p * (sorted.length - 1));
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Main performance testing function
 */
async function runPerformanceTests() {
  console.log('🚀 Trivia API Performance Testing');
  console.log('='.repeat(50));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Iterations: ${TEST_ITERATIONS}`);
  console.log(`Concurrent Requests: ${CONCURRENT_REQUESTS}`);
  
  const allStats = {};
  
  // Test each scenario
  for (const [key, scenario] of Object.entries(scenarios)) {
    try {
      allStats[key] = await testScenario(scenario);
    } catch (error) {
      console.log(`❌ Failed to test ${scenario.name}:`, error.message);
      allStats[key] = { error: error.message };
    }
  }

  // Summary report
  console.log('\n📋 Performance Summary Report');
  console.log('='.repeat(50));
  
  const performanceTargets = {
    questionFetching: { target: 500, description: 'Questions should load quickly for users' },
    questionFetchingExplicit: { target: 500, description: 'Explicit action should not add overhead' },
    dailyScoreRetrieval: { target: 300, description: 'Score retrieval should be very fast' },
    totalScoreRetrieval: { target: 800, description: 'Aggregation queries may be slower' },
    scoreSubmission: { target: 1000, description: 'Score submission can be slower (includes validation)' }
  };

  let overallPass = true;

  Object.entries(allStats).forEach(([key, stats]) => {
    if (stats.error) {
      console.log(`❌ ${scenarios[key].name}: ERROR - ${stats.error}`);
      overallPass = false;
      return;
    }

    const target = performanceTargets[key];
    const avgTime = parseFloat(stats.averageTime);
    const passed = avgTime <= target.target;
    const icon = passed ? '✅' : '⚠️';
    
    if (!passed) overallPass = false;
    
    console.log(`${icon} ${scenarios[key].name}:`);
    console.log(`    Average: ${stats.averageTime}ms (target: ≤${target.target}ms)`);
    console.log(`    Success Rate: ${stats.successRate}%`);
    console.log(`    95th Percentile: ${stats.p95Time}ms`);
  });

  console.log('\n' + '='.repeat(50));
  console.log(`🎯 Overall Performance: ${overallPass ? '✅ PASS' : '⚠️ REVIEW NEEDED'}`);
  
  if (!overallPass) {
    console.log('\n💡 Performance Recommendations:');
    console.log('   - Consider adding database indexes for slow queries');
    console.log('   - Review server resources and scaling');
    console.log('   - Check for network latency issues');
    console.log('   - Consider implementing caching for frequently accessed data');
  } else {
    console.log('\n🎉 All performance targets met! The consolidated API is performing well.');
  }

  return { allStats, overallPass };
}

// Run the performance tests if this script is executed directly
if (require.main === module) {
  runPerformanceTests()
    .then(({ overallPass }) => {
      process.exit(overallPass ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Performance testing failed:', error);
      process.exit(1);
    });
}

module.exports = { runPerformanceTests, scenarios };