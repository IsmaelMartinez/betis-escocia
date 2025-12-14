# ADR-009: Storybook for Component Development

## Status
Accepted

## Decision
**Storybook v10** for component development, documentation, and visual testing.

## Why Storybook
- **Component isolation**: Develop UI components independently
- **Documentation**: Auto-generated component docs
- **Visual testing**: Catch UI regressions
- **Developer experience**: Hot reload, responsive previews
- **Mobile-first**: Default mobile viewport for Betis branding

## Configuration
```typescript
// .storybook/main.ts
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  framework: "@storybook/nextjs",
  addons: ["@storybook/addon-docs", "@storybook/addon-onboarding"]
};
```

## Story Pattern
Create `.stories.tsx` alongside components:
```typescript
// src/components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: { layout: 'centered' }
};
export default meta;

export const Primary: StoryObj<typeof Button> = {
  args: { children: 'Click me', variant: 'primary' }
};
```

## Commands
```bash
npm run storybook       # Dev server on port 6006
npm run build-storybook # Static build
```

## Mocking Strategy
- Clerk: Mocked via `ClerkDecorator` component
- MSW: Service worker for API mocking
- Next.js Image: Mocked for Storybook compatibility

## Viewport Presets
- Small mobile: 320x568
- Large mobile: 414x896  
- Tablet: 768x1024

## Background Colors
- Light, Dark, Betis Green (#00A651), Betis Gold (#FFD700)

