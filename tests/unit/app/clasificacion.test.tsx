import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StandingEntry } from "@/services/footballDataService";

// Import the helper functions to test them directly
import {
  getPositionStyle,
  getPositionBadge,
  formatForm,
  getFormResultStyle,
} from "@/app/clasificacion/utils";

// Mock the dependencies
vi.mock("@/services/footballDataService");
vi.mock("@/lib/features/featureProtection", () => ({
  withFeatureFlag: vi.fn((Component) => Component),
  FeatureWrapper: vi.fn(({ children }) => (
    <div data-testid="feature-wrapper">{children}</div>
  )),
}));

vi.mock("@/components/ErrorBoundary", () => ({
  ErrorBoundary: vi.fn(({ children }) => (
    <div data-testid="error-boundary">{children}</div>
  )),
}));

vi.mock("@/components/LoadingSpinner", () => ({
  default: vi.fn(() => <div data-testid="loading-spinner">Loading...</div>),
}));

vi.mock("next/image", () => ({
  default: vi.fn(({ src, alt, width, height, className }) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid="team-image"
    />
  )),
}));

vi.mock("next/link", () => ({
  default: vi.fn(({ href, className, children }) => (
    <a href={href} className={className} data-testid="link">
      {children}
    </a>
  )),
}));

// Mock axios
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
      defaults: {
        headers: {
          common: {},
        },
      },
    })),
  },
}));

// Mock axios-rate-limit
vi.mock("axios-rate-limit", () => ({
  default: vi.fn((axiosInstance) => axiosInstance),
}));

