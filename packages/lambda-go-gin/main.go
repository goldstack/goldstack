package main

import (
	"os"

	"github.com/aws/aws-lambda-go/lambda"
)

func main() {
	// when no 'PORT' environment variable defined, process lambda
	if os.Getenv("PORT") == "" {
		lambda.Start(Handler)
		return
	}
	// otherwise start a local server
	StartLocal()
}
