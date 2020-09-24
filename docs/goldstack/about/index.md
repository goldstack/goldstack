---
id: goldstack-about
title: About
---

Getting started with a new project often takes so much longer than it should. Rather than writing code for the problem we want to solve, we fiddle around with the tooling. Especially in the JavaScript ecosystem this problem is often substantial and to make common tools such as Eslint, TypeScript, Jest and React work with one another often takes a lot of time and involves a fair bit of frustration.

Goldstack provides high quality starter projects that are configured based on best practices and sensible defaults. Using a Goldstack starter project rather than a hand-rolled one, should save dozens of hours of development effort. Moreover, at Goldstack we obsess with every detail of our starter projects and have the freedom to spend the time on optimizing things; something often lost in the race to get sprint goals delivered in many development projects.

## Design Principles

Goldstack templates are based on the following design principles

### Only the best tech

We all know that in software the same problem can be solved in many different ways and that there is often heated disagreement between developers which technology and framework is 'best' suited for a job. At Goldstack, we aim not to provide starter templates for every possible tech but instead focus on the technologies enjoy widespread adoption and support in the industry. Thus we hope to save you some time having to browse around the web to compare framework X to framework Y but instead provide you with choices that are 'good enough for most circumstances'.

### Be 'enterprise-ready'

In the JavaScript world, we often like things fast and loose; however this often collides with the requirements of a professional 'enterprise' environment. Goldstack provides templates that allow your project to lift off very quickly but provide you with all the flexibility to configure the project for your specific environment. Among others, we enable this by:

- All infrastructure is defined in Terraform that can easily be customised
- Everything can be deployed in AWS
- We provide instructions for security hardening for every template

### Serverless

There are almost uncountable ways in which we can deploy software these days; on bare metal, VMs, Kubernetes or using Serverless technologies. We believe that most projects these days are served best by a serverless approach; which requires less maintenance and provides many features that are otherwise hard won out of the box, such as scalability, security and observability. Therefore the infrastructure defined for templates will follow a serverless paradigm whenever possible. Some examples for this are:

- Any frontends are deployed using AWS S3 and CloudFront
- Our Express server template is wrapped in a Lambda
- Our email template utilises AWS Simple Email Service for email sending

### Unlimited customizability

We all know that there is usually a trade off in platforms that help us get something done quickly; such as when using Firebase: It is very easy to develop and deploy a simple application. However, it is often difficult to adapt the initial simple project to our specific needs. Goldstack is based on the premise that there should not a be a limit to what you can do with your project. Some of the elements that enable this are:

- Infrastructure can be adapted to your needs utilising the full power of Terraform
- Core functionality is defined as easy to change source code in the project
- Any 'magic' dependencies we add to your project are available as open source and open for you to modify as required

### Modularity first

Modularity is one of the most important principles in software design. Without breaking a big whole into smaller more manageable components, our projects quickly become difficult to extend and maintain. Unfortunately it has often been difficult in the JavaScript ecosystem to develop truly modular applications. Many projects started to adopt Lerna to enable breaking up larger projects into modules. However Lerna often comes with many problems especially in larger projects. Goldstack supports modularity through:

- Utilising Yarn 2 for efficient workspace management
- Providing TypeScript APIs for connecting modules; for instance a backened module can simply import an S3 module and use TypeScript methods to establish a connection to the bucket