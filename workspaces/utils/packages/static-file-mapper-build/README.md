[![npm version](https://badge.fury.io/js/static-file-mapper-build.svg)](https://badge.fury.io/js/static-file-mapper-build)

# Static File Mapper Build

Helps with managing static files for frontend deployments during deployments.

## Installation

```bash
npm install static-file-mapper-build
```

## Usage

This library helps tracking paths to generated static files for deployment bundles during build time.

```typescript
import { createStaticFileMapperBuild } from 'static-file-mapper-build';

// Example usage
const mapper = createStaticFileMapperBuild();
