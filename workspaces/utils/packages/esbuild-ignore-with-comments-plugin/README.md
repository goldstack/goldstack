[![npm version](https://badge.fury.io/js/esbuild-ignore-with-comments-plugin.svg)](https://badge.fury.io/js/esbuild-ignore-with-comments-plugin)

# ESBuild Ignore with Comments Plugin

Allows inserting comments into TypeScript source files. ESBuild will ignore these files during build.

This utility has been developed for the [Goldstack](https://goldstack.party) starter project builder. Check it out for starting your next project ❤️
## Installation

```bash
npm install esbuild-ignore-with-comments-plugin
```

## Usage

Add to any `.ts` or `.tsx` file the following comment:

```typescript
/* esbuild-ignore */
```

This file will be replaced with a source file that has an empty object as a default export.

Configure the plugin for esbuild as follows:

```typescript
import ignorePlugin from 'esbuild-ignore-with-comments-plugin';
import { build } from 'esbuild';

await build({
  plugins: [ignorePlugin()],
});
```

If you are bundling the same files multiple times (such as for server-side rendering) you can group files into sets and only ignore specific sets of files.

For instance, assume you have the following files:

`server.ts`

```typescript
/* esbuild-ignore ui */

// some server only stuff
```

`ui.ts`

```typescript
/* esbuild-ignore server */

// some ui only stuff
```

Then running the following will ignore `server.ts` during the build:

```typescript
await build({
  plugins: [ignorePlugin(['ui'])],
});
```

Note that files that have the comment `/* esbuild-ignore */` without specifying a group will always be ignored.

Also note that if you want to add a file to multiple groups, you need to include multiple `esbuild-ignore` comments, such as:

```typescript
/* esbuild-ignore server */
/* esbuild-ignore ui */

