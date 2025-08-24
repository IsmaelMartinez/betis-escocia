#!/usr/bin/env node

/**
 * Trivia Randomization Quality Testing Script
 * 
 * This script tests the quality of the new database-level randomization
 * by making multiple API requests and analyzing question distribution.
 */

const https = require('https');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_RUNS = parseInt(process.env.TEST_RUNS) || 50;
const CONCURRENT_REQUESTS = parseInt(process.env.CONCURRENT_REQUESTS) || 5;

// Statistics tracking
const questionStats = new Map();
const categoryStats = new Map();
const difficultyStats = new Map();
const requestTimes = [];
let totalRequests = 0;
let successfulRequests = 0;
let failedRequests = 0;

/**
 * Make HTTP request to trivia API
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const request = require(url.startsWith('https:') ? 'https' : 'http').get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        try {
          const jsonData = JSON.parse(data);
          resolve({ 
            success: true, 
            data: jsonData, 
            responseTime,
            statusCode: response.statusCode
          });
        } catch (error) {
          reject({ 
            success: false, 
            error: 'Invalid JSON response', 
            responseTime,
            statusCode: response.statusCode,
            rawData: data.substring(0, 200) // First 200 chars for debugging
          });
        }
      });
    });
    
    request.on('error', (error) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      reject({ 
        success: false, 
        error: error.message, 
        responseTime 
      });
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      reject({ 
        success: false, 
        error: 'Request timeout', 
        responseTime 
      });
    });
  });
}

/**
 * Process API response and update statistics
 */
function processResponse(response) {
  if (!response.success) {
    failedRequests++;
    console.error(`Failed request: ${response.error}`);
    return;
  }
  
  successfulRequests++;
  requestTimes.push(response.responseTime);
  
  // Extract questions from response
  let questions = [];
  if (response.data && Array.isArray(response.data)) {
    questions = response.data;
  } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
    questions = response.data.data;
  } else if (Array.isArray(response.data)) {
    questions = response.data;
  }
  
  if (questions.length === 0) {
    console.warn('No questions found in response:', JSON.stringify(response.data).substring(0, 100));
    return;
  }
  
  // Update question statistics
  questions.forEach(question => {
    const questionId = question.id;
    const category = question.category || 'Unknown';
    const difficulty = question.difficulty || 'Unknown';
    
    // Question frequency
    questionStats.set(questionId, (questionStats.get(questionId) || 0) + 1);
    
    // Category distribution
    categoryStats.set(category, (categoryStats.get(category) || 0) + 1);
    
    // Difficulty distribution  
    difficultyStats.set(difficulty, (difficultyStats.get(difficulty) || 0) + 1);
  });
}

/**
 * Run concurrent batch of requests
 */
async function runBatch(batchSize, batchNumber) {
  console.log(`Running batch ${batchNumber} (${batchSize} requests)...`);
  
  const promises = [];
  for (let i = 0; i < batchSize; i++) {
    const url = `${BASE_URL}/api/trivia?action=questions`;
    promises.push(
      makeRequest(url)
        .then(processResponse)
        .catch(processResponse)
    );
  }
  
  await Promise.all(promises);
  totalRequests += batchSize;
}

/**
 * Calculate and display statistics
 */
