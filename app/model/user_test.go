package model

import ()

const name = "Shawn Ding"
const email = "dingpeixuan911@gmail.com"
const password = "passwordfortest"

func mockUser() *User {
	u := NewUser(email, name)
	return u
}
