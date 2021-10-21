# TypeScript References Utility

This library ensures that [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) in TypeScript `tsconfig.js` files are automatically kept up to date in a project using **Yarn 2 workspaces**.

Running this script will:

- Add a list of all packages in the workspaces to the root `tsconfig.json` for the `"references"` attribute:

```json
 "references": [
    {
      "path": "workspaces/apps"
    },
    {
      "path": "workspaces/docs"
    },
    {
      "path": "workspaces/templates"
    },
    {
      "path": "workspaces/templates-lib"
    }]
  }
```

- Update all the `"references"` in the `tsconfig.json` for all packages in the workspace so that it includes all the packages that it declares as a dependency in `package.json`.

This package uses [@monorepo-utils/workspaces-to-typescript-project-references](https://github.com/azu/monorepo-utils/tree/master/packages/@monorepo-utils/workspaces-to-typescript-project-references#readme).

## Usage

Install as development dependency using

```
npm i @goldstack/utils-typescript-references --save-dev
-- or
yarn add -D @goldstack/utils-typescript-references
```

Add a script to your `package.json`

```json
{
  "scripts": {
    "fix-typescript-references": "utils-typescript-references"
  }
}
```

Run the script using

```
npm run fix-typescript-references
-- or
yarn fix-typescript-references
```

## Options

The following parameters can be passed when invoking the script:

`utils-typescript-references --skipPackages`

Will skip updating the `references` in `tsconfig.json` files for all packages in the project.

`utils-typescript-references --skipRoot`

Will skip updating the `references` in the `tsconfig.json` file for the project root.

## Limitations

- The root of the project and each workspace must contain a `tsconfig.json`. It is currently not able to specify an alternative file name for `tsconfig.json`. 
- The root `tsconfig.json` file needs to be a vanilla JSON document (so no comments)

If these limitations or anything else are an issues, please [raise a ticket in GitHub for the Goldstack Monorepo](https://github.com/goldstack/goldstack/issues).

## See Also

- [The Full Stack Blog - TypeScript Monorepo with Yarn and Project References](https://maxrohde.com/2021/10/01/typescript-monorepo-with-yarn-and-project-references/)
- [@monorepo-utils/workspaces-to-typescript-project-references](https://github.com/azu/monorepo-utils/tree/master/packages/@monorepo-utils/workspaces-to-typescript-project-references#readme)
- [Optimizing multi-package apps with TypeScript Project References](https://ebaytech.berlin/optimizing-multi-package-apps-with-typescript-project-references-d5c57a3b4440)
- [TypeScript Monorepos with Yarn](https://semaphoreci.com/blog/typescript-monorepos-with-yarn)