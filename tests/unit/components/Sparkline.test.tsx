import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Sparkline from "@/components/Sparkline";
import type { DailyMention } from "@/types/soylenti";

describe("Sparkline", () => {
  // Generate recent dates dynamically to avoid test failures when dates are in the past
  const getRecentDates = () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dates = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const recentDates = getRecentDates();
  const mockData: DailyMention[] = [
    { date: recentDates[0], count: 2 },
    { date: recentDates[1], count: 5 },
    { date: recentDates[2], count: 3 },
  ];

  describe("Basic Rendering", () => {
    it("should render an SVG element", () => {
      const { container } = render(<Sparkline data={mockData} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should render with default dimensions", () => {
      const { container } = render(<Sparkline data={mockData} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "64");
      expect(svg).toHaveAttribute("height", "20");
    });

    it("should render with custom dimensions", () => {
      const { container } = render(
        <Sparkline data={mockData} width={100} height={30} />,
      );
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "100");
      expect(svg).toHaveAttribute("height", "30");
    });

    it("should have aria-hidden for accessibility", () => {
      const { container } = render(<Sparkline data={mockData} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Sparkline data={mockData} className="custom-class" />,
      );
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("custom-class");
    });
  });

  describe("SVG Path Generation", () => {
    it("should render path elements for line and area", () => {
      const { container } = render(<Sparkline data={mockData} />);
      const paths = container.querySelectorAll("path");
      expect(paths.length).toBe(2); // area fill + main line
    });

    it("should render endpoint circle", () => {
      const { container } = render(<Sparkline data={mockData} />);
      const circle = container.querySelector("circle");
      expect(circle).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should show dashed line for empty data array", () => {
      const { container } = render(<Sparkline data={[]} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      // Should show a dashed line when no data
      const line = container.querySelector("line");
      expect(line).toBeInTheDocument();
      expect(line).toHaveAttribute("stroke-dasharray", "2,2");
    });

    it("should handle single data point without division by zero", () => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0];
      const singleData: DailyMention[] = [{ date: todayStr, count: 5 }];
      const { container } = render(<Sparkline data={singleData} days={1} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      // Should not have NaN in path
      const paths = container.querySelectorAll("path");
      paths.forEach((path) => {
        const d = path.getAttribute("d");
        expect(d).not.toContain("NaN");
      });
    });

    it("should show dashed line for all zeros data", () => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const dates = [];
      for (let i = 1; i >= 0; i--) {
        const date = new Date(today);
        date.setUTCDate(date.getUTCDate() - i);
        dates.push(date.toISOString().split("T")[0]);
      }
      const zeroData: DailyMention[] = [
        { date: dates[0], count: 0 },
        { date: dates[1], count: 0 },
      ];
      const { container } = render(<Sparkline data={zeroData} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      // Should show a dashed line when all zeros
      const line = container.querySelector("line");
      expect(line).toBeInTheDocument();
    });
  });

  describe("Trend Color Variants", () => {
    it("should use green color for up trend", () => {
      const { container } = render(<Sparkline data={mockData} trend="up" />);
      const linePath = container.querySelectorAll("path")[1];
      expect(linePath).toHaveAttribute("stroke", "var(--betis-verde)");
    });

    it("should use red color for down trend", () => {
      const { container } = render(<Sparkline data={mockData} trend="down" />);
      const linePath = container.querySelectorAll("path")[1];
      expect(linePath).toHaveAttribute("stroke", "#dc2626");
    });

    it("should use gray color for stable trend", () => {
      const { container } = render(
        <Sparkline data={mockData} trend="stable" />,
      );
      const linePath = container.querySelectorAll("path")[1];
      expect(linePath).toHaveAttribute("stroke", "#6b7280");
    });

    it("should default to stable trend when not specified", () => {
      const { container } = render(<Sparkline data={mockData} />);
      const linePath = container.querySelectorAll("path")[1];
      expect(linePath).toHaveAttribute("stroke", "#6b7280");
    });
  });

  describe("Days Configuration", () => {
    it("should respect custom days parameter", () => {
      // With days=7, the timeline should fill 7 days
      const { container } = render(<Sparkline data={mockData} days={7} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });
});
