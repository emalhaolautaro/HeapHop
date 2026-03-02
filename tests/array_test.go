package main

import (
	"math/rand"
	"time"
)

func main() {
	rand.Seed(time.Now().UnixNano())
	arr := make([]*int, 100)
	
	for i := 0; i < 100; i++ {
		val := rand.Int()
		arr[i] = &val
	}
	
	// Delete half
	arr = arr[50:]
}
