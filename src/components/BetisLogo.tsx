'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BetisLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function BetisLogo({ width = 80, height = 80, className = "" }: BetisLogoProps) {
  const [imageError, setImageError] = useState(false);

  // SVG data URL for fallback
  const svgContent = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#00A651" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="50" cy="50" r="40" fill="#FFFFFF"/>
      <circle cx="50" cy="50" r="32" fill="#00A651"/>
      <text x="50" y="58" font-family="Arial Black, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">RB</text>
      <polygon points="45,25 50,20 55,25 52,30 48,30" fill="#FFFFFF"/>
    </svg>
  `;
  const betisLogoSvg = `data:image/svg+xml;base64,${btoa(svgContent)}`;

  if (imageError) {
    // Fallback to SVG data URL
    return (
      <Image
        src={betisLogoSvg}
        alt="Real Betis"
        width={width}
        height={height}
        className={`rounded-lg shadow-md ${className}`}
        unoptimized
      />
    );
  }

  return (
    <Image
      src="/images/betis-logo.png"
      alt="Real Betis"
      width={width}
      height={width}
      className={`rounded-lg shadow-md ${className}`}
      onError={() => setImageError(true)}
      unoptimized
    />
  );
}
