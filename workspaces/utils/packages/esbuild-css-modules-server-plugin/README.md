[![npm version](https://badge.fury.io/js/esbuild-css-modules-server-plugin.svg)](https://badge.fury.io/js/esbuild-css-modules-server-plugin)

**Deprecation Notice**

This library is deprecated. Use [`esbuild-css-modules-client-plugin`](https://www.npmjs.com/package/esbuild-css-modules-client-plugin) instead using the option `excludeCSSInject: true`.

# esbuild CSS Modules Plugin (Server)

This [esbuild Plugin](https://esbuild.github.io/plugins/) bundles CSS module files for usage in server-side script for server-side rendering.

Thus, import directives such as the following can be used alongside React components:

```typescript
import styles from './Panel.module.css';
```

For creating client-side bundles, see [`esbuild-css-modules-client-plugin`](https://www.npmjs.com/package/esbuild-css-modules-client-plugin)

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

### Options

The plugin supports one option `onCSSGenerated`. This option accepts a callback function that receives one argument `css` that contains snippets of CSS generated.

```typescript
import cssPlugin from 'esbuild-css-modules-server-plugin';

const generatedCss: string[] = [];
const res = await build({
  plugins: [
    cssPlugin({
      onCSSGenerated: (css) => {
        generatedCss.push(css);
      },
    }),
  ],
});
console.log(generatedCss.join('\n'));
```

This can be useful for creating a CSS bundle that can be shipped with the other files packaged for the server. When generating a client-side bundle using [`esbuild-css-modules-client-plugin`](https://www.npmjs.com/package/esbuild-css-modules-client-plugin), the option `excludeCSSInject` can then be set to true for a better page load experience (no flicker of the page once CSS is injected).

## How does it work?

This plugin will transform `.css` files into JavaScript source files that contain:

- A default export with a map of original class names to transformed class names

Thus, when server-side rendering is performed, class names can be resolved to the transformed counter-parts and the HTML rendered with the correct class names.

## See also

- [`esbuild-plugin-css-in-js`](https://github.com/karishmashuklaa/esbuild-plugin-css-in-js): Plugin that includes plain CSS (instead of CSS with transformed classnames according to the CSS modules standard as this plugin does)
- [`node-css-require`](https://www.npmjs.com/package/node-css-require): Library used for CSS module transformation
