import type { Meta, StoryObj } from "@storybook/nextjs";
import SoylentiNewsList from "./SoylentiNewsList";
import type { BetisNewsWithPlayers } from "@/types/soylenti";

const meta: Meta<typeof SoylentiNewsList> = {
  title: "Admin/SoylentiNewsList",
  component: SoylentiNewsList,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SoylentiNewsList>;

const mockNews: BetisNewsWithPlayers[] = [
  {
    id: 1,
    title: "Isco negocia su vuelta al Betis",
    link: "https://example.com/isco-betis",
    pub_date: "2025-01-05T10:30:00Z",
    source: "Fichajes.net",
    description: "El centrocampista estaría en conversaciones avanzadas.",
    ai_probability: 85,
    ai_analysis: "Alta probabilidad basada en múltiples fuentes.",
    admin_context: null,
    reassessed_at: null,
    is_hidden: false,
    content_hash: "abc123",
    is_duplicate: false,
    created_at: "2025-01-05T10:35:00Z",
    updated_at: "2025-01-05T10:35:00Z",
    news_players: [
      {
        player_id: 1,
        role: "target",
        players: { id: 1, name: "Isco", normalized_name: "isco" },
      },
    ],
  },
  {
    id: 2,
    title: "Fekir podría salir en enero",
    link: "https://example.com/fekir-departure",
    pub_date: "2025-01-04T15:45:00Z",
    source: "BetisWeb",
    description: "Varios clubes interesados en el internacional francés.",
    ai_probability: 55,
    ai_analysis: "Probabilidad media sin confirmación oficial.",
    admin_context: "Revisar si hay movimientos reales del club",
    reassessed_at: "2025-01-04T16:00:00Z",
    is_hidden: false,
    content_hash: "def456",
    is_duplicate: false,
    created_at: "2025-01-04T15:50:00Z",
    updated_at: "2025-01-04T16:00:00Z",
    news_players: [
      {
        player_id: 2,
        role: "departing",
        players: { id: 2, name: "Nabil Fekir", normalized_name: "nabil-fekir" },
      },
    ],
  },
  {
    id: 3,
    title: "Rumor descartado sobre fichaje del Barcelona",
    link: "https://example.com/false-rumor",
    pub_date: "2025-01-03T09:20:00Z",
    source: "DiarioGol",
    ai_probability: 10,
    ai_analysis: "Probabilidad muy baja. Fuente poco fiable.",
    admin_context: null,
    reassessed_at: null,
    is_hidden: true,
    content_hash: "ghi789",
    is_duplicate: false,
    created_at: "2025-01-03T09:25:00Z",
    updated_at: "2025-01-03T11:00:00Z",
    news_players: [],
  },
];

const mockHandlers = {
  onReassess: async (newsId: number, adminContext: string) => {
    console.log("Reassess:", newsId, adminContext);
    return { success: true };
  },
  onHide: async (newsId: number, hide: boolean) => {
    console.log("Hide:", newsId, hide);
    return { success: true };
  },
  onUpdateProbability: async (newsId: number, probability: number) => {
    console.log("Update probability:", newsId, probability);
    return { success: true };
  },
  onAddPlayer: async (newsId: number, playerName: string) => {
    console.log("Add player:", newsId, playerName);
    return { success: true };
  },
  onRemovePlayer: async (newsId: number, playerId: number) => {
    console.log("Remove player:", newsId, playerId);
    return { success: true };
  },
};

export const Default: Story = {
  args: {
    news: mockNews,
    ...mockHandlers,
    isLoading: false,
    error: null,
  },
};

export const Loading: Story = {
  args: {
    news: [],
    ...mockHandlers,
    isLoading: true,
    error: null,
  },
};

export const Error: Story = {
  args: {
    news: [],
    ...mockHandlers,
    isLoading: false,
    error: "Error al cargar las noticias. Por favor, inténtalo de nuevo.",
  },
};

export const EmptyState: Story = {
  args: {
    news: [],
    ...mockHandlers,
    isLoading: false,
    error: null,
  },
};

export const WithPagination: Story = {
  args: {
    news: mockNews,
    ...mockHandlers,
    isLoading: false,
    error: null,
    currentPage: 2,
    totalCount: 47,
    itemsPerPage: 20,
    onPageChange: (page: number) => console.log("Page change:", page),
  },
};

export const SingleNewsItem: Story = {
  args: {
    news: [mockNews[0]],
    ...mockHandlers,
    isLoading: false,
    error: null,
  },
};

export const WithHiddenNews: Story = {
  args: {
    news: mockNews,
    ...mockHandlers,
    isLoading: false,
    error: null,
  },
};

export const NewsWithoutPlayers: Story = {
  args: {
    news: [
      {
        ...mockNews[0],
        news_players: [],
      },
    ],
    ...mockHandlers,
    isLoading: false,
    error: null,
  },
};

export const HighCredibilityNews: Story = {
  args: {
    news: [
      {
        ...mockNews[0],
        ai_probability: 95,
        ai_analysis: "Probabilidad muy alta. Múltiples fuentes confirman.",
      },
    ],
    ...mockHandlers,
    isLoading: false,
    error: null,
  },
};
