import type { Meta, StoryObj } from "@storybook/nextjs";
import MatchTicket from "./MatchTicket";

const meta: Meta<typeof MatchTicket> = {
  title: "Components/MatchTicket",
  component: MatchTicket,
  parameters: {
    layout: "centered",
    clerk: { enabled: false },
    backgrounds: {
      default: "light",
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["upcoming", "live", "finished"],
    },
    priority: {
      control: "select",
      options: ["normal", "featured", "derby"],
    },
    status: {
      control: "select",
      options: [
        "SCHEDULED",
        "TIMED",
        "IN_PLAY",
        "PAUSED",
        "FINISHED",
        "POSTPONED",
        "CANCELLED",
      ],
    },
    isHome: {
      control: "boolean",
    },
    showRSVP: {
      control: "boolean",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MatchTicket>;

// Sample data
const upcomingMatch = {
  id: 1,
  opponent: "Sevilla FC",
  date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
  competition: "Primera División",
  isHome: true,
  status: "SCHEDULED" as const,
  matchday: 19,
  watchParty: {
    location: "Polwarth Tavern",
    address: "35 Polwarth Cres, Edinburgh EH11 1HR",
    time: "20:00",
  },
  rsvpInfo: {
    rsvpCount: 12,
    totalAttendees: 18,
  },
  showRSVP: true,
};

const liveMatch = {
  id: 2,
  opponent: "Valencia CF",
  date: new Date().toISOString(),
  competition: "Primera División",
  isHome: false,
  status: "IN_PLAY" as const,
  matchday: 18,
  score: { home: 1, away: 2 },
  showRSVP: false,
};

const finishedMatch = {
  id: 3,
  opponent: "Athletic Club",
  date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  competition: "Copa del Rey",
  isHome: true,
  status: "FINISHED" as const,
  matchday: undefined,
  score: { home: 3, away: 1 },
  result: "W",
  showRSVP: false,
};

export const Upcoming: Story = {
  args: {
    ...upcomingMatch,
    variant: "upcoming",
    priority: "normal",
  },
};

export const UpcomingDerby: Story = {
  args: {
    ...upcomingMatch,
    variant: "upcoming",
    priority: "derby",
  },
};

export const UpcomingFeatured: Story = {
  args: {
    ...upcomingMatch,
    opponent: "Barcelona",
    variant: "upcoming",
    priority: "featured",
  },
};

export const Live: Story = {
  args: {
    ...liveMatch,
    variant: "live",
  },
};

export const LivePaused: Story = {
  args: {
    ...liveMatch,
    status: "PAUSED",
    variant: "live",
  },
};

export const Finished: Story = {
  args: {
    ...finishedMatch,
    variant: "finished",
  },
};

export const FinishedAway: Story = {
  args: {
    ...finishedMatch,
    isHome: false,
    variant: "finished",
  },
};

export const ChampionsLeague: Story = {
  args: {
    ...upcomingMatch,
    opponent: "Manchester United",
    competition: "UEFA Champions League",
    variant: "upcoming",
    priority: "featured",
  },
};

export const EuropaLeague: Story = {
  args: {
    ...upcomingMatch,
    opponent: "AS Roma",
    competition: "UEFA Europa League",
    variant: "upcoming",
  },
};

export const CopaDelRey: Story = {
  args: {
    ...upcomingMatch,
    opponent: "Girona FC",
    competition: "Copa del Rey",
    variant: "upcoming",
  },
};

export const Postponed: Story = {
  args: {
    ...upcomingMatch,
    status: "POSTPONED",
    showRSVP: false,
  },
};

export const WithoutRSVP: Story = {
  args: {
    ...upcomingMatch,
    showRSVP: false,
    rsvpInfo: undefined,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-md">
      <h3 className="text-lg font-bold text-gray-700">Upcoming (Normal)</h3>
      <MatchTicket {...upcomingMatch} variant="upcoming" priority="normal" />

      <h3 className="text-lg font-bold text-gray-700">Upcoming (Derby)</h3>
      <MatchTicket {...upcomingMatch} variant="upcoming" priority="derby" />

      <h3 className="text-lg font-bold text-gray-700">Live</h3>
      <MatchTicket {...liveMatch} variant="live" />

      <h3 className="text-lg font-bold text-gray-700">Finished</h3>
      <MatchTicket {...finishedMatch} variant="finished" />
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 max-w-4xl">
      <MatchTicket {...upcomingMatch} variant="upcoming" priority="derby" />
      <MatchTicket
        {...upcomingMatch}
        opponent="Athletic Club"
        competition="Copa del Rey"
        variant="upcoming"
      />
      <MatchTicket {...liveMatch} variant="live" />
      <MatchTicket {...finishedMatch} variant="finished" />
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
};

