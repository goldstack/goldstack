
const base = require('./../../jest.config.ui');

module.exports = {
  ...base,
  transform: {
    '^.+\\.svelte$': 'svelte-jester',
    '^.+\\.js$': 'babel-jest', "^.+\\.ts$": "ts-jest"
  },
  moduleFileExtensions: ['js', 'svelte', 'ts'],
}