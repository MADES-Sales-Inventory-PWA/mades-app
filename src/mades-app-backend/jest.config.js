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
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/config/**',
    '!src/**/index.ts',
    '!src/**/*.routes.ts',   
    '!src/**/*.mapper.ts',  
    '!src/app.ts',           
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'clover'],
  clearMocks: true,
};