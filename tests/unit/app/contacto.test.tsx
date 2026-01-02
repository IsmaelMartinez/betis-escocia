import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactPage from '../../../src/app/contacto/page';
import { useUser } from '@clerk/nextjs';

// Mock the dependencies
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn()
}));

vi.mock('@/components/MessageComponent', () => ({
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
  ))
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: vi.fn(({ size, label }) => (
    <div data-testid="loading-spinner" data-size={size}>
      {label}
    </div>
  ))
}));

vi.mock('next/link', () => ({
  default: vi.fn(({ href, className, children }) => (
    <a href={href} className={className} data-testid="link">
      {children}
    </a>
  ))
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Send: vi.fn(({ className }) => <div data-testid="send-icon" className={className} />),
  MessageSquare: vi.fn(({ className }) => <div data-testid="message-square-icon" className={className} />),
  UserPlus: vi.fn(({ className }) => <div data-testid="user-plus-icon" className={className} />),
  Package: vi.fn(({ className }) => <div data-testid="package-icon" className={className} />),
  Camera: vi.fn(({ className }) => <div data-testid="camera-icon" className={className} />),
  MessageCircle: vi.fn(({ className }) => <div data-testid="message-circle-icon" className={className} />),
  HelpCircle: vi.fn(({ className }) => <div data-testid="help-circle-icon" className={className} />)
}));

// Mock fetch
global.fetch = vi.fn();

// Mock scrollIntoView to prevent errors in test environment
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true
});

