'use client';

import Image from 'next/image';

interface BetisLogoProps {
  readonly width?: number;
  readonly height?: number;
  readonly className?: string;
}

export default function BetisLogo({ width = 80, height = 80, className = "" }: BetisLogoProps) {
  return (
    <Image
      src="/images/real_betis_official.svg"
      alt="Real Betis"
      width={width}
      height={height}
      className={`rounded-lg shadow-md ${className}`}
      unoptimized
    />
  );
}
