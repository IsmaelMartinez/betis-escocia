import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { withAdminRole } from '@/lib/withAdminRole';

// Mock Clerk hooks
const mockUseAuth = vi.fn();
const mockUseUser = vi.fn();
const mockPush = vi.fn();

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => mockUseAuth(),
  useUser: () => mockUseUser(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: ({ size, label }: { size: string; label: string }) => (
    <div data-testid="loading-spinner">
      Loading: {label} (size: {size})
    </div>
  ),
}));

// Test component
const TestComponent = ({ message }: { message: string }) => (
  <div data-testid="test-component">{message}</div>
);

describe('withAdminRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner while Clerk is loading', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
    });
    mockUseUser.mockReturnValue({
      user: null,
    });

    const WrappedComponent = withAdminRole(TestComponent);
    render(<WrappedComponent message="test" />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading: Verificando permisos... (size: lg)')).toBeInTheDocument();
  });

  it('should redirect to sign-in when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    });
    mockUseUser.mockReturnValue({
      user: null,
    });

    const WrappedComponent = withAdminRole(TestComponent);
    render(<WrappedComponent message="test" />);

    expect(mockPush).toHaveBeenCalledWith('/sign-in');
    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
  });

  it('should redirect to dashboard when user is not admin', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });
    mockUseUser.mockReturnValue({
      user: {
        id: 'user_123',
        publicMetadata: {
          role: 'user',
        },
      },
    });

    const WrappedComponent = withAdminRole(TestComponent);
    render(<WrappedComponent message="test" />);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading: Verificando permisos... (size: lg)')).toBeInTheDocument();
  });

  it('should redirect to dashboard when user has moderator role', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });
    mockUseUser.mockReturnValue({
      user: {
        id: 'user_123',
        publicMetadata: {
          role: 'moderator',
        },
      },
    });

    const WrappedComponent = withAdminRole(TestComponent);
    render(<WrappedComponent message="test" />);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render wrapped component when user is admin', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });
    mockUseUser.mockReturnValue({
      user: {
        id: 'user_123',
        publicMetadata: {
          role: 'admin',
        },
      },
    });

    const WrappedComponent = withAdminRole(TestComponent);
    render(<WrappedComponent message="Hello Admin!" />);

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Hello Admin!')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle user with no publicMetadata', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });
    mockUseUser.mockReturnValue({
      user: {
        id: 'user_123',
        publicMetadata: null,
      },
    });

    const WrappedComponent = withAdminRole(TestComponent);
    render(<WrappedComponent message="test" />);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should handle user with empty publicMetadata', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });
    mockUseUser.mockReturnValue({
      user: {
        id: 'user_123',
        publicMetadata: {},
      },
    });

    const WrappedComponent = withAdminRole(TestComponent);
    render(<WrappedComponent message="test" />);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should handle null user object', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });
    mockUseUser.mockReturnValue({
      user: null,
    });

    const WrappedComponent = withAdminRole(TestComponent);
    render(<WrappedComponent message="test" />);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should pass through all props to wrapped component', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });
    mockUseUser.mockReturnValue({
      user: {
        id: 'user_123',
        publicMetadata: {
          role: 'admin',
        },
      },
    });

    const TestComponentWithProps = ({ message, count }: { message: string; count: number }) => (
      <div data-testid="test-component">
        {message} - Count: {count}
      </div>
    );

    const WrappedComponent = withAdminRole(TestComponentWithProps);
    render(<WrappedComponent message="Hello" count={42} />);

    expect(screen.getByText('Hello - Count: 42')).toBeInTheDocument();
  });

  it('should work with TypeScript generics properly', () => {
    interface CustomProps {
      title: string;
      isActive: boolean;
    }

    const CustomComponent = ({ title, isActive }: CustomProps) => (
      <div data-testid="custom-component">
        {title} - Active: {isActive.toString()}
      </div>
    );

    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });
    mockUseUser.mockReturnValue({
      user: {
        id: 'user_123',
        publicMetadata: {
          role: 'admin',
        },
      },
    });

    const WrappedCustomComponent = withAdminRole(CustomComponent);
    render(<WrappedCustomComponent title="Test Title" isActive={true} />);

    expect(screen.getByText('Test Title - Active: true')).toBeInTheDocument();
  });

  it('should handle rapid state changes correctly', () => {
    // First render: loading
    mockUseAuth.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
    });
    mockUseUser.mockReturnValue({
      user: null,
    });

    const WrappedComponent = withAdminRole(TestComponent);
    const { rerender } = render(<WrappedComponent message="test" />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Second render: loaded but not signed in
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    });

    rerender(<WrappedComponent message="test" />);
    expect(mockPush).toHaveBeenCalledWith('/sign-in');

    // Third render: signed in but not admin
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });
    mockUseUser.mockReturnValue({
      user: {
        id: 'user_123',
        publicMetadata: {
          role: 'user',
        },
      },
    });

    rerender(<WrappedComponent message="test" />);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');

    // Fourth render: admin user
    mockUseUser.mockReturnValue({
      user: {
        id: 'user_123',
        publicMetadata: {
          role: 'admin',
        },
      },
    });

    rerender(<WrappedComponent message="Hello Admin!" />);
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Hello Admin!')).toBeInTheDocument();
  });

  it('should return null when not signed in (after redirect)', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    });
    mockUseUser.mockReturnValue({
      user: null,
    });

    const WrappedComponent = withAdminRole(TestComponent);
    const { container } = render(<WrappedComponent message="test" />);

    expect(container.firstChild).toBeNull();
  });
});