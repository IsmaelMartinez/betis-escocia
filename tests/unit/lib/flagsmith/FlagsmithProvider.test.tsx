import React from 'react';
import { render, screen } from '@testing-library/react';
import { FlagsmithProvider } from '@/lib/flagsmith/FlagsmithProvider';
import { initializeFeatureFlags } from '@/lib/featureFlags';

// Mock the initializeFeatureFlags function
jest.mock('@/lib/featureFlags', () => ({
  initializeFeatureFlags: jest.fn(),
}));

describe('FlagsmithProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call initializeFeatureFlags on mount', () => {
    render(
      <FlagsmithProvider>
        <div>Test Children</div>
      </FlagsmithProvider>
    );

    expect(initializeFeatureFlags).toHaveBeenCalledTimes(1);
  });

  it('should render children', () => {
    render(
      <FlagsmithProvider>
        <div>Test Children</div>
      </FlagsmithProvider>
    );

    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });
});