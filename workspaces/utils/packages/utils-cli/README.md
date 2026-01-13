[![npm version](https://badge.fury.io/js/%40goldstack%2Futils-cli.svg)](https://badge.fury.io/js/%40goldstack%2Futils-cli)

# Goldstack CLI Utils

This library contains a method to wrap the execution for a Node.js CLI application.

This utility has been developed for the [Goldstack](https://goldstack.party) starter project builder. Check it out for starting your next project ❤️
## Installation

```bash
npm install @goldstack/utils-cli
```

## Usage

```typescript
import { runCli } from '@goldstack/utils-cli';

runCli(async () => {
  // Your CLI logic here
});
```

See [Source Code](https://github.com/goldstack/goldstack/blob/master/workspaces/utils/packages/utils-cli/src/utilsCli.ts).

