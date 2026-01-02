import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FeatureCard from "@/components/FeatureCard";
import { Users, Clock, CheckCircle, MapPin, Award } from "lucide-react";

describe("FeatureCard Component", () => {
  describe("Basic rendering", () => {
    it("renders title and description", () => {
      render(
        <FeatureCard
          icon={Users}
          title="Test Title"
          description="Test description content"
        />,
      );

      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test description content")).toBeInTheDocument();
    });

    it("renders with Users icon", () => {
      const { container } = render(
        <FeatureCard
          icon={Users}
          title="Team Feature"
          description="Team description"
        />,
      );

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("h-8", "w-8", "text-white");
    });

    it("renders with Clock icon", () => {
      const { container } = render(
        <FeatureCard
          icon={Clock}
          title="Time Feature"
          description="Time description"
        />,
      );

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Icon background colors", () => {
    it("uses default bg-betis-verde when no iconBgColor specified", () => {
      const { container } = render(
        <FeatureCard
          icon={Users}
          title="Default Color"
          description="Uses default verde"
        />,
      );

      const iconContainer = container.querySelector(".bg-betis-verde");
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass("w-16", "h-16", "rounded-full");
    });

    it("applies bg-betis-verde when specified", () => {
      const { container } = render(
        <FeatureCard
          icon={Users}
          iconBgColor="bg-betis-verde"
          title="Verde"
          description="Green background"
        />,
      );

      const iconContainer = container.querySelector(".bg-betis-verde");
      expect(iconContainer).toBeInTheDocument();
    });

    it("applies bg-betis-verde-dark when specified", () => {
      const { container } = render(
        <FeatureCard
          icon={Clock}
          iconBgColor="bg-betis-verde-dark"
          title="Dark Verde"
          description="Dark green background"
        />,
      );

      const iconContainer = container.querySelector(".bg-betis-verde-dark");
      expect(iconContainer).toBeInTheDocument();
    });

    it("applies bg-betis-oro when specified", () => {
      const { container } = render(
        <FeatureCard
          icon={Award}
          iconBgColor="bg-betis-oro"
          title="Oro"
          description="Gold background"
        />,
      );

      const iconContainer = container.querySelector(".bg-betis-oro");
      expect(iconContainer).toBeInTheDocument();
    });

    it("applies bg-scotland-navy when specified", () => {
      const { container } = render(
        <FeatureCard
          icon={MapPin}
          iconBgColor="bg-scotland-navy"
          title="Navy"
          description="Navy background"
        />,
      );

      const iconContainer = container.querySelector(".bg-scotland-navy");
      expect(iconContainer).toBeInTheDocument();
    });

    it("applies bg-scotland-blue when specified", () => {
      const { container } = render(
        <FeatureCard
          icon={CheckCircle}
          iconBgColor="bg-scotland-blue"
          title="Blue"
          description="Blue background"
        />,
      );

      const iconContainer = container.querySelector(".bg-scotland-blue");
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe("Card styling", () => {
    it("has proper card classes for modern styling", () => {
      const { container } = render(
        <FeatureCard
          icon={Users}
          title="Styled Card"
          description="Modern card design"
        />,
      );

      const card = container.querySelector(".bg-white");
      expect(card).toHaveClass(
        "rounded-2xl",
        "p-8",
        "text-center",
        "shadow-xl",
        "border",
        "border-gray-100",
      );
    });

    it("includes hover effect classes", () => {
      const { container } = render(
        <FeatureCard
          icon={Users}
          title="Hover Card"
          description="Card with hover effects"
        />,
      );

      const card = container.querySelector(".bg-white");
      expect(card).toHaveClass(
        "hover:border-betis-verde",
        "transition-all",
        "duration-300",
        "transform",
        "hover:-translate-y-1",
      );
    });

    it("has overflow-hidden for pattern containment", () => {
      const { container } = render(
        <FeatureCard
          icon={Users}
          title="Overflow Card"
          description="Contains patterns"
        />,
      );

      const card = container.querySelector(".bg-white");
      expect(card).toHaveClass("overflow-hidden");
    });

    it("has relative positioning for pattern overlay", () => {
      const { container } = render(
        <FeatureCard
          icon={Users}
          title="Relative Card"
          description="Positioned for overlays"
        />,
      );

      const card = container.querySelector(".bg-white");
      expect(card).toHaveClass("group", "relative");
    });
  });

  describe("Pattern overlay", () => {
    it("renders pattern-verdiblanco-diagonal-subtle overlay", () => {
      const { container } = render(
        <FeatureCard
          icon={Users}
          title="Pattern Card"
          description="Has pattern overlay"
        />,
      );

      const pattern = container.querySelector(
        ".pattern-verdiblanco-diagonal-subtle",
      );
      expect(pattern).toBeInTheDocument();
      expect(pattern).toHaveClass("opacity-20");
    });

    it("positions pattern at top-right corner", () => {
      const { container } = render(
        <FeatureCard
          icon={Users}
          title="Corner Pattern"
          description="Pattern in corner"
        />,
      );

      const pattern = container.querySelector(
        ".pattern-verdiblanco-diagonal-subtle",
      );
      expect(pattern).toHaveClass(
        "absolute",
        "top-0",
        "right-0",
        "w-20",
        "h-20",
      );
    });
  });

  describe("Icon container", () => {
    it("has proper sizing and styling", () => {
      const { container } = render(
        <FeatureCard
          icon={Users}
          title="Icon Container"
          description="Styled icon"
        />,
      );

      const iconContainer = container.querySelector(".rounded-full");
      expect(iconContainer).toHaveClass(
        "w-16",
        "h-16",
        "flex",
        "items-center",
        "justify-center",
        "mx-auto",
        "mb-4",
      );
    });

    it("includes hover scale effect", () => {
      const { container } = render(
        <FeatureCard
          icon={Users}
          title="Scalable Icon"
          description="Icon scales on hover"
        />,
      );

      const iconContainer = container.querySelector(".rounded-full");
      expect(iconContainer).toHaveClass(
        "group-hover:scale-110",
        "transition-transform",
        "duration-300",
      );
    });
  });

  describe("Typography", () => {
    it("applies correct heading classes", () => {
      const { container } = render(
        <FeatureCard
          icon={Users}
          title="Typography Test"
          description="Heading styles"
        />,
      );

      const heading = screen.getByText("Typography Test");
      expect(heading.tagName).toBe("H3");
      expect(heading).toHaveClass(
        "font-heading",
        "text-xl",
        "font-bold",
        "mb-4",
        "text-scotland-navy",
        "uppercase",
        "tracking-wide",
      );
    });

    it("applies correct body text classes", () => {
      render(
        <FeatureCard
          icon={Users}
          title="Body Test"
          description="Body text content"
        />,
      );

      const description = screen.getByText("Body text content");
      expect(description.tagName).toBe("P");
      expect(description).toHaveClass("font-body", "text-gray-700");
    });
  });

  describe("Accessibility", () => {
    it("renders heading with proper hierarchy", () => {
      render(
        <FeatureCard
          icon={Users}
          title="Accessible Heading"
          description="Proper heading level"
        />,
      );

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("Accessible Heading");
    });

    it("content is readable and accessible", () => {
      render(
        <FeatureCard
          icon={Users}
          title="Accessible Card"
          description="This content should be accessible to screen readers"
        />,
      );

      expect(screen.getByText("Accessible Card")).toBeVisible();
      expect(
        screen.getByText("This content should be accessible to screen readers"),
      ).toBeVisible();
    });
  });

  describe("Content variations", () => {
    it("handles short description", () => {
      render(
        <FeatureCard
          icon={CheckCircle}
          title="Short"
          description="Brief text."
        />,
      );

      expect(screen.getByText("Short")).toBeInTheDocument();
      expect(screen.getByText("Brief text.")).toBeInTheDocument();
    });

    it("handles long description", () => {
      const longText =
        "This is a very long description that contains multiple sentences and provides detailed information about the feature being described in the card component.";

      render(
        <FeatureCard
          icon={Users}
          title="Long Description"
          description={longText}
        />,
      );

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("handles Spanish content", () => {
      render(
        <FeatureCard
          icon={Users}
          title="Reservamos Mesa"
          description="Con tu confirmación, podemos reservar una mesa grande para todos."
        />,
      );

      expect(screen.getByText("Reservamos Mesa")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Con tu confirmación, podemos reservar una mesa grande para todos.",
        ),
      ).toBeInTheDocument();
    });

    it.each([
      { icon: Users, name: "Users" },
      { icon: Clock, name: "Clock" },
      { icon: CheckCircle, name: "CheckCircle" },
      { icon: MapPin, name: "MapPin" },
      { icon: Award, name: "Award" },
    ])("handles different icon types: $name", ({ icon: Icon }) => {
      const { container } = render(
        <FeatureCard
          icon={Icon}
          title="Icon test"
          description="Different icon"
        />,
      );

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });
});
