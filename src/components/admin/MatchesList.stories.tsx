import type { Meta, StoryObj } from "@storybook/nextjs";
import MatchesList from "./MatchesList";
import { Match } from "@/lib/supabase";
import { fn } from "storybook/test";

const mockMatches: Match[] = [
  {
    id: 1,
    competition: "La Liga",
    date_time: new Date("2025-08-10T18:00:00Z").toISOString(),
    opponent: "FC Barcelona",
    home_away: "home",
    home_score: undefined,
    away_score: undefined,
    status: "SCHEDULED",
    matchday: 30,
    created_at: new Date("2025-07-01T00:00:00Z").toISOString(),
    updated_at: new Date("2025-07-01T00:00:00Z").toISOString(),
    external_id: 12345,
    notes: "Important match",
  },
  {
    id: 2,
    competition: "Copa del Rey",
    date_time: new Date("2025-07-25T20:30:00Z").toISOString(),
    opponent: "Real Madrid",
    home_away: "away",
    home_score: 1,
    away_score: 2,
    status: "FINISHED",
    matchday: 5,
    created_at: new Date("2025-07-01T00:00:00Z").toISOString(),
    updated_at: new Date("2025-07-01T00:00:00Z").toISOString(),
    external_id: 67890,
    notes: "Cup final",
  },
  {
    id: 3,
    competition: "La Liga",
    date_time: new Date("2025-08-01T12:00:00Z").toISOString(),
    opponent: "Valencia CF",
    home_away: "home",
    home_score: undefined,
    away_score: undefined,
    status: "POSTPONED",
    matchday: 31,
    created_at: new Date("2025-07-01T00:00:00Z").toISOString(),
    updated_at: new Date("2025-07-01T00:00:00Z").toISOString(),
    external_id: undefined,
    notes: "Postponed due to weather",
  },
  {
    id: 4,
    competition: "Friendly",
    date_time: new Date("2025-07-10T16:00:00Z").toISOString(),
    opponent: "Local Team",
    home_away: "home",
    home_score: 3,
    away_score: 0,
    status: "FINISHED",
    matchday: undefined,
    created_at: new Date("2025-07-01T00:00:00Z").toISOString(),
    updated_at: new Date("2025-07-01T00:00:00Z").toISOString(),
    external_id: undefined,
    notes: "Pre-season friendly",
  },
];

const meta: Meta<typeof MatchesList> = {
  title: "Admin/MatchesList",
  component: MatchesList,
  parameters: {
    layout: "fullscreen",
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ["autodocs"],
  argTypes: {
    matches: { control: "object" },
    onEdit: { action: "onEdit" },
    onDelete: { action: "onDelete" },
    onSync: { action: "onSync" },
    isLoading: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof MatchesList>;

export const Default: Story = {
  args: {
    matches: mockMatches,
    onEdit: fn(),
    onDelete: fn(() => Promise.resolve({ success: true })),
    onSync: fn(() => Promise.resolve({ success: true })),
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    matches: [],
    onEdit: fn(),
    onDelete: fn(() => Promise.resolve({ success: true })),
    onSync: fn(() => Promise.resolve({ success: true })),
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    matches: [],
    onEdit: fn(),
    onDelete: fn(() => Promise.resolve({ success: true })),
    onSync: fn(() => Promise.resolve({ success: true })),
    isLoading: false,
  },
};

export const WithLongList: Story = {
  args: {
    matches: Array.from({ length: 25 }).map((_, i) => ({
      id: i + 100,
      competition: i % 2 === 0 ? "La Liga" : "Copa del Rey",
      date_time: new Date(
        new Date().getTime() + (i - 10) * 24 * 60 * 60 * 1000,
      ).toISOString(),
      opponent: i % 3 === 0 ? `Team ${i + 1}` : `Team ${i + 2}`,
      home_away: i % 3 === 0 ? "home" : "away",
      home_score: i % 2 === 0 ? Math.floor(Math.random() * 3) : undefined,
      away_score: i % 2 === 0 ? Math.floor(Math.random() * 3) : undefined,
      status: i % 2 === 0 ? "FINISHED" : "SCHEDULED",
      matchday: i + 1,
      external_id: i % 4 === 0 ? i + 1000 : undefined,
      notes: `Match note ${i + 100}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
    onEdit: fn(),
    onDelete: fn(() => Promise.resolve({ success: true })),
    onSync: fn(() => Promise.resolve({ success: true })),
    isLoading: false,
  },
};
