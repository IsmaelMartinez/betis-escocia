// Data types for the Peña Bética Escocesa website

export interface Match {
  id: string;
  opponent: string;
  date: string;
  venue: string;
  competition: string;
  isHome: boolean;
  result?: string;
  scorers?: string[]; 
  watchParty?: {
    location: string;
    address: string;
    time: string;
  };
}

export interface PorraEntry {
  id: string;
  name: string;
  email: string;
  prediction: string;
  scorer: string;
  timestamp: string;
}

export interface Porra {
  id: string;
  matchId: string;
  opponent: string;
  date: string;
  venue: string;
  isActive: boolean;
  prizePool: number;
  entries: PorraEntry[];
  rules: {
    entryFee: number;
    penaSplit: number;
    prizesSplit: number;
    requiresPrediction: boolean;
    requiresScorer: boolean;
  };
  result?: string;
  scorer?: string;
  winner?: string;
}

export interface FranStatus {
  available: boolean;
  lastUpdate: string;
  nextAvailability: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
}

export interface ContactInfo {
  email: string;
  facebook: string;
  instagram: string;
  venue: {
    name: string;
    address: string;
    phone: string;
  };
}

export interface AboutInfo {
  title: string;
  subtitle: string;
  description: string;
  founded: string;
  location: string;
  homeVenue: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  type: 'general' | 'visit' | 'merchandise';
}
