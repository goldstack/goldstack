---
id: module-lambda-go-gin
title: Lambda Go Gin
---

[!embed](./about.md)

## Features

- Develop a backend server using [Go](https://golang.org) and [Gin](https://github.com/gin-gonic/gin)
- Serverless infrastructure defined in Terraform. Including API Gateway configuration
- Fully automated deployment supported

## Configure

[!embed](./../lambda-express/configure.md)

## Getting Started

This template will only work when the [Go](https://golang.org) executable is installed and available as local executable in the user path. For instructions of how to install the Go executable, please see [golang.org/doc/install](https://golang.org/doc/install).

Note that for automating the build and rolling out the infrastructure, this template will use [Yarn](https://yarnpkg.com/).

[!embed](./../shared/getting-started-infrastructure.md)

[!embed](./../shared/getting-started-deployment.md)

You should now be able to access your API. The domain under which the API is deployed is configured in `goldstack.json` under `"deployments[*].apiDomain"`. You can access this API domain with a browser since the default API provided in the template allows for GET requests to the root.

### Extending the API

The lambda exposes a REST API using the [Gin](https://github.com/gin-gonic/gin). The server is defined in the file `server.go`. Simply define additional routes or middleware there. For this, please refer to the Gin documentation.

```go
package main

import (
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CreateServer() *gin.Engine {
	r := gin.Default()

	corsEnv := os.Getenv("CORS")
	if corsEnv != "" {
		config := cors.DefaultConfig()
		config.AllowOrigins = []string{corsEnv}
		r.Use(cors.New(config))
	}
	r.GET("/status", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})
	return r
}
```

## Infrastructure

[!embed](./../shared/infrastructure.md)

## Deployment

[!embed](./../shared/deployment.md)