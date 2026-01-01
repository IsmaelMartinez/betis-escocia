"use client";

import type { DailyMention } from "@/types/soylenti";

interface SparklineProps {
  /** Sparse timeline data with dates and counts */
  data: DailyMention[];
  /** Number of days to display */
  days?: number;
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Trend direction for color coding */
  trend?: "up" | "down" | "stable";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Fill sparse timeline data into a complete array for the given number of days
 */
function fillTimeline(sparseData: DailyMention[], days: number): number[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result: number[] = [];
  const dataMap = new Map(sparseData.map((d) => [d.date, d.count]));

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    result.push(dataMap.get(dateStr) || 0);
  }

  return result;
}

/**
 * Pure SVG sparkline component for visualizing activity over time.
 * Zero dependencies - uses native SVG path generation.
 */
export default function Sparkline({
  data,
  days = 14,
  width = 64,
  height = 20,
  trend = "stable",
  className = "",
}: SparklineProps) {
  const filledData = fillTimeline(data, days);
  const max = Math.max(...filledData, 1);
  const padding = 2;
  const effectiveHeight = height - padding * 2;
  const effectiveWidth = width - padding * 2;

  // Generate SVG path
  const points = filledData
    .map((value, index) => {
      const x = padding + (index / (filledData.length - 1)) * effectiveWidth;
      const y = height - padding - (value / max) * effectiveHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Color based on trend
  const strokeColor =
    trend === "up"
      ? "var(--betis-verde)"
      : trend === "down"
        ? "#dc2626"
        : "#6b7280";

  // Create area fill path (for subtle background)
  const areaPath =
    points +
    ` L${(width - padding).toFixed(1)},${(height - padding).toFixed(1)} L${padding},${(height - padding).toFixed(1)} Z`;

  return (
    <svg
      width={width}
      height={height}
      className={`inline-block ${className}`}
      aria-hidden="true"
    >
      {/* Subtle area fill */}
      <path d={areaPath} fill={strokeColor} fillOpacity={0.1} />
      {/* Main line */}
      <path
        d={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Endpoint dot */}
      {filledData.length > 0 && (
        <circle
          cx={width - padding}
          cy={
            height -
            padding -
            (filledData[filledData.length - 1] / max) * effectiveHeight
          }
          r="2"
          fill={strokeColor}
        />
      )}
    </svg>
  );
}
