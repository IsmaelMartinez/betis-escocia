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
      src="/images/logo_no_texto.jpg"
      alt="Peña Bética Escocesa"
      width={width}
      height={height}
      className={`rounded-lg shadow-md ${className}`}
      unoptimized
    />
  );
}
