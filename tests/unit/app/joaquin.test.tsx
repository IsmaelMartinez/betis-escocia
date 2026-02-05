import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Play: vi.fn(({ className }) => (
    <div data-testid="play-icon" className={className} />
  )),
  Mic: vi.fn(({ className }) => (
    <div data-testid="mic-icon" className={className} />
  )),
  Smartphone: vi.fn(({ className }) => (
    <div data-testid="smartphone-icon" className={className} />
  )),
  Trophy: vi.fn(({ className }) => (
    <div data-testid="trophy-icon" className={className} />
  )),
  Heart: vi.fn(({ className }) => (
    <div data-testid="heart-icon" className={className} />
  )),
  Star: vi.fn(({ className }) => (
    <div data-testid="star-icon" className={className} />
  )),
  Video: vi.fn(({ className }) => (
    <div data-testid="video-icon" className={className} />
  )),
}));

describe("Joaquín Page", () => {
  describe("Hero section", () => {
    it("should render the main heading", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(
        screen.getByText("Los Chistes de Joaquín"),
      ).toBeInTheDocument();
    });

    it("should render the hero tagline", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      expect(
        screen.getByText("El hombre que convirtió el fútbol en comedia"),
      ).toBeInTheDocument();
    });

    it("should render the hero badge", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      expect(
        screen.getByText("El humor de una leyenda"),
      ).toBeInTheDocument();
    });

    it("should render the intro paragraph about Joaquín", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      expect(
        screen.getByText(/Joaquín Sánchez no solo fue uno de los mejores/),
      ).toBeInTheDocument();
    });
  });

  describe("Moments grid", () => {
    it("should render the section heading", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      expect(
        screen.getByText("Momentos Memorables"),
      ).toBeInTheDocument();
    });

    it("should render all six moment cards", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      expect(screen.getByText("El Rey del Confinamiento")).toBeInTheDocument();
      expect(screen.getByText("El Hormiguero")).toBeInTheDocument();
      expect(screen.getByText("Los Cumpleaños del Vestuario")).toBeInTheDocument();
      expect(screen.getByText("Ruedas de Prensa Memorables")).toBeInTheDocument();
      expect(screen.getByText("Campeón con Cachondeo")).toBeInTheDocument();
      expect(screen.getByText("La Despedida del Leyenda")).toBeInTheDocument();
    });

    it("should render category badges for each moment", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      expect(screen.getByText("Instagram Live")).toBeInTheDocument();
      expect(screen.getByText("Televisión")).toBeInTheDocument();
      expect(screen.getByText("Vestuario")).toBeInTheDocument();
      expect(screen.getByText("Rueda de Prensa")).toBeInTheDocument();
      expect(screen.getByText("Copa del Rey")).toBeInTheDocument();
      expect(screen.getByText("Despedida")).toBeInTheDocument();
    });

    it("should render year badges for each moment", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      expect(screen.getByText("2020")).toBeInTheDocument();
      expect(screen.getByText("2019")).toBeInTheDocument();
      expect(screen.getByText("2018")).toBeInTheDocument();
      expect(screen.getByText("2017")).toBeInTheDocument();
      expect(screen.getByText("2022")).toBeInTheDocument();
      expect(screen.getByText("2023")).toBeInTheDocument();
    });

    it("should render video links for each moment", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      const videoLinks = screen.getAllByRole("link", { name: /Ver Vídeos/ });
      expect(videoLinks).toHaveLength(6);

      videoLinks.forEach((link) => {
        expect(link).toHaveAttribute("href");
        expect(link.getAttribute("href")).toContain("youtube.com/results");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });

    it("should render descriptions for key moments", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      expect(
        screen.getByText(/Batió todos los récords de audiencia en España/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Pablo Motos no podía parar de reír/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Copa del Rey en 2022/),
      ).toBeInTheDocument();
    });
  });

  describe("CTA section", () => {
    it("should render the CTA heading", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      expect(
        screen.getByText("¡Viva er Betis manque pierda!"),
      ).toBeInTheDocument();
    });

    it("should render YouTube and Nosotros links", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      const youtubeLink = screen.getByRole("link", {
        name: /Más Vídeos en YouTube/,
      });
      expect(youtubeLink).toHaveAttribute("target", "_blank");
      expect(youtubeLink.getAttribute("href")).toContain("youtube.com");

      const nosotrosLink = screen.getByRole("link", {
        name: /Nuestra Historia/,
      });
      expect(nosotrosLink).toHaveAttribute("href", "/nosotros");
    });
  });

  describe("Design system consistency", () => {
    it("should use cultural fusion design patterns", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      const { container } = render(<JoaquinPage />);

      expect(container.querySelector(".bg-hero-fusion")).toBeInTheDocument();
      expect(
        container.querySelector(".pattern-tartan-navy"),
      ).toBeInTheDocument();
      expect(
        container.querySelector(".pattern-verdiblanco-subtle"),
      ).toBeInTheDocument();
      expect(container.querySelector(".bg-canvas-warm")).toBeInTheDocument();
    });

    it("should use typography system classes", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      const heading = screen.getByText("Los Chistes de Joaquín");
      expect(heading).toHaveClass("font-display");
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent("Los Chistes de Joaquín");

      const h2s = screen.getAllByRole("heading", { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    it("should have external links with proper attributes", async () => {
      const JoaquinPage = (await import("@/app/joaquin/page")).default;
      render(<JoaquinPage />);

      const externalLinks = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("target") === "_blank");

      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });
  });
});
