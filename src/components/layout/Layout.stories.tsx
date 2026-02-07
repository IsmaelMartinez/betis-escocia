import type { Meta, StoryObj } from "@storybook/nextjs";
import Layout from "./Layout";
import { setMockUser } from "@/lib/clerk/__mocks__/storybook";
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
  parameters: {
    layout: "fullscreen",
    clerk: { enabled: true }, // Enable Clerk for this component as it uses Clerk hooks
  },
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
    debugInfo: {
      features: { "show-clerk-auth": true, "show-partidos": true },
      environment: "development",
      enabledFeatures: ["show-clerk-auth", "show-partidos"],
      disabledFeatures: [],
    },
    navigationItems: mockNavigationItems,
  },
  render: (args) => {
    setMockUser(null); // Ensure no user is logged in by default
    return <Layout {...args} />;
  },
};

export const LoggedIn: Story = {
  args: {
    debugInfo: {
      features: { "show-clerk-auth": true, "show-partidos": true },
      environment: "development",
      enabledFeatures: ["show-clerk-auth", "show-partidos"],
      disabledFeatures: [],
    },
    navigationItems: mockNavigationItems,
  },
  render: (args) => {
    setMockUser({
      id: "user_123",
      firstName: "John",
      lastName: "Doe",
      emailAddresses: [{ emailAddress: "john.doe@example.com" }],
      publicMetadata: { role: "member" },
      createdAt: new Date(),
      lastSignInAt: new Date(),
      imageUrl: "https://example.com/avatar.jpg",
    });
    return <Layout {...args} />;
  },
};

export const LoggedInAdmin: Story = {
  args: {
    debugInfo: {
      features: { "show-clerk-auth": true, "show-partidos": true },
      environment: "development",
      enabledFeatures: ["show-clerk-auth", "show-partidos"],
      disabledFeatures: [],
    },
    navigationItems: mockNavigationItems,
  },
  render: (args) => {
    setMockUser({
      id: "user_admin",
      firstName: "Admin",
      lastName: "User",
      emailAddresses: [{ emailAddress: "admin@example.com" }],
      publicMetadata: { role: "admin" },
      createdAt: new Date(),
      lastSignInAt: new Date(),
      imageUrl: "https://example.com/admin-avatar.jpg",
    });
    return <Layout {...args} />;
  },
};

export const FeatureFlagsDisabled: Story = {
  args: {
    debugInfo: {
      features: { "show-clerk-auth": false, "show-partidos": false },
      environment: "development",
      enabledFeatures: [],
      disabledFeatures: ["show-clerk-auth", "show-partidos"],
    },
    navigationItems: [],
  },
  render: (args) => {
    setMockUser(null); // Ensure no user is logged in by default
    return <Layout {...args} />;
  },
};
