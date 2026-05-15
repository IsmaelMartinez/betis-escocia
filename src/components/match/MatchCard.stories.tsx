import type { Meta, StoryObj } from "@storybook/nextjs";
import MatchCard from "./MatchCard";
import { MatchStatus } from "@/types/match";

const commonArgs = {
  id: 1,
  opponentCrest: "https://crests.football-data.org/81.png", // Example crest for FC Barcelona
  competitionEmblem: "https://crests.football-data.org/PD.png", // Example emblem for LaLiga
};

const meta: Meta<typeof MatchCard> = {
  title: "Components/MatchCard",
  component: MatchCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    id: { control: "number" },
    opponent: { control: "text" },
    date: { control: "date" },
    competition: { control: "text" },
    isHome: { control: "boolean" },
    result: { control: "text" },
    status: {
      control: { type: "select" },
      options: [
        "SCHEDULED",
        "TIMED",
        "IN_PLAY",
        "PAUSED",
        "FINISHED",
        "POSTPONED",
        "SUSPENDED",
        "CANCELLED",
        "AWARDED",
      ],
    },
    matchday: { control: "number" },
    opponentCrest: { control: "text" },
    competitionEmblem: { control: "text" },
    score: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof MatchCard>;

export const Default: Story = {
  args: {
    ...commonArgs,
    opponent: "FC Barcelona",
    date: new Date(
      new Date().getTime() + 2 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 2 days from now
    competition: "LaLiga",
    isHome: true,
    status: "SCHEDULED" as MatchStatus,
    matchday: 30,
  },
};

export const CompletedMatch: Story = {
  args: {
    ...commonArgs,
    opponent: "Real Madrid",
    date: new Date(
      new Date().getTime() - 5 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 5 days ago
    competition: "LaLiga",
    isHome: false,
    status: "FINISHED" as MatchStatus,
    result: "WIN",
    matchday: 29,
    score: { home: 1, away: 2 }, // Betis (away) won 2-1
  },
};

export const PostponedMatch: Story = {
  args: {
    ...commonArgs,
    opponent: "Valencia CF",
    date: new Date(
      new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 7 days from now
    competition: "Copa del Rey",
    isHome: true,
    status: "POSTPONED" as MatchStatus,
    matchday: 1,
  },
};

export const LiveMatch: Story = {
  args: {
    ...commonArgs,
    opponent: "Sevilla FC",
    date: new Date().toISOString(), // Now
    competition: "LaLiga",
    isHome: true,
    status: "IN_PLAY" as MatchStatus,
    matchday: 31,
    score: { home: 0, away: 0 },
  },
};
