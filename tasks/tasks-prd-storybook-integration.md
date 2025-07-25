## Relevant Files

- `.storybook/main.ts` - Main Storybook configuration file with framework setup and addons
- `.storybook/preview.ts` - Global parameters, decorators, and viewport configurations
- `.storybook/theme.ts` - Custom Storybook theme reflecting Betis branding
- `package.json` - Dependencies and scripts for Storybook development and build
- `src/components/ui/Button.stories.tsx` - Story file for Button component with all variants and sizes
- `src/components/ui/Button.mdx` - MDX documentation for Button component usage patterns
- `src/components/LoadingSpinner.stories.tsx` - Story file for LoadingSpinner component
- `src/components/BetisLogo.stories.tsx` - Story file for BetisLogo component
- `src/components/GameTimer.stories.tsx` - Story file for GameTimer component
- `docs/storybook-guide.md` - Documentation for Storybook usage and conventions

### Notes

- Story files should be placed alongside their corresponding component files
- Use `.stories.tsx` extension for TypeScript story files
- MDX files are optional but recommended for complex components requiring detailed documentation
- Run `npm run storybook` to start the development server
- Run `npm run build-storybook` to generate static build

## Tasks

- [x] 1.0 Initial Storybook Setup and Configuration
  - [x] 1.1 Install Storybook 9.x and required dependencies (`@storybook/nextjs`, `@storybook/react`, `storybook`)
  - [x] 1.2 Initialize Storybook configuration using `npx storybook@latest init`
  - [x] 1.3 Configure `.storybook/main.ts` with Next.js framework and TypeScript support
  - [x] 1.4 Update `package.json` with Storybook scripts (`storybook` and `build-storybook`)
  - [x] 1.5 Test initial Storybook setup by running `npm run storybook`
  - [x] 1.6 Configure Storybook to work with Tailwind CSS and existing project styles
  - [ ] 1.7 (OPTIONAL) Install and configure Storybook MCP server (`storybook-mcp`) for AI-assisted development

- [ ] 2.0 Core Component Stories Implementation
  - [ ] 2.1 Identify and prioritize existing components in `src/components/` for story creation
  - [ ] 2.2 Create story file for Button component (`src/components/ui/Button.stories.tsx`) with all variants (primary, secondary, outline, ghost, danger) and sizes
  - [ ] 2.3 Create story file for LoadingSpinner component with different sizes and custom labels
  - [ ] 2.4 Create story file for BetisLogo component showing different display contexts
  - [ ] 2.5 Create story file for GameTimer component with different timer states and reset scenarios
  - [ ] 2.6 Implement basic interactive controls (args) for each component story

- [ ] 3.0 Betis Branding and Theme Integration
  - [ ] 3.1 Create custom Storybook theme in `.storybook/theme.ts` with Betis colors (#00A651 green, gold accents)
  - [ ] 3.2 Configure mobile-first viewport presets in `.storybook/preview.ts`
  - [ ] 3.3 Add Betis-branded background options for component testing
  - [ ] 3.4 Document Betis design tokens and color palette within Storybook
  - [ ] 3.5 Create component variations that showcase Betis branding patterns
  - [ ] 3.6 Ensure all stories reflect mobile-first responsive design principles

- [ ] 4.0 Advanced Features and Addons Configuration
  - [ ] 4.1 Install and configure Controls addon for interactive component testing
  - [ ] 4.2 Install and configure Docs addon for auto-generated documentation
  - [ ] 4.3 Install and configure A11y addon for accessibility testing and reporting
  - [ ] 4.4 Install and configure Viewport addon for responsive design testing
  - [ ] 4.5 Install and configure Backgrounds addon for different testing environments
  - [ ] 4.6 Set up visual regression testing integration (choose between Chromatic, Percy, or alternatives)
  - [ ] 4.7 Configure feature flag integration to demonstrate components with Flagsmith dependencies

- [ ] 5.0 Documentation and Developer Guidelines
  - [ ] 5.1 Create comprehensive developer guide (`docs/storybook-guide.md`) with usage instructions
  - [ ] 5.2 Document story naming conventions and organization patterns
  - [ ] 5.3 Create MDX documentation templates for complex components
  - [ ] 5.4 Write guidelines for handling authentication-dependent components in isolation
  - [ ] 5.5 Document integration with existing development workflow and testing procedures
  - [ ] 5.6 Create troubleshooting guide for common Storybook issues with Next.js 15
