[![npm version](https://badge.fury.io/js/%40goldstack%2Futils-json-to-ts.svg)](https://badge.fury.io/js/%40goldstack%2Futils-json-to-ts)

# JSON to TS Utilities

This library contains a simple wrapper around [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript) for use in Goldstack templates.

This approach is deprecated in favour of generating JSON schema from TypeScript.

This utility has been developed for the [Goldstack](https://goldstack.party) starter project builder. Check it out for starting your next project ❤️
## Installation

```bash
npm install @goldstack/utils-json-to-ts
```

## Usage

```json
const schema = {
  type: "object",
  properties: {
    name: { type: "string" }
  }
};
```
```typescript
import { convertJsonToTs } from '@goldstack/utils-json-to-ts';

const tsCode = await convertJsonToTs(schema);

```
```
