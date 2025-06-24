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
  const [logoSource, setLogoSource] = useState('/images/real_betis_official.svg');

  // High-quality SVG fallback with official Real Betis design
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <path d="M100 10 L170 40 L170 130 L100 190 L30 130 L30 40 Z" fill="#de9500" stroke="#000" stroke-width="2"/>
      <path d="M100 20 L155 45 L155 125 L100 175 L45 125 L45 45 Z" fill="#ffffff"/>
      <rect x="45" y="45" width="110" height="12" fill="#00954c"/>
      <rect x="45" y="70" width="110" height="12" fill="#00954c"/>
      <rect x="45" y="95" width="110" height="12" fill="#00954c"/>
      <rect x="45" y="120" width="110" height="12" fill="#00954c"/>
      <rect x="65" y="75" width="70" height="30" fill="#00954c" rx="3"/>
      <text x="100" y="95" font-family="serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">BETIS</text>
      <polygon points="95,25 100,15 105,25 103,30 97,30" fill="#de9500"/>
      <circle cx="100" cy="18" r="2" fill="#de9500"/>
      <circle cx="60" cy="60" r="3" fill="#00954c"/>
      <circle cx="140" cy="60" r="3" fill="#00954c"/>
      <circle cx="60" cy="90" r="3" fill="#00954c"/>
      <circle cx="140" cy="90" r="3" fill="#00954c"/>
      <circle cx="60" cy="120" r="3" fill="#00954c"/>
      <circle cx="140" cy="120" r="3" fill="#00954c"/>
      <rect x="50" y="145" width="100" height="12" fill="#00954c" rx="2"/>
      <text x="100" y="152" font-family="serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">REAL BETIS BALOMPIÉ</text>
    </svg>
  `;
  const betisLogoSvg = `data:image/svg+xml;base64,${btoa(svgContent)}`;

  const handleImageError = () => {
    if (logoSource === '/images/real_betis_official.svg') {
      // Try simplified version
      setLogoSource('/images/betis_logo_simple.svg');
    } else if (logoSource === '/images/betis_logo_simple.svg') {
      // Try the horizontal logo as final fallback
      setLogoSource('/images/logo_horizontal.svg');
    } else {
      // All external logos failed, use inline SVG fallback
      setImageError(true);
    }
  };

  if (imageError) {
    // Fallback to inline SVG
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

  // Try our official logo first, then fallback chain
  return (
    <Image
      src={logoSource}
      alt="Real Betis"
      width={width}
      height={height}
      className={`rounded-lg shadow-md ${className}`}
      onError={handleImageError}
      unoptimized
    />
  );
}
