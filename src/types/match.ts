// Football-Data.org API type definitions
// Based on the actual API response structure from Football-Data.org

export type MatchStatus = 
  | 'SCHEDULED' 
  | 'TIMED'
  | 'IN_PLAY' 
  | 'PAUSED' 
  | 'FINISHED' 
  | 'SUSPENDED' 
  | 'POSTPONED' 
  | 'CANCELLED'
  | 'AWARDED';

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string; // Three Letter Acronym
  crest: string;
}

export interface Competition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

export interface Season {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number;
  winner?: Team;
}

export interface Score {
  winner?: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW';
  duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT';
  fullTime: {
    home: number | null;
    away: number | null;
  };
  halfTime: {
    home: number | null;
    away: number | null;
  };
  extraTime?: {
    home: number | null;
    away: number | null;
  };
  penalties?: {
    home: number | null;
    away: number | null;
  };
}

export interface Referee {
  id: number;
  name: string;
  type: string;
  nationality: string;
}

export interface Odds {
  msg: string;
}

// Main match interface based on Football-Data.org API
export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday: number;
  stage: string;
  group?: string;
  lastUpdated: string;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  goals?: unknown[]; // Goals are in premium tier (not available in free tier)
  bookings?: unknown[]; // Bookings are in premium tier (not available in free tier)
  substitutions?: unknown[]; // Substitutions are in premium tier (not available in free tier)
  odds?: Odds;
  referees?: Referee[];
  competition: Competition;
  season: Season;
}

// API Response wrappers
export interface MatchesResponse {
  filters: {
    season: string;
    matchday?: string;
    status?: string;
    venue?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  resultSet: {
    count: number;
    competitions: string;
    first: string;
    last: string;
    played: number;
  };
  matches: Match[];
}

export interface TeamMatchesResponse {
  filters: {
    permission: string;
    limit: number;
  };
  resultSet: {
    count: number;
    first: string;
    last: string;
    played: number;
  };
  matches: Match[];
}

// Error response structure
export interface ApiError {
  message: string;
  errorCode?: number;
  details?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}

// Utility types for our app
export interface ProcessedMatch {
  id: number;
  opponent: string;
  date: string;
  venue?: string; // Made optional since we're not displaying it
  competition: string;
  isHome: boolean;
  result?: string;
  status: MatchStatus;
  matchday?: number;
  opponentCrest?: string;
  competitionEmblem?: string;
  score?: {
    home: number | null;
    away: number | null;
  };
}

// Watch party data (for community features)
export interface WatchParty {
  location: string;
  address: string;
  time: string;
}

// RSVP information for matches
export interface RSVPInfo {
  rsvpCount: number;
  totalAttendees: number;
}

// Enhanced match card props
export interface MatchCardProps {
  readonly id: number;
  readonly opponent: string;
  readonly date: string;
  readonly venue?: string; // Made optional since we're not displaying it
  readonly competition: string;
  readonly isHome: boolean;
  readonly result?: string;
  readonly status: MatchStatus;
  readonly matchday?: number;
  readonly opponentCrest?: string;
  readonly competitionEmblem?: string;
  readonly score?: {
    home: number | null;
    away: number | null;
  };
  readonly watchParty?: WatchParty;
  readonly rsvpInfo?: RSVPInfo;
  readonly showRSVP?: boolean;
}

// Service method return types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, unknown>;
}

export type MatchFilters = {
  status?: MatchStatus[];
  dateFrom?: string;
  dateTo?: string;
  competition?: string[];
  venue?: 'home' | 'away' | 'all';
  limit?: number;
  offset?: number;
};
