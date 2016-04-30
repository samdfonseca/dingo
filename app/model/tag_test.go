package model

import (
	"os"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func mockTag(name, slug string) *Tag {
	return NewTag(name, slug)
}
func tagEqualCheck(tag, expected *Tag) {
	So(tag.Name, ShouldEqual, expected.Name)
	So(tag.Slug, ShouldEqual, expected.Slug)
}

func TestTag(t *testing.T) {
	Convey("Initialize database", t, func() {
		Initialize("test.db", true)

		Convey("Test Tag", func() {
			p := mockPost()
			err := p.Save()

			name := "test-tag"
			slug := GenerateSlug(name, "tags")

			tag := mockTag(name, slug)
			err = tag.Save()
			So(err, ShouldBeNil)

			Convey("Geenrate tags from comma string", func() {
				tags := GenerateTagsFromCommaString("tagA,tagB")

				So(tags, ShouldHaveLength, 2)
			})

			Convey("Get tags by post ID", func() {
				tags, err := GetTagsByPostId(p.Id)

				So(tags, ShouldHaveLength, 2)
				So(err, ShouldBeNil)
			})

			Convey("Get tag", func() {
				t, err := GetTag(tag.Id)

				tagEqualCheck(t, tag)
				So(err, ShouldBeNil)
			})

			Convey("Get tag by slug", func() {
				t, err := GetTagBySlug(tag.Slug)

				tagEqualCheck(t, tag)
				So(err, ShouldBeNil)
			})

			Convey("Get all tags", func() {
				ts, err := GetAllTags()

				So(ts, ShouldHaveLength, 3)
				So(err, ShouldBeNil)
			})

			Convey("Delete old tags", func() {
				err := DeleteOldTags()

				ts, err := GetAllTags()
				So(err, ShouldBeNil)
				// delete test-tag created by mockTag(),
				// but two tags created by mockPost remain.
				So(ts, ShouldHaveLength, 2)
			})

		})
		Reset(func() {
			os.Remove("test.db")
		})
	})
}
