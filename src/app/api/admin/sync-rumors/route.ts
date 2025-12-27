import { createApiHandler } from '@/lib/apiUtils';
import { RumorSyncService } from '@/services/rumorSyncService';

export const POST = createApiHandler({
  auth: 'admin',
  handler: async () => {
    const syncService = new RumorSyncService();
    const result = await syncService.syncRumors();

    return {
      message: 'Rumor sync completed',
      ...result,
    };
  },
});