function displayStatistics() {
  console.log('\n' + '='.repeat(80));
  console.log('TRIVIA RANDOMIZATION QUALITY TEST RESULTS');
  console.log('='.repeat(80));
  
  console.log(`\n📊 REQUEST STATISTICS:`);
  console.log(`Total Requests: ${totalRequests}`);
  console.log(`Successful Requests: ${successfulRequests}`);
  console.log(`Failed Requests: ${failedRequests}`);
  console.log(`Success Rate: ${((successfulRequests / totalRequests) * 100).toFixed(2)}%`);
  
  if (requestTimes.length > 0) {
    const avgResponseTime = requestTimes.reduce((a, b) => a + b, 0) / requestTimes.length;
    const sortedTimes = requestTimes.sort((a, b) => a - b);
    const medianTime = sortedTimes[Math.floor(sortedTimes.length / 2)];
    const p95Time = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    
    console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Median Response Time: ${medianTime}ms`);
    console.log(`95th Percentile: ${p95Time}ms`);
    console.log(`Min Response Time: ${Math.min(...requestTimes)}ms`);
    console.log(`Max Response Time: ${Math.max(...requestTimes)}ms`);
  }
  
  console.log(`\n🎲 RANDOMIZATION QUALITY:`);
  console.log(`Unique Questions Seen: ${questionStats.size}`);
  console.log(`Total Question Selections: ${Array.from(questionStats.values()).reduce((a, b) => a + b, 0)}`);
  
  if (questionStats.size > 0) {
    const selections = Array.from(questionStats.values());
    const avgSelections = selections.reduce((a, b) => a + b, 0) / selections.length;
    const maxSelections = Math.max(...selections);
    const minSelections = Math.min(...selections);
    
    console.log(`Average Selections per Question: ${avgSelections.toFixed(2)}`);
    console.log(`Max Selections (any question): ${maxSelections}`);
    console.log(`Min Selections (any question): ${minSelections}`);
    console.log(`Selection Range: ${maxSelections - minSelections}`);
    
    // Calculate standard deviation for randomization quality
    const variance = selections.reduce((acc, val) => acc + Math.pow(val - avgSelections, 2), 0) / selections.length;
    const stdDev = Math.sqrt(variance);
    console.log(`Standard Deviation: ${stdDev.toFixed(2)}`);
    
    // Randomization quality assessment
    const coefficientOfVariation = stdDev / avgSelections;
    console.log(`Coefficient of Variation: ${coefficientOfVariation.toFixed(3)}`);
    
    let qualityAssessment;
    if (coefficientOfVariation < 0.3) {
      qualityAssessment = '✅ EXCELLENT - Very uniform distribution';
    } else if (coefficientOfVariation < 0.5) {
      qualityAssessment = '✅ GOOD - Reasonably uniform distribution';  
    } else if (coefficientOfVariation < 0.8) {
      qualityAssessment = '⚠️ FAIR - Some clustering, but acceptable';
    } else {
      qualityAssessment = '❌ POOR - Significant clustering detected';
    }
    console.log(`Quality Assessment: ${qualityAssessment}`);
  }
  
  console.log(`\n📂 CATEGORY DISTRIBUTION:`);
  const sortedCategories = Array.from(categoryStats.entries()).sort((a, b) => b[1] - a[1]);
  sortedCategories.forEach(([category, count]) => {
    const percentage = (count / (successfulRequests * 5) * 100).toFixed(1);
    console.log(`${category}: ${count} selections (${percentage}%)`);
  });
  
  console.log(`\n⚡ DIFFICULTY DISTRIBUTION:`);
  const sortedDifficulties = Array.from(difficultyStats.entries()).sort((a, b) => b[1] - a[1]);
  sortedDifficulties.forEach(([difficulty, count]) => {
    const percentage = (count / (successfulRequests * 5) * 100).toFixed(1);
    console.log(`${difficulty}: ${count} selections (${percentage}%)`);
  });
  
  console.log(`\n🔍 MOST/LEAST FREQUENT QUESTIONS:`);
  const sortedQuestions = Array.from(questionStats.entries()).sort((a, b) => b[1] - a[1]);
  
  console.log('Most Frequent (Top 5):');
  sortedQuestions.slice(0, 5).forEach(([questionId, count], index) => {
    console.log(`${index + 1}. Question ${questionId.substring(0, 8)}...: ${count} times`);
  });
  
  console.log('Least Frequent (Bottom 5):');
  sortedQuestions.slice(-5).reverse().forEach(([questionId, count], index) => {
    console.log(`${index + 1}. Question ${questionId.substring(0, 8)}...: ${count} times`);
  });
  
  console.log(`\n🎯 RECOMMENDATIONS:`);
  
  if (successfulRequests === 0) {
    console.log('❌ No successful requests - check API endpoint and connectivity');
  } else if (questionStats.size < 10) {
    console.log('⚠️ Limited question variety detected - consider adding more questions to database');
  } else if (coefficientOfVariation > 0.5) {
    console.log('⚠️ Consider improving randomization algorithm for better distribution');
  } else {
    console.log('✅ Randomization quality looks good - good question variety and distribution');
  }
  
  if (requestTimes.length > 0) {
    const avgTime = requestTimes.reduce((a, b) => a + b, 0) / requestTimes.length;
    if (avgTime > 500) {
      console.log('⚠️ Average response time > 500ms - consider performance optimization');
    } else {
      console.log('✅ Response times within acceptable range (<500ms average)');
    }
  }
  
  console.log('\n' + '='.repeat(80));
}

/**
 * Main execution function
 */
async function main() {
  console.log('🎲 TRIVIA RANDOMIZATION QUALITY TEST');
  console.log(`Testing endpoint: ${BASE_URL}/api/trivia?action=questions`);
  console.log(`Test runs: ${TEST_RUNS}`);
  console.log(`Concurrent requests: ${CONCURRENT_REQUESTS}`);
  console.log('Starting test...\n');
  
  try {
    // Run tests in batches to avoid overwhelming the server
    const totalBatches = Math.ceil(TEST_RUNS / CONCURRENT_REQUESTS);
    
    for (let batchNumber = 1; batchNumber <= totalBatches; batchNumber++) {
      const batchSize = Math.min(CONCURRENT_REQUESTS, TEST_RUNS - (batchNumber - 1) * CONCURRENT_REQUESTS);
      await runBatch(batchSize, batchNumber);
      
      // Small delay between batches
      if (batchNumber < totalBatches) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    displayStatistics();
    
    // Exit with appropriate code
    if (failedRequests > totalRequests * 0.1) { // More than 10% failures
      console.log('\n❌ Test completed with significant failures');
      process.exit(1);
    } else {
      console.log('\n✅ Test completed successfully');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n\n⚠️ Test interrupted by user');
  if (totalRequests > 0) {
    displayStatistics();
  }
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the test
main();