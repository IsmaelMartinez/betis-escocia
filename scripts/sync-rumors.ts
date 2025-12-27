import { RumorSyncService } from '../src/services/rumorSyncService';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  console.log('Starting rumor sync...');

  const syncService = new RumorSyncService();
  const result = await syncService.syncRumors();

  console.log('\nSync Results:');
  console.log(`- Fetched: ${result.fetched}`);
  console.log(`- Duplicates: ${result.duplicates}`);
  console.log(`- Analyzed: ${result.analyzed}`);
  console.log(`- Inserted: ${result.inserted}`);
  console.log(`- Errors: ${result.errors}`);

  process.exit(result.errors > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Sync failed:', error);
  process.exit(1);
});
