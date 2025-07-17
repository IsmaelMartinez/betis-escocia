/**
 * Flagsmith Migration Utility
 * 
 * This file provides utilities to migrate existing environment variable-based
 * feature flags to Flagsmith, ensuring a smooth transition.
 */

import { FlagsmithFeatureName, ENV_VAR_MIGRATION_MAP, DEFAULT_FLAG_VALUES } from './types';

export interface MigrationReport {
  totalFlags: number;
  migratedFlags: number;
  skippedFlags: number;
  errors: string[];
  flagDetails: {
    flagName: FlagsmithFeatureName;
    envVar: string;
    currentValue: boolean;
    defaultValue: boolean;
    status: 'migrated' | 'skipped' | 'error';
    error?: string;
  }[];
}

export interface MigrationConfig {
  dryRun?: boolean;
  verbose?: boolean;
  skipDefaults?: boolean;
  onProgress?: (progress: { current: number; total: number; flagName: string }) => void;
}

/**
 * Get current environment variable values for all feature flags
 */
export function getCurrentEnvironmentValues(): Record<string, boolean | null> {
  const values: Record<string, boolean | null> = {};
  
  Object.entries(ENV_VAR_MIGRATION_MAP).forEach(([envVar, flagName]) => {
    const envValue = process.env[envVar];
    values[flagName] = envValue === undefined ? null : envValue === 'true';
  });

  return values;
}

/**
 * Generate migration report showing what would be migrated
 */
export function generateMigrationReport(): MigrationReport {
  const report: MigrationReport = {
    totalFlags: 0,
    migratedFlags: 0,
    skippedFlags: 0,
    errors: [],
    flagDetails: []
  };

  Object.entries(ENV_VAR_MIGRATION_MAP).forEach(([envVar, flagName]) => {
    report.totalFlags++;
    
    const envValue = process.env[envVar];
    const currentValue = envValue === undefined ? null : envValue === 'true';
    const defaultValue = DEFAULT_FLAG_VALUES[flagName];
    
    let status: 'migrated' | 'skipped' | 'error' = 'migrated';
    let error: string | undefined;

    // Skip if environment variable is not set and matches default
    if (currentValue === null && defaultValue !== undefined) {
      status = 'skipped';
      report.skippedFlags++;
    } else if (currentValue !== null) {
      report.migratedFlags++;
    } else {
      status = 'error';
      error = 'Environment variable not set and no default value available';
      report.errors.push(`${flagName}: ${error}`);
    }

    report.flagDetails.push({
      flagName,
      envVar,
      currentValue: currentValue ?? defaultValue,
      defaultValue,
      status,
      error
    });
  });

  return report;
}

/**
 * Create Flagsmith flag creation script
 */
