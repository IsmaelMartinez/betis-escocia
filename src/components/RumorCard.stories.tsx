import type { Meta, StoryObj } from "@storybook/nextjs";
import RumorCard from "./RumorCard";

const meta: Meta<typeof RumorCard> = {
  title: "Soylenti/RumorCard",
  component: RumorCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RumorCard>;

export const HighCredibility: Story = {
  args: {
    title: "Betis negocia el fichaje de Isco para reforzar el centro del campo",
    link: "https://example.com/isco-betis",
    pubDate: "2025-01-05T10:30:00Z",
    source: "Fichajes.net",
    description:
      "El Real Betis estaría en conversaciones avanzadas con el agente de Isco para incorporar al centrocampista durante la ventana de enero.",
    aiProbability: 85,
    aiAnalysis:
      "Alta probabilidad basada en múltiples fuentes fiables y el historial del jugador con el club.",
    showCredibility: true,
    players: [
      { name: "Isco", role: "target" },
      { name: "Manuel Pellegrini", role: "mentioned" },
    ],
  },
};

export const MediumCredibility: Story = {
  args: {
    title: "Fekir podría salir del Betis en el mercado de invierno",
    link: "https://example.com/fekir-departure",
    pubDate: "2025-01-04T15:45:00Z",
    source: "BetisWeb",
    description:
      "El futuro de Nabil Fekir en el Betis es incierto con varios clubes interesados en sus servicios.",
    aiProbability: 55,
    aiAnalysis:
      "Probabilidad media. Rumor recurrente sin confirmación oficial.",
    showCredibility: true,
    players: [{ name: "Nabil Fekir", role: "departing" }],
  },
};

export const LowCredibility: Story = {
  args: {
    title: "Betis interesado en joven promesa del Barcelona",
    link: "https://example.com/barca-youngster",
    pubDate: "2025-01-03T09:20:00Z",
    source: "DiarioGol",
    aiProbability: 25,
    aiAnalysis:
      "Probabilidad baja. Fuente poco fiable y sin detalles concretos.",
    showCredibility: true,
  },
};

export const WithoutCredibility: Story = {
  args: {
    title: "El Betis prepara la próxima temporada con optimismo",
    link: "https://example.com/season-preview",
    pubDate: "2025-01-02T12:00:00Z",
    source: "ABC Sevilla",
    description:
      "Análisis de las perspectivas del Real Betis para la segunda mitad de la temporada.",
    showCredibility: false,
  },
};

export const MultiplePlayersLongTitle: Story = {
  args: {
    title:
      "El Real Betis Balompié estudia varias opciones para reforzar la plantilla en el mercado de fichajes de invierno según informaciones de última hora",
    link: "https://example.com/multiple-targets",
    pubDate: "2025-01-05T18:00:00Z",
    source: "Estadio Deportivo",
    description:
      "La dirección deportiva del conjunto verdiblanco tiene identificados varios objetivos para fortalecer la plantilla de cara a la segunda vuelta de LaLiga.",
    aiProbability: 70,
    aiAnalysis:
      "Rumor sólido con información detallada de fuentes cercanas al club.",
    showCredibility: true,
    players: [
      { name: "Isco", role: "target" },
      { name: "Borja Iglesias", role: "target" },
      { name: "Marc Roca", role: "target" },
    ],
  },
};

export const MinimalInformation: Story = {
  args: {
    title: "Movimiento en el mercado bético",
    link: "https://example.com/market-movement",
    pubDate: "2025-01-01T08:00:00Z",
    source: "DiarioBetis",
    aiProbability: 40,
    showCredibility: true,
  },
};
