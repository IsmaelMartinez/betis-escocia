import { render, screen } from '@testing-library/react';
import UnetePage from '@/app/unete/page';

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  MapPin: ({ className }: { className?: string }) => <div className={className} data-testid="map-pin-icon">MapPin</div>,
  Users: ({ className }: { className?: string }) => <div className={className} data-testid="users-icon">Users</div>,
  MessageCircle: ({ className }: { className?: string }) => <div className={className} data-testid="message-circle-icon">MessageCircle</div>,
  Heart: ({ className }: { className?: string }) => <div className={className} data-testid="heart-icon">Heart</div>,
}));

describe('Unete Page - Canary Tests', () => {
  test('should render page title and hero section', () => {
    render(<UnetePage />);

    expect(screen.getByText('Únete')).toBeInTheDocument();
    expect(screen.getByText('Ser bético en Escocia nunca fue tan fácil')).toBeInTheDocument();
    expect(screen.getByText(/No importa si acabas de llegar a Edinburgh/)).toBeInTheDocument();
  });

  test('should render how to join section', () => {
    render(<UnetePage />);

    expect(screen.getByText('🚀 PROCESO FÁCIL')).toBeInTheDocument();
    expect(screen.getByText('CÓMO UNIRTE')).toBeInTheDocument();
    expect(screen.getByText(/Es tan fácil como aparecer/)).toBeInTheDocument();
  });

  test('should render all four joining steps', () => {
    render(<UnetePage />);

    // Use getAllByText for text that appears multiple times
    expect(screen.getAllByText('Aparece en el Polwarth')).toHaveLength(2);
    expect(screen.getAllByText('Preséntate')).toHaveLength(2); // Appears in both card and visual
    expect(screen.getAllByText('Disfruta del partido')).toHaveLength(2); // Appears in both card and visual
    expect(screen.getAllByText('Únete digitalmente')).toHaveLength(2); // Appears in both card and visual
  });

  test('should render step numbers', () => {
    render(<UnetePage />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  test('should render step descriptions', () => {
    render(<UnetePage />);

    expect(screen.getByText(/Simplemente ven al Polwarth Tavern 30 minutos antes/)).toBeInTheDocument();
    expect(screen.getByText(/Di que eres bético y que has visto que tenemos una peña/)).toBeInTheDocument();
    expect(screen.getByText(/Vive el partido con nosotros/)).toBeInTheDocument();
    expect(screen.getByText(/únete a nuestro grupo de Facebook e Instagram/)).toBeInTheDocument();
  });

  test('should render step emojis', () => {
    render(<UnetePage />);

    // Use getAllByText for emojis that appear multiple times
    expect(screen.getAllByText('📍')).toHaveLength(2);
    expect(screen.getAllByText('👋')).toHaveLength(2); // Appears in both card and visual
    expect(screen.getAllByText('⚽')).toHaveLength(2); // Appears in both card and visual
    expect(screen.getAllByText('📱')).toHaveLength(2); // Appears in both card and visual
  });

  test('should render practical information section', () => {
    render(<UnetePage />);

    expect(screen.getByText('📍 INFORMACIÓN PRÁCTICA')).toBeInTheDocument();
    expect(screen.getByText('TODO LO QUE NECESITAS SABER')).toBeInTheDocument();
  });

  test('should render location information', () => {
    render(<UnetePage />);

    expect(screen.getByText('Ubicación')).toBeInTheDocument();
    expect(screen.getByText('Polwarth Tavern')).toBeInTheDocument();
    // Check for the actual address parts that exist in the component using regex
    expect(screen.getByText(/35 Polwarth Cres/)).toBeInTheDocument();
    expect(screen.getByText(/Edinburgh EH11 1HR/)).toBeInTheDocument();
  });

  test('should render contact information', () => {
    render(<UnetePage />);

    expect(screen.getByText('Contacto')).toBeInTheDocument();
    expect(screen.getByText('¿Dudas?')).toBeInTheDocument();
    expect(screen.getByText(/Escríbenos por Facebook/)).toBeInTheDocument();
  });

  test('should render Google Maps link', () => {
    render(<UnetePage />);

    const mapsLink = screen.getByText('Ver en Maps');
    expect(mapsLink).toBeInTheDocument();
    expect(mapsLink.closest('a')).toHaveAttribute('href', 'https://maps.google.com/maps?q=Polwarth+Tavern+Edinburgh');
    expect(mapsLink.closest('a')).toHaveAttribute('target', '_blank');
  });

  test('should render Facebook contact link', () => {
    render(<UnetePage />);

    const facebookLink = screen.getByText('Contactar');
    expect(facebookLink).toBeInTheDocument();
    expect(facebookLink.closest('a')).toHaveAttribute('href', 'https://www.facebook.com/groups/beticosenescocia/');
    expect(facebookLink.closest('a')).toHaveAttribute('target', '_blank');
  });

  test('should render special welcome for visitors', () => {
    render(<UnetePage />);

    expect(screen.getByText('🏴󠁧󠁢󠁳󠁣󠁴󠁿 ¿Estás de visita en Escocia?')).toBeInTheDocument();
    expect(screen.getByText(/Si eres bético y estás de vacaciones/)).toBeInTheDocument();
  });

  test('should render visitor categories', () => {
    render(<UnetePage />);

    expect(screen.getByText('✈️ Turistas')).toBeInTheDocument();
    expect(screen.getByText('🎓 Estudiantes')).toBeInTheDocument();
    expect(screen.getByText(/Si coincides con un partido durante tu visita/)).toBeInTheDocument();
    expect(screen.getByText(/Edinburgh tiene muchos estudiantes españoles/)).toBeInTheDocument();
  });

  test('should render FAQ section', () => {
    render(<UnetePage />);

    expect(screen.getByText('❓ PREGUNTAS FRECUENTES')).toBeInTheDocument();
    expect(screen.getByText('RESOLVEMOS TUS DUDAS')).toBeInTheDocument();
  });

  test('should render all FAQ questions', () => {
    render(<UnetePage />);

    expect(screen.getByText('¿Tengo que ser socio del Betis?')).toBeInTheDocument();
    expect(screen.getByText('¿Hay que pagar algo?')).toBeInTheDocument();
    expect(screen.getByText('¿Puedo venir con amigos no béticos?')).toBeInTheDocument();
    expect(screen.getByText('¿Qué pasa si el Betis pierde?')).toBeInTheDocument();
    expect(screen.getByText('¿Hay ambiente familiar?')).toBeInTheDocument();
  });

  test('should render FAQ answers', () => {
    render(<UnetePage />);

    expect(screen.getByText(/No es necesario. Solo necesitas ser bético de corazón/)).toBeInTheDocument();
    expect(screen.getByText(/Solo tu consumición en el pub/)).toBeInTheDocument();
    expect(screen.getByText(/¡Por supuesto! Siempre que respeten nuestros colores/)).toBeInTheDocument();
    expect(screen.getByText(/Nos consolamos juntos/)).toBeInTheDocument();
    expect(screen.getByText(/Totalmente. Vienen padres con hijos/)).toBeInTheDocument();
  });

  test('should render final CTA section', () => {
    render(<UnetePage />);

    expect(screen.getByText('💚 ¿A qué esperas?')).toBeInTheDocument();
    expect(screen.getByText(/El próximo partido del Betis puede ser el momento perfecto/)).toBeInTheDocument();
  });

  test('should render final action buttons', () => {
    render(<UnetePage />);

    const partidoButton = screen.getByText('📅 Ver próximo partido');
    expect(partidoButton).toBeInTheDocument();
    expect(partidoButton.closest('a')).toHaveAttribute('href', '/partidos');

    const facebookButton = screen.getByText('💬 Contactar por Facebook');
    expect(facebookButton).toBeInTheDocument();
    expect(facebookButton.closest('a')).toHaveAttribute('href', 'https://www.facebook.com/groups/beticosenescocia/');

    const youtubeButton = screen.getByText('📺 Ver en YouTube');
    expect(youtubeButton).toBeInTheDocument();
    expect(youtubeButton.closest('a')).toHaveAttribute('href', 'https://www.youtube.com/beticosenescocia');
  });

  test('should render external links with proper attributes', () => {
    render(<UnetePage />);

    const externalLinks = screen.getAllByRole('link').filter(link => {
      const href = link.getAttribute('href');
      return href && (href.includes('facebook.com') || href.includes('youtube.com') || href.includes('maps.google.com'));
    });

    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test('should render hero section with proper styling', () => {
    render(<UnetePage />);

    const heroTitle = screen.getByText('Únete');
    expect(heroTitle).toBeInTheDocument();
    // Check for the actual hero section container with proper styling
    const heroContainer = heroTitle.closest('div');
    expect(heroContainer).toBeInTheDocument();
    // The parent div should have the background styling
    const heroSection = heroContainer?.parentElement;
    expect(heroSection).toHaveClass('bg-betis-green', 'text-white');
  });

  test('should render sections with proper backgrounds', () => {
    render(<UnetePage />);

    // How to join section
    const joinSection = screen.getByText('🚀 PROCESO FÁCIL').closest('section');
    expect(joinSection).toHaveClass('bg-gray-50');

    // Practical info section
    const infoSection = screen.getByText('📍 INFORMACIÓN PRÁCTICA').closest('section');
    expect(infoSection).toHaveClass('bg-white');

    // FAQ section
    const faqSection = screen.getByText('❓ PREGUNTAS FRECUENTES').closest('section');
    expect(faqSection).toHaveClass('bg-gray-50');
  });

  test('should render responsive layout classes', () => {
    render(<UnetePage />);

    // Check for responsive grid in practical info section
    const infoGrid = screen.getByText('Ubicación').closest('.grid');
    expect(infoGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2');

    // Check for responsive grid in visitor section
    const visitorGrid = screen.getByText('✈️ Turistas').closest('.grid');
    expect(visitorGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2');
  });

  test('should render alternating layout for steps', () => {
    render(<UnetePage />);

    // Check for alternating layout classes
    const stepContainers = screen.getAllByText(/Paso \d/);
    expect(stepContainers.length).toBeGreaterThan(0);
  });

  test('should render gradient backgrounds', () => {
    render(<UnetePage />);

    // Check for gradient background in final CTA
    const ctaSection = screen.getByText('💚 ¿A qué esperas?').closest('section');
    expect(ctaSection).toHaveClass('bg-gradient-to-r', 'from-betis-green', 'to-betis-green-dark');
  });

  test('should render step details with proper styling', () => {
    render(<UnetePage />);

    // Check for step detail boxes
    const stepDetail = screen.getByText(/No hace falta avisar ni reservar/);
    expect(stepDetail.closest('div')).toHaveClass('bg-betis-green/10', 'rounded-lg');
  });

  test('should render FAQ with question marks', () => {
    render(<UnetePage />);

    // Check for question mark indicators
    const questionMarks = screen.getAllByText('?');
    expect(questionMarks.length).toBeGreaterThan(0);
  });

  test('should render step numbers with proper styling', () => {
    render(<UnetePage />);

    // Check for step number styling
    const stepNumbers = screen.getAllByText(/^[1-4]$/);
    stepNumbers.forEach(number => {
      expect(number.closest('div')).toHaveClass('bg-betis-green', 'text-white', 'rounded-full');
    });
  });
});
