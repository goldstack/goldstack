module.exports = {
  collectCoverageFrom: srcPattern('src'),
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/dist/', '/node_modules/', '/testData/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc/jest', { jsc: { parser: { syntax: 'typescript' } } }],
  },
  testEnvironment: 'node',
};
