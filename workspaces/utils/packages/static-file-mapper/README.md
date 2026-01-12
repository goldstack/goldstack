[![npm version](https://badge.fury.io/js/static-file-mapper.svg)](https://badge.fury.io/js/static-file-mapper)

# Static File Mapper

Helps with managing static files for frontend deployments.

## Installation

```bash
npm install static-file-mapper
```

## Usage

This library helps tracking paths to generated static files for deployment bundles.

```typescript
import { createStaticFileMapper } from 'static-file-mapper';

// Example usage
const mapper = createStaticFileMapper();
