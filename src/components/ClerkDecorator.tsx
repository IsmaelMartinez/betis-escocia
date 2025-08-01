import React from 'react';
// Removed ClerkProvider import

interface ClerkDecoratorProps {
  children: React.ReactNode;
}

const ClerkDecorator: React.FC<ClerkDecoratorProps> = ({ children }) => {
  return (
    <>{children}</> // Simply render children
  );
};

export default ClerkDecorator;