# Canary Test Framework

This directory contains the canary test framework for the Betis Scotland app simplification project.

## Overview

Canary tests are simple, happy path UI flow tests designed to ensure core functionality works as expected before and after code simplification. They act as a safety net to catch regressions during the refactoring process.

## Structure

```
tests/
├── README.md              # This documentation
├── utils/
│   └── canary-helpers.ts  # Test utilities and helpers
├── templates/
│   └── canary-test-template.canary.ts  # Template for new tests
└── canary/
    └── [feature-name].canary.test.tsx  # Individual feature tests
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Tests

```bash
# Run all tests
npm run test

# Run only canary tests
npm run test:canary

# Run tests in watch mode
npm run test:watch
```

### 3. Create a New Canary Test

1. Copy the template:
   ```bash
   cp tests/templates/canary-test-template.canary.ts tests/canary/your-feature.canary.test.tsx
   ```

2. Modify the test file:
   - Replace "Feature Name" with your actual feature name
   - Replace the component placeholder with your actual component
   - Remove test sections that don't apply to your feature
   - Add feature-specific tests as needed

## Test Utilities

### `canary-helpers.ts`

This file contains reusable test utilities organized by functionality:

#### `navigationHelpers`
- `testNavigationLink(linkText, expectedHref)` - Test navigation links
- `testMobileMenu()` - Test mobile menu functionality
- `testNavigationItems(expectedItems)` - Test navigation item presence

#### `formHelpers`
- `fillField(label, value)` - Fill form fields
- `submitForm(buttonText)` - Submit forms
- `testFormValidation(fieldLabel, invalidValue, expectedError)` - Test form validation

#### `authHelpers`
- `testSignInFlow(email, password)` - Test sign in functionality
- `testSignUpFlow(email, password)` - Test sign up functionality
- `testSignOut()` - Test sign out functionality

#### `featureFlagHelpers`
- `testFeatureVisible(featureName, testId)` - Test feature visibility when flag is enabled
- `testFeatureHidden(featureName, testId)` - Test feature hiding when flag is disabled

#### `dataHelpers`
- `testLoadingState(loadingText)` - Test loading states
- `testErrorState(errorText)` - Test error states
- `waitForDataLoad(expectedText)` - Wait for data to load

#### `testPatterns`
- `testPageRenders(component)` - Test basic rendering
- `testResponsiveElements()` - Test responsive design
- `testAccessibility()` - Test basic accessibility

## Test Categories

### 1. Basic Rendering Tests
- Component renders without crashing
- Proper HTML structure
- Basic accessibility checks

### 2. Navigation Tests
- Navigation links are present and functional
- Mobile menu works correctly
- Route transitions work

### 3. Form Tests
- Form submission works
- Form validation works
- Error handling works

### 4. Authentication Tests
- Sign in flow works
- Sign up flow works
- Sign out functionality works

### 5. Feature Flag Tests
- Features show when flags are enabled
- Features hide when flags are disabled
- Flag toggling works correctly

### 6. Data Loading Tests
- Loading states display correctly
- Error states display correctly
- Data loads successfully

## Best Practices

### 1. Keep Tests Simple
- Focus on happy path scenarios
- Test core functionality, not edge cases
- Use descriptive test names

### 2. Test User Flows
- Test from the user's perspective
- Test complete workflows, not isolated functions
- Use realistic test data

### 3. Maintain Tests
- Update tests when features change
- Remove tests for deprecated features
- Keep tests fast and reliable

### 4. Use Helpers
- Leverage the provided test utilities
- Create new helpers for common patterns
- Keep test code DRY

## Example Test

```typescript
import { renderWithProviders, navigationHelpers, testPatterns } from '../utils/canary-helpers'
import HomePage from '@/app/page'

describe('Home Page - Canary Tests', () => {
  it('should render without crashing', () => {
    testPatterns.testPageRenders(<HomePage />)
  })

  it('should display navigation links', () => {
    renderWithProviders(<HomePage />)
    const expectedLinks = ['Inicio', 'RSVP', 'Clasificación']
    navigationHelpers.testNavigationItems(expectedLinks)
  })
})
```

## Configuration

### Jest Configuration
- `jest.config.js` - Main Jest configuration
- `jest.setup.js` - Test setup and global mocks

### Environment Variables
Test environment variables are mocked in `jest.setup.js`. Update this file to match your feature flag configuration.

## Troubleshooting

### Common Issues

1. **Tests fail with module resolution errors**
   - Check `moduleNameMapping` in `jest.config.js`
   - Ensure path aliases match your `tsconfig.json`

2. **Component tests fail with provider errors**
   - Use `renderWithProviders` instead of `render`
   - Check mocks in `jest.setup.js`

3. **Feature flag tests don't work**
   - Verify environment variables in `jest.setup.js`
   - Check feature flag implementation

### Getting Help

- Check the test template for examples
- Review existing canary tests
- Consult the test utilities documentation
- Run tests with `--verbose` flag for detailed output

## Maintenance

This framework should be updated as the application evolves:

1. **Add new test utilities** for common patterns
2. **Update mocks** when dependencies change
3. **Add new test categories** for new feature types
4. **Remove obsolete tests** during simplification
5. **Update documentation** when framework changes

Remember: The goal is to catch regressions during simplification, not to achieve 100% test coverage. Focus on the most critical user flows and keep tests maintainable.
