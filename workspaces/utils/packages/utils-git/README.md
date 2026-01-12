[![npm version](https://badge.fury.io/js/%40goldstack%2Futils-git.svg)](https://badge.fury.io/js/%40goldstack%2Futils-git)

# Goldstack Git Utils

Simple wrapper for git commands for usage in Node.js applications.

## Installation

```bash
npm install @goldstack/utils-git
```

## Usage

```typescript
import { gitStatus } from '@goldstack/utils-git';

const status = await gitStatus();
console.log(status);
```

See [utilsGit.ts](https://github.com/goldstack/goldstack/blob/master/workspaces/utils/packages/utils-git/src/utilsGit.ts)
