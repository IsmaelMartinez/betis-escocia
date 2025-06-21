import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

const dataPath = join(process.cwd(), 'data', 'matches.json');

export async function GET() {
  try {
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading matches data:', error);
    return NextResponse.json({ error: 'Failed to fetch matches data' }, { status: 500 });
  }
}
