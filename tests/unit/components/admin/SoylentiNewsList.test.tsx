import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SoylentiNewsList from "@/components/admin/SoylentiNewsList";
import type { BetisNewsWithPlayers } from "@/types/soylenti";

// Mock dependencies
vi.mock("@/components/ui/Card", () => ({
  default: vi.fn(({ children, className }) => (
    <div className={`card ${className}`} data-testid="card">
      {children}
    </div>
  )),
  CardBody: vi.fn(({ children }) => (
    <div data-testid="card-body">{children}</div>
  )),
}));

vi.mock("@/components/MessageComponent", () => ({
  default: vi.fn(({ type, message }) => (
    <div data-testid="message-component" data-type={type}>
      {message}
    </div>
  )),
}));

vi.mock("@/components/LoadingSpinner", () => ({
  default: vi.fn(({ size, label }) => (
    <div data-testid="loading-spinner" data-size={size}>
      {label}
    </div>
  )),
}));

vi.mock("@/components/ui/Button", () => ({
  default: vi.fn(({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">
      {children}
    </button>
  )),
}));

describe("SoylentiNewsList", () => {
  const mockOnReassess = vi.fn();
  const mockOnHide = vi.fn();

  const createMockNews = (
    overrides: Partial<BetisNewsWithPlayers> = {},
  ): BetisNewsWithPlayers => ({
    id: 1,
    title: "Test News",
    link: "https://example.com/news/1",
    pub_date: "2024-01-15T10:30:00Z",
    source: "Test Source",
    description: "Test description",
    ai_probability: 75,
    ai_analysis: "Test analysis",
    is_duplicate: false,
    is_hidden: false,
    created_at: "2024-01-15T10:30:00Z",
    admin_context: null,
    reassessed_at: null,
    news_players: [],
    ...overrides,
  });

  const mockVisibleNews: BetisNewsWithPlayers[] = [
    createMockNews({ id: 1, title: "Visible News 1", is_hidden: false }),
    createMockNews({ id: 2, title: "Visible News 2", is_hidden: false }),
  ];

  const mockHiddenNews: BetisNewsWithPlayers[] = [
    createMockNews({ id: 3, title: "Hidden News 1", is_hidden: true }),
    createMockNews({ id: 4, title: "Hidden News 2", is_hidden: true }),
  ];

  const mockMixedNews: BetisNewsWithPlayers[] = [
    ...mockVisibleNews,
    ...mockHiddenNews,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading state", () => {
    it("shows loading spinner when isLoading is true", () => {
      render(
        <SoylentiNewsList
          news={[]}
          onReassess={mockOnReassess}
          onHide={mockOnHide}
          isLoading={true}
          error={null}
        />,
      );

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  describe("Error state", () => {
    it("shows error message when error is provided", () => {
      render(
        <SoylentiNewsList
          news={[]}
          onReassess={mockOnReassess}
          onHide={mockOnHide}
          isLoading={false}
          error="Test error message"
        />,
      );

      const errorMessage = screen.getByTestId("message-component");
      expect(errorMessage).toHaveAttribute("data-type", "error");
      expect(errorMessage).toHaveTextContent("Test error message");
    });
  });

  describe("Empty state", () => {
    it("shows info message when news array is empty", () => {
      render(
        <SoylentiNewsList
          news={[]}
          onReassess={mockOnReassess}
          onHide={mockOnHide}
          isLoading={false}
          error={null}
        />,
      );

      const infoMessage = screen.getByTestId("message-component");
      expect(infoMessage).toHaveAttribute("data-type", "info");
      expect(infoMessage).toHaveTextContent("No hay noticias para mostrar.");
    });
  });

  describe("showHidden toggle behavior", () => {
    it("shows only visible items when showHidden is false (default)", () => {
      render(
        <SoylentiNewsList
          news={mockMixedNews}
          onReassess={mockOnReassess}
          onHide={mockOnHide}
          isLoading={false}
          error={null}
          showHidden={false}
        />,
      );

      // Should show visible news
      expect(screen.getByText("Visible News 1")).toBeInTheDocument();
      expect(screen.getByText("Visible News 2")).toBeInTheDocument();

      // Should NOT show hidden news
      expect(screen.queryByText("Hidden News 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Hidden News 2")).not.toBeInTheDocument();
    });

    it("shows only hidden items when showHidden is true", () => {
      render(
        <SoylentiNewsList
          news={mockMixedNews}
          onReassess={mockOnReassess}
          onHide={mockOnHide}
          isLoading={false}
          error={null}
          showHidden={true}
        />,
      );

      // Should show hidden news
      expect(screen.getByText("Hidden News 1")).toBeInTheDocument();
      expect(screen.getByText("Hidden News 2")).toBeInTheDocument();

      // Should NOT show visible news
      expect(screen.queryByText("Visible News 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Visible News 2")).not.toBeInTheDocument();
    });

    it("shows empty state when showHidden is true but no hidden items exist", () => {
      render(
        <SoylentiNewsList
          news={mockVisibleNews}
          onReassess={mockOnReassess}
          onHide={mockOnHide}
          isLoading={false}
          error={null}
          showHidden={true}
        />,
      );

      // No cards should be rendered (empty filtered result)
      expect(screen.queryAllByTestId("card")).toHaveLength(0);
    });

    it("shows empty state when showHidden is false but no visible items exist", () => {
      render(
        <SoylentiNewsList
          news={mockHiddenNews}
          onReassess={mockOnReassess}
          onHide={mockOnHide}
          isLoading={false}
          error={null}
          showHidden={false}
        />,
      );

      // No cards should be rendered (empty filtered result)
      expect(screen.queryAllByTestId("card")).toHaveLength(0);
    });
  });

  describe("Sorting behavior", () => {
    it("displays news items sorted by pub_date descending (newest first)", () => {
      const unsortedNews: BetisNewsWithPlayers[] = [
        createMockNews({
          id: 1,
          title: "Oldest News",
          pub_date: "2024-01-10T10:00:00Z",
          is_hidden: false,
        }),
        createMockNews({
          id: 2,
          title: "Newest News",
          pub_date: "2024-01-20T10:00:00Z",
          is_hidden: false,
        }),
        createMockNews({
          id: 3,
          title: "Middle News",
          pub_date: "2024-01-15T10:00:00Z",
          is_hidden: false,
        }),
      ];

      render(
        <SoylentiNewsList
          news={unsortedNews}
          onReassess={mockOnReassess}
          onHide={mockOnHide}
          isLoading={false}
          error={null}
          showHidden={false}
        />,
      );

      const cards = screen.getAllByTestId("card");
      expect(cards).toHaveLength(3);

      // Check order: Newest, Middle, Oldest
      const titles = screen.getAllByRole("heading", { level: 3 });
      expect(titles[0]).toHaveTextContent("Newest News");
      expect(titles[1]).toHaveTextContent("Middle News");
      expect(titles[2]).toHaveTextContent("Oldest News");
    });
  });
});
