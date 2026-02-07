import type { Meta, StoryObj } from "@storybook/nextjs";
import FilteredMatches from "./FilteredMatches";
import { Match } from "@/types/match";

// Mock data for matches
const mockUpcomingMatches: Match[] = [
  {
    id: 1,
    competition: {
      id: 2014,
      name: "La Liga",
      code: "PD",
      type: "LEAGUE",
      emblem: "https://crests.football-data.org/PD.png",
    },
    utcDate: new Date(
      new Date().getTime() + 2 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 2 days from now
    status: "SCHEDULED",
    matchday: 30,
    homeTeam: {
      id: 90,
      name: "Real Betis",
      shortName: "Betis",
      tla: "BET",
      crest: "https://crests.football-data.org/90.png",
    },
    awayTeam: {
      id: 81,
      name: "FC Barcelona",
      shortName: "Barcelona",
      tla: "BAR",
      crest: "https://crests.football-data.org/81.png",
    },
    score: {
      fullTime: { home: null, away: null },
      duration: "REGULAR",
      halfTime: { home: null, away: null },
    },
    stage: "GROUP_STAGE",
    lastUpdated: new Date().toISOString(),
    season: {
      id: 1,
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      currentMatchday: 1,
    },
  },
  {
    id: 5,
    competition: {
      id: 2014,
      name: "La Liga",
      code: "PD",
      type: "LEAGUE",
      emblem: "https://crests.football-data.org/PD.png",
    },
    utcDate: new Date(
      new Date().getTime() + 1 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 1 day from now
    status: "SCHEDULED",
    matchday: 31,
    homeTeam: {
      id: 90,
      name: "Real Betis",
      shortName: "Betis",
      tla: "BET",
      crest: "https://crests.football-data.org/90.png",
    },
    awayTeam: {
      id: 298,
      name: "Girona FC",
      shortName: "Girona",
      tla: "GIR",
      crest: "https://crests.football-data.org/298.png",
    },
    score: {
      fullTime: { home: null, away: null },
      duration: "REGULAR",
      halfTime: { home: null, away: null },
    },
    stage: "GROUP_STAGE",
    lastUpdated: new Date().toISOString(),
    season: {
      id: 1,
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      currentMatchday: 1,
    },
  },
];

const mockRecentMatches: Match[] = [
  {
    id: 2,
    competition: {
      id: 2014,
      name: "La Liga",
      code: "PD",
      type: "LEAGUE",
      emblem: "https://crests.football-data.org/PD.png",
    },
    utcDate: new Date(
      new Date().getTime() - 5 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 5 days ago
    status: "FINISHED",
    matchday: 29,
    homeTeam: {
      id: 86,
      name: "Real Madrid",
      shortName: "Real Madrid",
      tla: "RMA",
      crest: "https://crests.football-data.org/86.png",
    },
    awayTeam: {
      id: 90,
      name: "Real Betis",
      shortName: "Betis",
      tla: "BET",
      crest: "https://crests.football-data.org/90.png",
    },
    score: {
      fullTime: { home: 1, away: 2 },
      duration: "REGULAR",
      halfTime: { home: 1, away: 1 },
    },
    stage: "GROUP_STAGE",
    lastUpdated: new Date().toISOString(),
    season: {
      id: 1,
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      currentMatchday: 1,
    },
  },
  {
    id: 4,
    competition: {
      id: 2014,
      name: "La Liga",
      code: "PD",
      type: "LEAGUE",
      emblem: "https://crests.football-data.org/PD.png",
    },
    utcDate: new Date(
      new Date().getTime() - 10 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 10 days ago
    status: "FINISHED",
    matchday: 28,
    homeTeam: {
      id: 90,
      name: "Real Betis",
      shortName: "Betis",
      tla: "BET",
      crest: "https://crests.football-data.org/90.png",
    },
    awayTeam: {
      id: 77,
      name: "Sevilla FC",
      shortName: "Sevilla",
      tla: "SEV",
      crest: "https://crests.football-data.org/77.png",
    },
    score: {
      fullTime: { home: 0, away: 0 },
      duration: "REGULAR",
      halfTime: { home: 0, away: 0 },
    },
    stage: "GROUP_STAGE",
    lastUpdated: new Date().toISOString(),
    season: {
      id: 1,
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      currentMatchday: 1,
    },
  },
];

const mockConferenceMatches: Match[] = [
  {
    id: 7,
    competition: {
      id: 2154,
      name: "UEFA Conference League",
      code: "UCL",
      type: "CUP",
      emblem: "https://crests.football-data.org/UCL.png",
    },
    utcDate: new Date(
      new Date().getTime() + 3 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    status: "SCHEDULED",
    matchday: 1,
    homeTeam: {
      id: 90,
      name: "Real Betis",
      shortName: "Betis",
      tla: "BET",
      crest: "https://crests.football-data.org/90.png",
    },
    awayTeam: {
      id: 100,
      name: "Team X",
      shortName: "TX",
      tla: "TX",
      crest: "",
    },
    score: {
      fullTime: { home: null, away: null },
      duration: "REGULAR",
      halfTime: { home: null, away: null },
    },
    stage: "GROUP_STAGE",
    lastUpdated: new Date().toISOString(),
    season: {
      id: 1,
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      currentMatchday: 1,
    },
  },
];

const mockFriendlyMatches: Match[] = [
  {
    id: 8,
    competition: {
      id: 0,
      name: "Friendly",
      code: "FR",
      type: "FRIENDLY",
      emblem: "",
    },
    utcDate: new Date(
      new Date().getTime() + 4 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    status: "SCHEDULED",
    matchday: 1,
    homeTeam: {
      id: 90,
      name: "Real Betis",
      shortName: "Betis",
      tla: "BET",
      crest: "https://crests.football-data.org/90.png",
    },
    awayTeam: {
      id: 101,
      name: "Team Y",
      shortName: "TY",
      tla: "TY",
      crest: "",
    },
    score: {
      fullTime: { home: null, away: null },
      duration: "REGULAR",
      halfTime: { home: null, away: null },
    },
    stage: "GROUP_STAGE",
    lastUpdated: new Date().toISOString(),
    season: {
      id: 1,
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      currentMatchday: 1,
    },
  },
];

const meta: Meta<typeof FilteredMatches> = {
  title: "Components/FilteredMatches",
  component: FilteredMatches,
  parameters: {
    layout: "fullscreen",
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ["autodocs"],
  argTypes: {
    upcomingMatches: { control: "object" },
    recentMatches: { control: "object" },
    conferenceMatches: { control: "object" },
    friendlyMatches: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof FilteredMatches>;

export const Default: Story = {
  args: {
    upcomingMatches: mockUpcomingMatches,
    recentMatches: mockRecentMatches,
    conferenceMatches: mockConferenceMatches,
    friendlyMatches: mockFriendlyMatches,
  },
};

export const NoUpcomingMatches: Story = {
  args: {
    upcomingMatches: [],
    recentMatches: mockRecentMatches,
    conferenceMatches: mockConferenceMatches,
    friendlyMatches: mockFriendlyMatches,
  },
};

export const NoRecentMatches: Story = {
  args: {
    upcomingMatches: mockUpcomingMatches,
    recentMatches: [],
    conferenceMatches: mockConferenceMatches,
    friendlyMatches: mockFriendlyMatches,
  },
};

export const NoConferenceMatches: Story = {
  args: {
    upcomingMatches: mockUpcomingMatches,
    recentMatches: mockRecentMatches,
    conferenceMatches: [],
    friendlyMatches: mockFriendlyMatches,
  },
};

export const NoFriendlyMatches: Story = {
  args: {
    upcomingMatches: mockUpcomingMatches,
    recentMatches: mockRecentMatches,
    conferenceMatches: mockConferenceMatches,
    friendlyMatches: [],
  },
};

export const NoMatchesAtAll: Story = {
  args: {
    upcomingMatches: [],
    recentMatches: [],
    conferenceMatches: [],
    friendlyMatches: [],
  },
};
