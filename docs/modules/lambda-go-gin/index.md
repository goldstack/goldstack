---
id: module-lambda-go-gin
title: Lambda Go Gin
---

The Lambda Go Gin module allows developing a lambda using [Go](https://golang.org) and the [Gin](https://github.com/gin-gonic/gin) web server framework. This module will also set up an API Gateway to forward requests to the lambda.

## Features

- Develop a backend server using [Go](https://golang.org) and [Gin](https://github.com/gin-gonic/gin)
- Serverless infrastructure defined in Terraform. Including API Gateway configuration
- Fully automated deployment supported

## Configure

[!embed](./../lambda-express/configure.md)

## Getting Started

Note that for automating the build and rolling out the infrastructure, this template will use [Yarn](https://yarnpkg.com/).

[!embed](./../shared/getting-started-infrastructure.md)

You should now be able to access your API. The domain under which the API is deployed is configured in `goldstack.json` under `"deployments[*].apiDomain"`. You can access this API domain with a browser since the default API provided in the template allows for GET requests to the root.

### Development

