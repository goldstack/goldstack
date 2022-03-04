<p align="center">
  <a href="https://goldstack.party">
    <img src="https://cdn.goldstack.party/img/202203/goldstack_icon.png" height="128">
    <h1 align="center">Goldstack - ⚙️ Project Builder</h1>
  </a>
</p>

![Build status](https://img.shields.io/github/workflow/status/goldstack/goldstack/Build,%20Test%20and%20Library%20Publish/master) [![Codacy Badge](https://app.codacy.com/project/badge/Grade/6cc586e39fca47a5b7bd64c5d3e1b563)](https://www.codacy.com/gh/goldstack/goldstack/dashboard?utm_source=github.com&utm_medium=referral&utm_content=goldstack/goldstack&utm_campaign=Badge_Grade)

Getting started on a new project is fun ... until it isn't. Goldstack provides customizable starter templates that help you lift your project off the ground and immediately start working on the features that matter to you.

# Getting Started

Explore the templates Goldstack provides:

<table>
<thead>
<tr>
<th></th>
<th></th>
</tr>
</thead>
<tbody>
<tr>
  <td>
    <p align="center"><img width="50" src="https://cdn.goldstack.party/img/202203/nextjs.svg"></p>
    <p><a href="https://goldstack.party/templates/nextjs-bootstrap">Next.js + Bootstrap</a></p>
  </td>
<td>Content Cell</td>
</tr>
<tr>
<td>Content Cell</td>
<td>Content Cell</td>
</tr>
</tbody>
</table>



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

[!embed](workspaces/docs/docs/goldstack/how-does-it-work/index.md)

# Configuration

[!embed](workspaces/docs/docs/goldstack/configuration/index.md)

# Getting Started

[!embed](workspaces/docs/docs/goldstack/getting-started/index.md)

# Security Hardening

[!embed](workspaces/docs/docs/goldstack/security-hardening/index.md)

# Template Documentation

Find documentation for the individual projects on the [Goldstack Documentation](https://docs.goldstack.party/docs)

# Contribute

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## Analysis Tools

- [Codacy](https://app.codacy.com/gh/goldstack/goldstack/dashboard)
- [Code Climate](https://codeclimate.com/github/goldstack/goldstack)
- [Mozilla Observatory](https://observatory.mozilla.org/analyze/goldstack.party)
