import type { Meta, StoryObj } from "@storybook/nextjs";
import ClassificationWidget from "./ClassificationWidget";
import { StandingEntry } from "@/services/footballDataService";

// Mock data for StandingEntry
const mockStandings: StandingEntry[] = [
  {
    position: 1,
    team: {
      id: 1,
      name: "Real Madrid",
      shortName: "RMA",
      tla: "RMA",
      crest: "https://crests.football-data.org/86.png",
    },
    playedGames: 38,
    form: "WWWDW",
    won: 28,
    draw: 8,
    lost: 2,
    points: 92,
    goalsFor: 87,
    goalsAgainst: 26,
    goalDifference: 61,
  },
  {
    position: 2,
    team: {
      id: 2,
      name: "FC Barcelona",
      shortName: "BAR",
      tla: "BAR",
      crest: "https://crests.football-data.org/81.png",
    },
    playedGames: 38,
    form: "LWWWD",
    won: 26,
    draw: 7,
    lost: 5,
    points: 85,
    goalsFor: 80,
    goalsAgainst: 35,
    goalDifference: 45,
  },
  {
    position: 3,
    team: {
      id: 3,
      name: "Girona FC",
      shortName: "GIR",
      tla: "GIR",
      crest: "https://crests.football-data.org/298.png",
    },
    playedGames: 38,
    form: "WWLLW",
    won: 25,
    draw: 6,
    lost: 7,
    points: 81,
    goalsFor: 78,
    goalsAgainst: 46,
    goalDifference: 32,
  },
  {
    position: 4,
    team: {
      id: 4,
      name: "Atlético de Madrid",
      shortName: "ATM",
      tla: "ATM",
      crest: "https://crests.football-data.org/92.png",
    },
    playedGames: 38,
    form: "WWLWD",
    won: 24,
    draw: 4,
    lost: 10,
    points: 76,
    goalsFor: 70,
    goalsAgainst: 43,
    goalDifference: 27,
  },
  {
    position: 5,
    team: {
      id: 90,
      name: "Real Betis Balompié",
      shortName: "BET",
      tla: "BET",
      crest: "https://crests.football-data.org/90.png",
    },
    playedGames: 38,
    form: "WWWWW",
    won: 17,
    draw: 14,
    lost: 7,
    points: 65,
    goalsFor: 48,
    goalsAgainst: 45,
    goalDifference: 3,
  },
  {
    position: 6,
    team: {
      id: 6,
      name: "Real Sociedad",
      shortName: "RSO",
      tla: "RSO",
      crest: "https://crests.football-data.org/94.png",
    },
    playedGames: 38,
    form: "DWLWD",
    won: 16,
    draw: 12,
    lost: 10,
    points: 60,
    goalsFor: 51,
    goalsAgainst: 39,
    goalDifference: 12,
  },
];

const meta: Meta<typeof ClassificationWidget> = {
  title: "Widgets/ClassificationWidget",
  component: ClassificationWidget,
  parameters: {
    layout: "centered",
    clerk: { enabled: false }, // Disable Clerk for this component
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes for styling the widget container.",
    },
    initialStandings: {
      control: "object",
      description: "Initial standings data to bypass API call.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ClassificationWidget>;

export const Default: Story = {
  args: {
    initialStandings: mockStandings,
  },
};

export const Loading: Story = {
  args: {
    simulateLoading: true,
  },
};

export const EmptyState: Story = {
  args: {
    initialStandings: [],
  },
};

export const ErrorState: Story = {
  args: {
    // Simulate error by providing null and letting component fetch (which will error)
    initialStandings: null,
  },
  parameters: {
    // This parameter will be used by the global decorator in preview.ts
    // to mock the fetch call to return an error.
    mockFetchError: true,
  },
};
