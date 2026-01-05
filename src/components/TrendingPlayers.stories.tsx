import type { Meta, StoryObj } from "@storybook/nextjs";
import TrendingPlayers from "./TrendingPlayers";
import type { TrendingPlayer } from "@/lib/supabase";

const meta: Meta<typeof TrendingPlayers> = {
  title: "Soylenti/TrendingPlayers",
  component: TrendingPlayers,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TrendingPlayers>;

const mockPlayers: TrendingPlayer[] = [
  {
    name: "Isco",
    normalizedName: "isco",
    rumorCount: 15,
    isActive: true,
    firstSeen: "2025-01-01T10:00:00Z",
    lastSeen: "2025-01-05T10:00:00Z",
  },
  {
    name: "Nabil Fekir",
    normalizedName: "nabil-fekir",
    rumorCount: 12,
    isActive: true,
    firstSeen: "2025-01-02T14:30:00Z",
    lastSeen: "2025-01-04T16:00:00Z",
  },
  {
    name: "Rodri",
    normalizedName: "rodri",
    rumorCount: 8,
    isActive: false,
    firstSeen: "2024-12-15T09:00:00Z",
    lastSeen: "2024-12-20T12:00:00Z",
  },
];

export const Default: Story = {
  args: {
    players: mockPlayers,
  },
};

export const WithSelectedPlayer: Story = {
  args: {
    players: mockPlayers,
    selectedPlayer: "nabil-fekir",
  },
};

export const WithClickHandler: Story = {
  args: {
    players: mockPlayers,
    onPlayerClick: (normalizedName: string) => {
      console.log("Clicked player:", normalizedName);
    },
  },
};

export const EmptyState: Story = {
  args: {
    players: [],
  },
};

export const SinglePlayer: Story = {
  args: {
    players: [mockPlayers[0]],
  },
};
