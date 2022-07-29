# esbuild CSS Modules Plugin (Client)

This [esbuild Plugin](https://esbuild.github.io/plugins/) bundles CSS module files along with client-side JavaScript.

Thus, import directives such as the following can be used alongside React components:

```typescript
import styles from './Panel.module.css';
```

## Usage

(1) Install this plugin as a dependency for your project:

```sh
npm i esbuild-css-modules-client-plugin
# -- or
yarn add esbuild-css-modules-client-plugin
```

(2) Add this plugin to the list of plugins supplied to esbuild:

```typescript
import cssPlugin from '';

const res = await build({
  plugins: [cssPlugin()],
});
```

## How does it work?

This plugin will transform `.css` files into JavaScript source files that contain:

- A small snippet of JavaScript that will inject a `<script>` tag when the script is loaded that contains the CSS (with transformed class names as per CSS module specification)
- A default export with a map of original class names to transformed class names

Thus, when the client-side bundle is loaded, all required CSS will be injected into the page and we can use the `styles` object to resolve original class names to the transformed ones.
