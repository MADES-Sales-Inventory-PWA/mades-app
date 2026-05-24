/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.test\\.ts$',  
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.test.json',
    }],
  },

  collectCoverageFrom: [
    'src/**/*.(t|j)s',       
    '!src/**/*.d.ts',
    '!src/config/prisma.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'clover'],

  coverageThreshold: {
    global: {
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
  },
};