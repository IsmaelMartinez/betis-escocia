import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactPage from "../../../src/app/[locale]/contacto/page";
import { useUser } from "@clerk/nextjs";

// Mock the dependencies
vi.mock("@clerk/nextjs", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/components/MessageComponent", () => ({
  FormSuccessMessage: vi.fn(({ title, message, className }) => (
    <div className={className} data-testid="success-message">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  )),
  FormErrorMessage: vi.fn(({ message, className }) => (
    <div className={className} data-testid="error-message">
      {message}
    </div>
  )),
  FormLoadingMessage: vi.fn(({ message, className }) => (
    <div className={className} data-testid="loading-message">
      {message}
    </div>
  )),
}));

vi.mock("@/components/LoadingSpinner", () => ({
  default: vi.fn(({ size, label }) => (
    <div data-testid="loading-spinner" data-size={size}>
      {label}
    </div>
  )),
}));

// lucide-react icons mock
vi.mock("lucide-react", () => ({
  Send: vi.fn(({ className }) => (
    <div data-testid="send-icon" className={className} />
  )),
  MessageSquare: vi.fn(({ className }) => (
    <div data-testid="message-square-icon" className={className} />
  )),
  UserPlus: vi.fn(({ className }) => (
    <div data-testid="user-plus-icon" className={className} />
  )),
  Package: vi.fn(({ className }) => (
    <div data-testid="package-icon" className={className} />
  )),
  Camera: vi.fn(({ className }) => (
    <div data-testid="camera-icon" className={className} />
  )),
  MessageCircle: vi.fn(({ className }) => (
    <div data-testid="message-circle-icon" className={className} />
  )),
  HelpCircle: vi.fn(({ className }) => (
    <div data-testid="help-circle-icon" className={className} />
  )),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock scrollIntoView to prevent errors in test environment
Object.defineProperty(Element.prototype, "scrollIntoView", {
  value: vi.fn(),
  writable: true,
});

describe("Contact Page", () => {
  const mockUseUser = vi.mocked(useUser);

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();

    // Mock console.log to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("Basic rendering", () => {
    it("renders page title and header", () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });

      render(<ContactPage />);

      expect(screen.getByText("title")).toBeInTheDocument();
      expect(screen.getByText("subtitle")).toBeInTheDocument();
    });

    it("renders contact type selection buttons", () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });

      render(<ContactPage />);

      expect(screen.getByText("whatDoYouNeed")).toBeInTheDocument();
      expect(screen.getAllByText("typeGeneral").length).toBeGreaterThan(0);
      expect(screen.getByText("typeRsvp")).toBeInTheDocument();
      expect(screen.getByText("typePhoto")).toBeInTheDocument();
      expect(screen.getByText("typeWhatsapp")).toBeInTheDocument();
      expect(screen.getByText("typeFeedback")).toBeInTheDocument();
    });

    it("renders contact form", () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });

      render(<ContactPage />);

      expect(screen.getByLabelText("nameLabel")).toBeInTheDocument();
      expect(screen.getByLabelText("emailLabel")).toBeInTheDocument();
      expect(screen.getByLabelText("phoneLabel")).toBeInTheDocument();
      expect(screen.getByLabelText("subjectLabel")).toBeInTheDocument();
      expect(screen.getByLabelText("messageLabel")).toBeInTheDocument();
      expect(screen.getByText("sendButton")).toBeInTheDocument();
    });

    it("renders FAQ section", () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });

      render(<ContactPage />);

      expect(screen.getByText("faqTitle")).toBeInTheDocument();
      expect(screen.getByText("faq1Question")).toBeInTheDocument();
      expect(screen.getByText("faq2Question")).toBeInTheDocument();
      expect(screen.getByText("faq3Question")).toBeInTheDocument();
    });

    it("renders alternative contact methods", () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });

      render(<ContactPage />);

      expect(screen.getByText("otherContactTitle")).toBeInTheDocument();
      expect(screen.getByText("Facebook")).toBeInTheDocument();
      expect(screen.getByText("Instagram")).toBeInTheDocument();
      expect(screen.getByText("inPerson")).toBeInTheDocument();
    });
  });

  describe("User authentication integration", () => {
    it("pre-fills form when user is authenticated", () => {
      const mockUser = {
        firstName: "Juan",
        lastName: "Pérez",
        emailAddresses: [{ emailAddress: "juan@example.com" }],
      };

      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
      } as any);

      render(<ContactPage />);

      expect(screen.getByDisplayValue("Juan Pérez")).toBeInTheDocument();
      expect(screen.getByDisplayValue("juan@example.com")).toBeInTheDocument();
      expect(
        screen.getByText(/connectedAs/),
      ).toBeInTheDocument();
    });

    it("handles user with only first name", () => {
      const mockUser = {
        firstName: "Juan",
        lastName: null,
        emailAddresses: [{ emailAddress: "juan@example.com" }],
      };

      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
      } as any);

      render(<ContactPage />);

      expect(screen.getByDisplayValue("Juan")).toBeInTheDocument();
    });

    it("handles user with no email addresses", () => {
      const mockUser = {
        firstName: "Juan",
        lastName: "Pérez",
        emailAddresses: [],
      };

      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
      } as any);

      render(<ContactPage />);

      expect(screen.getByDisplayValue("Juan Pérez")).toBeInTheDocument();
      expect(screen.getByLabelText("emailLabel")).toHaveValue(""); // Email field should be empty
    });
  });

  describe("Form interactions", () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });
    });

    it("updates form data when typing in fields", async () => {
      render(<ContactPage />);

      const nameInput = screen.getByLabelText("nameLabel");
      const emailInput = screen.getByLabelText("emailLabel");
      const messageInput = screen.getByLabelText("messageLabel");

      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(messageInput, { target: { value: "Test message" } });

      expect(nameInput).toHaveValue("Test User");
      expect(emailInput).toHaveValue("test@example.com");
      expect(messageInput).toHaveValue("Test message");
    });

    it("changes form type and updates subject", async () => {
      render(<ContactPage />);

      const rsvpButton = screen.getByRole("button", { name: /typeRsvp/ });
      fireEvent.click(rsvpButton);

      await waitFor(() => {
        const subjectInput = screen.getByLabelText("subjectLabel");
        expect(subjectInput).toHaveValue("defaultSubjectRsvp");
      });
    });

    it("shows special instructions for WhatsApp type", async () => {
      render(<ContactPage />);

      const whatsappButton = screen.getByRole("button", {
        name: /typeWhatsapp/,
      });
      fireEvent.click(whatsappButton);

      await waitFor(() => {
        expect(screen.getByText("whatsappNote")).toBeInTheDocument();
      });
    });

    it("shows special instructions for gallery type", async () => {
      render(<ContactPage />);

      const galleryButton = screen.getByRole("button", {
        name: /typePhoto/,
      });
      fireEvent.click(galleryButton);

      await waitFor(() => {
        expect(screen.getByText("photoNote")).toBeInTheDocument();
      });
    });
  });

  describe("Form submission", () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });
    });

    it("submits form successfully", async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<ContactPage />);

      // Fill form
      fireEvent.change(screen.getByLabelText("nameLabel"), {
        target: { value: "Test User" },
      });
      fireEvent.change(screen.getByLabelText("emailLabel"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText("subjectLabel"), {
        target: { value: "Test Subject" },
      });
      fireEvent.change(screen.getByLabelText("messageLabel"), {
        target: { value: "Test message" },
      });

      // Submit form
      const submitButton = screen.getByText("sendButton");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Test User",
            email: "test@example.com",
            phone: "",
            type: "general",
            subject: "Test Subject",
            message: "Test message",
          }),
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId("success-message")).toBeInTheDocument();
      });
    });

    it("handles form submission error", async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Server error" }),
      } as Response);

      render(<ContactPage />);

      // Fill form
      fireEvent.change(screen.getByLabelText("nameLabel"), {
        target: { value: "Test User" },
      });
      fireEvent.change(screen.getByLabelText("emailLabel"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText("subjectLabel"), {
        target: { value: "Test Subject" },
      });
      fireEvent.change(screen.getByLabelText("messageLabel"), {
        target: { value: "Test message" },
      });

      // Submit form
      const submitButton = screen.getByText("sendButton");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
        expect(screen.getByText("Server error")).toBeInTheDocument();
      });
    });

    it("handles network error during submission", async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<ContactPage />);

      // Fill form
      fireEvent.change(screen.getByLabelText("nameLabel"), {
        target: { value: "Test User" },
      });
      fireEvent.change(screen.getByLabelText("emailLabel"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText("subjectLabel"), {
        target: { value: "Test Subject" },
      });
      fireEvent.change(screen.getByLabelText("messageLabel"), {
        target: { value: "Test message" },
      });

      // Submit form
      const submitButton = screen.getByText("sendButton");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
        expect(
          screen.getByText("connectionError"),
        ).toBeInTheDocument();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Contact form error:",
        expect.any(Error),
      );
      consoleErrorSpy.mockRestore();
    });

    it("shows loading state during submission", async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ContactPage />);

      // Fill form
      fireEvent.change(screen.getByLabelText("nameLabel"), {
        target: { value: "Test User" },
      });
      fireEvent.change(screen.getByLabelText("emailLabel"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText("subjectLabel"), {
        target: { value: "Test Subject" },
      });
      fireEvent.change(screen.getByLabelText("messageLabel"), {
        target: { value: "Test message" },
      });

      // Submit form
      const submitButton = screen.getByText("sendButton");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("loading-message")).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });

    it("resets form after successful submission", async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(<ContactPage />);

      // Fill form with all required fields
      fireEvent.change(screen.getByLabelText("nameLabel"), {
        target: { value: "Test User" },
      });
      fireEvent.change(screen.getByLabelText("emailLabel"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText("phoneLabel"), {
        target: { value: "123456789" },
      });
      fireEvent.change(screen.getByLabelText("subjectLabel"), {
        target: { value: "Test Subject" },
      });
      fireEvent.change(screen.getByLabelText("messageLabel"), {
        target: { value: "Test message" },
      });

      // Submit form
      const submitButton = screen.getByText("sendButton");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("success-message")).toBeInTheDocument();
      });

      // Check that specific fields are reset (phone, subject, message)
      // Name and email may be preserved for authenticated users
      expect(screen.getByLabelText("phoneLabel")).toHaveValue("");
      expect(screen.getByLabelText("subjectLabel")).toHaveValue("");
      expect(screen.getByLabelText("messageLabel")).toHaveValue("");
    });
  });

  describe("External links", () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });
    });

    it("renders external social media links", () => {
      render(<ContactPage />);

      const facebookLink = screen.getByText("goToGroup");
      const instagramLink = screen.getByText("follow");
      const mapLink = screen.getByText("viewMap");

      expect(facebookLink).toBeInTheDocument();
      expect(instagramLink).toBeInTheDocument();
      expect(mapLink).toBeInTheDocument();
    });
  });

  describe("Default subject generation", () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });
    });

    it("sets correct default subject for each contact type", async () => {
      render(<ContactPage />);

      const testCases = [
        {
          buttonSelector: { name: /typeRsvp/ },
          expectedSubject: "defaultSubjectRsvp",
        },
        {
          buttonSelector: { name: /typePhoto/ },
          expectedSubject: "defaultSubjectPhoto",
        },
        {
          buttonSelector: { name: /typeWhatsapp/ },
          expectedSubject: "defaultSubjectWhatsapp",
        },
        {
          buttonSelector: { name: /typeFeedback/ },
          expectedSubject: "defaultSubjectFeedback",
        },
      ];

      for (const { buttonSelector, expectedSubject } of testCases) {
        const button = screen.getByRole("button", buttonSelector);
        fireEvent.click(button);

        await waitFor(() => {
          const subjectInput = screen.getByLabelText("subjectLabel");
          expect(subjectInput).toHaveValue(expectedSubject);
        });
      }
    });

    it("handles general type with empty default subject", async () => {
      render(<ContactPage />);

      // Click on a type with subject, then back to general
      fireEvent.click(screen.getByRole("button", { name: /typeRsvp/ }));
      await waitFor(() => {
        expect(screen.getByLabelText("subjectLabel")).toHaveValue(
          "defaultSubjectRsvp",
        );
      });

      fireEvent.click(screen.getByRole("button", { name: /typeGeneral/ }));
      await waitFor(() => {
        expect(screen.getByLabelText("subjectLabel")).toHaveValue("");
      });
    });
  });
});
