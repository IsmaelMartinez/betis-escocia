import type { Meta, StoryObj } from "@storybook/nextjs";
import Layout from "./Layout";
import type { NavigationItem } from "@/lib/features/featureFlags";

const mockNavigationItems: NavigationItem[] = [
  {
    name: "Partidos",
    href: "/partidos",
    nameEn: "Matches",
    feature: "show-partidos",
  },
  {
    name: "Nosotros",
    href: "/nosotros",
    nameEn: "About",
    feature: "show-nosotros",
  },
  { name: "Únete", href: "/unete", nameEn: "Join", feature: "show-unete" },
];

const meta: Meta<typeof Layout> = {
  title: "Layout/Layout",
  component: Layout,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  argTypes: {
    debugInfo: {
      control: "object",
      description: "Debug information for feature flags",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Layout>;

export const Default: Story = {
  args: {
    debugInfo: null,
    navigationItems: mockNavigationItems,
  },
};

export const WithDebugInfo: Story = {
  args: {
    debugInfo: {
      features: {
        "show-partidos": true,
        "show-clasificacion": true,
        "show-nosotros": true,
        "show-jugadores-historicos": true,
        "show-unete": true,
        "show-efemerides": true,
        "show-debug-info": true,
      },
      environment: "development",
      enabledFeatures: [
        "show-partidos",
        "show-clasificacion",
        "show-nosotros",
        "show-jugadores-historicos",
        "show-unete",
        "show-efemerides",
        "show-debug-info",
      ],
      disabledFeatures: [],
    },
    navigationItems: mockNavigationItems,
  },
};

export const NoNavigation: Story = {
  args: {
    debugInfo: null,
    navigationItems: [],
  },
};
