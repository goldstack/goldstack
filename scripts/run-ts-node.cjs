const tsNodeBin = require.resolve(`ts-node/dist/bin.js`);

process.argv = [
  process.argv[0],
  tsNodeBin,
  ...process.argv.slice(2),
];

require(tsNodeBin);
