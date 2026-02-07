export interface CompetitionConfig {
  ribbon: string;
  ribbonText: string;
  badge: string;
  displayName: string;
  shortName: string;
}

interface CompetitionMatcher {
  match: (compLower: string) => boolean;
  config: CompetitionConfig;
}

const COMPETITION_MATCHERS: CompetitionMatcher[] = [
  {
    match: (c) => c.includes("liga") || c.includes("primera"),
    config: {
      ribbon: "bg-gradient-to-r from-red-600 to-red-700",
      ribbonText: "text-white",
      badge: "bg-gradient-to-r from-red-600 to-red-700",
      displayName: "LaLiga",
      shortName: "LaLiga",
    },
  },
  {
    match: (c) => c.includes("champions"),
    config: {
      ribbon: "bg-gradient-to-r from-blue-600 to-blue-800",
      ribbonText: "text-white",
      badge: "bg-gradient-to-r from-blue-600 to-blue-800",
      displayName: "Champions League",
      shortName: "UCL",
    },
  },
  {
    match: (c) => c.includes("europa") && !c.includes("conference"),
    config: {
      ribbon: "bg-gradient-to-r from-orange-500 to-orange-600",
      ribbonText: "text-white",
      badge: "bg-gradient-to-r from-orange-500 to-orange-600",
      displayName: "Europa League",
      shortName: "UEL",
    },
  },
  {
    match: (c) => c.includes("conference"),
    config: {
      ribbon: "bg-gradient-to-r from-betis-verde to-betis-verde-dark",
      ribbonText: "text-white",
      badge: "bg-gradient-to-r from-green-600 to-green-700",
      displayName: "Conference League",
      shortName: "UECL",
    },
  },
  {
    match: (c) => c.includes("supercopa"),
    config: {
      ribbon: "bg-gradient-to-r from-purple-600 to-purple-700",
      ribbonText: "text-white",
      badge: "bg-gradient-to-r from-purple-600 to-purple-700",
      displayName: "Supercopa de España",
      shortName: "Supercopa",
    },
  },
  {
    match: (c) => c.includes("copa"),
    config: {
      ribbon: "bg-gradient-to-r from-betis-oro to-oro-antique",
      ribbonText: "text-scotland-navy",
      badge: "bg-gradient-to-r from-yellow-600 to-yellow-700",
      displayName: "Copa del Rey",
      shortName: "Copa",
    },
  },
];

const DEFAULT_CONFIG: CompetitionConfig = {
  ribbon: "bg-gradient-to-r from-betis-verde to-betis-verde-dark",
  ribbonText: "text-white",
  badge: "bg-gradient-to-r from-green-600 to-betis-green",
  displayName: "",
  shortName: "",
};

export function getCompetitionConfig(competition: string): CompetitionConfig {
  const compLower = competition.toLowerCase();
  const matched = COMPETITION_MATCHERS.find((m) => m.match(compLower));
  if (matched) return matched.config;
  return {
    ...DEFAULT_CONFIG,
    displayName: competition,
    shortName: competition.substring(0, 8),
  };
}

export function getCompetitionRibbon(competition: string): {
  bg: string;
  text: string;
} {
  const config = getCompetitionConfig(competition);
  return { bg: config.ribbon, text: config.ribbonText };
}

export function getCompetitionBadge(competition: string): string {
  return getCompetitionConfig(competition).badge;
}

export function getCompetitionDisplayName(competition: string): string {
  return getCompetitionConfig(competition).displayName;
}

export function getCompetitionShortName(competition: string): string {
  return getCompetitionConfig(competition).shortName;
}
