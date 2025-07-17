#!/usr/bin/env node

/**
 * Test Flagsmith Integration
 * 
 * This script tests the Flagsmith integration by attempting to fetch flags
 */

const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key] = valueParts.join('=');
        }
      }
    });
  }
}

async function testFlagsmithIntegration() {
  loadEnvFile();
  
  console.log('🧪 Testing Flagsmith Integration...\n');
  
  const flagsmith = require('flagsmith').default || require('flagsmith');

  const fetch = require('node-fetch'); // Import node-fetch to emulate HTTP requests

  try {
    console.log('📋 Configuration:');
    console.log(`Environment ID: ${process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID}`);
    console.log(`API URL: ${process.env.NEXT_PUBLIC_FLAGSMITH_API_URL || 'https://edge.api.flagsmith.com/api/v1/'}`);

    console.log('\n⚡ Initializing Flagsmith...');
    await flagsmith.init({
      environmentID: process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID,
      api: process.env.NEXT_PUBLIC_FLAGSMITH_API_URL || 'https://edge.api.flagsmith.com/api/v1/',
      enableLogs: true,
      fetch: fetch // Pass in the fetch function
    });

    console.log('✅ Flagsmith initialized successfully!');

    console.log('\n🏁 Testing flag evaluation...');

    const testFlags = [
      'show-clasificacion',
      'show-coleccionables',
      'show-galeria',
      'show-rsvp',
      'show-partidos',
      'show-nosotros',
      'show-contacto',
      'show-admin',
      'show-clerk-auth'
    ];

    for (const flagName of testFlags) {
      try {
        const hasFeature = flagsmith.hasFeature(flagName);
        const value = flagsmith.getValue(flagName);
        console.log(`  ${flagName}: hasFeature=${hasFeature}, value=${value}`);
      } catch (error) {
        console.log(`  ${flagName}: ❌ Error - ${error.message}`);
      }
    }

    console.log('\n✅ Flagsmith integration test completed!');

  } catch (error) {
    console.error('❌ Flagsmith test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testFlagsmithIntegration();
