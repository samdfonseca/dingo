package handler

import (
	"github.com/dinever/dingo/app/model"
	"github.com/dinever/golf"
	. "github.com/smartystreets/goconvey/convey"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"strings"
	"testing"
)

func authenticatedContext(form url.Values, method, path string) *golf.Context {
	_ = model.NewUser(email, name).Create(password)
	ctx := mockLogInPostContext()
	ctx.App.ServeHTTP(ctx.Response, ctx.Request)
	rec := ctx.Response.(*httptest.ResponseRecorder)
	w := httptest.NewRecorder()
	app := InitTestApp()
	req := makeTestHTTPRequest(strings.NewReader(form.Encode()), method, path)
	req.Header = http.Header{"Cookie": rec.HeaderMap["Set-Cookie"]}
	req.PostForm = form
	return golf.NewContext(req, w, app)
}

func TestViewHandler(t *testing.T) {
	Convey("Initialize database", t, func() {
		model.Initialize("test.db", true)

		Convey("Dashboard view", func() {
			ctx := authenticatedContext(nil, "GET", "/admin/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 200 OK", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 200)
			})
		})

		Convey("New post editor view", func() {
			ctx := authenticatedContext(nil, "GET", "/admin/editor/post/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 200 OK", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 200)
			})
		})

		Convey("New page editor view", func() {
			ctx := authenticatedContext(nil, "GET", "/admin/editor/page/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 200 OK", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 200)
			})
		})

		Convey("Profile view", func() {
			ctx := authenticatedContext(nil, "GET", "/admin/profile/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 200 OK", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 200)
			})
		})

		Convey("Post view", func() {
			ctx := authenticatedContext(nil, "GET", "/admin/posts/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 200 OK", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 200)
			})
		})

		Convey("Page view", func() {
			ctx := authenticatedContext(nil, "GET", "/admin/pages/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 200 OK", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 200)
			})
		})

		Convey("Create a post with correct format", func() {
			form := url.Values{}
			form.Add("title", "Hello World")
			form.Add("slug", "hello-world")
			form.Add("content", "Sample content")
			form.Add("tag", "Welcome, Dingo")
			form.Add("comment", "on")
			form.Add("category", "Dingo")
			form.Add("status", "on")
			ctx := authenticatedContext(form, "POST", "/admin/editor/post/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Post editor view", func() {
				ctx := authenticatedContext(nil, "GET", "/admin/editor/1/")
				app := ctx.App
				app.ServeHTTP(ctx.Response, ctx.Request)

				Convey("Should return HTTP response 200 OK", func() {
					So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 200)
				})
			})
		})

		Convey("Comment view", func() {
			ctx := authenticatedContext(nil, "GET", "/admin/comments/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 200 OK", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 200)
			})
		})

		Convey("Settings view", func() {
			ctx := authenticatedContext(nil, "GET", "/admin/setting/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 200 OK", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 200)
			})
		})

		Convey("Files view", func() {
			ctx := authenticatedContext(nil, "GET", "/admin/files/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 200 OK", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 200)
			})
		})

		Convey("Password view", func() {
			ctx := authenticatedContext(nil, "GET", "/admin/password/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 200 OK", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 200)
			})
		})

		Convey("Monitor view", func() {
			ctx := authenticatedContext(nil, "GET", "/admin/monitor/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 200 OK", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 200)
			})
		})

	})
}

func TestProfileChangeHandler(t *testing.T) {
	Convey("Initialize database", t, func() {
		model.Initialize("test.db", true)

		Convey("Authenticated user", func() {
			form := url.Values{}
			form.Add("name", "Ken Thompson")
			form.Add("slug", "ken")
			form.Add("email", "ken@gmail.com")
			ctx := authenticatedContext(form, "POST", "/admin/profile/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 200 OK", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 200)
			})
		})
	})
}

