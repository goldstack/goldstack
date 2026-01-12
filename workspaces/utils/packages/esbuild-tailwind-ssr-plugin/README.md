[![npm version](https://badge.fury.io/js/esbuild-tailwind-ssr-plugin.svg)](https://badge.fury.io/js/esbuild-tailwind-ssr-plugin)

# esbuild-tailwind-ssr-plugin

ESBuild plugin for compiling Tailwind CSS for Server-Side Rendering (SSR) use cases.

## Installation

```bash
npm install esbuild-tailwind-ssr-plugin
```

## Usage

Add the plugin to your esbuild configuration:

```typescript
import tailwindPlugin from 'esbuild-tailwind-ssr-plugin';
import { build } from 'esbuild';

await build({
  plugins: [tailwindPlugin()],
});
```

This plugin compiles Tailwind CSS classes into static CSS that can be used in SSR environments.
