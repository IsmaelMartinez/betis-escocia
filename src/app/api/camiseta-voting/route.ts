import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { votingRequestSchema } from '@/lib/schemas/voting';
import { ZodError } from 'zod';

interface Voter {
  name: string;
  email: string;
  votedAt: string;
}

interface VotingOption {
  id: string;
  name: string;
  description: string;
  image: string;
  votes: number;
  voters: Voter[];
}

interface PreOrder {
  id: string;
  name: string;
  email: string;
  phone?: string;
  size: string;
  quantity: number;
  preferredDesign?: string;
  message?: string;
  submittedAt: string;
  status: string;
}

interface VotingData {
  voting: {
    active: boolean;
    totalVotes: number;
    endDate: string;
    options: VotingOption[];
  };
  preOrders: {
    active: boolean;
    totalOrders: number;
    endDate: string;
    minimumOrders: number;
    orders: PreOrder[];
  };
  stats: {
    lastUpdated: string;
    totalInteractions: number;
  };
}

const VOTING_DATA_FILE = path.join(process.cwd(), 'data', 'camiseta-voting.json');

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(VOTING_DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read voting data
function readVotingData(): VotingData {
  ensureDataDirectory();
  
  if (!fs.existsSync(VOTING_DATA_FILE)) {
    const initialData = {
      voting: {
      active: true,
      totalVotes: 0,
      endDate: "2025-07-31T23:59:59.000Z",
      options: [
        {
          id: "design_1",
          name: "Dinnae seek mair – there’s nae mair tae be foun’",
          description: "Lema clásico de la peña en escocés",
          image: "/images/coleccionables/camiseta-1.png",
          votes: 0,
          voters: []
        },
        {
          id: "design_2",
          name: "\"No busques más que no hay\"",
          description: "Lema clásico de la peña",
          image: "/images/coleccionables/camiseta-2.png",
          votes: 0,
          voters: []
        }
      ]
      },
      preOrders: {
      active: true,
      totalOrders: 0,
      endDate: "2025-08-15T23:59:59.000Z",
      minimumOrders: 20,
      orders: []
      },
      stats: {
      lastUpdated: new Date().toISOString(),
      totalInteractions: 0
      }
    };
    
    fs.writeFileSync(VOTING_DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  
  const content = fs.readFileSync(VOTING_DATA_FILE, 'utf8');
  return JSON.parse(content);
}

// Write voting data
function writeVotingData(data: VotingData) {
  ensureDataDirectory();
  data.stats.lastUpdated = new Date().toISOString();
  fs.writeFileSync(VOTING_DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = readVotingData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading voting data:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Error al cargar los datos de votación';
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ENOENT') {
        errorMessage = 'No se encontraron datos de votación previos';
      } else if (error.code === 'EACCES') {
        errorMessage = 'Error de permisos al acceder a los datos de votación';
      }
    } else if (error instanceof SyntaxError) {
      errorMessage = 'Error en el formato de los datos de votación';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = votingRequestSchema.parse(body);
    const data = readVotingData();
    
    if (validatedData.action === 'vote') {
      // Handle voting
      const { designId, voter } = validatedData;
      
      // Check if user already voted
      const alreadyVoted = data.voting.options.some((option: VotingOption) =>
        option.voters.some((v: Voter) => v.email === voter.email)
      );
      
      if (alreadyVoted) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Ya has votado anteriormente. Solo se permite un voto por persona.' 
          },
          { status: 400 }
        );
      }
      
      // Add vote
      const option = data.voting.options.find((opt: VotingOption) => opt.id === designId);
      if (!option) {
        return NextResponse.json(
          { 
            success: false,
            error: 'El diseño seleccionado no existe. Por favor, recarga la página.' 
          },
          { status: 400 }
        );
      }
      
      option.votes += 1;
      option.voters.push({
        ...voter,
        votedAt: new Date().toISOString()
      });
      
      data.voting.totalVotes += 1;
      data.stats.totalInteractions += 1;
      
      writeVotingData(data);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Voto registrado correctamente',
        totalVotes: data.voting.totalVotes
      });
      
    } else if (validatedData.action === 'preOrder') {
      // Handle pre-order
      const { orderData } = validatedData;
      
      // Check if user already has a pre-order
      const existingOrder = data.preOrders.orders.find((order: PreOrder) => 
        order.email === orderData.email
      );
      
      if (existingOrder) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Ya tienes un pre-pedido registrado. Solo se permite un pre-pedido por persona.' 
          },
          { status: 400 }
        );
      }
      
      // Add pre-order
      const newOrder = {
        id: `preorder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...orderData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      data.preOrders.orders.push(newOrder);
      data.preOrders.totalOrders += 1;
      data.stats.totalInteractions += 1;
      
      writeVotingData(data);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Pre-pedido registrado correctamente',
        orderId: newOrder.id,
        totalOrders: data.preOrders.totalOrders
      });
      
    }
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map(issue => issue.message);
      return NextResponse.json({
        success: false,
        error: 'Datos de votación inválidos',
        details: errorMessages
      }, { status: 400 });
    }
    
    // Provide more specific error messages
    let errorMessage = 'Error interno al procesar la solicitud';
    
    if (error instanceof SyntaxError) {
      errorMessage = 'Los datos enviados no son válidos. Por favor, revisa la información.';
    } else if (error && typeof error === 'object' && 'code' in error && (error.code === 'ENOENT' || error.code === 'EACCES')) {
      errorMessage = 'Error de almacenamiento. Por favor, inténtalo de nuevo.';
    } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('space')) {
      errorMessage = 'Error de espacio de almacenamiento. Contacta al administrador.';
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
