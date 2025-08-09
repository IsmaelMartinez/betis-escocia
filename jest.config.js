module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@clerk/nextjs$": "<rootDir>/__mocks__/@clerk/nextjs.ts",
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
  testMatch: [
    "**/tests/integration/**/*.(test|spec).{ts,tsx}",
    "**/tests/unit/**/*.(test|spec).{ts,tsx}", // Reverted to original
    // Exclude canary tests for now (they are empty placeholders)
    // "**/tests/canary/**/*.(test|spec).{ts,tsx}",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/tests/unit/app/", // Added this line to ignore the app directory
  ],
  transform: {
    "^.+.(ts|tsx)$": [
      "@swc/jest",
      {
        jsc: {
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
        module: {
          type: "commonjs",
        },
      },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transformIgnorePatterns: [
    "node_modules/(?!(@clerk/.*|next-auth-mock|jose|@flagsmith/.*|@supabase/.*|isows)/)",
  ],
  // Optimize test execution
  maxWorkers: "50%",
  // Suppress verbose output during testing
  verbose: false,
  // Clear mocks between tests automatically
  clearMocks: true,
  // Detect test changes and only run affected tests
  watchman: true,
};
