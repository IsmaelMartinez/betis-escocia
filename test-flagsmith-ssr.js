#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const flagsmith = require('flagsmith/isomorphic');

async function testFlagsmithSSR() {
  console.log('Testing Flagsmith SSR integration...');
  console.log('Environment ID:', process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID ? 'Set' : 'Missing');
  
  try {
    // Initialize Flagsmith on the server
    await flagsmith.init({
      environmentID: process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID,
    });
    
    console.log('✅ Flagsmith initialized successfully');
    
    // Get the server state
    const serverState = flagsmith.getState();
    console.log('Server state:', JSON.stringify(serverState, null, 2));
    
    // Test some flags
    const testFlags = [
      'show-rsvp',
      'show-partidos', 
      'show-galeria',
      'show-porra',
      'show-redes-sociales',
      'show-admin'
    ];
    
    console.log('\nTesting individual flags:');
    testFlags.forEach(flag => {
      const enabled = flagsmith.hasFeature(flag);
      console.log(`  ${flag}: ${enabled ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Error initializing Flagsmith:', error);
  }
}

testFlagsmithSSR();
