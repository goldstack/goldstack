[![npm version](https://badge.fury.io/js/%40goldstack%2Futils-yarn.svg)](https://badge.fury.io/js/%40goldstack%2Futils-yarn)

# Goldstack Yarn Utilities

This library allows running [yarn](https://yarnpkg.com/) commands from Node.js applications.

This utility has been developed for the [Goldstack](https://goldstack.party) starter project builder. Check it out for starting your next project ❤️
## Installation

```bash
npm install @goldstack/utils-yarn
```

## Usage

```typescript
import { yarnInstall } from '@goldstack/utils-yarn';

await yarnInstall();

