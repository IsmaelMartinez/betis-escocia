'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { getCardClass, cn } from '@/lib/designSystem';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  readonly variant?: 'base' | 'interactive' | 'elevated' | 'betis';
  readonly className?: string;
  readonly children: ReactNode;
}

export default function Card({ 
  variant = 'base',
  className = '',
  children,
  ...props 
}: CardProps) {
  const cardClass = getCardClass(variant);
  
  return (
    <div
      {...props}
      className={cn(cardClass, className)}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-200', className)}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-gray-200 bg-gray-50/50', className)}>
      {children}
    </div>
  );
}

// Specialized card variants
export function InteractiveCard(props: Omit<CardProps, 'variant'>) {
  return <Card {...props} variant="interactive" />;
}

export function BetisCard(props: Omit<CardProps, 'variant'>) {
  return <Card {...props} variant="betis" />;
}

export function ElevatedCard(props: Omit<CardProps, 'variant'>) {
  return <Card {...props} variant="elevated" />;
}
