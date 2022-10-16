[![npm version](https://badge.fury.io/js/esbuild-ssr-css-modules-plugin.svg)](https://badge.fury.io/js/esbuild-ssr-css-modules-plugin)

# esbuild SSR CSS Modules Plugin

This [esbuild Plugin](https://esbuild.github.io/plugins/) bundles CSS module files for Server-Side Rendering (SSR) use cases.

Using import directives such as the following in your React components:

```typescript
import styles from './Panel.module.css';
```

Results in exceptions when trying to render your React components on the server-side, since these will be executed in Node.js and Node.js cannot load the `.css` files. (Note: if you absolutely require this, such as for local testing, have a look at [`node-css-require`](https://www.npmjs.com/package/node-css-require).)

This plugin will:

- Replace all CSS files imported into React source files with JavaScript files. This allows looking up the generated style names during server-side rendering.
- Provide the generated CSS source.
- (Optional) Inject JavaScript snippets into JavaScript source files that will dynamically load a style tag with the generated CSS. This can be useful for local testing but is not recommended for production deployments.

## Usage

(1) Install this plugin as a dependency for your project:

```sh
npm i esbuild-ssr-css-modules-plugin
# -- or
yarn add esbuild-ssr-css-modules-plugin
```

(2) Add this plugin to the list of plugins supplied to esbuild:

```typescript
import cssPlugin from 'esbuild-ssr-css-modules-plugin';

const res = await build({
  plugins: [cssPlugin()],
});
```

### Options

#### onCSSGenerated

The plugin accepts the parameter `onCSSGenerated`. This parameter accepts a callback function that receives one argument `css` that contains snippets of CSS generated.

```typescript
import cssPlugin from 'esbuild-ssr-css-modules-plugin';

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

#### jsCSSInject

The plugin supports the option `jsCSSInject`. This defaults to `false`. When set to `true`, `<script>` tags are injected to be run during script load.

```typescript
import cssPlugin from 'esbuild-ssr-css-modules-plugin';

const res = await build({
  plugins: [
    cssPlugin({
      jsCSSInject: true,
    }),
  ],
});
```

## How does it work?

### When no JS is injected

This plugin will transform `.css` files into JavaScript source files that contain:

- A default export with a map of original class names to transformed class names

Thus, when server-side rendering is performed, class names can be resolved to the transformed counter-parts and the HTML rendered with the correct class names.

### When JS is injected

This plugin will transform `.css` files into JavaScript source files that contain:

- A small snippet of JavaScript that will inject a `<script>` tag when the script is loaded that contains the CSS (with transformed class names as per CSS module specification)
- A default export with a map of original class names to transformed class names

Thus, when the client-side bundle is loaded, all required CSS will be injected into the page and we can use the `styles` object to resolve original class names to the transformed ones.

## See also

- [`node-css-require`](https://www.npmjs.com/package/node-css-require): Library used for CSS module transformation
