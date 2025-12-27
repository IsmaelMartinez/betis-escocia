import { createApiHandler } from "@/lib/apiUtils";
import { syncRumors } from "@/services/rumorSyncService";

export const POST = createApiHandler({
  auth: "admin",
  handler: async () => {
    const result = await syncRumors();

    return {
      message: "Rumor sync completed",
      ...result,
    };
  },
});
