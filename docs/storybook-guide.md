# Storybook Developer Guide

This guide provides instructions for developing and documenting UI components using Storybook v9 in the Betis project.

## 1. Getting Started

Storybook is a powerful frontend workshop environment for building UI components in isolation. It helps you develop components faster, document them, and test them.

**Current Version**: Storybook v9.0.18 with Next.js-Vite integration

### 1.1 Starting Storybook

To start the Storybook development server, run the following command in your project's root directory:

```bash
npm run storybook
```

This will open Storybook in your browser at `http://localhost:6006`.

**Note**: Storybook v9 includes significant performance improvements with 48% lighter bundle sizes and faster startup times.

### 1.2 Building Storybook

To generate a static build of your Storybook, which can be deployed to a static hosting service, run:

```bash
npm run build-storybook
```

The static build will be generated in the `storybook-static` directory.

## 2. Writing Stories

Stories are functions that describe how to render a component in a given state. They are typically placed alongside the component file with a `.stories.tsx` extension.

### 2.1 Basic Story Structure

Here's a basic example of a story file:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    children: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};
```

- **`Meta`**: Defines metadata about your component, including its title in the Storybook sidebar, the component itself, and global parameters.
- **`StoryObj`**: Defines individual stories for your component. Each named export from the story file will be a separate story.
- **`args`**: Properties that are passed to your component. These can be controlled interactively in Storybook's Controls panel.
- **`argTypes`**: Configures how `args` are displayed and controlled in the Storybook UI.

### 2.2 Story Naming and Organization

To maintain a consistent and organized Storybook, please follow these conventions:

- **File Location**: Story files (`.stories.tsx`) should be placed directly alongside their corresponding component files.
- **Title Naming**: The `title` property in `Meta` defines the path in the Storybook sidebar. Use a hierarchical structure, typically starting with a category (e.g., `UI`, `Components`, `Layouts`) followed by the component name. For example: `UI/Button` or `Components/Forms/Input`.
- **Story Naming**: Each named export in your story file (e.g., `Primary`, `Secondary`) will become a story. Use descriptive names that clearly indicate the state or variation of the component being showcased.
- **Tags**: Use the `tags` property in `Meta` to add relevant tags to your stories (e.g., `autodocs`, `interaction`, `accessibility`).

### 2.3 Using Addons

Storybook is extended with addons to enhance the development experience. Here are some key addons configured in this project:

### 2.3.1 Essential Addons (Built-in with Storybook v9)

The following addons are now built into Storybook core and no longer require separate packages:

- **Controls**: Automatically generates UI controls for your component's `args`, allowing you to interactively change props and see the component's behavior in real-time.
- **Viewport**: Allows you to test your components across different screen sizes and devices by simulating various viewport dimensions.
- **Backgrounds**: Provides options to change the background color of your stories, useful for testing components on different themes or brand colors.
- **Actions**: Logs actions taken on your components (button clicks, form submissions, etc.) for debugging.
- **Toolbars**: Provides global toolbars for switching between different states across all stories.
- **Measure & Outline**: Visual debugging tools to check spacing and component boundaries.

### 2.3.2 Additional Addons

- **Docs**: Auto-generates documentation pages for your components based on your stories and JSDoc comments. Use MDX files for more detailed documentation.
- **A11y (Accessibility)**: Helps you catch accessibility issues early in the development process by running automated accessibility checks on your stories.
- **Vitest**: Provides component testing capabilities directly within Storybook.

### 2.3.3 Storybook v9 Migration Notes

This project has been migrated to Storybook v9, which includes significant changes:

- **Package Consolidation**: Many addon packages have been consolidated into the main `storybook` package
- **Essential Addons Moved to Core**: Controls, viewport, backgrounds, and other essential features no longer require separate packages
- **Improved Performance**: 48% lighter bundle sizes and faster startup times
- **Enhanced Testing**: Better integration with Vitest for component testing

For more details, see [ADR-010: Storybook v9 Migration](../adr/010-storybook-v9-migration.md).

## 3. Design Tokens and Branding

We have integrated Betis branding and design tokens into Storybook. You can find the documented color palette and other design tokens in the [Design Tokens/Colors](/?path=/docs/design-tokens-colors--docs) section of Storybook.

When creating new components or stories, ensure they adhere to the established design system and branding guidelines.

## 4. Feature Flag Integration

Components that depend on Flagsmith feature flags can be tested in isolation within Storybook. We have set up a mocking mechanism for Flagsmith, allowing you to control the state of feature flags directly from your stories. This enables you to easily test different feature flag scenarios without needing a live Flagsmith connection.

To control feature flags in your stories, you can import the mocked Flagsmith manager and use its `setFlags` method:

```typescript
// Example of a story with feature flag control
import type { Meta, StoryObj } from '@storybook/react';
import MyFeatureComponent from './MyFeatureComponent';
import { getFlagsmithManager } from '@/lib/flagsmith'; // This will resolve to the mock

