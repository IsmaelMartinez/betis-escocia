"use client";

import type { DailyMention } from "@/types/soylenti";
import { fillTimeline } from "@/lib/utils/timeline";

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
  const total = filledData.reduce((a, b) => a + b, 0);
  const max = Math.max(...filledData, 1);
  const padding = 2;
  const effectiveHeight = height - padding * 2;
  const effectiveWidth = width - padding * 2;

  // Color based on trend
  const strokeColor =
    trend === "up"
      ? "var(--betis-verde)"
      : trend === "down"
        ? "#dc2626"
        : "#6b7280";

  // If no activity at all, show a dashed baseline
  if (total === 0) {
    return (
      <svg
        width={width}
        height={height}
        className={`inline-block ${className}`}
        aria-hidden="true"
      >
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          stroke="#d1d5db"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      </svg>
    );
  }

  // Generate SVG path (handle single data point to avoid division by zero)
  const divisor = filledData.length > 1 ? filledData.length - 1 : 1;
  const points = filledData
    .map((value, index) => {
      const x = padding + (index / divisor) * effectiveWidth;
      const y = height - padding - (value / max) * effectiveHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

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
