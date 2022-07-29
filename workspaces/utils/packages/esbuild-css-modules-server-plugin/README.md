# esbuild CSS Modules Plugin (Server)

This [esbuild Plugin](https://esbuild.github.io/plugins/) bundles CSS module files for usage in server-side script for server-side rendering.

Thus, import directives such as the following can be used alongside React components:

```typescript
import styles from './Panel.module.css';
```

## Usage

(1) Install this plugin as a dependency for your project:

```sh
npm i esbuild-css-modules-server-plugin
# -- or
yarn add esbuild-css-modules-server-plugin
```

(2) Add this plugin to the list of plugins supplied to esbuild:

```typescript
import cssServerPlugin from 'esbuild-css-modules-server-plugin';

const res = await build({
  plugins: [cssServerPlugin()],
});
```

## How does it work?

This plugin will transform `.css` files into JavaScript source files that contain:

- A default export with a map of original class names to transformed class names

Thus, when server-side rendering is performed, class names can be resolved to the transformed counter-parts and the HTML rendered with the correct class names.