func TestPostHandler(t *testing.T) {
	Convey("Initialize database", t, func() {
		model.Initialize("test.db", true)

		Convey("Create a post with incorrect format", func() {
			form := url.Values{}
			form.Add("title", "Hello World")
			form.Add("slug", "")
			form.Add("content", "Sample content")
			form.Add("tag", "Welcome, Dingo")
			form.Add("comment", "on")
			form.Add("category", "Dingo")
			form.Add("status", "on")
			ctx := authenticatedContext(form, "POST", "/admin/editor/post/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 400 Bad Request", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 400)
			})

			Convey("Should return status error", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Body.String(), ShouldContainSubstring, "error")
			})
		})

		Convey("Create a page with correct format", func() {
			form := url.Values{}
			form.Add("title", "Hello World")
			form.Add("slug", "hello-world")
			form.Add("content", "Sample content")
			form.Add("tag", "Welcome, Dingo")
			form.Add("comment", "on")
			form.Add("category", "Dingo")
			form.Add("status", "on")
			ctx := authenticatedContext(form, "POST", "/admin/editor/page/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 200 OK", func() {
				So(ctx.StatusCode(), ShouldEqual, 200)
			})

			Convey("Should return status success", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Body.String(), ShouldContainSubstring, "success")
			})
		})

		Convey("Create a post with correct format", func() {
			form := url.Values{}
			form.Add("title", "Hello World")
			form.Add("slug", "hello-world")
			form.Add("content", "Sample content")
			form.Add("tag", "Welcome, Dingo")
			form.Add("comment", "on")
			form.Add("category", "Dingo")
			form.Add("status", "on")
			ctx := authenticatedContext(form, "POST", "/admin/editor/post/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Should return HTTP response 200 OK", func() {
				So(ctx.StatusCode(), ShouldEqual, 200)
			})

			Convey("Should return status success", func() {
				So(ctx.Response.(*httptest.ResponseRecorder).Body.String(), ShouldContainSubstring, "success")
			})

			Convey("Successfully retrieve the post", func() {
				post, _ := model.GetPostById(1)

				Convey("Should have correct title", func() {
					So(post.Title, ShouldEqual, "Hello World")
				})

				Convey("Should have correct tag length", func() {
					So(post.Tags, ShouldHaveLength, 2)
				})

				Convey("Should have correct content", func() {
					So(post.Markdown, ShouldEqual, "Sample content")
				})

				Convey("Should have correct HTML content", func() {
					So(post.Html, ShouldEqual, "<p>Sample content</p>\n")
				})

				Convey("Should be post", func() {
					So(post.IsPage, ShouldBeFalse)
				})

				Convey("Should be published", func() {
					So(post.IsPublished, ShouldBeTrue)
				})

				Convey("Should have correct author", func() {
					So(post.Author.Id, ShouldEqual, 1)
					So(post.CreatedBy, ShouldEqual, 1)
					So(post.UpdatedBy, ShouldEqual, 1)
					So(post.PublishedBy, ShouldEqual, 1)
				})

				Convey("Should create relevant tags", func() {
					t, err := model.GetTagBySlug("dingo")
					So(err, ShouldBeNil)
					So(t.Name, ShouldEqual, "Dingo")

					t, err = model.GetTagBySlug("welcome")
					So(err, ShouldBeNil)
					So(t.Name, ShouldEqual, "Welcome")
				})

			})

			Convey("Update the post", func() {
				form := url.Values{}
				form.Add("title", "Hello World Modified")
				form.Add("slug", "hello-world")
				form.Add("content", "Sample modified content")
				form.Add("tag", "Welcome")
				form.Add("comment", "on")
				form.Add("category", "Dingo")
				form.Add("status", "on")
				ctx = authenticatedContext(form, "POST", "/admin/editor/1/")

				app.ServeHTTP(ctx.Response, ctx.Request)

				Convey("Successfully retrieve the post", func() {
					post, _ := model.GetPostById(1)

					Convey("Should have correct title", func() {
						So(post.Title, ShouldEqual, "Hello World Modified")
					})

					Convey("Should have correct tag length", func() {
						So(post.Tags, ShouldHaveLength, 1)
					})

					Convey("Should have correct content", func() {
						So(post.Markdown, ShouldEqual, "Sample modified content")
					})

					Convey("Should have correct HTML content", func() {
						So(post.Html, ShouldEqual, "<p>Sample modified content</p>\n")
					})

					Convey("Should be post", func() {
						So(post.IsPage, ShouldBeFalse)
					})

					Convey("Should be published", func() {
						So(post.IsPublished, ShouldBeTrue)
					})

					Convey("Should have correct author", func() {
						So(post.Author.Id, ShouldEqual, 1)
						So(post.CreatedBy, ShouldEqual, 1)
						So(post.UpdatedBy, ShouldEqual, 1)
						So(post.PublishedBy, ShouldEqual, 1)
					})

					Convey("Unused tags should be removed", func() {
						_, err := model.GetTagBySlug("dingo")
						So(err, ShouldNotBeNil)
					})

				})

			})

			Convey("Remove the post", func() {
				form := url.Values{}
				ctx = authenticatedContext(form, "DELETE", "/admin/editor/1/")
				app.ServeHTTP(ctx.Response, ctx.Request)

				Convey("Successfully retrieve the post", func() {
					So(ctx.Response.(*httptest.ResponseRecorder).Body.String(), ShouldContainSubstring, "success")
				})
			})

		})

		Reset(func() {
			os.Remove("test.db")
		})
	})
}

