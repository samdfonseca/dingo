package model

import (
	"os"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

const name = "Shawn Ding"
const email = "dingpeixuan911@gmail.com"
const password = "passwordfortest"

func mockUser() *User {
	u := NewUser(email, name)
	return u
}

func userEqualCheck(user *User, expected *User) {
	So(user.Id, ShouldEqual, expected.Id)
	So(user.Name, ShouldEqual, expected.Name)
	So(user.Slug, ShouldNotBeNil)
	So(user.Avatar, ShouldNotBeNil)
	So(user.Email, ShouldEqual, expected.Email)
	So(user.Role, ShouldNotBeNil)
}

func TestUser(t *testing.T) {
	Convey("Initialize database", t, func() {
		Initialize("test.db", true)

		Convey("Test User", func() {
			user := mockUser()
			err := user.Create(password)
			So(err, ShouldBeNil)

			Convey("Get User By Id", func() {
				u, err := GetUserById(user.Id)
				So(err, ShouldBeNil)
				userEqualCheck(u, user)
			})

			Convey("Get User By Slug", func() {
				u, err := GetUserBySlug(user.Slug)
				So(err, ShouldBeNil)
				userEqualCheck(u, user)
			})

			Convey("Get User By Name", func() {
				u, err := GetUserByName(user.Name)
				So(err, ShouldBeNil)
				userEqualCheck(u, user)
			})

			Convey("Get User By Email", func() {
				u, err := GetUserByEmail(user.Email)
				So(err, ShouldBeNil)
				userEqualCheck(u, user)
			})

			Convey("Check Password", func() {
				result := user.CheckPassword("passwordfortest")
				So(result, ShouldEqual, true)
			})

			Convey("Change Password", func() {
				err := user.ChangePassword("updatedpassword")
				So(err, ShouldBeNil)
				result := user.CheckPassword("updatedpassword")
				So(result, ShouldEqual, true)
			})

			Convey("Email Exist", func() {
				result := UserEmailExist(user.Email)
				So(err, ShouldBeNil)
				So(result, ShouldEqual, true)
			})

			Convey("Get Number Of Users", func() {
				result, err := GetNumberOfUsers()
				So(err, ShouldBeNil)
				So(result, ShouldEqual, 1)
			})

			Convey("Update User", func() {
				user.Name = "Kenjiro Nakayama"
				user.Email = "nakayamakenjiro@gmail.com"
				err := user.UpdateUser(user.Id)
				So(err, ShouldBeNil)
				u, err := GetUserById(user.Id)
				userEqualCheck(u, user)
			})

		})
		Reset(func() {
			os.Remove("test.db")
		})
	})
}
