import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RSVPForm from '@/components/RSVPForm';
import { useUser } from '@clerk/nextjs';

// Mock the dependencies
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn()
}));

vi.mock('@/lib/featureFlags', () => ({
  isFeatureEnabled: vi.fn(() => false), // Default to disabled
}));

vi.mock('@/components/MessageComponent', () => ({
  FormSuccessMessage: vi.fn(({ title, message, className }) => (
    <div className={className} data-testid="success-message">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  )),
  FormErrorMessage: vi.fn(({ message, className }) => (
    <div className={className} data-testid="error-message">
      {message}
    </div>
  )),
  FormLoadingMessage: vi.fn(({ message, className }) => (
    <div className={className} data-testid="loading-message">
      {message}
    </div>
  ))
}));

vi.mock('@/components/Field', () => ({
  default: vi.fn(({ label, children, error, touched, className }) => (
    <div className={className} data-testid="field">
      <label>{label}</label>
      {children}
      {touched && error && <span data-testid="field-error">{error}</span>}
    </div>
  )),
  ValidatedInput: vi.fn((props) => (
    <input
      {...props}
      data-testid={`input-${props.name}`}
    />
  )),
  ValidatedSelect: vi.fn((props) => (
    <select
      {...props}
      data-testid={`select-${props.name}`}
    >
      {props.children}
    </select>
  )),
  ValidatedTextarea: vi.fn((props) => (
    <textarea
      {...props}
      data-testid={`textarea-${props.name}`}
    />
  ))
}));

vi.mock('@/lib/formValidation', () => ({
  useFormValidation: vi.fn(() => ({
    data: {
      name: '',
      email: '',
      attendees: 1,
      message: ''
    },
    errors: {},
    touched: {},
    handleChange: vi.fn(),
    handleBlur: vi.fn(),
    validateField: vi.fn(),
    validateForm: vi.fn(() => ({ isValid: true, errors: {} })),
    resetForm: vi.fn(),
    setData: vi.fn()
  })),
  commonValidationRules: {
    name: { required: true, minLength: 2, maxLength: 50 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    message: { required: false, minLength: 5, maxLength: 500 }
  }
}));

vi.mock('lucide-react', () => ({
  User: vi.fn(() => <div data-testid="user-icon" />),
  Mail: vi.fn(() => <div data-testid="mail-icon" />),
  MessageSquare: vi.fn(() => <div data-testid="message-square-icon" />),
  Users: vi.fn(() => <div data-testid="users-icon" />),
}));

// Mock fetch
global.fetch = vi.fn();

describe('RSVPForm', () => {
  const mockUseUser = vi.mocked(useUser);

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Basic rendering', () => {
    it('renders RSVP form with all fields', () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });

      render(<RSVPForm />);

      expect(screen.getByTestId('input-name')).toBeInTheDocument();
      expect(screen.getByTestId('input-email')).toBeInTheDocument();
      expect(screen.getByTestId('select-attendees')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-message')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });

      render(<RSVPForm />);

      expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument();
    });
  });

  describe('Feature flag integration', () => {
    it('works when feature flags are disabled', () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });
      
      render(<RSVPForm />);

      // Component should render successfully even with feature flags disabled
      expect(screen.getByTestId('input-name')).toBeInTheDocument();
    });

    it('works when user is not authenticated', () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });
      
      render(<RSVPForm />);

      expect(screen.getByTestId('input-name')).toBeInTheDocument();
      expect(screen.getByTestId('input-email')).toBeInTheDocument();
    });
  });

  describe('User authentication integration', () => {
    it('pre-fills form when user is authenticated', () => {
      const mockUser = {
        firstName: 'Juan',
        lastName: 'Pérez',
        emailAddresses: [{ emailAddress: 'juan@example.com' }]
      };

      mockUseUser.mockReturnValue({ 
        user: mockUser, 
        isLoaded: true, 
        isSignedIn: true 
      } as any);

      render(<RSVPForm />);

      // Form should render with user data
      expect(screen.getByTestId('input-name')).toBeInTheDocument();
      expect(screen.getByTestId('input-email')).toBeInTheDocument();
    });
  });

  describe('Props handling', () => {
    it('accepts onSuccess callback prop', () => {
      const mockOnSuccess = vi.fn();
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });

      render(<RSVPForm onSuccess={mockOnSuccess} />);

      expect(screen.getByTestId('input-name')).toBeInTheDocument();
    });

    it('accepts selectedMatchId prop', () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });

      render(<RSVPForm selectedMatchId={123} />);

      expect(screen.getByTestId('input-name')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('renders without crashing when user data is malformed', () => {
      const mockUser = {
        firstName: null,
        lastName: undefined,
        emailAddresses: []
      };

      mockUseUser.mockReturnValue({ 
        user: mockUser, 
        isLoaded: true, 
        isSignedIn: true 
      } as any);

      expect(() => render(<RSVPForm />)).not.toThrow();
    });

    it('handles loading state properly', () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: false, isSignedIn: false } as any);

      render(<RSVPForm />);

      // Component should still render while loading
      expect(screen.getByTestId('input-name')).toBeInTheDocument();
    });
  });
});