func TestCommentHandler(t *testing.T) {
	Convey("Initialize database", t, func() {
		model.Initialize("test.db", true)

		Convey("Create a new post", func() {
			form := url.Values{}
			form.Add("title", "Hello World")
			form.Add("slug", "hello-world")
			form.Add("content", "Sample content")
			form.Add("tag", "Welcome, Dingo")
			form.Add("comment", "on")
			form.Add("category", "Dingo")
			form.Add("status", "on")
			ctx := authenticatedContext(form, "POST", "/admin/editor/post/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Create a comment", func() {
				form := url.Values{}
				form.Add("author", "Ken Thompson")
				form.Add("email", "ken@gmail.com")
				form.Add("website", "https://en.wikipedia.org/wiki/Ken_Thompson")
				form.Add("comment", "Nice post!")
				ctx := mockContext(form, "POST", "/comment/1/")
				app.ServeHTTP(ctx.Response, ctx.Request)

				c, err := model.GetCommentById(1)
				So(err, ShouldBeNil)
				So(c.Approved, ShouldBeFalse)

				Convey("Approve the comment", func() {
					form := url.Values{}
					form.Add("id", "1")
					ctx := authenticatedContext(form, "PUT", "/admin/comments/")
					app.ServeHTTP(ctx.Response, ctx.Request)

					So(ctx.Response.(*httptest.ResponseRecorder).Body.String(), ShouldContainSubstring, "success")

					Convey("Get the approved comment", func() {
						c, err := model.GetCommentById(1)

						So(err, ShouldBeNil)
						So(c.Approved, ShouldBeTrue)
					})
				})

				Convey("Reply to the comment", func() {
					form := url.Values{}
					form.Add("pid", "1")
					form.Add("content", "Hello, thanks for the comment!")
					ctx := authenticatedContext(form, "POST", "/admin/comments/")
					app.ServeHTTP(ctx.Response, ctx.Request)

					So(ctx.Response.(*httptest.ResponseRecorder).Body.String(), ShouldContainSubstring, "success")

					Convey("Get the parent comment", func() {
						c, err := model.GetCommentById(1)

						So(err, ShouldBeNil)
						So(c.Approved, ShouldBeTrue)
					})

					Convey("Get the reply comment", func() {
						c, err := model.GetCommentById(2)

						So(err, ShouldBeNil)
						So(c.Parent, ShouldEqual, 1)
						So(c.Approved, ShouldBeTrue)
					})
				})

				Convey("Delete the comment", func() {
					form := url.Values{}
					form.Add("id", "1")
					ctx := authenticatedContext(form, "DELETE", "/admin/comments/")
					app.ServeHTTP(ctx.Response, ctx.Request)

					So(ctx.Response.(*httptest.ResponseRecorder).Body.String(), ShouldContainSubstring, "success")

					Convey("Get the parent comment", func() {
						c, err := model.GetCommentById(1)

						So(err, ShouldNotBeNil)
						So(c, ShouldBeNil)
					})
				})

			})
		})

		Reset(func() {
			os.Remove("test.db")
		})
	})
}

