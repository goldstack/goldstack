---
id: how-does-it-work
title: How Does It Work
---

Generating new starter projects with Goldstack is very simple and quick.

### Step 1: Select the modules you need

Rather than providing a library of projects, Goldstack provides a _library of module templates_ that can be used to compose project. This ensures that you can start with a project that includes exactly the features you need.

Some examples of modules are:

- [Next.js](../modules/app-nextjs)
- [S3](../modules/s3)
- [Lambda Express](../modules/lambda-express)

You can select as many modules as you want. All modules are configured to be easily used alongside each other. For instance, if you choose all modules from the list above, you can link the Lambda Express module to the Next JS application and the S3 module with the Express application. All modules are deployed into a project configured using Yarn workspaces.

### Step 2: Configure the project

It can often be overwhelming to get started with customizing a new starter project to your needs, especially if the starter project consists of many different modules. We therefore provide a small tool to establish a number of baseline configurations for your project.

For instance, if any module is selected that requires deployment to a website, the configuration tool will help you configure the domain to be used for deploying the website. The configuration will cover all aspects required for you to start deploying your project right away.

### Step 3: Decide on purchasing option

We are strong believers in open source and most of the source code comprising Goldstack is available as open source. With some effort, anyone should be able to piece together a Goldstack equivalent project from source code we make available publicly. However we also believe that premium quality content requires a commercial ecosystem. Therefore we ask for your contribution when using a Goldstack template. Currently we only offer one purchasing option, which is a one time payment that will enable you to generate an unlimited number of starter templates for 30 days.

### Step 4: Download

Goldstack will package your project into one zip file that you can download. This zip file will contain everything to get started developing business logic for your project. We will also send you an email with a link you can use to re-download your project or create more Goldstack templates. This email also includes a list of getting started guides for your project.

### Step 5: Follow getting started guides

We recommend that you follow the getting started guides we provide alongside with the download link. The first step will usually be to simply run `yarn` at the root of your project, open VSCode and to run `yarn infra up [dev|prod]` to bring up your infrastructure.
