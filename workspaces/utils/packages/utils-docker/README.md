[![npm version](https://badge.fury.io/js/%40goldstack%2Futils-docker.svg)](https://badge.fury.io/js/%40goldstack%2Futils-docker)

# Goldstack Docker Utils

This library contains tools to run Docker images locally or as part of a CI/CD build process.

## Installation

```bash
npm install @goldstack/utils-docker
```

## Usage

```typescript
import { runDocker } from '@goldstack/utils-docker';

await runDocker({
  image: 'my-image',
  command: 'echo hello',
});
```

See [utilsDocker.ts](https://github.com/goldstack/goldstack/blob/master/workspaces/templates-lib/packages/utils-docker/src/utilsDocker.ts).
