const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Ruta a la app de Next.js para cargar envs y next.config.js
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // Evita que Jest intente ejecutar las pruebas e2e de Playwright
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/tests/'
  ],
}

module.exports = createJestConfig(customJestConfig)