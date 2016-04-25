package main

import (
	"flag"

	"github.com/dinever/dingo/app"
)

func main() {
	portPtr := flag.String("port", "8000", "The port number for Dingo to listen to.")
	dbFilePathPtr := flag.String("database", "dingo.db", "The database file path for Djingo to use.")
	flag.Parse()

	Dingo.Init(*dbFilePathPtr)
	Dingo.Run(*portPtr)
}
