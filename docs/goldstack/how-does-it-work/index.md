---
id: how-does-it-work
title: How Does It Work
---

Generating new starter projects with Goldstack is simple and quick.

[%Step-by-step Walkthrough](https://www.youtube.com/embed/jIXaN1Os0CE)

### Step 1: Select the modules you need

Rather than providing a library of projects, Goldstack provides a _library of module templates_ that can be used to compose projects. This ensures that you can start with a project that includes exactly the features you need.

Some examples of modules are:

- [Next.js](../modules/app-nextjs)
- [S3](../modules/s3)
- [Lambda Express](../modules/lambda-express)

You can select as many modules as you want. All modules are configured to be easily used alongside each other. For instance, if you choose all modules from the list above, you can link the Lambda Express module to the Next JS application and the S3 module with the Express application. All modules are deployed into a project configured using Yarn workspaces.

### Step 2: Configure the project

It can often be overwhelming to get started with customizing a new starter project to your needs, especially if the starter project consists of many different modules. We therefore provide a web-based interface for creating a baseline configuration for your project. This baseline configuration will enable you to start developing and deploying your project immediately.

All configuration is written into source files. So you will be able to change and extend the configuration later in accordance with your requirements.

For instance, if any module is selected that requires deployment to a website, the configuration tool will help you configure the domain to be used for deploying the website. If you later want to change the domain or deploy your project to multiple domains (e.g. staging and production), you can modify the configuration files in your source code.

### Step 3: Decide on purchasing option

You could, if you so chose, piece together a project template from the source code we make available publicly for free. Doing so will require some effort and time. By purchasing a Goldstack template, you can save your time, effort and energy, and let us do all the heavy lifting.

We have put a lot of labour and love into creating our templates and ask that you contribute a small amount so that we can continue providing premium quality content that is commercially viable.

### Step 4: Download

Goldstack will package your project into one zip file that you can download. This zip file will contain everything to get started developing business logic for your project. We will also send you an email with a link you can use to re-download your project or create more Goldstack templates. The email also includes a list of getting started guides for your project.

### Step 5: Follow getting started guides

We recommend that you follow the getting started guides we provide with the download link. The first step will usually be to simply run `yarn` at the root of your project, open VSCode and to run `yarn infra up [dev|prod]` to bring up your infrastructure.