export function generateFlagsmithScript(): string {
  const report = generateMigrationReport();
  const lines: string[] = [];
  
  lines.push('# Flagsmith Flag Creation Script');
  lines.push('# This script can be used to create flags in Flagsmith dashboard');
  lines.push('# Or adapted for use with Flagsmith CLI/API');
  lines.push('');
  lines.push('# Migration Summary:');
  lines.push(`# Total flags: ${report.totalFlags}`);
  lines.push(`# Flags to migrate: ${report.migratedFlags}`);
  lines.push(`# Flags skipped: ${report.skippedFlags}`);
  lines.push(`# Errors: ${report.errors.length}`);
  lines.push('');

  if (report.errors.length > 0) {
    lines.push('# ERRORS:');
    report.errors.forEach(error => lines.push(`# ${error}`));
    lines.push('');
  }

  lines.push('# Flag Configuration:');
  lines.push('# Copy these values to your Flagsmith dashboard');
  lines.push('');

  report.flagDetails.forEach(detail => {
    if (detail.status === 'error') {
      lines.push(`# ERROR: ${detail.flagName} - ${detail.error}`);
      return;
    }

    lines.push(`# Flag: ${detail.flagName}`);
    lines.push(`# Environment Variable: ${detail.envVar}`);
    lines.push(`# Current Value: ${detail.currentValue}`);
    lines.push(`# Default Value: ${detail.defaultValue}`);
    lines.push(`# Status: ${detail.status}`);
    
    if (detail.status === 'migrated') {
      lines.push(`# CREATE FLAG: ${detail.flagName} = ${detail.currentValue}`);
    } else {
      lines.push(`# SKIP FLAG: ${detail.flagName} (using default: ${detail.defaultValue})`);
    }
    
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Create environment variable mapping for reference
 */
export function createEnvironmentVariableMapping(): Record<string, unknown> {
  const mapping: Record<string, unknown> = {};

  Object.entries(ENV_VAR_MIGRATION_MAP).forEach(([envVar, flagName]) => {
    const envValue = process.env[envVar];
    const currentValue = envValue === undefined ? null : envValue === 'true';
    const defaultValue = DEFAULT_FLAG_VALUES[flagName];

    mapping[flagName] = {
      environmentVariable: envVar,
      currentEnvironmentValue: currentValue,
      defaultValue,
      effectiveValue: currentValue ?? defaultValue,
      needsMigration: currentValue !== null,
      description: getFlagDescription(flagName)
    };
  });

  return mapping;
}

/**
 * Get description for a flag (for documentation)
 */
function getFlagDescription(flagName: FlagsmithFeatureName): string {
  const descriptions: Record<FlagsmithFeatureName, string> = {
    'show-clasificacion': 'Show La Liga classification/standings page',
    'show-coleccionables': 'Show collectibles/merchandise page',
    'show-galeria': 'Show photo gallery page',
    'show-rsvp': 'Show RSVP functionality for events',
    'show-partidos': 'Show matches/games page',
    'show-social-media': 'Show social media integration',
    'show-history': 'Show club history page',
    'show-nosotros': 'Show about us page',
    'show-unete': 'Show join/membership page',
    'show-contacto': 'Show contact page',
    'show-porra': 'Show betting pool functionality',
    'show-redes-sociales': 'Show social networks page',
    'show-admin': 'Show admin panel access',
    'show-clerk-auth': 'Show Clerk authentication system',
    'show-debug-info': 'Show debug information in development',
    'show-beta-features': 'Show beta/experimental features'
  };

  return descriptions[flagName] || 'Feature flag description not available';
}

/**
 * Validate migration readiness
 */
export function validateMigrationReadiness(): {
  ready: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if Flagsmith environment ID is set
  if (!process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID) {
    issues.push('NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID is not set');
    recommendations.push('Set up Flagsmith account and configure environment ID');
  }

  // Check current environment variables
  const currentValues = getCurrentEnvironmentValues();
  const undefinedFlags = Object.entries(currentValues)
    .filter(([, value]) => value === null)
    .map(([flagName]) => flagName);

  if (undefinedFlags.length > 0) {
    recommendations.push(`Consider setting explicit values for: ${undefinedFlags.join(', ')}`);
  }

  // Check for production environment
  if (process.env.NODE_ENV === 'production') {
    issues.push('Migration should not be run in production environment');
    recommendations.push('Run migration in development/staging first');
  }

  return {
    ready: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Generate migration checklist
 */
export function generateMigrationChecklist(): string[] {
  const checklist = [
    'Set up Flagsmith account and create environments (development, production)',
    'Configure NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID in environment variables',
    'Review current environment variable values using generateMigrationReport()',
    'Create flags in Flagsmith dashboard using generated script',
    'Test flag evaluation in development environment',
    'Update feature flag implementation to use Flagsmith',
    'Test all features with new Flagsmith integration',
    'Deploy to production with Flagsmith configuration',
    'Monitor system performance and error rates',
    'Remove old environment variables after successful migration'
  ];

  return checklist;
}

/**
 * Export migration data for external tools
 */
export function exportMigrationData(): {
  timestamp: string;
  environment: string;
  report: MigrationReport;
  mapping: Record<string, unknown>;
  script: string;
  checklist: string[];
} {
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    report: generateMigrationReport(),
    mapping: createEnvironmentVariableMapping(),
    script: generateFlagsmithScript(),
    checklist: generateMigrationChecklist()
  };
}

/**
 * Print migration report to console
 */
export function printMigrationReport(config: MigrationConfig = {}): void {
  const report = generateMigrationReport();
  
  console.log('\n🚀 Flagsmith Migration Report');
  console.log('='.repeat(50));
  console.log(`Total flags: ${report.totalFlags}`);
  console.log(`Flags to migrate: ${report.migratedFlags}`);
  console.log(`Flags skipped: ${report.skippedFlags}`);
  console.log(`Errors: ${report.errors.length}`);
  console.log('');

  if (report.errors.length > 0) {
    console.log('❌ ERRORS:');
    report.errors.forEach(error => console.log(`   ${error}`));
    console.log('');
  }

  console.log('📋 Flag Details:');
  report.flagDetails.forEach(detail => {
    const statusIcon = detail.status === 'migrated' ? '✅' : 
                      detail.status === 'skipped' ? '⏭️' : '❌';
    
    console.log(`${statusIcon} ${detail.flagName}:`);
    console.log(`   Environment Variable: ${detail.envVar}`);
    console.log(`   Current Value: ${detail.currentValue}`);
    console.log(`   Default Value: ${detail.defaultValue}`);
    console.log(`   Status: ${detail.status}`);
    
    if (detail.error) {
      console.log(`   Error: ${detail.error}`);
    }
    
    console.log('');
  });

  if (config.verbose) {
    console.log('📝 Migration Script:');
    console.log('='.repeat(50));
    console.log(generateFlagsmithScript());
  }
}
