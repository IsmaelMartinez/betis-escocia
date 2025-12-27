import React from "react";
import type { Preview } from "@storybook/nextjs";
import "../src/app/globals.css";
import { initialize, mswLoader } from "msw-storybook-addon";
import ClerkDecorator from "../src/components/ClerkDecorator";

// Initialize MSW
initialize({
  onUnhandledRequest: "bypass", // or 'warn'
  serviceWorker: {
    url: "/mockServiceWorker.js", // Path relative to Storybook's root
    options: {
      scope: "/",
      baseUrl: "/",
    },
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
    viewport: {
      viewports: {
        mobile1: {
          name: "Small mobile",
          styles: {
            width: "320px",
            height: "568px",
          },
        },
        mobile2: {
          name: "Large mobile",
          styles: {
            width: "414px",
            height: "896px",
          },
        },
        tablet: {
          name: "Tablet",
          styles: {
            width: "768px",
            height: "1024px",
          },
        },
      },
      defaultViewport: "mobile1",
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "warm", value: "#FDFBF7" },
        { name: "dark", value: "#333333" },
        { name: "betis-verde", value: "#048D47" },
        { name: "betis-verde-dark", value: "#036B38" },
        { name: "betis-oro", value: "#D4AF37" },
        { name: "scotland-navy", value: "#0B1426" },
      ],
    },
  },
  loaders: [mswLoader],
  decorators: [
    (Story, context) => {
      const { clerk } = context.parameters;
      if (clerk && clerk.enabled === false) {
        return React.createElement(Story);
      }
      return React.createElement(
        ClerkDecorator,
        null,
        React.createElement(Story),
      );
    },
  ],
};

export default preview;
