import { render, screen } from '@testing-library/react';
import NosotrosPage from '@/app/nosotros/page';

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
  Users: ({ className }: { className?: string }) => <div className={className} data-testid="users-icon">Users</div>,
  Heart: ({ className }: { className?: string }) => <div className={className} data-testid="heart-icon">Heart</div>,
}));

describe('Nosotros Page - Canary Tests', () => {
  test('should render page title and hero section', () => {
    render(<NosotrosPage />);

    expect(screen.getByText('Nosotros')).toBeInTheDocument();
    expect(screen.getByText('Más que una peña, somos familia')).toBeInTheDocument();
    expect(screen.getByText(/Desde 2010, hemos sido el hogar de todos los béticos en Escocia/)).toBeInTheDocument();
  });

  test('should render our story section', () => {
    render(<NosotrosPage />);

    expect(screen.getByText('📖 NUESTRA HISTORIA')).toBeInTheDocument();
    expect(screen.getByText('CÓMO EMPEZÓ TODO')).toBeInTheDocument();
    expect(screen.getByText('El Comienzo')).toBeInTheDocument();
    expect(screen.getByText('La Comunidad')).toBeInTheDocument();
  });

  test('should render founding story details', () => {
    render(<NosotrosPage />);

    expect(screen.getByText(/Todo empezó el 4 de diciembre de 2010/)).toBeInTheDocument();
    // Use getAllByText for text that appears multiple times
    expect(screen.getAllByText(/Juan Morata y José María Conde/)).toHaveLength(2);
    expect(screen.getByText(/primera peña oficial del Real Betis en el Reino Unido/)).toBeInTheDocument();
  });

  test('should render LaLiga quote', () => {
    render(<NosotrosPage />);

    expect(screen.getByText(/La idea de crear el club de fans vino tomando algo en un pub/)).toBeInTheDocument();
    expect(screen.getByText('- Fuente: LaLiga oficial')).toBeInTheDocument();
  });

  test('should render community statistics', () => {
    render(<NosotrosPage />);

    expect(screen.getByText('25+')).toBeInTheDocument();
    expect(screen.getByText('Miembros activos')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Años de historia')).toBeInTheDocument();
  });

  test('should render timeline section', () => {
    render(<NosotrosPage />);

    expect(screen.getByText('⏰ CRONOLOGÍA')).toBeInTheDocument();
    expect(screen.getByText('MOMENTOS CLAVE')).toBeInTheDocument();
  });

  test('should render all milestone years', () => {
    render(<NosotrosPage />);

    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('2011')).toBeInTheDocument();
    expect(screen.getByText('2013')).toBeInTheDocument();
    expect(screen.getByText('2015')).toBeInTheDocument();
    expect(screen.getByText('2018')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
  });

  test('should render milestone events', () => {
    render(<NosotrosPage />);

    expect(screen.getByText('Fundación histórica')).toBeInTheDocument();
    expect(screen.getByText('El ascenso que cambió todo')).toBeInTheDocument();
    expect(screen.getByText('José Mari toma las riendas')).toBeInTheDocument();
    expect(screen.getByText('Nueva casa en Polwarth')).toBeInTheDocument();
    expect(screen.getByText('Reconocimiento de LaLiga')).toBeInTheDocument();
    expect(screen.getByText('ABC nos cita')).toBeInTheDocument();
  });

  test('should render team section', () => {
    render(<NosotrosPage />);

    expect(screen.getByText('👥 EL EQUIPO')).toBeInTheDocument();
    expect(screen.getByText('NUESTROS PILARES')).toBeInTheDocument();
    // Check for the actual description text
    expect(screen.getByText(/Las personas que hacen que todo funcione y que cada partido sea especial/)).toBeInTheDocument();
  });

  test('should render founding members', () => {
    render(<NosotrosPage />);

    expect(screen.getByText('José María Conde (José Mari)')).toBeInTheDocument();
    expect(screen.getByText('Co-fundador y Presidente')).toBeInTheDocument();
    expect(screen.getByText('Juan Morata')).toBeInTheDocument();
    expect(screen.getByText('Co-fundador')).toBeInTheDocument();
    expect(screen.getByText('Javi Guerra')).toBeInTheDocument();
    expect(screen.getByText('Vicepresidente')).toBeInTheDocument();
  });

  test('should render member descriptions', () => {
    render(<NosotrosPage />);

    expect(screen.getByText(/Co-fundador de la peña en 2010 junto con Juan/)).toBeInTheDocument();
    expect(screen.getByText(/Regresó a España por motivos profesionales/)).toBeInTheDocument();
    expect(screen.getByText(/Vicepresidente activo de la peña/)).toBeInTheDocument();
  });

  test('should render call to action section', () => {
    render(<NosotrosPage />);

    expect(screen.getByText('¿Quieres ser parte de nuestra historia?')).toBeInTheDocument();
    expect(screen.getByText(/Cada bético que se une a nosotros añade un capítulo más/)).toBeInTheDocument();
  });

  test('should render action buttons', () => {
    render(<NosotrosPage />);

    const uneteButton = screen.getByText('💬 Únete a nosotros');
    expect(uneteButton).toBeInTheDocument();
    expect(uneteButton.closest('a')).toHaveAttribute('href', '/unete');

    const rsvpButton = screen.getByText('📅 Próximos eventos');
    expect(rsvpButton).toBeInTheDocument();
    expect(rsvpButton.closest('a')).toHaveAttribute('href', '/rsvp');
  });

  test('should render hero section with proper styling', () => {
    render(<NosotrosPage />);

    const heroTitle = screen.getByText('Nosotros');
    expect(heroTitle).toBeInTheDocument();
    // Check for the actual hero section container with proper styling
    const heroContainer = heroTitle.closest('div');
    expect(heroContainer).toBeInTheDocument();
    // The parent div should have the background styling
    const heroSection = heroContainer?.parentElement;
    expect(heroSection).toHaveClass('bg-betis-green', 'text-white');
  });

  test('should render sections with proper backgrounds', () => {
    render(<NosotrosPage />);

    // Our story section
    const storySection = screen.getByText('📖 NUESTRA HISTORIA').closest('section');
    expect(storySection).toHaveClass('bg-gray-50');

    // Timeline section
    const timelineSection = screen.getByText('⏰ CRONOLOGÍA').closest('section');
    expect(timelineSection).toHaveClass('bg-white');

    // Team section
    const teamSection = screen.getByText('👥 EL EQUIPO').closest('section');
    expect(teamSection).toHaveClass('bg-gray-50');
  });

  test('should render responsive grid layouts', () => {
    render(<NosotrosPage />);

    // Story section grid
    const storyGrid = screen.getByText('El Comienzo').closest('.grid');
    expect(storyGrid).toHaveClass('grid-cols-1', 'lg:grid-cols-2');

    // Team members grid
    const teamGrid = screen.getByText('José María Conde (José Mari)').closest('.grid');
    expect(teamGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  test('should render member emojis', () => {
    render(<NosotrosPage />);

    // Check for emojis in member cards
    expect(screen.getByText('👑')).toBeInTheDocument();
    expect(screen.getByText('⚽')).toBeInTheDocument();
    expect(screen.getByText('🛡️')).toBeInTheDocument();
  });

  test('should render timeline with proper structure', () => {
    render(<NosotrosPage />);

    // Check for timeline items
    const timelineItems = screen.getAllByText(/2010|2011|2013|2015|2018|2021/);
    expect(timelineItems.length).toBeGreaterThan(0);
  });

  test('should render cards with hover effects', () => {
    render(<NosotrosPage />);

    // Check for hover effect classes on cards
    const memberCard = screen.getByText('José María Conde (José Mari)').closest('.transform');
    expect(memberCard).toHaveClass('hover:scale-105', 'transition-all');

    const timelineCard = screen.getByText('Fundación histórica').closest('.transform');
    expect(timelineCard).toHaveClass('hover:scale-105', 'transition-all');
  });

  test('should render background overlays for readability', () => {
    render(<NosotrosPage />);

    // Check for overlay in CTA section
    const ctaSection = screen.getByText('¿Quieres ser parte de nuestra historia?').closest('section');
    const overlay = ctaSection?.querySelector('.absolute.inset-0.bg-black\\/20');
    expect(overlay).toBeInTheDocument();
  });

  test('should render with proper z-index stacking', () => {
    render(<NosotrosPage />);

    // Check for proper z-index in CTA section
    const ctaContent = screen.getByText('¿Quieres ser parte de nuestra historia?').closest('.relative.z-10');
    expect(ctaContent).toHaveClass('relative', 'z-10');
  });

  test('should render badge styles for sections', () => {
    render(<NosotrosPage />);

    // Check for badge styling
    const badge = screen.getByText('📖 NUESTRA HISTORIA').closest('.inline-block');
    expect(badge).toHaveClass('bg-betis-green', 'text-white', 'px-6', 'py-3', 'rounded-lg');
  });

  test('should render member role badges', () => {
    render(<NosotrosPage />);

    // Check for role badge styling
    const roleText = screen.getByText('Co-fundador y Presidente');
    expect(roleText).toHaveClass('text-betis-green', 'font-semibold');
  });
});
