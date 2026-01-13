[![npm version](https://badge.fury.io/js/%40goldstack%2Futils-esbuild.svg)](https://badge.fury.io/js/%40goldstack%2Futils-esbuild)

# Goldstack Esbuild Utilities

Simple utilities for working with [esbuild](https://esbuild.github.io/).

This utility has been developed for the [Goldstack](https://goldstack.party) starter project builder. Check it out for starting your next project ❤️
## Installation

```bash
npm install @goldstack/utils-esbuild
```

## Usage
```typescript
import { buildWithEsbuild } from '@goldstack/utils-esbuild';

await buildWithEsbuild({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
});

```
```
