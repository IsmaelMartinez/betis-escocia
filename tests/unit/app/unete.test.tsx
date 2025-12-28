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

describe("Unete Page", () => {
  it("should render the main heading", async () => {
    const UnetePage = (await import("@/app/unete/page")).default;
    render(<UnetePage />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("should render all four steps to join", async () => {
    const UnetePage = (await import("@/app/unete/page")).default;
    render(<UnetePage />);

    // Check for step titles (using getAllByText since there might be duplicates)
    expect(
      screen.getAllByText("Aparece en el Polwarth").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Preséntate").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Disfruta del partido").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("Únete digitalmente").length).toBeGreaterThan(0);
  });

  it("should render step descriptions", async () => {
    const UnetePage = (await import("@/app/unete/page")).default;
    render(<UnetePage />);

    expect(
      screen.getByText(/Simplemente ven al Polwarth Tavern 15 minutos antes/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Di que eres bético y que has visto que tenemos una peña/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Vive el partido con nosotros/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/únete a nuestro grupo de Facebook e Instagram/),
    ).toBeInTheDocument();
  });

  it("should render step details", async () => {
    const UnetePage = (await import("@/app/unete/page")).default;
    render(<UnetePage />);

    expect(
      screen.getByText(/No hace falta avisar ni reservar/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Somos muy acogedores/)).toBeInTheDocument();
    expect(
      screen.getByText(/Cantamos, sufrimos, celebramos/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Así podrás seguir todas las novedades/),
    ).toBeInTheDocument();
  });

  it("should render FAQ section", async () => {
    const UnetePage = (await import("@/app/unete/page")).default;
    render(<UnetePage />);

    // Check for FAQ questions - use regex for partial matches to be more resilient
    expect(
      screen.getByText(/¿Tengo que ser socio del Betis/),
    ).toBeInTheDocument();
    expect(screen.getByText(/¿Hay que pagar algo/)).toBeInTheDocument();
    expect(
      screen.getByText(/¿Puedo venir con amigos no béticos/),
    ).toBeInTheDocument();
  });

  it("should render FAQ answers", async () => {
    const UnetePage = (await import("@/app/unete/page")).default;
    render(<UnetePage />);

    expect(
      screen.getByText(/No es necesario. Solo necesitas ser bético de corazón/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Solo tu consumición en el pub/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /¡Por supuesto! Todos son bienvenidos mientras haya buen rollo/,
      ),
    ).toBeInTheDocument();
  });

  it("should render location information", async () => {
    const UnetePage = (await import("@/app/unete/page")).default;
    render(<UnetePage />);

    // Use getAllByText for elements that might appear multiple times
    expect(screen.getAllByText(/Polwarth Tavern/).length).toBeGreaterThan(0);
  });

  it("should have proper accessibility structure with headings", async () => {
    const UnetePage = (await import("@/app/unete/page")).default;
    render(<UnetePage />);

    // Should have hierarchical heading structure
    const headings = screen.getAllByRole("heading");
    expect(headings.length).toBeGreaterThan(0);

    // Should have a main heading (h1)
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toBeInTheDocument();
  });

  it("should render step numbers", async () => {
    const UnetePage = (await import("@/app/unete/page")).default;
    render(<UnetePage />);

    // Check for step numbers (1, 2, 3, 4)
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("should render step icons/emojis", async () => {
    const UnetePage = (await import("@/app/unete/page")).default;
    render(<UnetePage />);

    // Check that emojis are present (they may appear multiple times)
    expect(screen.getAllByText("📍").length).toBeGreaterThan(0);
    expect(screen.getAllByText("👋").length).toBeGreaterThan(0);
    expect(screen.getAllByText("⚽").length).toBeGreaterThan(0);
    expect(screen.getAllByText("📱").length).toBeGreaterThan(0);
  });

  it("should contain all FAQ questions and answers", async () => {
    const UnetePage = (await import("@/app/unete/page")).default;
    render(<UnetePage />);

    // Expected FAQ structure
    const expectedFAQs = [
      {
        question: "¿Tengo que ser socio del Betis?",
        answerPart: "No es necesario",
      },
      {
        question: "¿Hay que pagar algo?",
        answerPart: "Solo tu consumición",
      },
      {
        question: "¿Puedo venir con amigos no béticos?",
        answerPart: "¡Por supuesto!",
      },
    ];

    expectedFAQs.forEach(({ question, answerPart }) => {
      expect(screen.getByText(question)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(answerPart))).toBeInTheDocument();
    });
  });

  it("should be informative about the joining process", async () => {
    const UnetePage = (await import("@/app/unete/page")).default;
    render(<UnetePage />);

    // Key information that should be present
    expect(screen.getByText(/15 minutos antes/)).toBeInTheDocument();
    expect(screen.getByText(/ambiente es familiar/)).toBeInTheDocument();
    expect(screen.getByText(/no cobra cuotas/)).toBeInTheDocument();
    expect(screen.getByText(/Villamarín/)).toBeInTheDocument();
  });
});
