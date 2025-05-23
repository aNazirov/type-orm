import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^libs/ioredis$': '<rootDir>/libs/ioredis/src',
    '^libs/ioredis/(.*)$': '<rootDir>/libs/ioredis/src/$1',
  },
};

export default config;
