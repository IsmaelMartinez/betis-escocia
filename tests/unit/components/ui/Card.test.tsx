import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card, { 
  CardHeader, 
  CardBody, 
  CardFooter, 
  InteractiveCard, 
  BetisCard, 
  ElevatedCard 
} from '@/components/ui/Card';

// Mock the design system
vi.mock('@/lib/designSystem', () => ({
  getCardClass: vi.fn((variant: string) => `card card-${variant}`),
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

describe('Card Component', () => {
  describe('Basic functionality', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      );
      
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies default variant', () => {
      render(<Card data-testid="card">Default card</Card>);
      const card = screen.getByTestId('card');
      
      expect(card).toHaveClass('card', 'card-base');
    });

    it('applies custom variant', () => {
      render(<Card variant="interactive" data-testid="card">Interactive card</Card>);
      const card = screen.getByTestId('card');
      
      expect(card).toHaveClass('card', 'card-interactive');
    });

    it('applies custom className', () => {
      render(
        <Card className="custom-class" data-testid="card">
          Custom card
        </Card>
      );
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
    });

    it('preserves other HTML div attributes', () => {
      render(
        <Card 
          id="my-card" 
          data-testid="custom-card"
          aria-label="Custom card"
          role="region"
        >
          Card with attributes
        </Card>
      );
      
      const card = screen.getByTestId('custom-card');
      expect(card).toHaveAttribute('id', 'my-card');
      expect(card).toHaveAttribute('aria-label', 'Custom card');
      expect(card).toHaveAttribute('role', 'region');
    });
  });

  describe('All variants', () => {
    it.each([
      ['base', 'card-base'],
      ['interactive', 'card-interactive'],
      ['elevated', 'card-elevated'],
      ['betis', 'card-betis'],
    ])('applies correct class for %s variant', (variant, expectedClass) => {
      render(<Card variant={variant as any} data-testid="card">Test</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass(expectedClass);
    });
  });
});

describe('CardHeader Component', () => {
  it('renders children correctly', () => {
    render(
      <CardHeader>
        <h2>Header Title</h2>
      </CardHeader>
    );
    
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Header Title');
  });

  it('applies default styling', () => {
    render(<CardHeader data-testid="header">Header content</CardHeader>);
    const header = screen.getByTestId('header');
    
    expect(header).toHaveClass('px-6', 'py-4', 'border-b', 'border-gray-200');
  });

  it('applies custom className', () => {
    render(
      <CardHeader className="custom-header" data-testid="header">
        Custom header
      </CardHeader>
    );
    
    const header = screen.getByTestId('header');
    expect(header).toHaveClass('custom-header');
    // Should still have default classes
    expect(header).toHaveClass('px-6', 'py-4', 'border-b', 'border-gray-200');
  });
});

describe('CardBody Component', () => {
  it('renders children correctly', () => {
    render(
      <CardBody>
        <p>Body content</p>
      </CardBody>
    );
    
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('applies default styling', () => {
    render(<CardBody data-testid="body">Body content</CardBody>);
    const body = screen.getByTestId('body');
    
    expect(body).toHaveClass('px-6', 'py-4');
  });

  it('applies custom className', () => {
    render(
      <CardBody className="custom-body" data-testid="body">
        Custom body
      </CardBody>
    );
    
    const body = screen.getByTestId('body');
    expect(body).toHaveClass('custom-body');
    // Should still have default classes
    expect(body).toHaveClass('px-6', 'py-4');
  });
});

describe('CardFooter Component', () => {
  it('renders children correctly', () => {
    render(
      <CardFooter>
        <button>Footer action</button>
      </CardFooter>
    );
    
    expect(screen.getByRole('button')).toHaveTextContent('Footer action');
  });

  it('applies default styling', () => {
    render(<CardFooter data-testid="footer">Footer content</CardFooter>);
    const footer = screen.getByTestId('footer');
    
    expect(footer).toHaveClass(
      'px-6', 
      'py-4', 
      'border-t', 
      'border-gray-200', 
      'bg-gray-50/50'
    );
  });

  it('applies custom className', () => {
    render(
      <CardFooter className="custom-footer" data-testid="footer">
        Custom footer
      </CardFooter>
    );
    
    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('custom-footer');
    // Should still have default classes
    expect(footer).toHaveClass(
      'px-6', 
      'py-4', 
      'border-t', 
      'border-gray-200', 
      'bg-gray-50/50'
    );
  });
});

describe('Complete Card Structure', () => {
  it('renders full card with header, body, and footer', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <h2>Card Title</h2>
        </CardHeader>
        <CardBody data-testid="body">
          <p>Card body content</p>
        </CardBody>
        <CardFooter data-testid="footer">
          <button>Action</button>
        </CardFooter>
      </Card>
    );
    
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('body')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Card Title');
    expect(screen.getByText('Card body content')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Action');
  });
});

describe('Specialized Card Components', () => {
  it('InteractiveCard applies interactive variant', () => {
    render(<InteractiveCard data-testid="card">Interactive</InteractiveCard>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('card-interactive');
  });

  it('BetisCard applies betis variant', () => {
    render(<BetisCard data-testid="card">Betis</BetisCard>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('card-betis');
  });

  it('ElevatedCard applies elevated variant', () => {
    render(<ElevatedCard data-testid="card">Elevated</ElevatedCard>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('card-elevated');
  });

  it('specialized cards accept all other props', () => {
    render(
      <InteractiveCard 
        className="custom" 
        id="special-card"
        data-testid="card"
      >
        Special card
      </InteractiveCard>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('card-interactive', 'custom');
    expect(card).toHaveAttribute('id', 'special-card');
  });

  it('specialized cards can be used with card sections', () => {
    render(
      <BetisCard data-testid="betis-card">
        <CardHeader>Betis Header</CardHeader>
        <CardBody>Betis content</CardBody>
        <CardFooter>Betis footer</CardFooter>
      </BetisCard>
    );
    
    const card = screen.getByTestId('betis-card');
    expect(card).toHaveClass('card-betis');
    expect(screen.getByText('Betis Header')).toBeInTheDocument();
    expect(screen.getByText('Betis content')).toBeInTheDocument();
    expect(screen.getByText('Betis footer')).toBeInTheDocument();
  });
});