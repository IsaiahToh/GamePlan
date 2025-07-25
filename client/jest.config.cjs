const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  globals: {
    "ts-jest": {
      diagnostics: {
        ignoreCodes: [1343],
      },
      astTransformers: {
        before: [
          {
            path: "ts-jest-mock-import-meta",
            options: {
              metaObjectReplacement: {
                env: {
                  // Read from process.env at Jest config time
                  VITE_API_URL: process.env.VITE_API_URL || "http://localhost:3000",
                },
              },
            },
          },
        ],
      },
    },
  },
};
