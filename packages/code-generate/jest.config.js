/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  moduleFileExtensions: ['ts', 'js'],
  testPathIgnorePatterns: ['/dist/'],
  // transform: {
  //   '^.+\\.[t|j]s?$': 'ts-jest'
  // },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  testRegex: '.*\\.test\\.ts?$',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  }
};