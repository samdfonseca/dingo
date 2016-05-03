package main

import (
	"flag"
	"os"

	"github.com/dinever/dingo/app"
)

func main() {
	listenPort := os.Getenv("DINGO_PORT")
	if listenPort == "" {
		listenPort = "8000"
	}
	portPtr := flag.String("port", listenPort, "The port number for Dingo to listen to.")

	dbFile := os.Getenv("DINGO_DB_FILE")
	if dbFile == "" {
		dbFile = "dingo.db"
	}
	dbFilePathPtr := flag.String("database", dbFile, "The database file path for Djingo to use.")

	flag.Parse()

	Dingo.Init(*dbFilePathPtr)
	Dingo.Run(*portPtr)
}
