package main

import "os"

func StartLocal() {
	r := CreateServer()

	portEnv := os.Getenv("PORT")
	var port string
	if portEnv != "" {
		port = ":" + portEnv
	} else {
		port = ":8084"
	}

	r.Run(port)
}
