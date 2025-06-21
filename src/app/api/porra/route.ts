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
    return NextResponse.json({ error: 'Failed to fetch porra data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, prediction, scorer } = await request.json();
    
    // Validation
    if (!name || !email || !prediction || !scorer) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate prediction format (e.g., "2-1")
    const predictionRegex = /^\d{1,2}-\d{1,2}$/;
    if (!predictionRegex.test(prediction)) {
      return NextResponse.json({ error: 'Invalid prediction format. Use format like "2-1"' }, { status: 400 });
    }

    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    
    // Check if porra is active
    if (!data.currentPorra.isActive) {
      return NextResponse.json({ error: 'Porra is currently closed' }, { status: 400 });
    }

    // Check if email already exists
    const existingEntry = data.currentPorra.entries.find((entry: PorraEntry) => entry.email === email);
    if (existingEntry) {
      return NextResponse.json({ error: 'Email already registered for this porra' }, { status: 400 });
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
    return NextResponse.json({ error: 'Failed to process entry' }, { status: 500 });
  }
}