func TestSettingHandler(t *testing.T) {
	Convey("Initialize database", t, func() {
		model.Initialize("test.db", true)

		Convey("Save settings", func() {
			settings := []struct {
				Key, Value string
			}{
				{"title", "Dingo Blog"},
				{"github", "dinever"},
				{"twitter", "Dingpeixuan"},
				{"email", "dingpeixuan911@gmail.com"},
			}
			form := url.Values{}
			for _, s := range settings {
				form.Add(s.Key, s.Value)
			}
			ctx := authenticatedContext(form, "POST", "/admin/setting/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Retrieve Settings", func() {
				for _, s := range settings {
					So(model.GetSettingValue(s.Key), ShouldEqual, s.Value)
				}
			})
		})

		Convey("Save custom settings", func() {
			settings := []struct {
				Key, Value string
			}{
				{"title", "Dingo Blog"},
				{"github", "dinever"},
				{"twitter", "Dingpeixuan"},
				{"email", "dingpeixuan911@gmail.com"},
			}
			form := url.Values{}
			for _, s := range settings {
				form.Add("key", s.Key)
				form.Add("value", s.Value)
			}
			ctx := authenticatedContext(form, "POST", "/admin/setting/custom/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Retrieve Settings", func() {
				for _, s := range settings {
					So(model.GetSettingValue(s.Key), ShouldEqual, s.Value)
				}
			})
		})

		Convey("Save navigator settings", func() {
			settings := []struct {
				Lable, Url string
			}{
				{"Home", "/"},
				{"About", "/about/"},
				{"Contact", "/contact"},
			}
			form := url.Values{}
			for _, s := range settings {
				form.Add("label", s.Lable)
				form.Add("url", s.Url)
			}
			ctx := authenticatedContext(form, "POST", "/admin/setting/nav/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			Convey("Retrieve Settings", func() {
				navs := model.GetNavigators()

				So(navs, ShouldHaveLength, 3)
				for i, s := range settings {
					So(navs[i].Label, ShouldEqual, s.Lable)
					So(navs[i].Url, ShouldEqual, s.Url)
				}
			})
		})

		Reset(func() {
			os.Remove("test.db")
		})
	})
}

func TestPasswordHandler(t *testing.T) {
	Convey("Initialize database", t, func() {
		model.Initialize("test.db", true)

		Convey("Change password with wrong old password", func() {
			form := url.Values{}
			form.Add("old", "wrongpassword")
			form.Add("new", "newpassword")
			ctx := authenticatedContext(form, "POST", "/admin/password/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 400)
			So(ctx.Response.(*httptest.ResponseRecorder).Body.String(), ShouldContainSubstring, "error")
		})

		Convey("Change password with correct old password", func() {
			form := url.Values{}
			form.Add("old", "passwordfortest")
			form.Add("new", "newpassword")
			ctx := authenticatedContext(form, "POST", "/admin/password/")
			app := ctx.App
			app.ServeHTTP(ctx.Response, ctx.Request)

			So(ctx.Response.(*httptest.ResponseRecorder).Code, ShouldEqual, 200)
			So(ctx.Response.(*httptest.ResponseRecorder).Body.String(), ShouldContainSubstring, "success")
		})

		Reset(func() {
			os.Remove("test.db")
		})
	})
}
