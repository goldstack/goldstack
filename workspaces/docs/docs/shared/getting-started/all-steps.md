## 1. Install dependencies

[!embed](./../../shared/getting-started/dependencies.md)

## 2. Extract and install

Extract the contents of the zip file into a folder of your choice.

[!embed](./../../shared/getting-started/install.md)

## 3. Build modules

[!embed](./../../shared/getting-started/build.md)

## 4. Configure VSCode

[!embed](./../../shared/getting-started/vscode.md)

## 5. Initialise TypeScript

[!embed](./../../shared/getting-started/typescript.md)

## 6. Deploy modules (Optional)

If you have [configured your project for AWS deployment](./configuration) on Goldstack before downloading the project, all modules should be ready to be deployed to AWS. We recommend going through each of your modules individually to ensure the infrastructure for them can be deployed successfully. Please see the getting started guides for the templates you have chosen for instructions. You should have received an email that contains links to the relevant getting started guides.

## 7. Develop

Each module you have selected comes with its own instructions about how to get started with development. However, there are some handy commands in the project root that can be useful for development:

- `yarn build`: Will build all modules in the project.
- `yarn compile`: Will compile all TypeScript code.
- `yarn fix-project-references`: Will ensure all [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html) between the packages in the project are correct. Always run this after adding a new package or changing the dependencies between packages in the project.
- `yarn test-watch`: Will run tests when modules have changed.
- `yarn format-check` and `yarn format`: Will check or fix source code formatting using Prettier
- `yarn lint` and `yarn lint-fix`: Will check or auto-fix linting issues using ESLint.
- `yarn check` and `yarn check-fix`: Will check and auto-fix import order, linting and formatting issues  

Note that you can run all of these commands in the context of individual modules as well. If you only modify code within one module, this is sufficient. However, if you develop multiple modules at the same time, it is important to run these commands at the project root.
