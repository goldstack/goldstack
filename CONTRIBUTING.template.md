
⚠️ This section is currently work in progress ⚠️

Thanks for taking the time to contribute! While the following documentation intends to be as comprehensive as possible, please do not hesitate to reach out by [opening a GitHub issue](https://github.com/goldstack/goldstack/issues) or on Twitter: [@mxro](https://twitter.com/mxro).

## Getting Started with Development

### Project Setup

*   Clone the Goldstack repository
*   Ensure dependencies are installed

```sh
node -v
yarn -v
docker --version
```

*   Install dependencies, run `yarn` in the cloned directory

```sh
yarn
```

After the installation is complete, you can verify that Yarn 2+ has been initialised by running:

```sh
yarn -v
# > 3.0.2+
```

You can now compile/build the project:

```sh
yarn compile
yarn build
```

Note it is not necessary to run `yarn` or `yarn compile` for the individual nested workspaces and packages in the repository. Running `yarn` and `yarn compile` will compile/install all nested workspaces and packages.

### Project Structure

The Goldstack monorepo is a repository nested in two levels. [workspaces](https://github.com/goldstack/goldstack/tree/master/workspaces) itself contains the following composite packages:

*   [apps](https://github.com/goldstack/goldstack/tree/master/workspaces/apps) - contains the [Goldstack website](https://goldstack.party) and backend
*   [docs](https://github.com/goldstack/goldstack/tree/master/workspaces/docs) - contains the [Goldstack documentation](https://docs.goldstack.party/docs)
*   [template-lib](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-lib) - contains packages that are used as dependencies of templates to support the build process and development.
*   [template-management](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-management) - contains utilities for developing and testing templates.
*   [template](https://github.com/goldstack/goldstack/tree/master/workspaces/templates) - contains the blueprint for Goldstack templates