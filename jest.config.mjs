import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Ruta a app Next.js
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e-tests/'
  ],
  testMatch: [
    '<rootDir>/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)'
  ],
};

export default createJestConfig(config);