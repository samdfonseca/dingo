package model

import (
	"os"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func mockMessage(c *Comment) *Message {
	m := NewMessage("comment", c)
	return m
}

func TestMessage(t *testing.T) {
	Convey("Initialize database", t, func() {
		Initialize("test.db", true)

		Convey("Test Message", func() {
			p := mockPost()
			_ = p.Save()

			c := mockComment()
			c.PostId = p.Id
			_ = c.Save()

			um := mockMessage(c)

			err := um.Save()
			So(err, ShouldBeNil)

			rm := mockMessage(c)
			rm.IsRead = true

			err = rm.Save()
			So(err, ShouldBeNil)

			Convey("Get UnreadMessages", func() {
				messages := GetUnreadMessages()

				So(messages, ShouldHaveLength, 1)
				So(messages[0].Type, ShouldEqual, um.Type)
				So(messages[0].Data, ShouldEqual, um.Data)
			})
		})
		Reset(func() {
			os.Remove("test.db")
		})
	})
}
