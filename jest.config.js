module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
  testMatch: [
    "**/tests/integration/**/*.(test|spec).{ts,tsx}",
    "**/tests/unit/**/*.(test|spec).{ts,tsx}",
    // Exclude canary tests for now (they are empty placeholders)
    // "**/tests/canary/**/*.(test|spec).{ts,tsx}",
  ],
  transform: {
    "^.+\.(ts|tsx)$": ["@swc/jest", { /* swc options */ }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
