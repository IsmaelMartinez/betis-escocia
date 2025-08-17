/**
 * Shared utilities and types for camiseta voting functionality
 * Used by vote, pre-order, and status endpoints
 */

import fs from 'fs';
import path from 'path';

// Shared interfaces
export interface Voter {
  name: string;
  email: string;
  votedAt: string;
}

export interface VotingOption {
  id: string;
  name: string;
  description: string;
  image: string;
  votes: number;
  voters: Voter[];
}

export interface PreOrder {
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

export interface VotingData {
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

// Shared constants
export const VOTING_DATA_FILE = path.join(process.cwd(), 'data', 'camiseta-voting.json');

// Shared utility functions
export function ensureDataDirectory() {
  const dataDir = path.dirname(VOTING_DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function getInitialVotingData(): VotingData {
  return {
    voting: {
      active: true,
      totalVotes: 0,
      endDate: "2026-07-31T23:59:59.000Z",
      options: [
        {
          id: "design_1",
          name: "Dinnae seek mair – there's nae mair tae be foun'",
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
      endDate: "2026-08-15T23:59:59.000Z",
      minimumOrders: 20,
      orders: []
    },
    stats: {
      lastUpdated: new Date().toISOString(),
      totalInteractions: 0
    }
  };
}

export function readVotingData(): VotingData {
  ensureDataDirectory();
  
  if (!fs.existsSync(VOTING_DATA_FILE)) {
    throw new Error('ENOENT');
  }
  
  const content = fs.readFileSync(VOTING_DATA_FILE, 'utf8');
  return JSON.parse(content);
}

export function readVotingDataOrCreate(): VotingData {
  ensureDataDirectory();
  
  if (!fs.existsSync(VOTING_DATA_FILE)) {
    const initialData = getInitialVotingData();
    fs.writeFileSync(VOTING_DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  
  const content = fs.readFileSync(VOTING_DATA_FILE, 'utf8');
  return JSON.parse(content);
}

export function writeVotingData(data: VotingData) {
  ensureDataDirectory();
  data.stats.lastUpdated = new Date().toISOString();
  fs.writeFileSync(VOTING_DATA_FILE, JSON.stringify(data, null, 2));
}

export function sanitizeVotingData(data: VotingData) {
  const now = new Date();
  const votingEndDate = new Date(data.voting.endDate);
  const preOrderEndDate = new Date(data.preOrders.endDate);
  
  // Create sanitized voting options (remove voter details for privacy)
  const sanitizedOptions = data.voting.options.map(option => ({
    id: option.id,
    name: option.name,
    description: option.description,
    image: option.image,
    votes: option.votes,
    percentage: data.voting.totalVotes > 0 
      ? Math.round((option.votes / data.voting.totalVotes) * 100) 
      : 0
  }));
  
  return {
    voting: {
      active: data.voting.active && now <= votingEndDate,
      totalVotes: data.voting.totalVotes,
      endDate: data.voting.endDate,
      timeRemaining: votingEndDate > now ? votingEndDate.getTime() - now.getTime() : 0,
      options: sanitizedOptions
    },
    preOrders: {
      active: data.preOrders.active && now <= preOrderEndDate,
      totalOrders: data.preOrders.totalOrders,
      endDate: data.preOrders.endDate,
      minimumOrders: data.preOrders.minimumOrders,
      progressPercentage: Math.round((data.preOrders.totalOrders / data.preOrders.minimumOrders) * 100),
      timeRemaining: preOrderEndDate > now ? preOrderEndDate.getTime() - now.getTime() : 0,
      isGoalReached: data.preOrders.totalOrders >= data.preOrders.minimumOrders
    },
    stats: {
      lastUpdated: data.stats.lastUpdated,
      totalInteractions: data.stats.totalInteractions
    }
  };
}