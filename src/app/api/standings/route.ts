import { NextResponse } from 'next/server';
import { FootballDataService, StandingEntry } from '@/services/footballDataService';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const CACHE_DURATION_HOURS = 24;

async function getCachedStandings() {
  const { data, error } = await supabase
    .from('classification_cache')
    .select('data, last_updated')
    .order('last_updated', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching cached standings:', error);
    return null;
  }

  return data?.[0] || null;
}

async function setCachedStandings(standings: { table: StandingEntry[] }) {
  const { error } = await supabase
    .from('classification_cache')
    .upsert({ id: 1, data: standings, last_updated: new Date().toISOString() }, { onConflict: 'id' });

  if (error) {
    console.error('Error saving standings to cache:', error);
  }
}

export async function GET() {
  try {
    const cachedData = await getCachedStandings();
    
    if (cachedData) {
      const lastUpdated = new Date(cachedData.last_updated);
      const now = new Date();
      const diffHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

      if (diffHours < CACHE_DURATION_HOURS) {
        return NextResponse.json({
          standings: cachedData.data,
          lastUpdated: cachedData.last_updated,
          source: 'cache',
        });
      }
    }

    const service = new FootballDataService();
    const standings = await service.getLaLigaStandings();
    
    if (!standings) {
      return NextResponse.json(
        { error: 'No se pudieron obtener las clasificaciones' },
        { status: 404 }
      );
    }

    await setCachedStandings(standings);

    return NextResponse.json({
      standings: standings,
      lastUpdated: new Date().toISOString(),
      source: 'api',
    });
  } catch (error) {
    console.error('Error fetching standings:', error);
    
    let errorMessage = 'Error interno al cargar las clasificaciones';
    
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Error de conexión al obtener las clasificaciones. Verifica tu conexión a internet.';
      } else if (error.message.includes('API') || error.message.includes('429')) {
        errorMessage = 'Servicio temporalmente no disponible. Inténtalo más tarde.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Tiempo de espera agotado. Por favor, inténtalo de nuevo.';
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}
