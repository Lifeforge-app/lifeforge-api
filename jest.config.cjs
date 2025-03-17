const { pathsToModuleNameMapper } = require("ts-jest");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", { isolatedModules: true, diagnostics: false }],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  verbose: true,
  moduleNameMapper: {
    "^@utils/(.*)$": "<rootDir>/src/core/utils/$1",
  },
};