describe('Contact Page', () => {
  const mockUseUser = vi.mocked(useUser);

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    
    // Mock console.log to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('Basic rendering', () => {
    it('renders page title and header', () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });

      render(<ContactPage />);

      expect(screen.getByText('Contacto')).toBeInTheDocument();
      expect(screen.getByText('¿Tienes alguna pregunta? Estamos aquí para ayudarte')).toBeInTheDocument();
    });

    it('renders contact type selection buttons', () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });

      render(<ContactPage />);

      expect(screen.getByText('¿Qué necesitas?')).toBeInTheDocument();
      expect(screen.getAllByText('Consulta General').length).toBeGreaterThan(0);
      expect(screen.getByText('Eventos y RSVP')).toBeInTheDocument();
  // No shop/collectibles button expected
      expect(screen.getByText('Fotos y Galería')).toBeInTheDocument();
      expect(screen.getByText('Unirse a WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('Sugerencias Web')).toBeInTheDocument();
    });

    it('renders contact form', () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });

      render(<ContactPage />);

      expect(screen.getByLabelText('Nombre completo *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      expect(screen.getByLabelText('Teléfono (opcional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Asunto *')).toBeInTheDocument();
      expect(screen.getByLabelText('Mensaje *')).toBeInTheDocument();
      expect(screen.getByText('Enviar Mensaje')).toBeInTheDocument();
    });

    it('renders FAQ section', () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });

      render(<ContactPage />);

      expect(screen.getByText('Preguntas Frecuentes')).toBeInTheDocument();
      expect(screen.getByText('¿Cómo puedo unirme a la peña?')).toBeInTheDocument();
      expect(screen.getByText('¿Tengo que confirmar asistencia?')).toBeInTheDocument();
      expect(screen.getByText('¿Puedo traer amigos?')).toBeInTheDocument();
    });

    it('renders alternative contact methods', () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });

      render(<ContactPage />);

      expect(screen.getByText('Otras formas de contacto')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('En persona')).toBeInTheDocument();
    });
  });

  describe('User authentication integration', () => {
    it('pre-fills form when user is authenticated', () => {
      const mockUser = {
        firstName: 'Juan',
        lastName: 'Pérez',
        emailAddresses: [{ emailAddress: 'juan@example.com' }]
      };

      mockUseUser.mockReturnValue({ 
        user: mockUser, 
        isLoaded: true, 
        isSignedIn: true 
      } as any);

      render(<ContactPage />);

      expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByDisplayValue('juan@example.com')).toBeInTheDocument();
      expect(screen.getByText('✓ Conectado como Juan Pérez')).toBeInTheDocument();
    });

    it('handles user with only first name', () => {
      const mockUser = {
        firstName: 'Juan',
        lastName: null,
        emailAddresses: [{ emailAddress: 'juan@example.com' }]
      };

      mockUseUser.mockReturnValue({ 
        user: mockUser, 
        isLoaded: true, 
        isSignedIn: true 
      } as any);

      render(<ContactPage />);

      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
    });

    it('handles user with no email addresses', () => {
      const mockUser = {
        firstName: 'Juan',
        lastName: 'Pérez',
        emailAddresses: []
      };

      mockUseUser.mockReturnValue({ 
        user: mockUser, 
        isLoaded: true, 
        isSignedIn: true 
      } as any);

      render(<ContactPage />);

      expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toHaveValue(''); // Email field should be empty
    });
  });

  describe('Form interactions', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });
    });

    it('updates form data when typing in fields', async () => {
      render(<ContactPage />);

      const nameInput = screen.getByLabelText('Nombre completo *');
      const emailInput = screen.getByLabelText('Email *');
      const messageInput = screen.getByLabelText('Mensaje *');

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(messageInput, { target: { value: 'Test message' } });

      expect(nameInput).toHaveValue('Test User');
      expect(emailInput).toHaveValue('test@example.com');
      expect(messageInput).toHaveValue('Test message');
    });

    it('changes form type and updates subject', async () => {
      render(<ContactPage />);

      const rsvpButton = screen.getByRole('button', { name: /Eventos y RSVP/ });
      fireEvent.click(rsvpButton);

      await waitFor(() => {
        const subjectInput = screen.getByLabelText('Asunto *');
        expect(subjectInput).toHaveValue('Consulta sobre eventos');
      });
    });

    it('shows special instructions for WhatsApp type', async () => {
      render(<ContactPage />);

      const whatsappButton = screen.getByRole('button', { name: /Unirse a WhatsApp/ });
      fireEvent.click(whatsappButton);

      await waitFor(() => {
        expect(screen.getByText(/Solicitud de WhatsApp:/)).toBeInTheDocument();
      });
    });

    it('shows special instructions for gallery type', async () => {
      render(<ContactPage />);

      const galleryButton = screen.getByRole('button', { name: /Fotos y Galería/ });
      fireEvent.click(galleryButton);

      await waitFor(() => {
        expect(screen.getByText(/Envío de fotos:/)).toBeInTheDocument();
      });
    });

  });

  describe('Form submission', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });
    });

    it('submits form successfully', async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response);

      render(<ContactPage />);

      // Fill form
      fireEvent.change(screen.getByLabelText('Nombre completo *'), { 
        target: { value: 'Test User' } 
      });
      fireEvent.change(screen.getByLabelText('Email *'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('Asunto *'), { 
        target: { value: 'Test Subject' } 
      });
      fireEvent.change(screen.getByLabelText('Mensaje *'), { 
        target: { value: 'Test message' } 
      });

      // Submit form
      const submitButton = screen.getByText('Enviar Mensaje');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            phone: '',
            type: 'general',
            subject: 'Test Subject',
            message: 'Test message'
          })
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });
    });

    it('handles form submission error', async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' })
      } as Response);

      render(<ContactPage />);

      // Fill form
      fireEvent.change(screen.getByLabelText('Nombre completo *'), { 
        target: { value: 'Test User' } 
      });
      fireEvent.change(screen.getByLabelText('Email *'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('Asunto *'), { 
        target: { value: 'Test Subject' } 
      });
      fireEvent.change(screen.getByLabelText('Mensaje *'), { 
        target: { value: 'Test message' } 
      });

      // Submit form
      const submitButton = screen.getByText('Enviar Mensaje');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });
    });

    it('handles network error during submission', async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<ContactPage />);

      // Fill form
      fireEvent.change(screen.getByLabelText('Nombre completo *'), { 
        target: { value: 'Test User' } 
      });
      fireEvent.change(screen.getByLabelText('Email *'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('Asunto *'), { 
        target: { value: 'Test Subject' } 
      });
      fireEvent.change(screen.getByLabelText('Mensaje *'), { 
        target: { value: 'Test message' } 
      });

      // Submit form
      const submitButton = screen.getByText('Enviar Mensaje');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Error de conexión. Inténtalo de nuevo.')).toBeInTheDocument();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Contact form error:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('shows loading state during submission', async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ContactPage />);

      // Fill form
      fireEvent.change(screen.getByLabelText('Nombre completo *'), { 
        target: { value: 'Test User' } 
      });
      fireEvent.change(screen.getByLabelText('Email *'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('Asunto *'), { 
        target: { value: 'Test Subject' } 
      });
      fireEvent.change(screen.getByLabelText('Mensaje *'), { 
        target: { value: 'Test message' } 
      });

      // Submit form
      const submitButton = screen.getByText('Enviar Mensaje');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading-message')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });

    it('resets form after successful submission', async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response);

      render(<ContactPage />);

      // Fill form with all required fields
      fireEvent.change(screen.getByLabelText('Nombre completo *'), { 
        target: { value: 'Test User' } 
      });
      fireEvent.change(screen.getByLabelText('Email *'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('Teléfono (opcional)'), { 
        target: { value: '123456789' } 
      });
      fireEvent.change(screen.getByLabelText('Asunto *'), { 
        target: { value: 'Test Subject' } 
      });
      fireEvent.change(screen.getByLabelText('Mensaje *'), { 
        target: { value: 'Test message' } 
      });

      // Submit form
      const submitButton = screen.getByText('Enviar Mensaje');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });

      // Check that specific fields are reset (phone, subject, message)
      // Name and email may be preserved for authenticated users
      expect(screen.getByLabelText('Teléfono (opcional)')).toHaveValue('');
      expect(screen.getByLabelText('Asunto *')).toHaveValue('');
      expect(screen.getByLabelText('Mensaje *')).toHaveValue('');
    });
  });

  describe('External links', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });
    });

    it('renders external social media links', () => {
      render(<ContactPage />);

      const facebookLink = screen.getByText('Ir al grupo');
      const instagramLink = screen.getByText('Seguir');
      const mapLink = screen.getByText('Ver mapa');

      expect(facebookLink).toBeInTheDocument();
      expect(instagramLink).toBeInTheDocument();
      expect(mapLink).toBeInTheDocument();
    });
  });

  describe('Default subject generation', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });
    });

    it('sets correct default subject for each contact type', async () => {
      render(<ContactPage />);

      const testCases = [
        { buttonSelector: { name: /Eventos y RSVP/ }, expectedSubject: 'Consulta sobre eventos' },
        { buttonSelector: { name: /Fotos y Galería/ }, expectedSubject: 'Envío de fotos' },
        { buttonSelector: { name: /Unirse a WhatsApp/ }, expectedSubject: 'Solicitud de invitación a WhatsApp' },
        { buttonSelector: { name: /Sugerencias Web/ }, expectedSubject: 'Sugerencias para la web' },
      ];

      for (const { buttonSelector, expectedSubject } of testCases) {
        const button = screen.getByRole('button', buttonSelector);
        fireEvent.click(button);

        await waitFor(() => {
          const subjectInput = screen.getByLabelText('Asunto *');
          expect(subjectInput).toHaveValue(expectedSubject);
        });
      }
    });

    it('handles general type with empty default subject', async () => {
      render(<ContactPage />);

      // Click on a type with subject, then back to general
      fireEvent.click(screen.getByRole('button', { name: /Eventos y RSVP/ }));
      await waitFor(() => {
        expect(screen.getByLabelText('Asunto *')).toHaveValue('Consulta sobre eventos');
      });

      fireEvent.click(screen.getByRole('button', { name: /Consulta General/ }));
      await waitFor(() => {
        expect(screen.getByLabelText('Asunto *')).toHaveValue('');
      });
    });
  });
});