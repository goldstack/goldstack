# Goldstack - JavaScript Project Builder 💖

Getting started on a new project is fun ... until it isn't. Goldstack provides customizable starter templates that help you lift your project off the ground and immediately start working on the important parts.

Compose your customised starter project on [goldstack.party](https://goldstack.party).

# Roadmap

It should be a surprise to no one that setting up a dynamic monorepo for JavaScript/TypeScript projects is challenging. While the projects built with Goldstack have loads of config and best practices embedded, there is still a way to go to make this a complete turnkey solution. The following table gives an overview of what works well in the generated project and where some work may still be needed.

| Status | Feature                | Comments                                                                                                                                                                                                 |
| ------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 👌     | Install and Build      | Yarn Workspaces using Yarn v2 (Berry) overall works very well and allows for very fast install and build speeds.                                                                                         |
| 👌     | TypeScript             | Well-supported, only workaround required is to run `yarn fix-project-references` when new inter-project dependencies are added.                                                                          |
| 👌     | Linting and Formatting | ESLint and Prettier are configured to work effectively across all packages.                                                                                                                              |
| 👌     | Testing                | Running tests with Jest works across all packages                                                                                                                                                        |
| 👌     | IDE Integration        | VSCode including Intellisense works across the monorepo                                                                                                                                                  |
| 🤷     | AWS                    | Deployment into AWS using Terraform overall works very well. Just initial configuration and the way credentials are provided can be improved. See [#3](https://github.com/goldstack/goldstack/issues/3). |

# About

[!embed](workspaces/docs/docs/goldstack/about/index.md)

# How Does It Work

[!embed](workspaces/docs/docs/goldstack/about/index.md)

# Configuration

[!embed](workspaces/docs/docs/goldstack/configuration/index.md)

# Getting Started

[!embed](workspaces/docs/docs/goldstack/getting-started/index.md)

# Security Hardening

[!embed](workspaces/docs/docs/goldstack/security-hardening/index.md)

# Template Documentation

Find documentation for the individual projects on the [Goldstack Documentation](https://docs.goldstack.party/docs)

# Contribute

⚠️ This section is currently work in progress ⚠️

## Project Setup

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

## Project Structure

The Goldstack monorepo is a repository nested in two levels. [workspaces](https://github.com/goldstack/goldstack/tree/master/workspaces) itself contains the following composite packages:

- [apps](https://github.com/goldstack/goldstack/tree/master/workspaces/apps) - contains the [Goldstack website](https://goldstack.party) and backend
- [docs](https://github.com/goldstack/goldstack/tree/master/workspaces/docs) - contains the [Goldstack documentation](https://docs.goldstack.party/docs)
- [template-lib](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-lib) - contains packages that are used as dependencies of templates to support the build process and development.
- [template-management](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-management) - contains utilities for developing and testing templates.
- [template](https://github.com/goldstack/goldstack/tree/master/workspaces/templates) - contains the blueprint for Goldstack templates


