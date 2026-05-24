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
    '!src/**/*.repository.ts',
    '!src/**/*.controller.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.schema.ts',
    '!src/app.ts',
    '!src/use-cases/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'clover'],
  clearMocks: true,
};