import { NextResponse } from 'next/server';
import { FootballDataService } from '@/services/footballDataService';

export async function GET() {
  try {
    const service = new FootballDataService();
    const standings = await service.getLaLigaStandings();
    
    if (!standings) {
      return NextResponse.json(
        { error: 'No se pudieron obtener las clasificaciones' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      standings: standings,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching standings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener las clasificaciones' },
      { status: 500 }
    );
  }
}
