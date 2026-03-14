import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RootLayout from "../../../src/app/layout";

describe("RootLayout", () => {
  it("renders children as pass-through", () => {
    const { container } = render(
      RootLayout({ children: <p>Test Children</p> }) as React.ReactElement,
    );

    expect(container.textContent).toBe("Test Children");
  });

  it("renders without errors", () => {
    expect(() => {
      render(
        RootLayout({ children: <p>Test Children</p> }) as React.ReactElement,
      );
    }).not.toThrow();
  });
});
