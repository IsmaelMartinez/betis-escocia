import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StockIndicator from "@/components/StockIndicator";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Package: vi.fn(() => <div data-testid="package-icon">Package</div>),
  AlertTriangle: vi.fn(() => (
    <div data-testid="alert-triangle-icon">AlertTriangle</div>
  )),
  CheckCircle: vi.fn(() => (
    <div data-testid="check-circle-icon">CheckCircle</div>
  )),
  XCircle: vi.fn(() => <div data-testid="x-circle-icon">XCircle</div>),
}));

describe("StockIndicator", () => {
  describe("Basic rendering", () => {
    it("renders without crashing", () => {
      render(<StockIndicator stock={10} />);

      expect(screen.getByText("Stock limitado")).toBeInTheDocument();
    });

    it("displays stock quantity by default", () => {
      render(<StockIndicator stock={25} />);

      expect(screen.getByText("(25)")).toBeInTheDocument();
    });

    it("hides stock quantity when showQuantity is false", () => {
      render(<StockIndicator stock={25} showQuantity={false} />);

      expect(screen.queryByText("(25)")).not.toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<StockIndicator stock={10} className="custom-class" />);

      const container = screen.getByText("Stock limitado").closest("div");
      expect(container).toHaveClass("custom-class");
    });
  });

  describe("Stock status calculation", () => {
    it('shows "Agotado" when stock is 0', () => {
      render(<StockIndicator stock={0} />);

      expect(screen.getByText("Agotado")).toBeInTheDocument();
      expect(screen.getByTestId("x-circle-icon")).toBeInTheDocument();
    });

    it('shows "Pocas unidades" when stock is low (10% of maxStock)', () => {
      render(<StockIndicator stock={5} maxStock={50} />);

      expect(screen.getByText("Pocas unidades")).toBeInTheDocument();
      expect(screen.getByTestId("alert-triangle-icon")).toBeInTheDocument();
    });

    it('shows "Stock limitado" when stock is medium (30% of maxStock)', () => {
      render(<StockIndicator stock={15} maxStock={50} />);

      expect(screen.getByText("Stock limitado")).toBeInTheDocument();
      expect(screen.getByTestId("package-icon")).toBeInTheDocument();
    });

    it('shows "Disponible" when stock is high (>30% of maxStock)', () => {
      render(<StockIndicator stock={35} maxStock={50} />);

      expect(screen.getByText("Disponible")).toBeInTheDocument();
      expect(screen.getByTestId("check-circle-icon")).toBeInTheDocument();
    });
  });

  describe("Stock level thresholds with default maxStock", () => {
    it("uses default maxStock of 50", () => {
      render(<StockIndicator stock={5} />);

      // 5 <= 50 * 0.1 (5), so should be low
      expect(screen.getByText("Pocas unidades")).toBeInTheDocument();
    });

    it("calculates low threshold correctly with default maxStock", () => {
      render(<StockIndicator stock={5} />);

      expect(screen.getByText("Pocas unidades")).toBeInTheDocument();
    });

    it("calculates medium threshold correctly with default maxStock", () => {
      render(<StockIndicator stock={15} />);

      expect(screen.getByText("Stock limitado")).toBeInTheDocument();
    });

    it("calculates high threshold correctly with default maxStock", () => {
      render(<StockIndicator stock={25} />);

      expect(screen.getByText("Disponible")).toBeInTheDocument();
    });
  });

  describe("Stock level thresholds with custom maxStock", () => {
    it("calculates thresholds correctly with custom maxStock", () => {
      // maxStock = 100, low = 10, medium = 30
      render(<StockIndicator stock={10} maxStock={100} />);

      expect(screen.getByText("Pocas unidades")).toBeInTheDocument();
    });

    it("handles edge case at low threshold boundary", () => {
      // Exactly at 10% threshold
      render(<StockIndicator stock={10} maxStock={100} />);

      expect(screen.getByText("Pocas unidades")).toBeInTheDocument();
    });

    it("handles edge case at medium threshold boundary", () => {
      // Exactly at 30% threshold
      render(<StockIndicator stock={30} maxStock={100} />);

      expect(screen.getByText("Stock limitado")).toBeInTheDocument();
    });

    it("handles fractional thresholds", () => {
      // maxStock = 37, low = 3.7, medium = 11.1
      render(<StockIndicator stock={3} maxStock={37} />);

      expect(screen.getByText("Pocas unidades")).toBeInTheDocument();
    });
  });

  describe("Color classes", () => {
    it("applies red colors for out of stock", () => {
      render(<StockIndicator stock={0} />);

      const container = screen.getByText("Agotado").closest("div");
      expect(container).toHaveClass(
        "text-red-600",
        "bg-red-50",
        "border-red-200",
      );
    });

    it("applies orange colors for low stock", () => {
      render(<StockIndicator stock={2} maxStock={50} />);

      const container = screen.getByText("Pocas unidades").closest("div");
      expect(container).toHaveClass(
        "text-orange-600",
        "bg-orange-50",
        "border-orange-200",
      );
    });

    it("applies yellow colors for medium stock", () => {
      render(<StockIndicator stock={10} maxStock={50} />);

      const container = screen.getByText("Stock limitado").closest("div");
      expect(container).toHaveClass(
        "text-yellow-600",
        "bg-yellow-50",
        "border-yellow-200",
      );
    });

    it("applies green colors for high stock", () => {
      render(<StockIndicator stock={40} maxStock={50} />);

      const container = screen.getByText("Disponible").closest("div");
      expect(container).toHaveClass(
        "text-betis-verde",
        "bg-betis-verde-pale",
        "border-betis-verde/20",
      );
    });
  });

  describe("Container styling", () => {
    it("applies correct base classes", () => {
      render(<StockIndicator stock={10} />);

      const container = screen.getByText("Stock limitado").closest("div");
      expect(container).toHaveClass(
        "inline-flex",
        "items-center",
        "gap-2",
        "px-3",
        "py-1",
        "rounded-full",
        "border",
        "text-sm",
        "font-medium",
      );
    });

    it("combines base classes with color classes", () => {
      render(<StockIndicator stock={0} />);

      const container = screen.getByText("Agotado").closest("div");
      expect(container).toHaveClass("inline-flex", "items-center");
      expect(container).toHaveClass(
        "text-red-600",
        "bg-red-50",
        "border-red-200",
      );
    });

    it("adds custom className to base classes", () => {
      render(<StockIndicator stock={10} className="my-custom-class" />);

      const container = screen.getByText("Stock limitado").closest("div");
      expect(container).toHaveClass(
        "inline-flex",
        "items-center",
        "my-custom-class",
      );
    });
  });

  describe("Quantity display logic", () => {
    it("shows quantity when showQuantity is true and stock > 0", () => {
      render(<StockIndicator stock={15} showQuantity={true} />);

      expect(screen.getByText("(15)")).toBeInTheDocument();
    });

    it("hides quantity when showQuantity is false", () => {
      render(<StockIndicator stock={15} showQuantity={false} />);

      expect(screen.queryByText("(15)")).not.toBeInTheDocument();
    });

    it("hides quantity when stock is 0 even if showQuantity is true", () => {
      render(<StockIndicator stock={0} showQuantity={true} />);

      expect(screen.queryByText("(0)")).not.toBeInTheDocument();
    });

    it("applies correct styling to quantity display", () => {
      render(<StockIndicator stock={25} />);

      const quantity = screen.getByText("(25)");
      expect(quantity).toHaveClass("ml-1", "font-bold");
    });
  });

  describe("Icon display", () => {
    it("shows correct icon for each stock status", () => {
      const { rerender } = render(<StockIndicator stock={0} />);
      expect(screen.getByTestId("x-circle-icon")).toBeInTheDocument();

      rerender(<StockIndicator stock={2} maxStock={50} />);
      expect(screen.getByTestId("alert-triangle-icon")).toBeInTheDocument();

      rerender(<StockIndicator stock={10} maxStock={50} />);
      expect(screen.getByTestId("package-icon")).toBeInTheDocument();

      rerender(<StockIndicator stock={40} maxStock={50} />);
      expect(screen.getByTestId("check-circle-icon")).toBeInTheDocument();
    });

    it("applies correct classes to icons", () => {
      render(<StockIndicator stock={10} />);

      const icon = screen.getByTestId("package-icon");
      expect(icon).toBeInTheDocument();
      // Icon classes are handled by the mock, but we can verify it exists
    });
  });

  describe("Edge cases and error handling", () => {
    it("handles negative stock gracefully", () => {
      render(<StockIndicator stock={-5} />);

      // Negative stock is still treated as non-zero, so it follows normal logic
      // -5 <= 50 * 0.1 (5), so should be low
      expect(screen.getByText("Pocas unidades")).toBeInTheDocument();
      expect(screen.getByTestId("alert-triangle-icon")).toBeInTheDocument();
    });

    it("handles zero maxStock", () => {
      render(<StockIndicator stock={10} maxStock={0} />);

      // Should default to high since stock > 0 * anything
      expect(screen.getByText("Disponible")).toBeInTheDocument();
    });

    it("handles very small maxStock", () => {
      render(<StockIndicator stock={1} maxStock={1} />);

      // 1 > 1 * 0.3 (0.3), so should be high
      expect(screen.getByText("Disponible")).toBeInTheDocument();
    });

    it("handles very large stock numbers", () => {
      render(<StockIndicator stock={999999} />);

      expect(screen.getByText("Disponible")).toBeInTheDocument();
      expect(screen.getByText("(999999)")).toBeInTheDocument();
    });

    it("handles decimal stock values", () => {
      render(<StockIndicator stock={5.5} />);

      expect(screen.getByText("(5.5)")).toBeInTheDocument();
    });

    it("handles very large maxStock values", () => {
      render(<StockIndicator stock={500} maxStock={10000} />);

      // 500 <= 10000 * 0.1 (1000), so should be low
      expect(screen.getByText("Pocas unidades")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("provides meaningful text content", () => {
      render(<StockIndicator stock={15} />);

      expect(screen.getByText("Stock limitado")).toBeInTheDocument();
      expect(screen.getByText("(15)")).toBeInTheDocument();
    });

    it("maintains semantic structure", () => {
      render(<StockIndicator stock={25} />);

      const container = screen.getByText("Disponible").closest("div");
      expect(container?.tagName).toBe("DIV");

      const text = screen.getByText("Disponible");
      expect(text.tagName).toBe("SPAN");
    });

    it("provides clear visual hierarchy with icons and text", () => {
      render(<StockIndicator stock={5} maxStock={50} />);

      // Should have icon, text, and quantity all visible
      expect(screen.getByTestId("alert-triangle-icon")).toBeInTheDocument();
      expect(screen.getByText("Pocas unidades")).toBeInTheDocument();
      expect(screen.getByText("(5)")).toBeInTheDocument();
    });
  });

  describe("Component flexibility", () => {
    it("works with different maxStock values", () => {
      const { rerender } = render(<StockIndicator stock={10} maxStock={20} />);

      // 10 > 20 * 0.3 (6), so should be high
      expect(screen.getByText("Disponible")).toBeInTheDocument();

      rerender(<StockIndicator stock={10} maxStock={100} />);

      // 10 <= 100 * 0.1 (10), so should be low
      expect(screen.getByText("Pocas unidades")).toBeInTheDocument();
    });

    it("maintains consistent behavior across different props", () => {
      render(
        <StockIndicator
          stock={0}
          maxStock={100}
          showQuantity={false}
          className="test"
        />,
      );

      expect(screen.getByText("Agotado")).toBeInTheDocument();
      expect(screen.getByTestId("x-circle-icon")).toBeInTheDocument();
      expect(screen.queryByText("(0)")).not.toBeInTheDocument();

      const container = screen.getByText("Agotado").closest("div");
      expect(container).toHaveClass("test");
    });
  });

  describe("Text localization", () => {
    it("displays Spanish text labels correctly", () => {
      const { rerender } = render(<StockIndicator stock={0} />);
      expect(screen.getByText("Agotado")).toBeInTheDocument();

      rerender(<StockIndicator stock={2} maxStock={50} />);
      expect(screen.getByText("Pocas unidades")).toBeInTheDocument();

      rerender(<StockIndicator stock={10} maxStock={50} />);
      expect(screen.getByText("Stock limitado")).toBeInTheDocument();

      rerender(<StockIndicator stock={40} maxStock={50} />);
      expect(screen.getByText("Disponible")).toBeInTheDocument();
    });

    it("uses appropriate terminology for stock levels", () => {
      render(<StockIndicator stock={1} maxStock={50} />);

      // At very low stock, should show "Pocas unidades" (few units)
      expect(screen.getByText("Pocas unidades")).toBeInTheDocument();
    });
  });

  describe("Performance considerations", () => {
    it("calculates stock status efficiently", () => {
      const startTime = performance.now();
      render(<StockIndicator stock={25} maxStock={100} />);
      const endTime = performance.now();

      // Should render very quickly
      expect(endTime - startTime).toBeLessThan(50);
      expect(screen.getByText("Stock limitado")).toBeInTheDocument();
    });

    it("handles multiple instances efficiently", () => {
      const { rerender } = render(<StockIndicator stock={10} />);

      // Multiple re-renders should work smoothly
      for (let i = 0; i < 10; i++) {
        rerender(<StockIndicator stock={i * 5} />);
      }

      expect(screen.getByText("Disponible")).toBeInTheDocument(); // Last render: stock=45
    });
  });
});
