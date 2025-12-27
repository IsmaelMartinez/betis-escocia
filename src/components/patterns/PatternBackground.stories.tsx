import type { Meta, StoryObj } from '@storybook/nextjs';
import PatternBackground, { 
  VerdiblancoBorder, 
  TicketEdge, 
  HeroBackground,
  CulturalCard,
  PatternType 
} from './PatternBackground';

const meta: Meta<typeof PatternBackground> = {
  title: 'Design System/Patterns',
  component: PatternBackground,
  parameters: {
    layout: 'fullscreen',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
  argTypes: {
    pattern: {
      control: 'select',
      options: [
        'none',
        'verdiblanco',
        'verdiblanco-subtle',
        'verdiblanco-whisper',
        'verdiblanco-diagonal',
        'tartan-subtle',
        'tartan-medium',
        'tartan-navy',
        'celtic-grid',
        'edinburgh-mist',
        'stadium-atmosphere',
        'oro-glow',
        'navy-depth',
        'hero-fusion',
        'warm-canvas',
        'hero-layered',
        'card-cultural',
      ] as PatternType[],
    },
    asOverlay: {
      control: 'boolean',
    },
    as: {
      control: 'select',
      options: ['div', 'section', 'article', 'aside', 'header', 'footer'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PatternBackground>;

// Helper component to display pattern in a visible box
const PatternDisplay = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div className="p-4">
    <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {children}
    </div>
  </div>
);

export const AllVerdibancoPatterns: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-8 bg-gray-100">
      <PatternDisplay title="verdiblanco (full)">
        <PatternBackground pattern="verdiblanco" className="h-32" />
      </PatternDisplay>
      <PatternDisplay title="verdiblanco-subtle">
        <PatternBackground pattern="verdiblanco-subtle" className="h-32 bg-white" />
      </PatternDisplay>
      <PatternDisplay title="verdiblanco-whisper">
        <PatternBackground pattern="verdiblanco-whisper" className="h-32 bg-white" />
      </PatternDisplay>
      <PatternDisplay title="verdiblanco-diagonal">
        <PatternBackground pattern="verdiblanco-diagonal" className="h-32 bg-white" />
      </PatternDisplay>
    </div>
  ),
};

export const AllScottishPatterns: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-8 bg-gray-100">
      <PatternDisplay title="tartan-subtle">
        <PatternBackground pattern="tartan-subtle" className="h-32 bg-white" />
      </PatternDisplay>
      <PatternDisplay title="tartan-medium">
        <PatternBackground pattern="tartan-medium" className="h-32 bg-white" />
      </PatternDisplay>
      <PatternDisplay title="tartan-navy">
        <PatternBackground pattern="tartan-navy" className="h-32 bg-scotland-navy" />
      </PatternDisplay>
      <PatternDisplay title="celtic-grid">
        <PatternBackground pattern="celtic-grid" className="h-32 bg-white" />
      </PatternDisplay>
    </div>
  ),
};

export const AllBackgrounds: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-8 bg-gray-100">
      <PatternDisplay title="edinburgh-mist">
        <PatternBackground pattern="edinburgh-mist" className="h-32" />
      </PatternDisplay>
      <PatternDisplay title="stadium-atmosphere">
        <PatternBackground pattern="stadium-atmosphere" className="h-32" />
      </PatternDisplay>
      <PatternDisplay title="warm-canvas">
        <PatternBackground pattern="warm-canvas" className="h-32" />
      </PatternDisplay>
      <PatternDisplay title="hero-fusion">
        <PatternBackground pattern="hero-fusion" className="h-32" />
      </PatternDisplay>
      <PatternDisplay title="navy-depth">
        <PatternBackground pattern="navy-depth" className="h-32" />
      </PatternDisplay>
      <PatternDisplay title="oro-glow (on dark bg)">
        <PatternBackground pattern="oro-glow" className="h-32 bg-scotland-navy" />
      </PatternDisplay>
    </div>
  ),
};

export const LayeredPatterns: Story = {
  render: () => (
    <PatternBackground 
      pattern="edinburgh-mist" 
      overlayPatterns={['tartan-subtle', 'verdiblanco-whisper']}
      className="min-h-64 p-8"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-betis-verde-dark mb-4">
          Layered Patterns
        </h1>
        <p className="text-gray-600">
          Edinburgh mist base + tartan overlay + verdiblanco whisper
        </p>
      </div>
    </PatternBackground>
  ),
};

export const VerdiblancoBorderExample: Story = {
  render: () => (
    <div className="p-8 bg-gray-100">
      <VerdiblancoBorder className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-betis-verde-dark mb-2">
          Card with Verdiblanco Border
        </h2>
        <p className="text-gray-600">
          The left edge shows the iconic Betis verdiblanco stripes.
        </p>
      </VerdiblancoBorder>
    </div>
  ),
};

export const TicketEdgeExample: Story = {
  render: () => (
    <div className="p-8 bg-gray-100">
      <TicketEdge className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-betis-verde-dark mb-2">
          Match Ticket Style
        </h2>
        <p className="text-gray-600">
          Perforated edge effect like a classic match ticket.
        </p>
      </TicketEdge>
    </div>
  ),
};

export const HeroBackgroundVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <HeroBackground variant="fusion" className="min-h-48 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-2">Hero Fusion</h1>
          <p>Betis verde to Scotland navy gradient</p>
        </div>
      </HeroBackground>
      
      <HeroBackground variant="mist" className="min-h-48 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-betis-verde-dark mb-2">Hero Mist</h1>
          <p className="text-gray-600">Edinburgh mist with subtle verdiblanco</p>
        </div>
      </HeroBackground>
      
      <HeroBackground variant="stadium" className="min-h-48 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-betis-verde-dark mb-2">Hero Stadium</h1>
          <p className="text-gray-600">Stadium atmosphere with tartan overlay</p>
        </div>
      </HeroBackground>
    </div>
  ),
};

export const CulturalCardExample: Story = {
  render: () => (
    <div className="p-8 bg-gray-100 grid grid-cols-2 gap-4">
      <CulturalCard className="p-6">
        <h2 className="text-xl font-bold text-betis-verde-dark mb-2">
          Cultural Card
        </h2>
        <p className="text-gray-600">
          Card with subtle verdiblanco texture and warm canvas gradient.
        </p>
      </CulturalCard>
      <CulturalCard className="p-6">
        <h2 className="text-xl font-bold text-betis-verde-dark mb-2">
          Another Card
        </h2>
        <p className="text-gray-600">
          The pattern is subtle but adds cultural depth.
        </p>
      </CulturalCard>
    </div>
  ),
};

export const AsOverlay: Story = {
  render: () => (
    <div className="relative h-64 bg-betis-verde flex items-center justify-center">
      <PatternBackground pattern="tartan-subtle" asOverlay />
      <div className="relative z-10 text-white text-center">
        <h1 className="text-3xl font-bold mb-2">Pattern as Overlay</h1>
        <p>The tartan pattern is layered over the green background</p>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    pattern: 'verdiblanco-subtle',
    className: 'h-64 flex items-center justify-center',
    children: (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-betis-verde-dark">
          Interactive Pattern Preview
        </h1>
        <p className="text-gray-600 mt-2">
          Use the controls to change the pattern
        </p>
      </div>
    ),
  },
};

