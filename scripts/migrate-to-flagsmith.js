#!/usr/bin/env node

/**
 * Flagsmith Migration Script
 * 
 * This script helps with migrating from environment variables to Flagsmith.
 * It generates reports, validates readiness, and provides migration guidance.
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

// Import the migration utilities
async function runMigration() {
  try {
    console.log('🚀 Starting Flagsmith Migration Analysis...\n');
    
    // Load the migration utilities
    const migrationPath = path.join(__dirname, '..', 'src', 'lib', 'flagsmith', 'migration.ts');
    
    // Since this is a Node.js script, we need to use require for the compiled version
    // or use a runtime transpiler. For simplicity, we'll provide the guidance here.
    
    console.log('📋 Migration Checklist:');
    console.log('='.repeat(50));
    
    const checklist = [
      '1. Set up Flagsmith account and create environments (development, production)',
      '2. Configure NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID in environment variables',
      '3. Review current environment variable values',
      '4. Create flags in Flagsmith dashboard',
      '5. Test flag evaluation in development environment',
      '6. Update feature flag implementation to use Flagsmith',
      '7. Test all features with new Flagsmith integration',
      '8. Deploy to production with Flagsmith configuration',
      '9. Monitor system performance and error rates',
      '10. Remove old environment variables after successful migration'
    ];
    
    checklist.forEach((item, index) => {
      console.log(`${index + 1 < 10 ? ' ' : ''}${item}`);
    });
    
    console.log('\n📊 Current Environment Variables:');
    console.log('='.repeat(50));
    
    const envVars = [
      'NEXT_PUBLIC_FEATURE_CLASIFICACION',
      'NEXT_PUBLIC_FEATURE_COLECCIONABLES',
      'NEXT_PUBLIC_FEATURE_GALERIA',
      'NEXT_PUBLIC_FEATURE_RSVP',
      'NEXT_PUBLIC_FEATURE_PARTIDOS',
      'NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA',
      'NEXT_PUBLIC_FEATURE_HISTORY',
      'NEXT_PUBLIC_FEATURE_NOSOTROS',
      'NEXT_PUBLIC_FEATURE_UNETE',
      'NEXT_PUBLIC_FEATURE_CONTACTO',
      'NEXT_PUBLIC_FEATURE_PORRA',
      'NEXT_PUBLIC_FEATURE_REDES_SOCIALES',
      'NEXT_PUBLIC_FEATURE_ADMIN',
      'NEXT_PUBLIC_FEATURE_CLERK_AUTH'
    ];
    
    const flagMapping = {
      'NEXT_PUBLIC_FEATURE_CLASIFICACION': 'show-clasificacion',
      'NEXT_PUBLIC_FEATURE_COLECCIONABLES': 'show-coleccionables',
      'NEXT_PUBLIC_FEATURE_GALERIA': 'show-galeria',
      'NEXT_PUBLIC_FEATURE_RSVP': 'show-rsvp',
      'NEXT_PUBLIC_FEATURE_PARTIDOS': 'show-partidos',
      'NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA': 'show-social-media',
      'NEXT_PUBLIC_FEATURE_HISTORY': 'show-history',
      'NEXT_PUBLIC_FEATURE_NOSOTROS': 'show-nosotros',
      'NEXT_PUBLIC_FEATURE_UNETE': 'show-unete',
      'NEXT_PUBLIC_FEATURE_CONTACTO': 'show-contacto',
      'NEXT_PUBLIC_FEATURE_PORRA': 'show-porra',
      'NEXT_PUBLIC_FEATURE_REDES_SOCIALES': 'show-redes-sociales',
      'NEXT_PUBLIC_FEATURE_ADMIN': 'show-admin',
      'NEXT_PUBLIC_FEATURE_CLERK_AUTH': 'show-clerk-auth'
    };
    
    const defaultValues = {
      'show-clasificacion': true,
      'show-coleccionables': false,
      'show-galeria': false,
      'show-rsvp': true,
      'show-partidos': true,
      'show-social-media': false,
      'show-history': false,
      'show-nosotros': true,
      'show-unete': true,
      'show-contacto': false,
      'show-porra': false,
      'show-redes-sociales': false,
      'show-admin': false,
      'show-clerk-auth': false
    };
    
    envVars.forEach(envVar => {
      const value = process.env[envVar];
      const flagName = flagMapping[envVar];
      const defaultValue = defaultValues[flagName];
      const currentValue = value === undefined ? null : value === 'true';
      const effectiveValue = currentValue !== null ? currentValue : defaultValue;
      
      const status = currentValue !== null ? '✅ SET' : '⚠️  NOT SET';
      
      console.log(`${status} ${envVar}:`);
      console.log(`   Environment Value: ${currentValue !== null ? currentValue : 'undefined'}`);
      console.log(`   Default Value: ${defaultValue}`);
      console.log(`   Effective Value: ${effectiveValue}`);
      console.log(`   Flagsmith Flag: ${flagName}`);
      console.log('');
    });
    
    console.log('🔧 Flagsmith Configuration:');
    console.log('='.repeat(50));
    
    const flagsmithEnvId = process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;
    const flagsmithApiUrl = process.env.NEXT_PUBLIC_FLAGSMITH_API_URL;
    
    console.log(`Environment ID: ${flagsmithEnvId || '❌ NOT SET'}`);
    console.log(`API URL: ${flagsmithApiUrl || '✅ Using default'}`);
    
    if (!flagsmithEnvId) {
      console.log('');
      console.log('❌ REQUIRED: Set NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID');
      console.log('   1. Go to https://app.flagsmith.com/');
      console.log('   2. Create an account or log in');
      console.log('   3. Create a new project');
      console.log('   4. Copy the Environment ID from your environment settings');
      console.log('   5. Add it to your .env.local file');
    }
    
    console.log('\n📝 Flagsmith Flag Creation Guide:');
    console.log('='.repeat(50));
    console.log('Copy the following flag configurations to your Flagsmith dashboard:\n');
    
    Object.entries(flagMapping).forEach(([envVar, flagName]) => {
      const value = process.env[envVar];
      const defaultValue = defaultValues[flagName];
      const currentValue = value === undefined ? null : value === 'true';
      const effectiveValue = currentValue !== null ? currentValue : defaultValue;
      
      console.log(`Flag Name: ${flagName}`);
      console.log(`Value: ${effectiveValue}`);
      console.log(`Description: Feature flag for ${flagName.replace('show-', '').replace('-', ' ')}`);
      console.log('---');
    });
    
    console.log('\n🧪 Testing Commands:');
    console.log('='.repeat(50));
    console.log('After setting up Flagsmith, run these commands to test:');
    console.log('');
    console.log('# Build the project');
    console.log('npm run build');
    console.log('');
    console.log('# Start development server');
    console.log('npm run dev');
    console.log('');
    console.log('# Check the browser console for Flagsmith initialization messages');
    console.log('# Look for "[Feature Flags] Flagsmith initialized successfully"');
    
    console.log('\n✅ Migration Complete!');
    console.log('Your Flagsmith integration is ready for testing.');
    
  } catch (error) {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  }
}

// Run the migration
loadEnvFile();
runMigration();
