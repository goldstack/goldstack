[![npm version](https://badge.fury.io/js/%40goldstack%2Futils-sh.svg)](https://badge.fury.io/js/%40goldstack%2Futils-sh)

# Goldstack Shell Utilities

This library provides various convenience methods for working with files and folders as well as interacting with the shell.

## Installation

```bash
npm install @goldstack/utils-sh
```

## Usage

```typescript
import { sh } from '@goldstack/utils-sh';

await sh('echo hello');