// Create a synchronous version of the standing row component for testing
const StandingRowTest = ({
  entry,
  isBetis,
}: {
  entry: StandingEntry;
  isBetis: boolean;
}) => {
  const positionBadge = getPositionBadge
    ? getPositionBadge(entry.position)
    : null;
  const formResults = formatForm ? formatForm(entry.form) : [];

  return (
    <tr
      className={`${isBetis ? "bg-green-50 border-green-200" : "hover:bg-gray-50"} transition-colors`}
      data-testid={`team-row-${entry.team.id}`}
    >
      {/* Position */}
      <td className="px-3 py-4 text-sm">
        <div className="flex items-center space-x-2">
          <span
            className={`font-medium ${getPositionStyle ? getPositionStyle(entry.position) : ""}`}
          >
            {entry.position}
          </span>
          {positionBadge && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${positionBadge.color}`}
            >
              {positionBadge.text}
            </span>
          )}
        </div>
      </td>

      {/* Team */}
      <td className="px-3 py-4">
        <div className="flex items-center space-x-3">
          <img
            src={entry.team.crest}
            alt={entry.team.name}
            width={24}
            height={24}
            className="rounded"
            data-testid="team-image"
          />
          <div className="flex flex-col">
            <span
              className={`font-medium text-sm ${isBetis ? "text-green-700" : "text-gray-900"}`}
            >
              {entry.team.shortName || entry.team.name}
            </span>
            <span className="text-xs text-gray-500 sm:hidden">
              {entry.team.tla}
            </span>
          </div>
        </div>
      </td>

      {/* Points */}
      <td className="px-3 py-4 text-sm font-bold text-center">
        <span className={isBetis ? "text-green-700" : "text-gray-900"}>
          {entry.points}
        </span>
      </td>

      {/* Form */}
      <td className="px-3 py-4 hidden lg:table-cell">
        <div className="flex space-x-1">
          {formResults.map((result, index) => (
            <span
              key={`form-${formResults.length}-${index}-${result}`}
              className={`w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center ${getFormResultStyle ? getFormResultStyle(result) : ""}`}
            >
              {result}
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
};

const mockStandingsData: StandingEntry[] = [
  {
    position: 1,
    team: {
      id: 1,
      name: "Real Madrid",
      shortName: "Real Madrid",
      tla: "RMA",
      crest: "/images/real-madrid.png",
    },
    playedGames: 10,
    won: 8,
    draw: 2,
    lost: 0,
    points: 26,
    goalsFor: 25,
    goalsAgainst: 8,
    goalDifference: 17,
    form: "WWWWW",
  },
  {
    position: 7,
    team: {
      id: 90,
      name: "Real Betis Balompié",
      shortName: "Betis",
      tla: "BET",
      crest: "/images/betis.png",
    },
    playedGames: 10,
    won: 5,
    draw: 2,
    lost: 3,
    points: 17,
    goalsFor: 15,
    goalsAgainst: 12,
    goalDifference: 3,
    form: "WLWDW",
  },
  {
    position: 18,
    team: {
      id: 3,
      name: "Valencia CF",
      shortName: "Valencia",
      tla: "VAL",
      crest: "/images/valencia.png",
    },
    playedGames: 10,
    won: 2,
    draw: 3,
    lost: 5,
    points: 9,
    goalsFor: 10,
    goalsAgainst: 18,
    goalDifference: -8,
    form: "LLLWL",
  },
];

describe("Clasificacion Page Helper Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPositionStyle function", () => {
    it("returns correct styles for Champions League positions (1-4)", () => {
      expect(getPositionStyle(1)).toBe("text-betis-verde font-bold");
      expect(getPositionStyle(4)).toBe("text-betis-verde font-bold");
    });

    it("returns correct styles for Europa League positions (5-6)", () => {
      expect(getPositionStyle(5)).toBe("text-scotland-blue font-bold");
      expect(getPositionStyle(6)).toBe("text-scotland-blue font-bold");
    });

    it("returns correct styles for Conference League position (7)", () => {
      expect(getPositionStyle(7)).toBe("text-orange-600 font-bold");
    });

    it("returns correct styles for relegation positions (18+)", () => {
      expect(getPositionStyle(18)).toBe("text-red-600 font-bold");
      expect(getPositionStyle(20)).toBe("text-red-600 font-bold");
    });

    it("returns default style for mid-table positions", () => {
      expect(getPositionStyle(10)).toBe("text-gray-900");
      expect(getPositionStyle(15)).toBe("text-gray-900");
    });
  });

  describe("getPositionBadge function", () => {
    it("returns UCL badge for Champions League positions", () => {
      const badge = getPositionBadge(1);
      expect(badge).toEqual({
        text: "UCL",
        color: "bg-betis-verde-light text-betis-verde-dark",
      });
    });

    it("returns UEL badge for Europa League positions", () => {
      const badge = getPositionBadge(5);
      expect(badge).toEqual({
        text: "UEL",
        color: "bg-blue-100 text-scotland-blue",
      });
    });

    it("returns UECL badge for Conference League position", () => {
      const badge = getPositionBadge(7);
      expect(badge).toEqual({
        text: "UECL",
        color: "bg-orange-100 text-orange-800",
      });
    });

    it("returns DESC badge for relegation positions", () => {
      const badge = getPositionBadge(18);
      expect(badge).toEqual({
        text: "DESC",
        color: "bg-red-100 text-red-800",
      });
    });

    it("returns null for mid-table positions", () => {
      expect(getPositionBadge(10)).toBeNull();
      expect(getPositionBadge(15)).toBeNull();
    });
  });

  describe("formatForm function", () => {
    it("returns array of form results limited to last 5", () => {
      const result = formatForm("WWLWDLLWW");
      expect(result).toEqual(["D", "L", "L", "W", "W"]); // Last 5 characters of 'WWLWDLLWW'
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it("handles short form strings", () => {
      const result = formatForm("WW");
      expect(result).toEqual(["W", "W"]);
    });

    it("handles empty form strings", () => {
      const result = formatForm("");
      expect(result).toEqual([]);
    });

    it("handles null/undefined form strings", () => {
      expect(formatForm(null as any)).toEqual([]);
      expect(formatForm(undefined as any)).toEqual([]);
    });
  });

  describe("getFormResultStyle function", () => {
    it("returns correct styles for wins", () => {
      expect(getFormResultStyle("W")).toBe("bg-betis-verde text-white");
    });

    it("returns correct styles for draws", () => {
      expect(getFormResultStyle("D")).toBe("bg-betis-oro text-white");
    });

    it("returns correct styles for losses", () => {
      expect(getFormResultStyle("L")).toBe("bg-red-500 text-white");
    });

    it("returns default style for unknown results", () => {
      expect(getFormResultStyle("X")).toBe("bg-gray-300 text-gray-700");
      expect(getFormResultStyle("")).toBe("bg-gray-300 text-gray-700");
    });
  });
});

describe("StandingRow Component Logic", () => {
  it("renders team information correctly", () => {
    const betisEntry = mockStandingsData.find((team) => team.team.id === 90)!;

    render(
      <table>
        <tbody>
          <StandingRowTest entry={betisEntry} isBetis={true} />
        </tbody>
      </table>,
    );

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Betis")).toBeInTheDocument();
    expect(screen.getByText("17")).toBeInTheDocument();
    expect(screen.getByText("BET")).toBeInTheDocument();
  });

  it("applies correct styling for Betis team", () => {
    const betisEntry = mockStandingsData.find((team) => team.team.id === 90)!;

    render(
      <table>
        <tbody>
          <StandingRowTest entry={betisEntry} isBetis={true} />
        </tbody>
      </table>,
    );

    const row = screen.getByTestId("team-row-90");
    expect(row).toHaveClass("bg-green-50", "border-green-200");
  });

  it("displays position badges correctly", () => {
    const madridEntry = mockStandingsData.find((team) => team.team.id === 1)!;
    const betisEntry = mockStandingsData.find((team) => team.team.id === 90)!;
    const valenciaEntry = mockStandingsData.find((team) => team.team.id === 3)!;

    render(
      <table>
        <tbody>
          <StandingRowTest entry={madridEntry} isBetis={false} />
          <StandingRowTest entry={betisEntry} isBetis={true} />
          <StandingRowTest entry={valenciaEntry} isBetis={false} />
        </tbody>
      </table>,
    );

    expect(screen.getByText("UCL")).toBeInTheDocument(); // Madrid - position 1
    expect(screen.getByText("UECL")).toBeInTheDocument(); // Betis - position 7
    expect(screen.getByText("DESC")).toBeInTheDocument(); // Valencia - position 18
  });

  it("displays form results correctly", () => {
    const betisEntry = mockStandingsData.find((team) => team.team.id === 90)!;

    render(
      <table>
        <tbody>
          <StandingRowTest entry={betisEntry} isBetis={true} />
        </tbody>
      </table>,
    );

    // Should display last 5 characters of 'WLWDW'
    const formResults = screen.getAllByText("W");
    expect(formResults.length).toBeGreaterThan(0);
    expect(screen.getByText("L")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
  });

  it("renders team images correctly", () => {
    const betisEntry = mockStandingsData.find((team) => team.team.id === 90)!;

    render(
      <table>
        <tbody>
          <StandingRowTest entry={betisEntry} isBetis={true} />
        </tbody>
      </table>,
    );

    const image = screen.getByTestId("team-image");
    expect(image).toHaveAttribute("alt", "Real Betis Balompié");
    expect(image).toHaveAttribute("src", "/images/betis.png");
  });

  it("handles teams without form data", () => {
    const entryWithoutForm = {
      ...mockStandingsData[0],
      form: "",
    };

    render(
      <table>
        <tbody>
          <StandingRowTest entry={entryWithoutForm} isBetis={false} />
        </tbody>
      </table>,
    );

    expect(screen.getByText("Real Madrid")).toBeInTheDocument();
    // No form results should be displayed
    expect(screen.queryByText("W")).not.toBeInTheDocument();
  });

  it("handles teams with short form strings", () => {
    const entryWithShortForm = {
      ...mockStandingsData[0],
      form: "WL",
    };

    render(
      <table>
        <tbody>
          <StandingRowTest entry={entryWithShortForm} isBetis={false} />
        </tbody>
      </table>,
    );

    expect(screen.getByText("Real Madrid")).toBeInTheDocument();
    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("L")).toBeInTheDocument();
  });

  it("uses team short name when available", () => {
    const entryWithShortName = {
      ...mockStandingsData[0],
      team: {
        ...mockStandingsData[0].team,
        shortName: "RM",
      },
    };

    render(
      <table>
        <tbody>
          <StandingRowTest entry={entryWithShortName} isBetis={false} />
        </tbody>
      </table>,
    );

    expect(screen.getByText("RM")).toBeInTheDocument();
  });

  it("falls back to full name when short name not available", () => {
    const entryWithoutShortName = {
      ...mockStandingsData[0],
      team: {
        ...mockStandingsData[0].team,
        shortName: "",
      },
    };

    render(
      <table>
        <tbody>
          <StandingRowTest entry={entryWithoutShortName} isBetis={false} />
        </tbody>
      </table>,
    );

    expect(screen.getByText("Real Madrid")).toBeInTheDocument();
  });
});

describe("Clasificacion Page Integration", () => {
  it("validates that helper functions exist and are testable", () => {
    expect(typeof getPositionStyle).toBe("function");
    expect(typeof getPositionBadge).toBe("function");
    expect(typeof formatForm).toBe("function");
    expect(typeof getFormResultStyle).toBe("function");
  });

  it("validates team data structure", () => {
    const sampleEntry = mockStandingsData[0];

    expect(sampleEntry).toHaveProperty("position");
    expect(sampleEntry).toHaveProperty("team");
    expect(sampleEntry.team).toHaveProperty("id");
    expect(sampleEntry.team).toHaveProperty("name");
    expect(sampleEntry.team).toHaveProperty("shortName");
    expect(sampleEntry.team).toHaveProperty("tla");
    expect(sampleEntry.team).toHaveProperty("crest");
    expect(sampleEntry).toHaveProperty("points");
    expect(sampleEntry).toHaveProperty("form");
  });

  it("validates Betis team identification", () => {
    const betisEntry = mockStandingsData.find((entry) => entry.team.id === 90);
    expect(betisEntry).toBeDefined();
    expect(betisEntry?.team.name).toContain("Betis");
  });

  it("validates position range handling", () => {
    const positions = mockStandingsData.map((entry) => entry.position);
    expect(Math.min(...positions)).toBeGreaterThan(0);
    expect(Math.max(...positions)).toBeLessThanOrEqual(20);
  });
});
