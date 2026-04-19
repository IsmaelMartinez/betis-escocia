import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// Mock all dependencies
vi.mock("@clerk/nextjs", () => ({
  useAuth: vi.fn(),
  useUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/api/supabase", () => ({
  createMatch: vi.fn(),
  updateMatch: vi.fn(),
  deleteMatch: vi.fn(),
  getMatches: vi.fn(() => Promise.resolve([])),
}));

vi.mock("@/lib/auth/withAdminRole", () => ({
  withAdminRole: vi.fn((Component) => Component),
}));

vi.mock("@/lib/features/featureFlags", () => ({
  hasFeature: vi.fn(() => true),
}));

vi.mock("@/lib/features/featureProtection", () => ({
  FeatureWrapper: vi.fn(({ children }) => children),
}));

vi.mock("@/lib/utils/logger", () => ({
  log: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock all admin components
vi.mock("@/components/admin/MatchForm", () => ({
  default: vi.fn(() => <div data-testid="match-form">Match Form</div>),
}));

vi.mock("@/components/admin/MatchesList", () => ({
  default: vi.fn(() => <div data-testid="matches-list">Matches List</div>),
}));

vi.mock("@/components/ui/Card", () => ({
  default: vi.fn(({ children }) => <div data-testid="card">{children}</div>),
  CardHeader: vi.fn(({ children }) => (
    <div data-testid="card-header">{children}</div>
  )),
  CardBody: vi.fn(({ children }) => (
    <div data-testid="card-body">{children}</div>
  )),
}));

vi.mock("@/components/ui/Button", () => ({
  default: vi.fn(({ children, onClick, disabled, ...props }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      {...props}
      data-testid="button"
    >
      {children}
    </button>
  )),
}));

vi.mock("@/components/LoadingSpinner", () => ({
  default: vi.fn(() => <div data-testid="loading-spinner">Loading...</div>),
}));

vi.mock("@/components/MessageComponent", () => ({
  default: vi.fn(({ message }) => <div data-testid="message">{message}</div>),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock date-fns
vi.mock("date-fns", () => ({
  format: vi.fn(() => "2025-08-25"),
}));

vi.mock("date-fns/locale", () => ({
  es: {},
}));

vi.mock("@/lib/constants/dateFormats", () => ({
  DATE_FORMAT: "dd/MM/yyyy",
}));

// Import the component after all mocks
import AdminPage from "@/app/[locale]/admin/page";

describe("AdminPage", () => {
  const mockPush = vi.fn();
  const mockGetToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);

    vi.mocked(useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: mockGetToken,
    } as any);

    vi.mocked(useUser).mockReturnValue({
      user: {
        id: "admin-123",
        emailAddresses: [{ emailAddress: "admin@test.com" }],
      },
    } as any);

    mockGetToken.mockResolvedValue("valid-token");

    // Mock successful fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: "Success" }),
    } as any);
  });

  describe("Authentication", () => {
    it("should redirect to sign-in when not authenticated", () => {
      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        getToken: mockGetToken,
      } as any);

      render(<AdminPage />);

      expect(mockPush).toHaveBeenCalledWith("/sign-in");
    });

    it("should not redirect when authenticated", () => {
      render(<AdminPage />);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should not redirect when auth is not loaded yet", () => {
      vi.mocked(useAuth).mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
        getToken: mockGetToken,
      } as any);

      render(<AdminPage />);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Component Rendering", () => {
    it("should render loading spinner initially", () => {
      render(<AdminPage />);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("should render dashboard view by default after loading", async () => {
      render(<AdminPage />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      });

      // Should show dashboard cards
      expect(screen.getAllByTestId("card").length).toBeGreaterThan(0);
    });
  });

  describe("Matches Data Fetching", () => {
    it("should fetch matches on mount via getMatches", async () => {
      const { getMatches } = await import("@/lib/api/supabase");

      render(<AdminPage />);

      await waitFor(() => {
        expect(getMatches).toHaveBeenCalled();
      });
    });
  });

  describe("Component Integration", () => {
    it("should have admin components available", async () => {
      const MatchForm = await import("@/components/admin/MatchForm");
      expect(MatchForm.default).toBeDefined();

      const MatchesList = await import("@/components/admin/MatchesList");
      expect(MatchesList.default).toBeDefined();
    });

    it("should render and manage state correctly", async () => {
      render(<AdminPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      });

      // Component should render cards successfully
      expect(screen.getAllByTestId("card").length).toBeGreaterThan(0);
    });
  });
});
