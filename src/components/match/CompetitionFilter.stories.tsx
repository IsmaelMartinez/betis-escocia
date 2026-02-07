import type { Meta, StoryObj } from "@storybook/nextjs";
import CompetitionFilter, { Competition } from "./CompetitionFilter";
import { fn } from "storybook/test";

const mockCompetitions: Competition[] = [
  {
    id: "PL",
    code: "PL",
    name: "Premier League",
    emblem: "https://crests.football-data.org/PL.png",
  },
  {
    id: "PD",
    code: "PD",
    name: "La Liga",
    emblem: "https://crests.football-data.org/PD.png",
  },
  {
    id: "SA",
    code: "SA",
    name: "Serie A",
    emblem: "https://crests.football-data.org/SA.png",
  },
];

const mockMatchCounts = {
  PL: 10,
  PD: 8,
  SA: 5,
};

const meta: Meta<typeof CompetitionFilter> = {
  title: "Components/CompetitionFilter",
  component: CompetitionFilter,
  parameters: {
    layout: "centered",
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ["autodocs"],
  argTypes: {
    competitions: {
      control: "object",
      description: "Array of competition objects",
    },
    selectedCompetition: {
      control: "select",
      options: [null, ...mockCompetitions.map((c) => c.id)],
      description: "ID of the currently selected competition",
    },
    onCompetitionChange: {
      action: "competitionChanged",
      description: "Callback function when competition selection changes",
    },
    matchCounts: {
      control: "object",
      description: "Object mapping competition IDs to match counts",
    },
  },
  args: {
    competitions: mockCompetitions,
    onCompetitionChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CompetitionFilter>;

export const Default: Story = {
  args: {
    selectedCompetition: null,
    matchCounts: mockMatchCounts,
  },
};

export const WithSelectedCompetition: Story = {
  args: {
    selectedCompetition: "PD",
    matchCounts: mockMatchCounts,
  },
};

export const NoMatchCounts: Story = {
  args: {
    selectedCompetition: null,
    matchCounts: {},
  },
};

export const EmptyCompetitions: Story = {
  args: {
    competitions: [],
    selectedCompetition: null,
    matchCounts: {},
  },
};
