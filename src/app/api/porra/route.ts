import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface PorraEntry {
  id: string;
  name: string;
  email: string;
  prediction: string;
  scorer: string;
  timestamp: string;
}

const dataPath = join(process.cwd(), 'data', 'porra.json');

export async function GET() {
  try {
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading porra data:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Error al cargar los datos de la porra';
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ENOENT') {
        errorMessage = 'No se encontraron datos de porra previos';
      } else if (error.code === 'EACCES') {
        errorMessage = 'Error de permisos al acceder a los datos de la porra';
      }
    } else if (error instanceof SyntaxError) {
      errorMessage = 'Error en el formato de los datos de la porra';
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, prediction, scorer } = await request.json();
    
    // Validation
    if (!name || !email || !prediction || !scorer) {
      return NextResponse.json({ 
        success: false,
        error: 'Todos los campos son obligatorios (nombre, email, predicción y goleador)' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false,
        error: 'Por favor introduce un email válido' 
      }, { status: 400 });
    }

    // Validate prediction format (e.g., "2-1")
    const predictionRegex = /^\d{1,2}-\d{1,2}$/;
    if (!predictionRegex.test(prediction)) {
      return NextResponse.json({ 
        success: false,
        error: 'Formato de predicción inválido. Usa el formato "2-1"' 
      }, { status: 400 });
    }

    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    
    // Check if porra is active
    if (!data.currentPorra.isActive) {
      return NextResponse.json({ 
        success: false,
        error: 'La porra está actualmente cerrada' 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingEntry = data.currentPorra.entries.find((entry: PorraEntry) => entry.email === email);
    if (existingEntry) {
      return NextResponse.json({ 
        success: false,
        error: 'Este email ya está registrado en esta porra' 
      }, { status: 400 });
    }

    // Create new entry
    const newEntry = {
      id: `entry-${Date.now()}`,
      name,
      email,
      prediction,
      scorer,
      timestamp: new Date().toISOString()
    };

    // Add entry and update prize pool
    data.currentPorra.entries.push(newEntry);
    data.currentPorra.prizePool += data.currentPorra.rules.entryFee;

    // Write back to file
    writeFileSync(dataPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: 'Entry registered successfully',
      prizePool: data.currentPorra.prizePool,
      totalEntries: data.currentPorra.entries.length
    });

  } catch (error) {
    console.error('Error processing porra entry:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Error interno al procesar tu participación en la porra';
    
    if (error instanceof SyntaxError) {
      errorMessage = 'Los datos enviados no son válidos. Por favor, revisa la información.';
    } else if (error && typeof error === 'object' && 'code' in error && (error.code === 'ENOENT' || error.code === 'EACCES')) {
      errorMessage = 'Error de almacenamiento. Por favor, inténtalo de nuevo.';
    } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('space')) {
      errorMessage = 'Error de espacio de almacenamiento. Contacta al administrador.';
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage 
    }, { status: 500 });
  }
}
