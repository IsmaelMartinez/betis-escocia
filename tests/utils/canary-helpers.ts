import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'

/**
 * Canary Test Utilities
 * 
 * These utilities are designed for simple happy path UI flow tests
 * to ensure features work as expected before and after simplification.
 */

// Test user for consistent testing
export const testUser = userEvent.setup()

/**
 * Render component with common providers and setup
 */
export function renderWithProviders(ui: ReactElement) {
  return render(ui)
}

/**
 * Navigation test helpers
 */
export const navigationHelpers = {
  /**
   * Test that a navigation link exists and is clickable
   */
  async testNavigationLink(linkText: string, expectedHref?: string) {
    const link = screen.getByRole('link', { name: new RegExp(linkText, 'i') })
    expect(link).toBeInTheDocument()
    
    if (expectedHref) {
      expect(link).toHaveAttribute('href', expectedHref)
    }
    
    // Test that link is clickable
    await testUser.click(link)
    return link
  },

  /**
   * Test mobile menu functionality
   */
  async testMobileMenu() {
    // Look for menu button (hamburger menu)
    const menuButton = screen.getByRole('button', { name: /menu/i })
    expect(menuButton).toBeInTheDocument()
    
    // Click to open menu
    await testUser.click(menuButton)
    
    return menuButton
  },

  /**
   * Test that key navigation items are present
   */
  testNavigationItems(expectedItems: string[]) {
    expectedItems.forEach(item => {
      const navItem = screen.getByRole('link', { name: new RegExp(item, 'i') })
      expect(navItem).toBeInTheDocument()
    })
  }
}

/**
 * Form test helpers
 */
export const formHelpers = {
  /**
   * Fill form field by label
   */
  async fillField(label: string, value: string) {
    const field = screen.getByLabelText(new RegExp(label, 'i'))
    await testUser.clear(field)
    await testUser.type(field, value)
    return field
  },

  /**
   * Submit form by button text
   */
  async submitForm(buttonText: string = 'submit') {
    const submitButton = screen.getByRole('button', { name: new RegExp(buttonText, 'i') })
    await testUser.click(submitButton)
    return submitButton
  },

  /**
   * Test form validation
   */
  async testFormValidation(fieldLabel: string, invalidValue: string, expectedError: string) {
    await this.fillField(fieldLabel, invalidValue)
    await this.submitForm()
    
    await waitFor(() => {
      expect(screen.getByText(new RegExp(expectedError, 'i'))).toBeInTheDocument()
    })
  }
}

/**
 * Authentication test helpers
 */
export const authHelpers = {
  /**
   * Test sign in flow
   */
  async testSignInFlow(email: string = 'test@example.com', password: string = 'password123') {
    await formHelpers.fillField('email', email)
    await formHelpers.fillField('password', password)
    await formHelpers.submitForm('sign in')
  },

  /**
   * Test sign up flow
   */
  async testSignUpFlow(email: string = 'test@example.com', password: string = 'password123') {
    await formHelpers.fillField('email', email)
    await formHelpers.fillField('password', password)
    await formHelpers.submitForm('sign up')
  },

  /**
   * Test sign out functionality
   */
  async testSignOut() {
    const signOutButton = screen.getByRole('button', { name: /sign out|cerrar sesión/i })
    await testUser.click(signOutButton)
    return signOutButton
  }
}

/**
 * Feature flag test helpers
 */
export const featureFlagHelpers = {
  /**
   * Test that feature is visible when flag is enabled
   */
  testFeatureVisible(featureName: string, testId?: string) {
    const element = testId 
      ? screen.getByTestId(testId)
      : screen.getByText(new RegExp(featureName, 'i'))
    expect(element).toBeInTheDocument()
  },

  /**
   * Test that feature is hidden when flag is disabled
   */
  testFeatureHidden(featureName: string, testId?: string) {
    const element = testId 
      ? screen.queryByTestId(testId)
      : screen.queryByText(new RegExp(featureName, 'i'))
    expect(element).not.toBeInTheDocument()
  }
}

/**
 * Data loading test helpers
 */
export const dataHelpers = {
  /**
   * Test loading state
   */
  testLoadingState(loadingText: string = 'loading') {
    const loadingElement = screen.getByText(new RegExp(loadingText, 'i'))
    expect(loadingElement).toBeInTheDocument()
  },

  /**
   * Test error state
   */
  testErrorState(errorText: string = 'error') {
    const errorElement = screen.getByText(new RegExp(errorText, 'i'))
    expect(errorElement).toBeInTheDocument()
  },

  /**
   * Wait for data to load
   */
  async waitForDataLoad(expectedText: string) {
    await waitFor(() => {
      expect(screen.getByText(new RegExp(expectedText, 'i'))).toBeInTheDocument()
    })
  }
}

/**
 * Common test patterns
 */
export const testPatterns = {
  /**
   * Test page renders without crashing
   */
  testPageRenders(component: ReactElement) {
    renderWithProviders(component)
    // If we get here without throwing, the page rendered successfully
    expect(document.body).toBeInTheDocument()
  },

  /**
   * Test responsive design elements
   */
  testResponsiveElements() {
    // Test that main content is present
    expect(screen.getByRole('main')).toBeInTheDocument()
    
    // Test that header/nav is present
    expect(screen.getByRole('banner')).toBeInTheDocument()
  },

  /**
   * Test accessibility basics
   */
  testAccessibility() {
    // Test that main landmarks are present
    expect(screen.getByRole('main')).toBeInTheDocument()
    
    // Test that headings are present
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
  }
}

/**
 * Mock data for testing
 */
export const mockData = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    publicMetadata: { role: 'user' }
  },
  
  adminUser: {
    id: 'admin-user-id',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    publicMetadata: { role: 'admin' }
  },
  
  match: {
    id: 1,
    homeTeam: 'Real Betis',
    awayTeam: 'Sevilla FC',
    date: '2024-01-01T20:00:00Z',
    venue: 'Estadio Benito Villamarín'
  }
}

export { screen, waitFor, fireEvent }
