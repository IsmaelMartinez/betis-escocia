import { createApiHandler } from "@/lib/api/apiUtils";
import {
  FootballDataService,
  StandingEntry,
} from "@/services/footballDataService";
import axios from "axios";
import { unstable_cache } from "next/cache";
import { log } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

const CACHE_DURATION_SECONDS = 24 * 60 * 60;

type StandingsResponse = {
  standings: { table: StandingEntry[] };
  lastUpdated: string;
};

const fetchStandings = unstable_cache(
  async (): Promise<StandingsResponse> => {
    const service = new FootballDataService(axios.create());
    const standings = await service.getLaLigaStandings();

    if (!standings) {
      throw new Error("No se pudieron obtener las clasificaciones");
    }

    log.info("Fetched fresh LaLiga standings", undefined, {
      teamCount: standings.table?.length || 0,
    });

    return {
      standings,
      lastUpdated: new Date().toISOString(),
    };
  },
  ["la-liga-standings"],
  { revalidate: CACHE_DURATION_SECONDS, tags: ["la-liga-standings"] },
);

export const GET = createApiHandler({
  handler: async (): Promise<StandingsResponse> => fetchStandings(),
});
