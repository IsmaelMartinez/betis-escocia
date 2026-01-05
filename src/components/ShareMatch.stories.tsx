import type { Meta, StoryObj } from "@storybook/nextjs";
import { useEffect, ReactElement } from "react";
import ShareMatch from "./ShareMatch";
import { Match } from "@/types/match";
import { fn } from "storybook/test";

// Mock wrapper component for Storybook
function MockedWrapper({ children }: { children: ReactElement }) {
  useEffect(() => {
    // Mock browser APIs
    if (typeof window !== "undefined") {
      // Store originals
      const originalShare = navigator.share;
      const originalClipboard = navigator.clipboard;
      const originalOpen = window.open;

      // Mock navigator.share
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: fn(() => Promise.resolve()),
      });

      // Mock navigator.clipboard
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: fn(() => Promise.resolve()),
        },
      });

      // Mock window.open
      window.open = fn() as unknown as typeof window.open;

      // Cleanup on unmount
      return () => {
        if (originalShare) {
          Object.defineProperty(navigator, "share", {
            configurable: true,
            value: originalShare,
          });
        }
        if (originalClipboard) {
          Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: originalClipboard,
          });
        }
        window.open = originalOpen;
      };
    }
  }, []);

  return children;
}

const mockMatch: Match = {
  id: 1,
  competition: {
    id: 2014,
    name: "La Liga",
    code: "PD",
    type: "LEAGUE",
    emblem: "https://crests.football-data.org/PD.png",
  },
  utcDate: new Date().toISOString(),
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
  stage: "REGULAR_SEASON",
  lastUpdated: new Date().toISOString(),
  season: {
    id: 1,
    startDate: "2024-08-01",
    endDate: "2025-05-31",
    currentMatchday: 30,
  },
};

const mockFinishedMatch: Match = {
  id: 2,
  competition: {
    id: 2014,
    name: "La Liga",
    code: "PD",
    type: "LEAGUE",
    emblem: "https://crests.football-data.org/PD.png",
  },
  utcDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
  status: "FINISHED",
  matchday: 29,
  homeTeam: {
    id: 90,
    name: "Real Betis",
    shortName: "Betis",
    tla: "BET",
    crest: "https://crests.football-data.org/90.png",
  },
  awayTeam: {
    id: 86,
    name: "Real Madrid",
    shortName: "Real Madrid",
    tla: "RMA",
    crest: "https://crests.football-data.org/86.png",
  },
  score: {
    fullTime: { home: 1, away: 2 },
    duration: "REGULAR",
    halfTime: { home: 1, away: 1 },
  },
  stage: "REGULAR_SEASON",
  lastUpdated: new Date().toISOString(),
  season: {
    id: 1,
    startDate: "2024-08-01",
    endDate: "2025-05-31",
    currentMatchday: 29,
  },
};

const meta: Meta<typeof ShareMatch> = {
  title: "Components/ShareMatch",
  component: ShareMatch,
  parameters: {
    layout: "centered",
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ["autodocs"],
  argTypes: {
    match: { control: "object" },
    opponent: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof ShareMatch>;

export const Default: Story = {
  args: {
    match: mockMatch,
    opponent: mockMatch.awayTeam,
  },
  decorators: [
    (Story) => (
      <MockedWrapper>
        <Story />
      </MockedWrapper>
    ),
  ],
};

export const FinishedMatch: Story = {
  args: {
    match: mockFinishedMatch,
    opponent: mockFinishedMatch.awayTeam,
  },
  decorators: [
    (Story) => (
      <MockedWrapper>
        <Story />
      </MockedWrapper>
    ),
  ],
};

// Error mock wrapper component
function ErrorMockedWrapper({ children }: { children: ReactElement }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Store originals
      const originalShare = navigator.share;
      const originalClipboard = navigator.clipboard;
      const originalOpen = window.open;

      // Mock failing navigator.share
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: fn(() => Promise.reject(new Error("Share failed"))),
      });

      // Mock failing navigator.clipboard
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: fn(() =>
            Promise.reject(new Error("Clipboard write failed")),
          ),
        },
      });

      // Mock window.open
      window.open = fn() as unknown as typeof window.open;

      // Cleanup on unmount
      return () => {
        if (originalShare) {
          Object.defineProperty(navigator, "share", {
            configurable: true,
            value: originalShare,
          });
        }
        if (originalClipboard) {
          Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: originalClipboard,
          });
        }
        window.open = originalOpen;
      };
    }
  }, []);

  return children;
}

export const ShareError: Story = {
  args: {
    match: mockMatch,
    opponent: mockMatch.awayTeam,
  },
  decorators: [
    (Story) => (
      <ErrorMockedWrapper>
        <Story />
      </ErrorMockedWrapper>
    ),
  ],
};
