import type { Meta, StoryObj } from '@storybook/nextjs';
import Card, { CardHeader, CardBody, CardFooter, InteractiveCard, BetisCard, ElevatedCard } from './Card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['base', 'interactive', 'elevated', 'betis'],
      description: 'Visual style of the card',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    children: {
      control: false, // Rendered directly in stories
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <h2 className="text-xl font-bold">Default Card Header</h2>
        </CardHeader>
        <CardBody>
          <p>This is the body of a default card.</p>
        </CardBody>
        <CardFooter>
          <p className="text-sm text-gray-500">Default Card Footer</p>
        </CardFooter>
      </>
    ),
  },
};

export const Interactive: Story = {
  args: {
    variant: 'interactive',
    children: (
      <>
        <CardHeader>
          <h2 className="text-xl font-bold">Interactive Card Header</h2>
        </CardHeader>
        <CardBody>
          <p>This card has interactive hover effects.</p>
        </CardBody>
      </>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <>
        <CardHeader>
          <h2 className="text-xl font-bold">Elevated Card Header</h2>
        </CardHeader>
        <CardBody>
          <p>This card has an elevated shadow effect.</p>
        </CardBody>
      </>
    ),
  },
};

export const BetisThemed: Story = {
  args: {
    variant: 'betis',
    children: (
      <>
        <CardHeader>
          <h2 className="text-xl font-bold text-white">Betis Card Header</h2>
        </CardHeader>
        <CardBody>
          <p className="text-white">This card uses Betis brand colors.</p>
        </CardBody>
      </>
    ),
  },
};

export const CardWithOnlyBody: Story = {
  args: {
    children: (
      <CardBody>
        <h2 className="text-xl font-bold">Card with only a body</h2>
        <p>Sometimes you just need a simple card body.</p>
      </CardBody>
    ),
  },
};

// Stories for exported sub-components
const metaCardHeader: Meta<typeof CardHeader> = {
  title: 'UI/Card/CardHeader',
  component: CardHeader,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    className: { control: 'text' },
  },
};

type StoryCardHeader = StoryObj<typeof CardHeader>;

export const HeaderOnly: StoryCardHeader = {
  args: {
    children: 'Simple Header',
  },
};

const metaCardBody: Meta<typeof CardBody> = {
  title: 'UI/Card/CardBody',
  component: CardBody,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    className: { control: 'text' },
  },
};

type StoryCardBody = StoryObj<typeof CardBody>;

export const BodyOnly: StoryCardBody = {
  args: {
    children: 'Simple Body Content',
  },
};

const metaCardFooter: Meta<typeof CardFooter> = {
  title: 'UI/Card/CardFooter',
  component: CardFooter,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    className: { control: 'text' },
  },
};

type StoryCardFooter = StoryObj<typeof CardFooter>;

export const FooterOnly: StoryCardFooter = {
  args: {
    children: 'Simple Footer',
  },
};

// Stories for specialized card variants
const metaInteractiveCard: Meta<typeof InteractiveCard> = {
  title: 'UI/Card/InteractiveCard',
  component: InteractiveCard,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
    className: { control: 'text' },
  },
};

type StoryInteractiveCard = StoryObj<typeof InteractiveCard>;

export const InteractiveCardExample: StoryInteractiveCard = {
  args: {
    children: (
      <CardBody>
        <h2 className="text-xl font-bold">Clickable Card</h2>
        <p>This card changes appearance on hover.</p>
      </CardBody>
    ),
  },
};

const metaBetisCard: Meta<typeof BetisCard> = {
  title: 'UI/Card/BetisCard',
  component: BetisCard,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
    className: { control: 'text' },
  },
};

type StoryBetisCard = StoryObj<typeof BetisCard>;

export const BetisCardExample: StoryBetisCard = {
  args: {
    children: (
      <CardBody>
        <h2 className="text-xl font-bold text-white">Betis Branded Card</h2>
        <p className="text-white">This card uses the Betis theme.</p>
      </CardBody>
    ),
  },
};

// const metaElevatedCard: Meta<typeof ElevatedCard> = {
  title: 'UI/Card/ElevatedCard',
  component: ElevatedCard,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
    className: { control: 'text' },
  },
};

type StoryElevatedCard = StoryObj<typeof ElevatedCard>;

export const ElevatedCardExample: StoryElevatedCard = {
  args: {
    children: (
      <CardBody>
        <h2 className="text-xl font-bold">Card with Elevation</h2>
        <p>This card has a distinct shadow.</p>
      </CardBody>
    ),
  },
};
