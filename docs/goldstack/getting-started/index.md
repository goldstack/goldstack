---
id: getting-started
title: Getting Started
---

Once you have downloaded the zip archive for your project, there are only a few things left to get ready for coding.

## 1. Install dependencies

Goldstack requires a few dependencies to be available in your development system. Please verify they are present or install them:

- Node v12+
- Yarn v1.22.5+
- Docker v19+

## 2. Extract and install

Extract the contents of the zip file into a folder of your choice. After you have done that, you must initialise the project. Simply run the following in your project directory:

```bash
yarn
```

The installation process should take around 3-10 minutes depending on the modules you have selected and your Internet speed.

You can confirm everything was installed correctly by running:

```bash
yarn -v
```

Which should show a yarn version of 2.0.0+.

## 3. Build modules

Next make sure that everything builds correctly by running the following in your project directory:

```bash
yarn build
```

## 4. Configure VSCode

Your project should come with all files required to configure VSCode. Configuration files are present in the `.vscode/` folder. Simply open the folder of your project in VSCode. Next try to find any `.ts` file in your project. They should be present in one of your modules under `packages/*/src/`. Once you open a `.ts` file, VSCode should open a confirmation. Please confirm this to ensure everything will work correctly.

## 5. Deploy modules

Since you have [configured your project](./configuration), all modules should be ready to be deployed to AWS. We recommend going through each of your modules individually to ensure the infrastructure for them can be deployed successfully. Please see the getting started guides for the templates you have chosen for instructions.

