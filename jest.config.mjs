import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Ruta a app Next.js
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
};

export default createJestConfig(config);