import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";
import { ErrorBoundary } from "./ErrorBoundary";

// A component that intentionally throws an error
const BuggyComponent = () => {
  throw new Error("I am a buggy component!");
};

const meta: Meta<typeof ErrorBoundary> = {
  title: "Components/ErrorBoundary",
  component: ErrorBoundary,
  parameters: {
    layout: "centered",
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ["autodocs"],
  argTypes: {
    fallback: {
      control: false, // Not directly controllable via args
    },
    children: {
      control: false, // Not directly controllable via args
    },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

export const Default: Story = {
  args: {
    children: <p>This component does not throw an error.</p>,
  },
};

export const WithError: Story = {
  args: {
    children: <BuggyComponent />,
  },
};

export const WithCustomFallback: Story = {
  args: {
    children: <BuggyComponent />,
    fallback: ({ error, resetError }) => (
      <div
        style={{
          border: "2px solid orange",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h3>Custom Fallback UI</h3>
        <p>Error: {error.message}</p>
        <button onClick={resetError}>Reset Custom Error</button>
      </div>
    ),
  },
};
