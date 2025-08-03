import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

interface ClerkDecoratorProps {
  children: React.ReactNode;
}

const ClerkDecorator: React.FC<ClerkDecoratorProps> = ({ children }) => {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
};

export default ClerkDecorator;