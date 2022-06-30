import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'src/clients/gid-issuer-client.ts': {
      functions: 66.66
    },
    'src/services/**': {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true
};

export default config;
