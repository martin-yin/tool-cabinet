module.exports = {
    verbose: true,
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    testPathIgnorePatterns: ['/dist/'],
    transform: {
      '^.+\\.[t|j]s?$': 'esbuild-jest'
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
    testRegex: '.*\\.test\\.ts?$',
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/src/$1'
    }
  }