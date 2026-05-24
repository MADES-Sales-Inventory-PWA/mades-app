const scanner = require('sonarqube-scanner').default;

scanner(
  {
    serverUrl: 'https://sonarcloud.io',
    token: 'd68a6ca61f5c14ad06d5b0ae1af87247e162c022',
    options: {
      'sonar.projectKey': 'mades-sales-inventory-pwa',
      'sonar.organization': 'mades-sales-inventory-pwa',
      'sonar.sources': 'src',
      'sonar.tests': 'test',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.exclusions': '**/node_modules/**,**/dist/**,**/*.d.ts',
    },
  },
  () => process.exit()
);