const meta: Meta<typeof MyFeatureComponent> = {
  title: 'Components/MyFeatureComponent',
  component: MyFeatureComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MyFeatureComponent>;

export const FeatureEnabled: Story = {
  render: (args) => {
    // Set the feature flag to true for this story
    getFlagsmithManager().setFlags({ 'my_feature': true });
    return <MyFeatureComponent {...args} />;
  },
};

export const FeatureDisabled: Story = {
  render: (args) => {
    // Set the feature flag to false for this story
    getFlagsmithManager().setFlags({ 'my_feature': false });
    return <MyFeatureComponent {...args} />;
  },
};
```

Remember to reset the flags if necessary between stories to avoid unintended side effects.

## 5. Handling Authentication-Dependent Components

Components that rely on user authentication (e.g., displaying user-specific data, restricted access components) can be challenging to test in isolation. In Storybook, you can mock authentication states to simulate different user scenarios.

### 5.1 Mocking Clerk Authentication

Since the project uses Clerk for authentication, you can leverage `@clerk/nextjs/testing` to mock authentication states within your stories. This allows you to render components as if a user is logged in, logged out, or has specific roles.

Here's an example of how to use `withClerk` and `SignedIn/SignedOut` components from Clerk's testing utilities:

```typescript
// Example of a story with mocked authentication
import type { Meta, StoryObj } from '@storybook/react';
import { withClerk, SignedIn, SignedOut } from '@clerk/nextjs/testing';
import UserProfile from './UserProfile';

const meta: Meta<typeof UserProfile> = {
  title: 'Components/UserProfile',
  component: UserProfile,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ border: '1px solid #eee', padding: '20px' }}>
        <Story />
      </div>
    ),
    withClerk(), // Apply the Clerk decorator
  ],
};

export default meta;
type Story = StoryObj<typeof UserProfile>;

export const LoggedInUser: Story = {
  args: {
    // Mock user data if your component directly uses props
    user: { firstName: 'John', lastName: 'Doe' },
  },
  render: (args) => (
    <SignedIn>
      <UserProfile {...args} />
    </SignedIn>
  ),
};

export const LoggedOutUser: Story = {
  render: () => (
    <SignedOut>
      <div>Please log in to view your profile.</div>
    </SignedOut>
  ),
};

export const AdminUser: Story = {
  args: {
    user: { firstName: 'Admin', lastName: 'User' },
  },
  render: (args) => (
    <SignedIn user={{ unsafeMetadata: { role: 'admin' } }}>
      <UserProfile {...args} />
    </SignedIn>
  ),
};
```

**Key points:**

- **`withClerk()` decorator**: Apply this decorator to your `meta` object to enable Clerk mocking for all stories in that file.
- **`SignedIn` and `SignedOut` components**: Use these components to conditionally render content based on the mocked authentication state.
- **Mocking user data**: You can pass a `user` object to `SignedIn` to simulate a logged-in user with specific data or roles.

## 6. Integration with Development Workflow and Testing

Storybook is an integral part of our frontend development workflow, complementing existing practices and tools.

### 6.1 Component Development Lifecycle

We encourage a "Storybook-driven development" approach:

1.  **Develop in Isolation**: Build new UI components directly within Storybook. This ensures components are self-contained, reusable, and don't rely on the full application context during development.
2.  **Iterate Quickly**: Use Storybook's hot-reloading and interactive controls to rapidly iterate on component design and functionality.
3.  **Document as You Go**: Write stories and MDX documentation alongside your component code. This ensures documentation is always up-to-date and reflects the component's current state.
4.  **Review and Collaborate**: Share your Storybook with designers, product managers, and other developers for easy review and feedback. Chromatic (our visual regression testing tool) further streamlines this process.

### 6.2 Complementing Testing Procedures

Storybook complements our existing testing strategies (unit, integration, E2E) by providing:

-   **Visual Testing**: Storybook is the foundation for visual regression testing with Chromatic, ensuring UI consistency across changes.
-   **Manual QA**: It provides a dedicated environment for manual quality assurance of UI components, allowing testers to easily explore all component states and variations.
-   **Accessibility Testing**: The A11y addon helps identify and fix accessibility issues early in the development cycle, before components are integrated into the main application.
-   **Component-level Interaction Testing**: While not a replacement for full E2E tests, Storybook allows for focused interaction testing of individual components.

## 7. Troubleshooting

This section provides solutions to common issues you might encounter while working with Storybook in this Next.js 15 project.

### 7.1 Common Issues and Solutions

-   **Issue: Storybook not starting or showing blank screen.**
    -   **Possible Cause:** Conflicts with Next.js webpack configuration, incorrect addon setup, or port conflicts.
    -   **Solution:**
        -   Ensure all Storybook-related dependencies are correctly installed (`npm install`).
        -   Check `.storybook/main.ts` for correct framework and addon configurations.
        -   Try running Storybook on a different port (`npm run storybook -- -p 9009`).
        -   Clear Storybook cache (`rm -rf ./.storybook/cache`).

-   **Issue: Tailwind CSS styles not applying in Storybook.**
    -   **Possible Cause:** Incorrect PostCSS setup or Tailwind configuration.
    -   **Solution:**
        -   Verify that `../src/app/globals.css` is imported in `.storybook/preview.ts`.
        -   Ensure your `tailwind.config.js` includes Storybook files in its `content` array.
        -   Check `postcss.config.mjs` (or `.js`) for correct PostCSS plugins.

-   **Issue: Components not rendering correctly or showing errors related to Next.js features (e.g., `Image`, `Link`).**
    -   **Possible Cause:** Storybook's Next.js integration might not be fully configured or there are specific Next.js features not supported out-of-the-box in Storybook.
    -   **Solution:**
        -   Ensure `@storybook/nextjs-vite` is correctly configured in `main.ts`.
        -   For `next/image`, ensure you have `staticDirs` configured in `main.ts` to serve static assets.
        -   For `next/link`, you might need to mock the `useRouter` hook or use a Storybook decorator to provide a router context.

-   **Issue: Flagsmith feature flags not behaving as expected in Storybook.**
    -   **Possible Cause:** Incorrect mocking setup or cache issues.
    -   **Solution:**
        -   Verify that the alias in `.storybook/vite.config.ts` correctly points to the mock Flagsmith implementation.
        -   Ensure you are using `getFlagsmithManager().setFlags()` correctly within your stories to control flag states.
        -   Clear browser cache or restart Storybook if changes to mocks are not reflecting.

(This section will be continuously updated as new common issues and their solutions are identified during development.)
