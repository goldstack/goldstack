[![npm version](https://badge.fury.io/js/node-css-require.svg)](https://badge.fury.io/js/node-css-require)

# Node CSS Require

Sometimes it is required to import CSS files into a Node script:

```typescript
import styles from './component.module.css';
```

This will result in an error when running the script with Node.js such as the following:

```
C:\Users\Max\repos\ts-node-files-test\src\index.css:1
.hi {
^

SyntaxError: Unexpected token '.'
    at Object.compileFunction (node:vm:352:18)
    at wrapSafe (node:internal/modules/cjs/loader:1033:15)
```

This module provides a way to load CSS files when running Node or server-side code. Simply run the following code before any CSS file is loaded:

```typescript
import { register } from 'node-css-require';

register();
```

If you cannot run this code early enough as part of your program execution, create a new file `register.js` with the following contents:

```javascript
const { register } = require('node-css-require');

register();
```

And supply a path to this script when running node using the [`-r`](https://nodejs.org/api/cli.html#-r---require-module) option.

```
node -r register.js myscript.js
```

This will ensure the logic for registering the loading mechanism for CSS files is loaded before any other script of your application.

Note that the value of the imported variable from a CSS file will be map of class names defined in the CSS file mapped to dynamically generated names using [`css-modules`](https://github.com/css-modules/css-modules).

In order to avoid any errors during TypeScript compilation declare a file `typings.d.ts` with the following contents:

```typescript
declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}
```
