'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { getCardClass, cn } from '@/lib/utils/designSystem';

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

interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  readonly children: ReactNode;
  readonly className?: string;
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div {...props} className={cn('px-6 py-4 border-b border-gray-200', className)}>
      {children}
    </div>
  );
}

interface CardBodyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  readonly children: ReactNode;
  readonly className?: string;
}

export function CardBody({ children, className = '', ...props }: CardBodyProps) {
  return (
    <div {...props} className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  readonly children: ReactNode;
  readonly className?: string;
}

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div {...props} className={cn('px-6 py-4 border-t border-gray-200 bg-gray-50/50', className)}>
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
