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

  // Simple SVG fallback for the official Betis shield
  const svgContent = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L85 25 L85 70 L50 95 L15 70 L15 25 Z" fill="#00A651" stroke="#FFFFFF" stroke-width="2"/>
      <path d="M50 12 L78 28 L78 66 L50 86 L22 66 L22 28 Z" fill="#FFFFFF"/>
      <path d="M22 28 L78 28 L78 36 L22 36 Z" fill="#00A651"/>
      <path d="M22 44 L78 44 L78 52 L22 52 Z" fill="#00A651"/>
      <path d="M22 60 L78 60 L78 66 L50 86 L22 66 Z" fill="#00A651"/>
      <circle cx="50" cy="47" r="12" fill="#00A651"/>
      <text x="50" y="53" font-family="serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">B</text>
      <polygon points="46,18 50,14 54,18 52,22 48,22" fill="#FFD700"/>
      <circle cx="50" cy="16" r="2" fill="#FFD700"/>
      <rect x="30" y="70" width="40" height="8" fill="#00A651" rx="2"/>
      <text x="50" y="76" font-family="serif" font-size="6" font-weight="bold" fill="#FFFFFF" text-anchor="middle">BETIS</text>
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
        className={className}
        unoptimized
      />
    );
  }

  // The official logo is square, so we can use the provided width and height directly
  return (
    <Image
      src="/images/betis_official_logo.png"
      alt="Real Betis"
      width={width}
      height={height}
      className={className}
      onError={() => setImageError(true)}
      unoptimized
    />
  );
}
