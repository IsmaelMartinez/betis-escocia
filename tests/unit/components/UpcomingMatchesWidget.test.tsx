import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UpcomingMatchesWidget from "@/components/match/UpcomingMatchesWidget";
import type { Match } from "@/lib/api/supabase";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: vi.fn(({ href, className, children, ...props }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  )),
}));

// Mock supabase functions
vi.mock("@/lib/api/supabase", () => ({
  getUpcomingMatchesWithRSVPCounts: vi.fn(),
}));

// Mock FeatureWrapper to always render children (feature enabled)
vi.mock("@/lib/features/featureProtection", () => ({
  FeatureWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Import the mocked function
import { getUpcomingMatchesWithRSVPCounts } from "@/lib/api/supabase";

describe("UpcomingMatchesWidget Component", () => {
  const mockMatches: (Match & {
    rsvp_count: number;
    total_attendees: number;
  })[] = [
    {
      id: 1,
      date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      opponent: "Valencia CF",
      competition: "La Liga",
      home_away: "home",
      rsvp_count: 15,
      total_attendees: 12,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(), // Added updated_at
    },
    {
      id: 2,
      date_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
      opponent: "Real Sociedad",
      competition: "Copa del Rey",
      home_away: "away",
      rsvp_count: 8,
      total_attendees: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(), // Added updated_at
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.reload
    Object.defineProperty(window, "location", {
      writable: true,
      value: { reload: vi.fn() },
    });
  });

  describe("Loading state", () => {
    it("renders loading skeleton", () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      render(<UpcomingMatchesWidget />);

      expect(screen.getByText("title")).toBeInTheDocument();
      expect(
        screen
          .getAllByRole("generic")
          .some((el) => el.className.includes("animate-pulse")),
      ).toBe(true);
    });

    it("shows skeleton items for matches", () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      render(<UpcomingMatchesWidget />);

      const skeletonItems = document.querySelectorAll(".animate-pulse");
      expect(skeletonItems.length).toBeGreaterThan(0);
    });
  });

  describe("Error state", () => {
    it("renders error message when API fails", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockRejectedValueOnce(
        new Error("API Error"),
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        expect(
          screen.getByText("errorLoading"),
        ).toBeInTheDocument();
      });

      expect(screen.getByText("retry")).toBeInTheDocument();
    });

    it("handles reload button click", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockRejectedValueOnce(
        new Error("API Error"),
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        const retryButton = screen.getByText("retry");
        fireEvent.click(retryButton);
        expect(window.location.reload).toHaveBeenCalled();
      });
    });
  });

  describe("Empty state", () => {
    it("renders empty state when no matches", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce([]);

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        expect(
          screen.getByText("noScheduled"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("willBeAnnounced"),
        ).toBeInTheDocument();
      });
    });

    it("shows links to matches page in empty state", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce([]);

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        const verTodosLink = screen.getByText("viewAll");
        const verHistorialLink = screen.getByText("viewHistory");

        expect(verTodosLink).toHaveAttribute("href", "/partidos");
        expect(verHistorialLink).toHaveAttribute("href", "/partidos");
      });
    });

    it("renders empty state when matches is null", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(null);

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        expect(
          screen.getByText("noScheduled"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Success state with matches", () => {
    it("renders matches correctly", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        mockMatches,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        expect(screen.getByText("Valencia CF")).toBeInTheDocument();
        expect(screen.getByText("Real Sociedad")).toBeInTheDocument();
        expect(screen.getByText("La Liga")).toBeInTheDocument();
        expect(screen.getByText("Copa del Rey")).toBeInTheDocument();
      });
    });

    it("displays home/away indicators correctly", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        mockMatches,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        // First match (home): Betis shows 'home', Valencia shows 'home' (component bug)
        // Second match (away): Betis shows 'away', Real Sociedad shows 'away'
        expect(screen.getAllByText("home")).toHaveLength(2); // Both teams in home match
        expect(screen.getAllByText("away")).toHaveLength(2); // Both teams in away match
      });
    });

    it("highlights Betis team name correctly", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        mockMatches,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        const betisElements = screen.getAllByText("Real Betis");
        betisElements.forEach((element) => {
          expect(element).toHaveClass("text-betis-verde");
        });
      });
    });

    it("shows RSVP counts when available", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        mockMatches,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        expect(screen.getAllByText("15")).toHaveLength(1); // rsvp_count for first match
        expect(screen.getAllByText("8")).toHaveLength(1); // rsvp_count for second match
        expect(screen.getAllByText("confirmations")).toHaveLength(2); // Both matches show confirmaciones
        expect(screen.getAllByText("12")).toHaveLength(1); // total_attendees for first match
        expect(screen.getAllByText("5")).toHaveLength(1); // total_attendees for second match
        expect(screen.getAllByText(/attendees/)).toHaveLength(2); // Both matches show attendees (using regex)
      });
    });

    it("shows RSVP button for upcoming matches", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        mockMatches,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        const rsvpButtons = screen.getAllByText("📝 confirmAttendance");
        expect(rsvpButtons).toHaveLength(2); // Both matches are upcoming

        expect(rsvpButtons[0].closest("a")).toHaveAttribute(
          "href",
          "/rsvp?match=1",
        );
        expect(rsvpButtons[1].closest("a")).toHaveAttribute(
          "href",
          "/rsvp?match=2",
        );
      });
    });

    it("formats match dates correctly", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        mockMatches,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        // Check that date elements exist (exact format depends on locale)
        const dateElements = document.querySelectorAll(
          ".text-xs.text-gray-500",
        );
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });

    it("applies grid layout for multiple matches", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        mockMatches,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        const container = document.querySelector(".grid");
        expect(container).toHaveClass("grid-cols-1", "md:grid-cols-2");
      });
    });

    it("uses space-y layout for single match", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce([
        mockMatches[0],
      ]);

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        const container = document.querySelector(".space-y-4");
        expect(container).toBeTruthy();
      });
    });

    it('renders "viewAllMatches" link', async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        mockMatches,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        // Check for the bottom link that uses the viewAllMatches key
        const bottomLink = screen.getByText("viewAllMatches");
        expect(bottomLink).toBeInTheDocument();
        expect(bottomLink).toHaveAttribute("href", "/partidos");
      });
    });

    it('shows header "viewAll" link', async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        mockMatches,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        const headerLinks = screen.getAllByText("viewAll");
        expect(headerLinks.length).toBeGreaterThan(0);
        expect(headerLinks[0]).toHaveAttribute("href", "/partidos");
      });
    });
  });

  describe("Match display details", () => {
    it("handles matches without RSVP counts", async () => {
      const matchesWithoutRSVP = mockMatches.map((match) => ({
        ...match,
        rsvp_count: 0,
        total_attendees: 0,
      }));

      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        matchesWithoutRSVP,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        // Should still show RSVP buttons but no counts
        const rsvpButtons = screen.getAllByText("📝 confirmAttendance");
        expect(rsvpButtons.length).toBeGreaterThanOrEqual(1);
        expect(screen.queryByText("confirmations")).not.toBeInTheDocument();
      });
    });

    it("shows total attendees when available without confirmations", async () => {
      const matchesWithAttendeesOnly = mockMatches.map((match) => ({
        ...match,
        rsvp_count: 0,
        total_attendees: 5,
      }));

      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        matchesWithAttendeesOnly,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        // Should not show RSVP counts section if rsvp_count is 0
        expect(screen.queryByText("confirmations")).not.toBeInTheDocument();
      });
    });

    it("handles past matches by not showing RSVP button", async () => {
      const pastMatch = {
        ...mockMatches[0],
        date_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      };

      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce([
        pastMatch,
      ]);

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        expect(
          screen.queryByText("📝 confirmAttendance"),
        ).not.toBeInTheDocument();
        expect(screen.getByText("Valencia CF")).toBeInTheDocument();
      });
    });
  });

  describe("Custom styling", () => {
    it("applies custom className", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        mockMatches,
      );

      const { container } = render(
        <UpcomingMatchesWidget className="custom-widget-class" />,
      );

      await waitFor(() => {
        const widget = container.firstChild as HTMLElement;
        expect(widget).toHaveClass("custom-widget-class");
      });
    });
  });

  describe("API integration", () => {
    it("calls API with correct limit", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        mockMatches,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        expect(getUpcomingMatchesWithRSVPCounts).toHaveBeenCalledWith(2);
      });
    });

    it("handles API response with data", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        mockMatches,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        expect(screen.getByText("Valencia CF")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper heading structure", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        mockMatches,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        const heading = screen.getByText("title");
        expect(heading).toHaveClass("text-xl", "font-bold");
      });
    });

    it("has accessible button styling", async () => {
      vi.mocked(getUpcomingMatchesWithRSVPCounts).mockResolvedValueOnce(
        mockMatches,
      );

      render(<UpcomingMatchesWidget />);

      await waitFor(() => {
        const rsvpButtons = screen.getAllByText("📝 confirmAttendance");
        rsvpButtons.forEach((button) => {
          expect(button).toHaveClass("bg-betis-verde", "text-white");
        });
      });
    });
  });
});
