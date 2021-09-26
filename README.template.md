# Goldstack - Starter Project Builder 💖

Getting started on a new project is fun ... until it isn't. Goldstack provides customizable starter templates that help you lift your project off the ground and immediately start working on the important parts.

Compose your customised starter project on [goldstack.party](https://goldstack.party).

# Roadmap

It should be a surprise to no one that setting up a dynamic monorepo for JavaScript/TypeScript projects is challenging. While the projects built with Goldstack have loads of config and best practices embedded, there is still a way to go to make this a complete turnkey solution. The following table gives an overview of what works well in the generated project and where some work may still be needed.

|Status|Feature|Comments|
|-|-|-|
|👌|Install and Build|Yarn Workspaces using Yarn v2 (Berry) overall works very well and allows for very fast install and build speeds.|
|👌|Linting and Formatting|ESLint and Prettier are configured to work effectively across all packages.|
|👌|Testing|Running tests with Jest works across all packages|
|👌|IDE Integration|VSCode including Intellisense works across the monorepo|
|🤷|AWS|Deployment into AWS using Terraform overall works very well. Just initial configuration and the way credentials are provided can be improved. [#3](https://github.com/goldstack/goldstack/issues/3)|
|👎|TypeScript|TypeScript support works but only with a workaround that requires running `yarn compile watch` in the root project. Compilation is slow for larger projects. [#2](https://github.com/goldstack/goldstack/issues/2)| 

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
