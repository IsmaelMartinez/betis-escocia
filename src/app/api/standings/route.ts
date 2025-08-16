import { createApiHandler } from '@/lib/apiUtils';
import { FootballDataService, StandingEntry } from '@/services/footballDataService';
import axios from 'axios';
import { supabase } from '@/lib/supabase';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const CACHE_DURATION_HOURS = 24;

type StandingsResponse = {
  standings: { table: StandingEntry[] };
  lastUpdated: string;
  source: 'cache' | 'api';
};

async function getCachedStandings() {
  const { data, error } = await supabase
    .from('classification_cache')
    .select('data, last_updated')
    .order('last_updated', { ascending: false })
    .limit(1);

  if (error) {
    log.error('Failed to fetch cached standings from database', error);
    return null;
  }

  return data?.[0] || null;
}

async function setCachedStandings(standings: { table: StandingEntry[] }) {
  const { error } = await supabase
    .from('classification_cache')
    .upsert({ id: 1, data: standings, last_updated: new Date().toISOString() }, { onConflict: 'id' });

  if (error) {
    log.error('Failed to save standings to cache', error);
  } else {
    log.info('Successfully cached LaLiga standings', undefined, {
      teamCount: standings.table?.length || 0
    });
  }
}

async function getStandings(): Promise<StandingsResponse> {
  // Check cache first
  const cachedData = await getCachedStandings();
  
  if (cachedData) {
    const lastUpdated = new Date(cachedData.last_updated);
    const now = new Date();
    const diffHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

    if (diffHours < CACHE_DURATION_HOURS) {
      log.info('Returning cached standings data', undefined, {
        cacheAge: Math.round(diffHours * 100) / 100,
        source: 'cache'
      });
      
      return {
        standings: cachedData.data,
        lastUpdated: cachedData.last_updated,
        source: 'cache',
      };
    }
  }

  // Fetch fresh data from API
  const service = new FootballDataService(axios.create());
  const standings = await service.getLaLigaStandings();
  
  if (!standings) {
    throw new Error('No se pudieron obtener las clasificaciones');
  }

  // Cache the fresh data
  await setCachedStandings(standings);

  log.info('Successfully fetched fresh standings data', undefined, {
    teamCount: standings.table?.length || 0,
    source: 'football-data-api'
  });

  return {
    standings: standings,
    lastUpdated: new Date().toISOString(),
    source: 'api',
  };
}

export const GET = createApiHandler({
  auth: 'none',
  handler: async () => {
    return await getStandings();
  }
});