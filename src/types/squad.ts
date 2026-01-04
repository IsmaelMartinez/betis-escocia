/**
 * Types for squad management and starting eleven features
 */

// Position types
export type Position =
  | "Goalkeeper"
  | "Centre-Back"
  | "Left-Back"
  | "Right-Back"
  | "Defensive Midfield"
  | "Central Midfield"
  | "Attacking Midfield"
  | "Left Winger"
  | "Right Winger"
  | "Centre-Forward";

export type PositionShort =
  | "GK"
  | "CB"
  | "LB"
  | "RB"
  | "DM"
  | "CM"
  | "AM"
  | "LW"
  | "RW"
  | "ST";

export type SquadStatus =
  | "active"
  | "injured"
  | "suspended"
  | "loaned_out"
  | "on_loan";

export type PositionGroup = "goalkeepers" | "defenders" | "midfielders" | "forwards";

// Map full position to short code
export const POSITION_TO_SHORT: Record<Position, PositionShort> = {
  Goalkeeper: "GK",
  "Centre-Back": "CB",
  "Left-Back": "LB",
  "Right-Back": "RB",
  "Defensive Midfield": "DM",
  "Central Midfield": "CM",
  "Attacking Midfield": "AM",
  "Left Winger": "LW",
  "Right Winger": "RW",
  "Centre-Forward": "ST",
};

// Map position to group for UI organization
export const POSITION_TO_GROUP: Record<Position, PositionGroup> = {
  Goalkeeper: "goalkeepers",
  "Centre-Back": "defenders",
  "Left-Back": "defenders",
  "Right-Back": "defenders",
  "Defensive Midfield": "midfielders",
  "Central Midfield": "midfielders",
  "Attacking Midfield": "midfielders",
  "Left Winger": "forwards",
  "Right Winger": "forwards",
  "Centre-Forward": "forwards",
};

// Squad member with joined player data
export interface SquadMember {
  id: number;
  player_id: number;
  external_id: number | null;
  shirt_number: number | null;
  position: Position | null;
  position_short: PositionShort | null;
  date_of_birth: string | null;
  nationality: string | null;
  photo_url: string | null;
  is_captain: boolean;
  is_vice_captain: boolean;
  squad_status: SquadStatus;
  joined_at: string | null;
  contract_until: string | null;
  created_at: string;
  updated_at: string;
  // Joined from players table
  player?: {
    id: number;
    name: string;
    normalized_name: string;
    display_name: string | null;
    aliases: string[] | null;
    rumor_count: number;
  };
}

// For inserting new squad members
export interface SquadMemberInsert {
  player_id: number;
  external_id?: number | null;
  shirt_number?: number | null;
  position?: Position | null;
  position_short?: PositionShort | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  photo_url?: string | null;
  is_captain?: boolean;
  is_vice_captain?: boolean;
  squad_status?: SquadStatus;
  joined_at?: string | null;
  contract_until?: string | null;
}

// For updating squad members
export interface SquadMemberUpdate {
  external_id?: number | null;
  shirt_number?: number | null;
  position?: Position | null;
  position_short?: PositionShort | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  photo_url?: string | null;
  is_captain?: boolean;
  is_vice_captain?: boolean;
  squad_status?: SquadStatus;
  joined_at?: string | null;
  contract_until?: string | null;
}

// Individual player in a lineup
export interface LineupPlayer {
  playerId: number;
  squadMemberId: number;
  position: PositionShort; // GK, CB, etc.
  x: number; // 0-100 percentage position on pitch (left to right)
  y: number; // 0-100 percentage position on pitch (bottom to top)
}

// Common formation types
export type Formation =
  | "4-3-3"
  | "4-4-2"
  | "3-5-2"
  | "4-2-3-1"
  | "3-4-3"
  | "5-3-2"
  | "4-1-4-1"
  | "4-5-1";

