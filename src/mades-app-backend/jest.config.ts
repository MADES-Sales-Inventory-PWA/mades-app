import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  roots: ["<rootDir>/src"],
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/*.test.ts",
    "**/*.spec.ts"
  ],
  extensionsToTreatAsEsm: [],

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "CommonJS",
          moduleResolution: "Node"
        }
      }
    ]
  },
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
  verbose: true
};

export default config;