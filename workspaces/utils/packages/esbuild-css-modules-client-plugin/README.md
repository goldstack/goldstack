[![npm version](https://badge.fury.io/js/esbuild-css-modules-client-plugin.svg)](https://badge.fury.io/js/esbuild-css-modules-client-plugin)

# esbuild CSS Modules Plugin (Client)

This [esbuild Plugin](https://esbuild.github.io/plugins/) bundles CSS module files along with client-side JavaScript.

Thus, import directives such as the following can be used alongside React components:

```typescript
import styles from './Panel.module.css';
```

For creating bundles for server-side rendering, see [`esbuild-css-modules-server-plugin`](https://www.npmjs.com/package/esbuild-css-modules-server-plugin)

## Usage

(1) Install this plugin as a dependency for your project:

```sh
npm i esbuild-css-modules-client-plugin
# -- or
yarn add esbuild-css-modules-client-plugin
```

(2) Add this plugin to the list of plugins supplied to esbuild:

```typescript
import cssPlugin from 'esbuild-css-modules-client-plugin';

const res = await build({
  plugins: [cssPlugin()],
});
```

### Options

The plugin supports one option `excludeCSSInject`. This defaults to `false`. When set, no `<script>` tags are injected to be run during script load.

```typescript
import cssPlugin from 'esbuild-css-modules-client-plugin';

const res = await build({
  plugins: [cssPlugin({
    excludeCSSInject: true
  })],
});
```

## How does it work?

This plugin will transform `.css` files into JavaScript source files that contain:

- A small snippet of JavaScript that will inject a `<script>` tag when the script is loaded that contains the CSS (with transformed class names as per CSS module specification)
- A default export with a map of original class names to transformed class names

Thus, when the client-side bundle is loaded, all required CSS will be injected into the page and we can use the `styles` object to resolve original class names to the transformed ones.

## See also

- [`esbuild-plugin-css-in-js`](https://github.com/karishmashuklaa/esbuild-plugin-css-in-js): Plugin that includes plain CSS (instead of CSS with transformed classnames according to the CSS modules standard as this plugin does)
- [`node-css-require`](https://www.npmjs.com/package/node-css-require): Library used for CSS module transformation