// Starting eleven / saved formation
export interface StartingEleven {
  id: number;
  name: string;
  description: string | null;
  formation: string;
  lineup: LineupPlayer[];
  match_id: number | null;
  is_active: boolean;
  is_predicted: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// For inserting new formations
export interface StartingElevenInsert {
  name: string;
  description?: string | null;
  formation: string;
  lineup: LineupPlayer[];
  match_id?: number | null;
  is_active?: boolean;
  is_predicted?: boolean;
  created_by?: string | null;
}

// For updating formations
export interface StartingElevenUpdate {
  name?: string;
  description?: string | null;
  formation?: string;
  lineup?: LineupPlayer[];
  match_id?: number | null;
  is_active?: boolean;
  is_predicted?: boolean;
}

// Default positions for common formations (x, y in percentage)
export const FORMATION_POSITIONS: Record<Formation, { position: PositionShort; x: number; y: number }[]> = {
  "4-3-3": [
    { position: "GK", x: 50, y: 5 },
    { position: "LB", x: 15, y: 25 },
    { position: "CB", x: 35, y: 20 },
    { position: "CB", x: 65, y: 20 },
    { position: "RB", x: 85, y: 25 },
    { position: "CM", x: 30, y: 45 },
    { position: "CM", x: 50, y: 40 },
    { position: "CM", x: 70, y: 45 },
    { position: "LW", x: 20, y: 70 },
    { position: "ST", x: 50, y: 80 },
    { position: "RW", x: 80, y: 70 },
  ],
  "4-4-2": [
    { position: "GK", x: 50, y: 5 },
    { position: "LB", x: 15, y: 25 },
    { position: "CB", x: 35, y: 20 },
    { position: "CB", x: 65, y: 20 },
    { position: "RB", x: 85, y: 25 },
    { position: "LW", x: 15, y: 50 },
    { position: "CM", x: 35, y: 45 },
    { position: "CM", x: 65, y: 45 },
    { position: "RW", x: 85, y: 50 },
    { position: "ST", x: 35, y: 75 },
    { position: "ST", x: 65, y: 75 },
  ],
  "3-5-2": [
    { position: "GK", x: 50, y: 5 },
    { position: "CB", x: 25, y: 20 },
    { position: "CB", x: 50, y: 18 },
    { position: "CB", x: 75, y: 20 },
    { position: "LB", x: 10, y: 45 },
    { position: "CM", x: 35, y: 40 },
    { position: "DM", x: 50, y: 35 },
    { position: "CM", x: 65, y: 40 },
    { position: "RB", x: 90, y: 45 },
    { position: "ST", x: 35, y: 75 },
    { position: "ST", x: 65, y: 75 },
  ],
  "4-2-3-1": [
    { position: "GK", x: 50, y: 5 },
    { position: "LB", x: 15, y: 25 },
    { position: "CB", x: 35, y: 20 },
    { position: "CB", x: 65, y: 20 },
    { position: "RB", x: 85, y: 25 },
    { position: "DM", x: 35, y: 40 },
    { position: "DM", x: 65, y: 40 },
    { position: "LW", x: 20, y: 60 },
    { position: "AM", x: 50, y: 55 },
    { position: "RW", x: 80, y: 60 },
    { position: "ST", x: 50, y: 80 },
  ],
  "3-4-3": [
    { position: "GK", x: 50, y: 5 },
    { position: "CB", x: 25, y: 20 },
    { position: "CB", x: 50, y: 18 },
    { position: "CB", x: 75, y: 20 },
    { position: "LB", x: 15, y: 45 },
    { position: "CM", x: 35, y: 40 },
    { position: "CM", x: 65, y: 40 },
    { position: "RB", x: 85, y: 45 },
    { position: "LW", x: 20, y: 70 },
    { position: "ST", x: 50, y: 80 },
    { position: "RW", x: 80, y: 70 },
  ],
  "5-3-2": [
    { position: "GK", x: 50, y: 5 },
    { position: "LB", x: 10, y: 30 },
    { position: "CB", x: 30, y: 20 },
    { position: "CB", x: 50, y: 18 },
    { position: "CB", x: 70, y: 20 },
    { position: "RB", x: 90, y: 30 },
    { position: "CM", x: 30, y: 45 },
    { position: "CM", x: 50, y: 42 },
    { position: "CM", x: 70, y: 45 },
    { position: "ST", x: 35, y: 75 },
    { position: "ST", x: 65, y: 75 },
  ],
  "4-1-4-1": [
    { position: "GK", x: 50, y: 5 },
    { position: "LB", x: 15, y: 25 },
    { position: "CB", x: 35, y: 20 },
    { position: "CB", x: 65, y: 20 },
    { position: "RB", x: 85, y: 25 },
    { position: "DM", x: 50, y: 35 },
    { position: "LW", x: 15, y: 55 },
    { position: "CM", x: 35, y: 50 },
    { position: "CM", x: 65, y: 50 },
    { position: "RW", x: 85, y: 55 },
    { position: "ST", x: 50, y: 80 },
  ],
  "4-5-1": [
    { position: "GK", x: 50, y: 5 },
    { position: "LB", x: 15, y: 25 },
    { position: "CB", x: 35, y: 20 },
    { position: "CB", x: 65, y: 20 },
    { position: "RB", x: 85, y: 25 },
    { position: "LW", x: 15, y: 50 },
    { position: "CM", x: 35, y: 45 },
    { position: "DM", x: 50, y: 40 },
    { position: "CM", x: 65, y: 45 },
    { position: "RW", x: 85, y: 50 },
    { position: "ST", x: 50, y: 80 },
  ],
};
