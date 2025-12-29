import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TrendingPlayers from "@/components/TrendingPlayers";
import type { TrendingPlayer } from "@/lib/supabase";

describe("TrendingPlayers", () => {
  const mockOnPlayerClick = vi.fn();

  const mockPlayers: TrendingPlayer[] = [
    {
      name: "Isco Alarcón",
      normalizedName: "isco alarcon",
      rumorCount: 5,
      firstSeen: "2025-12-20T10:00:00Z",
      lastSeen: "2025-12-28T10:00:00Z",
      isActive: true,
    },
    {
      name: "Marc Roca",
      normalizedName: "marc roca",
      rumorCount: 3,
      firstSeen: "2025-12-15T10:00:00Z",
      lastSeen: "2025-12-10T10:00:00Z",
      isActive: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render nothing when players array is empty", () => {
    const { container } = render(
      <TrendingPlayers players={[]} onPlayerClick={mockOnPlayerClick} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render all players in the list", () => {
    render(
      <TrendingPlayers
        players={mockPlayers}
        onPlayerClick={mockOnPlayerClick}
      />,
    );

    expect(screen.getByText("Isco Alarcón")).toBeInTheDocument();
    expect(screen.getByText("Marc Roca")).toBeInTheDocument();
    expect(screen.getByText("Jugadores en Tendencia")).toBeInTheDocument();
  });

  it("should display rumor count for each player", () => {
    render(
      <TrendingPlayers
        players={mockPlayers}
        onPlayerClick={mockOnPlayerClick}
      />,
    );

    expect(screen.getByText("5 menciones")).toBeInTheDocument();
    expect(screen.getByText("3 menciones")).toBeInTheDocument();
  });

  it("should call onPlayerClick when a player is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TrendingPlayers
        players={mockPlayers}
        onPlayerClick={mockOnPlayerClick}
      />,
    );

    const iscoButton = screen.getByRole("button", {
      name: /filtrar rumores por isco alarcón/i,
    });
    await user.click(iscoButton);

    expect(mockOnPlayerClick).toHaveBeenCalledWith("isco alarcon");
  });

  it("should highlight selected player", () => {
    render(
      <TrendingPlayers
        players={mockPlayers}
        onPlayerClick={mockOnPlayerClick}
        selectedPlayer="isco alarcon"
      />,
    );

    const iscoButton = screen.getByRole("button", {
      name: /filtrar rumores por isco alarcón/i,
    });
    expect(iscoButton).toHaveClass("bg-betis-verde-light");
    expect(iscoButton).toHaveAttribute("aria-pressed", "true");
  });

  it("should not highlight unselected players", () => {
    render(
      <TrendingPlayers
        players={mockPlayers}
        onPlayerClick={mockOnPlayerClick}
        selectedPlayer="isco alarcon"
      />,
    );

    const marcButton = screen.getByRole("button", {
      name: /filtrar rumores por marc roca/i,
    });
    expect(marcButton).not.toHaveClass("bg-betis-verde-light");
    expect(marcButton).toHaveAttribute("aria-pressed", "false");
  });

  it("should have proper accessibility labels", () => {
    render(
      <TrendingPlayers
        players={mockPlayers}
        onPlayerClick={mockOnPlayerClick}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);

    expect(buttons[0]).toHaveAttribute(
      "aria-label",
      "Filtrar rumores por Isco Alarcón",
    );
    expect(buttons[1]).toHaveAttribute(
      "aria-label",
      "Filtrar rumores por Marc Roca",
    );
  });

  it("should display active status indicator for active players", () => {
    render(
      <TrendingPlayers
        players={mockPlayers}
        onPlayerClick={mockOnPlayerClick}
      />,
    );

    // Active player should have green badge
    const activeBadge = screen.getByText("5 menciones");
    expect(activeBadge).toHaveClass("bg-betis-verde", "text-white");

    // Inactive player should have gray badge
    const inactiveBadge = screen.getByText("3 menciones");
    expect(inactiveBadge).toHaveClass("bg-gray-200", "text-gray-600");
  });
});
