[![npm version](https://badge.fury.io/js/%40goldstack%2Futils-json-to-ts.svg)](https://badge.fury.io/js/%40goldstack%2Futils-json-to-ts)

# JSON to TS Utilities

This library contains a simple wrapper around [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript) for use in Goldstack templates.

This approach is deprecated in favour of generating JSON schema from TypeScript.

## Installation

```bash
npm install @goldstack/utils-json-to-ts
```

## Usage

```typescript
import { convertJsonToTs } from '@goldstack/utils-json-to-ts';

const tsCode = await convertJsonToTs(schema);
