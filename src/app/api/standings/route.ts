import { NextResponse } from 'next/server';
import { FootballDataService } from '@/services/footballDataService';

export const dynamic = 'force-dynamic'; // This route requires dynamic rendering

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
    
    // Provide more specific error messages
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
