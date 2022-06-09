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

### --help

Shows a reference of all available options:

```
$ utils-typescript-references --help
Options:
  --help                 Show help                                     [boolean]
  --version              Show version number                           [boolean]
  --skipPackages         Only update project references in the root tsConfig
                                                                       [boolean]
  --skipRoot             Skip updating project references in project root
                         tsConfig                                      [boolean]
  --excludeInReferences  Exclude specific packages from being referenced by
                         other packages                                  [array]
  --excludeInRoot        Exclude specific packages from being referenced in the
                         root tsConfig                                   [array]
  --tsConfigName         Names of tsConfig files to be updated           [array]
```

### --tsConfigName

Provide one or more name of `tsconfig.json` files in projects across the monorepo that should be updated.

```
$ utils-typescript-references --tsConfigName tsconfig.json --tsConfigName tsconfig.build.json
```

Defaults to `tsconfig.json`

This helpful for monorepos where for instance the `tsconfig.build.json` builds the modules that are exported from the package, and thus should be run when you are building using `tsc -b`. In this case the `tsconfig.json` can be set up to type check only (no emit) and have a manually inserted reference to `tsconfig.build.json` for running `tsc -b`.

Note that once any `--tsConfigName` is provided, the default `tsconfig.json` is not updated any more. In order to continue updating `tsconfig.json` along with any custom configuration files, simply provide it as an extra option:

```
$ utils-typescript-references --tsConfigName tsconfig.build.json --tsConfigName tsconfig.json
```

This option can also be used if the `tsconfig.json` file is not in the root of packages (e.g. in the `src/` folder). In that case, provide an option as follows:

```
$ utils-typescript-references --tsConfigName src/tsconfig.json --tsConfigName tsconfig.json
```

### --excludeInReferences

Will prevent certain packages from being added to the `references` of other projects in the monorepo.

```
$ utils-typescript-references --excludeInReferences @myproject/packageA --excludeInReferences @myproject/PackageB
```

The above will cause `@myproject/packageA` and `@myproject/packageB` not to be inserted as referenced in all other packages of the monorepo.

### --skipPackages

Will skip updating the `references` in `tsconfig.json` files for all packages in the project.

```
$ utils-typescript-references --skipPackages
```

### -skipRoot

Will skip updating the `references` in the `tsconfig.json` file for the project root.

```
$ utils-typescript-references --skipRoot
```

## Limitations

- The root `tsconfig.json` file needs to be a vanilla JSON document (so no comments)

If these limitations or anything else are an issues, please [raise a ticket in GitHub for the Goldstack Monorepo](https://github.com/goldstack/goldstack/issues).

## See Also

- [Code with Joy - The Ultimate Guide to TypeScript Monorepos](https://maxrohde.com/2021/11/20/the-ultimate-guide-to-typescript-monorepos/)
- [The Full Stack Blog - TypeScript Monorepo with Yarn and Project References](https://maxrohde.com/2021/10/01/typescript-monorepo-with-yarn-and-project-references/)
- [@monorepo-utils/workspaces-to-typescript-project-references](https://github.com/azu/monorepo-utils/tree/master/packages/@monorepo-utils/workspaces-to-typescript-project-references#readme)
- [Optimizing multi-package apps with TypeScript Project References](https://ebaytech.berlin/optimizing-multi-package-apps-with-typescript-project-references-d5c57a3b4440)
- [TypeScript Monorepos with Yarn](https://semaphoreci.com/blog/typescript-monorepos-with-yarn)
