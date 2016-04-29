package model

import (
	"fmt"
	"os"
	"testing"

	"github.com/dinever/dingo/app/utils"
	. "github.com/smartystreets/goconvey/convey"
)

func mockComment() *Comment {
	c := NewComment()
	c.Author = name
	c.Email = email
	c.Website = "http://example.com"
	c.Content = "comment test"
	c.Avatar = utils.Gravatar(c.Email, "50")
	c.Parent = 1
	c.PostId = 2
	//	c.Ip = "127.0.0.1"
	c.UserAgent = "Mozilla"
	c.UserId = 1
	c.Approved = true
	return c
}

func commentEqualCheck(c *Comment, expected *Comment) {
	So(c.Author, ShouldEqual, expected.Author)
	So(c.Email, ShouldEqual, expected.Email)
	So(c.Website, ShouldEqual, expected.Website)
	So(c.Content, ShouldEqual, expected.Content)
	So(c.Avatar, ShouldEqual, expected.Avatar)
	So(c.Parent, ShouldEqual, expected.Parent)
	So(c.PostId, ShouldEqual, expected.PostId)
	So(c.Ip, ShouldEqual, expected.Ip)
	So(c.UserAgent, ShouldEqual, expected.UserAgent)
	So(c.UserId, ShouldEqual, expected.UserId)
	So(c.Approved, ShouldEqual, expected.Approved)
}

func TestComment(t *testing.T) {
	Convey("Initialize database", t, func() {
		Initialize("test.db", true)

		Convey("Test Message", func() {
			pc := mockComment()
			err := pc.Save()
			So(err, ShouldBeNil)

			cc := mockComment()
			cc.Parent = pc.Id
			cc.Content = "comment test by child"
			err = cc.Save()
			So(err, ShouldBeNil)

			Convey("Get Comment List", func() {
				result, _, err := GetCommentList(1, 2)
				So(err, ShouldBeNil)
				So(result, ShouldHaveLength, 2)
			})
			Convey("To Json", func() {
				result := cc.ToJson()
				So(result, ShouldNotBeNil)
			})

			Convey("Parent Content", func() {
				result := cc.ParentContent()
				So(result, ShouldEqual, fmt.Sprintf("> @%s\n\n> %s\n", pc.Author, pc.Content))
			})

			Convey("Get Number of Comments", func() {
				result, err := GetNumberOfComments()
				So(err, ShouldBeNil)
				So(result, ShouldEqual, 2)
			})

			Convey("Get Comment By ID", func() {
				result, err := GetCommentById(cc.Id)
				So(err, ShouldBeNil)
				commentEqualCheck(result, cc)
			})

			Convey("Get Comment By Post ID", func() {
				result, err := GetCommentByPostId(cc.Id)
				So(err, ShouldBeNil)
				commentEqualCheck(result[0], cc)
				commentEqualCheck(result[1], pc)
			})

			Convey("Validate Comment", func() {
				result := cc.ValidateComment()
				So(result, ShouldEqual, "")
			})

			Convey("Delete Comment", func() {
				err := DeleteComment(cc.Id)
				So(err, ShouldBeNil)
				result, err := GetCommentById(cc.Id)
				So(err, ShouldNotBeNil)
				So(result, ShouldBeNil)
			})
		})
		Reset(func() {
			os.Remove("test.db")
		})
	})
}
