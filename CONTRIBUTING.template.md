Thanks for taking the time to contribute! While the following documentation intends to be as comprehensive as possible, please do not hesitate to reach out by [opening a GitHub issue](https://github.com/goldstack/goldstack/issues) or on Twitter: [@mxro](https://twitter.com/mxro).

Contents:

- Getting Started with Development
- Creating Templates

## Getting Started with Development

### Project Setup

- Clone the Goldstack repository
- Ensure dependencies are installed

```sh
node -v
yarn -v
docker --version
```

- Install dependencies, run `yarn` in the cloned directory

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

- [apps](https://github.com/goldstack/goldstack/tree/master/workspaces/apps) - contains the [Goldstack website](https://goldstack.party) and backend
- [docs](https://github.com/goldstack/goldstack/tree/master/workspaces/docs) - contains the [Goldstack documentation](https://docs.goldstack.party/docs)
- [template-lib](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-lib) - contains packages that are used as dependencies of templates to support the build process and development.
- [template-management](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-management) - contains utilities for developing and testing templates.
- [template](https://github.com/goldstack/goldstack/tree/master/workspaces/templates) - contains the blueprint for Goldstack templates

### Developing Goldstack Alongside your Project

When you generate a new project with Goldstack, your _generated project_ will be version linked to [official packages published in NPM](https://www.npmjs.com/search?q=keywords:goldstack). In order to change any of the _official packages_ and test them against your _generated project_, you will need to connect your recently _generated project_ to a _local Goldstack monorepo_ instead of the _official packages_.

The source code for the _official packages_ is defined in the Goldstack monorepo (this repo) under [template-lib](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-lib).

### Link your _generated project_ to a _local Goldstack monorepo_

You can use the [`yarn link`](https://yarnpkg.com/en/docs/cli/link) command to link your _generated project_ to a _local Goldstack monorepo_ instead of the _official packages_.

For this, clone the [Goldstack Monorepo](https://github.com/goldstack/goldstack) into a folder on your local machine. Then within your _generated project_, run the following command:

```sh
yarn link /path/to/goldstack/monorepo/ -Apr
```

Now, if you make any changes to the libraries in the _local Goldstack monorepo_, these will be effective when running `yarn template-ts` scripts in your _generated project_.

### Copy your _generated project_ as a yarn workspace under a _local Goldstack monorepo_

Since [Yarn workspaces](https://yarnpkg.com/features/workspaces) allow for embedding multiple projects in a single monorepo, you can copy your _generated project_ as a yarn workspace under a _local Goldstack monorepo_ by following these steps:

#### Copy your generated project into the folder: `workspaces/generated`

![](https://user-images.githubusercontent.com/1448524/155213397-2b67a16d-fb76-476e-bfcf-314903dcc046.png)

It is important to place the generated project into the `workspaces/generated` folder since this is ignored by Git in the Goldstack monorepo.

#### _Delete_ the following files/folders

- `workspaces/generated/.yarn`
- `workspaces/generated/.yarnrc.yml`
- `workspaces/generated/yarn.lock`

#### Update all references to use the local package version numbers.

You need to ensure that the versions referenced in the `package.json` files in the _generated project_ match the versions of the library source code in the _local Goldstack monorepo_.

You can run the command `yarn ensure-local-packages` from `<goldstack>` root to do this.

#### Rebuild the _local Goldstack monorepo_

Now that the _generated project_ is a yarn workspace within the _local Goldstack monorepo_ you can simply run the `yarn` command to build everything.

#### Testing

If you make changes to the libraries in [template-lib](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-lib), these will be available in your generated project and can be invoked using `yarn template-ts *`.

You can take a look this video if you have any issues getting this working: https://youtu.be/wIXxhM4qWkA

You can commit any changes to the Goldstack monorepo for a PR to this repository. You must use a separate git repository for your own project. Therefore it is important to place the generated project into the `workspaces/generated` folder since this is added to the `.gitignore` file in the Goldstack monorepo.

## Creating Templates

All Goldstack templates are defined as packages in the [`templates` workspace](https://github.com/goldstack/goldstack/tree/master/workspaces/templates/packages).

A Goldstack template consists of the following:

- A `template.json` file describing some template metadata
- A `goldstack.json` file describing the configuration for deployments
- A set of JSON schemas describing the template configuration. This is used to automatically render the Web interface for defining template configuration.
- A `build.json` file that provides information which files should be included in the template and allows for some file modifications.

Creating a new template will involve the following:

1. Add the template source code as a new package in [`workspaces/templates/packages`](https://github.com/goldstack/goldstack/tree/master/workspaces/templates/packages)
2. A template may use any of the Goldstack libraries provided or not. You can also define new reusable libraries in the [`templates-lib`](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-lib) workspace. For an example for a simple library to provide a CLI for deploying the infrastructure for a template, see [templateS3Cli.ts](https://github.com/goldstack/goldstack/blob/master/workspaces/templates-lib/packages/template-s3-cli/src/templateS3Cli.ts).
3. Every template must contain a `goldstack.json` and corresponding [JSON Schemas](https://github.com/goldstack/goldstack/tree/master/workspaces/templates/packages/app-nextjs/schemas). The `goldstack.json` file must reference the `package.schema.json` JSON schema, see

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "",
  "template": ""
}
```

4. Every template must contain a [`template.json`](https://github.com/goldstack/goldstack/blob/master/workspaces/templates/packages/app-nextjs/template.json) file.
5. Every template must contain a [`build.json`](https://github.com/goldstack/goldstack/blob/master/workspaces/templates/packages/app-nextjs/build.json) file. This determines what files will be included in the template provided in projects.
6. Template metadata used for building and rendering the template on the Goldstack UI is defined in the [`template-metadata`](https://github.com/goldstack/goldstack/tree/master/workspaces/templates/packages/template-metadata/src) package.
7. The folder name of the template (`packages/templates/[folder name]`) needs to be added to [module template names](https://github.com/goldstack/goldstack/blob/hetzner-server-goldstack-integration/workspaces/templates/packages/module-template-utils/src/moduleTemplateUtils.ts#L10)
7. The deploy set defined in the template metadata needs to be referenced in the GitHub deployment workflows for [dev](https://github.com/goldstack/goldstack/blob/master/.github/workflows/template_deploy_dev.yml#L11) and [prod](https://github.com/goldstack/goldstack/blob/master/.github/workflows/template_deploy_prod.yml#L11).

We plan to simplify contributing templates in the future. For now, please don't hesitate to [reach out for help](https://github.com/goldstack/goldstack/issues).
