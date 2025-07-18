import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  })),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_FEATURE_CLASIFICACION = 'true'
process.env.NEXT_PUBLIC_FEATURE_GALERIA = 'true'
process.env.NEXT_PUBLIC_FEATURE_RSVP = 'true'
process.env.NEXT_PUBLIC_FEATURE_PARTIDOS = 'true'
process.env.NEXT_PUBLIC_FEATURE_CONTACTO = 'true'
process.env.NEXT_PUBLIC_FEATURE_HISTORY = 'true'
process.env.NEXT_PUBLIC_FEATURE_NOSOTROS = 'true'
process.env.NEXT_PUBLIC_FEATURE_UNETE = 'true'
process.env.NEXT_PUBLIC_FEATURE_CLERK_AUTH = 'true'

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    user: null,
    isLoaded: true,
    isSignedIn: false,
  })),
  useClerk: jest.fn(() => ({
    signOut: jest.fn(),
  })),
  ClerkProvider: ({ children }) => children,
}))

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
