---
id: goldstack-about
title: About
---

Getting started with a new project often takes so much longer than it should. Rather than writing code for the problem we want to solve, we fiddle around with the tooling. This problem is often substantial especially in JavaScript ecosystems, where getting common tools such as ESLint, TypeScript, Jest and React work together takes a lot of time and can be frustrating.

Goldstack provides high quality starter projects that are configured based on best practices and sensible defaults. Using a Goldstack starter project rather than a hand-rolled one, will save you dozens of development hours. Moreover, at Goldstack we obsess with every detail of our starter projects and have the freedom to spend the time on optimizing things; something often lost in the race to get sprint goals delivered in many development projects.

## Design Principles

Goldstack templates are based on the following design principles:

### Only the best tech

We all know that in software the same problem can be solved in many different ways and that there is often heated disagreement between developers as to which technology and framework is best suited for a job. At Goldstack, we aim not to provide starter templates for every possible tech but instead focus on the technologies enjoy widespread adoption and support in the industry. Thus we hope to save you some time having to browse around the web to compare framework X to framework Y but instead provide you with choices that are 'good enough for most circumstances'.

### Professional

Goldstack templates allow your project to lift off at rocket speed while being sufficiently robust and configurable to fit the requirements of a professional environment. We enable this by:

- All infrastructure is defined in Terraform that can easily be customized
- Everything can be deployed in AWS
- We provide instructions for security hardening for every template

### Serverless

Goldstack templates use Serverless technologies unlocking the benefits of rapid development cycles, security, observability and low ongoing costs. Following some examples of ways Serverless technologies are employed for the templates:

- Any frontends are deployed using AWS S3 and CloudFront
- Our Express server template is wrapped in a Lambda
- Our email template utilizes AWS Simple Email Service for email sending

### Unlimited customizability

We all know that there is usually a trade off in platforms that help us get something done quickly; such as when using Firebase: It is very easy to develop and deploy a simple application. However, it is often difficult to adapt the initial simple project to our specific needs. Goldstack is based on the premise that there should not a be a limit to what you can do with your project. Some of the elements that enable this are:

- Infrastructure can be adapted to your needs utilizing the full power of Terraform
- Core functionality is defined as easy to change source code in the project
- Any 'magic' dependencies we add to your project are available as open source and open for you to modify as required

### Modularity first

Modularity is one of the most important principles in software design. Unfortunately it is often difficult in the JavaScript ecosystem to develop truly modular applications. Many projects have started to adopt Lerna for this purpose, but Lerna comes with its own problems, especially for larger projects.

- Utilizing Yarn 2 for efficient workspace management
- Providing TypeScript APIs for connecting modules; for instance a backend module can simply import an S3 module and use TypeScript methods to establish a connection to the bucket

### Built to be Tested

Automated testing is a key driver for software quality but, while modern frameworks make it easy to write unit tests for individual components, it is often difficult to establish end-to-end tests that cover the entire stack of an application. Goldstack modules are optimized to allow writing tests that cover all modules of an application. For instance, it is possible to write a Jest test that uses React Testing Library to walk through the user interface while interacting with an in-memory API server (rather than having to mock calls to the backend).
