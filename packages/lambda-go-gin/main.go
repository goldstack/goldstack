package main

import (
	"os"

	"github.com/aws/aws-lambda-go/lambda"
)

func main() {
	// when no 'PORT' environment variable defined, run lambda
	if os.Getenv("PORT") == "" {
		lambda.Start(Handler)
		return
	}
	// otherwise start a local server
	StartLocal()
}
