# TypeScript References Yarn Workspaces Sync Utility

This library ensures that [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) in TypeScript `tsconfig.js` files are automatically kept up to date in a project using **Yarn 2 workspaces**.

Running this script will:

1. Add a list of all packages in the workspaces to the root `tsconfig.json` for the `"references"` attribute:

```json
{
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
    }
  ]
}
```

2. Update all the `"references"` in the `tsconfig.json` for all packages in the workspace so that it includes all the packages that it declares as a dependency in `package.json`.

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

`utils-typescript-references --tsConfigName tsconfig.build.json`

Will update and reference `tsconfig.build.json` files only; `tsconfig.json` files are ignored, and packages
with only `tsconfig.json` and not `tsconfig.build.json` will not have references inserted.  This is intended
for monorepos where the `tsconfig.build.json` builds the modules that are exported from the package, and thus
should be run when you are building using `tsc -b`.  In this case the `tsconfig.json` can be set up to type
check only (no emit) and have a manually inserted reference to `tsconfig.build.json` for running `tsc -b`. 

`utils-typescript-references --tsConfigName tsconfig.build.json --tsConfigName tsconfig.json`

This is similar to the above but allows a fallback to referencing / updating `tsconfig.json` for some packages
where `tsconfig.build.json` is not present (maybe it's not needed as there are no tests to compile separately).

`utils-typescript-references --tsConfigName src/tsconfig.json --tsConfigName tsconfig.json`

Prefer to reference and update `tsconfig.json` inside a `src` subfolder rather than at the top
of the package / project.



## Limitations

- The root `tsconfig.json` file needs to be a vanilla JSON document (so no comments)

If these limitations or anything else are an issues, please [raise a ticket in GitHub for the Goldstack Monorepo](https://github.com/goldstack/goldstack/issues).

## See Also

- [The Full Stack Blog - TypeScript Monorepo with Yarn and Project References](https://maxrohde.com/2021/10/01/typescript-monorepo-with-yarn-and-project-references/)
- [@monorepo-utils/workspaces-to-typescript-project-references](https://github.com/azu/monorepo-utils/tree/master/packages/@monorepo-utils/workspaces-to-typescript-project-references#readme)
- [Optimizing multi-package apps with TypeScript Project References](https://ebaytech.berlin/optimizing-multi-package-apps-with-typescript-project-references-d5c57a3b4440)
- [TypeScript Monorepos with Yarn](https://semaphoreci.com/blog/typescript-monorepos-with-yarn)
