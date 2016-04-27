package handler

import (
	"github.com/dinever/dingo/app/model"
	"github.com/dinever/dingo/app/utils"
	"github.com/dinever/golf"
	"github.com/twinj/uuid"
	"strconv"
	"time"
)

func AdminHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	ctx.Loader("admin").Render("home.html", map[string]interface{}{
		"Title":    "Dashboard",
		"Statis":   model.NewStatis(ctx.App),
		"User":     u,
		"Messages": model.GetUnreadMessages(),
		"Monitor":  utils.ReadMemStats(),
	})
}

func ProfileHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	ctx.Loader("admin").Render("profile.html", map[string]interface{}{
		"Title": "Profile",
		"User":  u,
	})
}

func ProfileChangeHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	if u.Email != ctx.Request.FormValue("email") && !model.UserChangeEmail(ctx.Request.FormValue("email")) {
		ctx.JSON(map[string]interface{}{"status": "error", "msg": "A user with that email address already exists."})
		return
	}
	u.Name = ctx.Request.FormValue("name")
	u.Slug = ctx.Request.FormValue("slug")
	u.Email = ctx.Request.FormValue("email")
	u.Avatar = utils.Gravatar(ctx.Request.FormValue("email"), "180")
	u.Website = ctx.Request.FormValue("url")
	u.Bio = ctx.Request.FormValue("bio")
	err := u.UpdateUser(u.Id)
	if err != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    err.Error(),
		})
	}
	ctx.JSON(map[string]interface{}{"status": "success"})
}

func PostCreateHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	p := model.NewPost()
	ctx.Loader("admin").Render("edit_post.html", map[string]interface{}{
		"Title": "New Post",
		"Post":  p,
		"User":  u,
	})
}

func PostSaveHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	p := model.NewPost()
	id := ctx.Param("id")
	idInt, _ := strconv.Atoi(id)
	p.Id = int64(idInt)
	p.Title = ctx.Request.FormValue("title")
	p.Slug = ctx.Request.FormValue("slug")
	p.Markdown = ctx.Request.FormValue("content")
	p.Html = utils.Markdown2Html(p.Markdown)
	p.Tags = model.GenerateTagsFromCommaString(ctx.Request.FormValue("tag"))
	p.AllowComment = ctx.Request.FormValue("comment") == "on"
	p.Category = ctx.Request.FormValue("category")
	p.CreatedBy = u.Id
	p.UpdatedBy = u.Id
	p.IsPublished = ctx.Request.FormValue("status") == "on"
	p.IsPage = false
	p.Author = u
	p.Hits = 1
	var e error
	e = p.Save()
	if e != nil {
		ctx.SendStatus(400)
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    e.Error(),
		})
		return
	}
	ctx.JSON(map[string]interface{}{
		"status":  "success",
		"content": p,
	})
}

func AdminPostHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	i, _ := strconv.Atoi(ctx.Request.FormValue("page"))
	posts, pager, err := model.GetPostList(int64(i), 10, false, false, "created_at DESC")
	if err != nil {
		panic(err)
	}
	ctx.Loader("admin").Render("posts.html", map[string]interface{}{
		"Title": "Posts",
		"Posts": posts,
		"User":  u,
		"Pager": pager,
	})
}

func PostEditHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	id := ctx.Param("id")
	postId, _ := strconv.Atoi(id)
	p, err := model.GetPostById(int64(postId))
	if p == nil || err != nil {
		ctx.Redirect("/admin/posts/")
		return
	}
	ctx.Loader("admin").Render("edit_post.html", map[string]interface{}{
		"Title": "Edit Post",
		"Post":  p,
		"User":  u,
	})
}

func PostRemoveHandler(ctx *golf.Context) {
	id := ctx.Param("id")
	postId, _ := strconv.Atoi(id)
	err := model.DeletePostById(int64(postId))
	if err != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
		})
	} else {
		ctx.JSON(map[string]interface{}{
			"status": "success",
		})
	}
}

func PageCreateHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	p := model.NewPost()
	ctx.Loader("admin").Render("edit_post.html", map[string]interface{}{
		"Title": "New Page",
		"Post":  p,
		"User":  u,
	})
}

func AdminPageHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	i, _ := strconv.Atoi(ctx.Request.FormValue("page"))
	pages, pager, err := model.GetPostList(int64(i), 10, true, false, `created_at`)
	if err != nil {
		panic(err)
	}
	ctx.Loader("admin").Render("pages.html", map[string]interface{}{
		"Title": "Pages",
		"Pages": pages,
		"User":  u,
		"Pager": pager,
	})
}

func PageSaveHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	p := model.NewPost()
	p.Id = 0
	if !model.PostChangeSlug(ctx.Request.FormValue("slug")) {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    "The slug of this post has conflicts with another post."})
		return
	}
	p.Title = ctx.Request.FormValue("title")
	p.Slug = ctx.Request.FormValue("slug")
	p.Markdown = ctx.Request.FormValue("content")
	p.Html = utils.Markdown2Html(p.Markdown)
	p.Tags = model.GenerateTagsFromCommaString(ctx.Request.FormValue("tag"))
	p.AllowComment = ctx.Request.FormValue("comment") == "on"
	p.Category = ctx.Request.FormValue("category")
	p.CreatedBy = u.Id
	p.UpdatedBy = u.Id
	p.IsPublished = ctx.Request.FormValue("status") == "on"
	p.IsPage = true
	p.Author = u
	p.Hits = 1
	var e error
	e = p.Save()
	if e != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    e.Error(),
		})
		return
	}
	ctx.JSON(map[string]interface{}{
		"status":  "success",
		"content": p,
	})
}

func CommentViewHandler(ctx *golf.Context) {
	i, _ := strconv.Atoi(ctx.Request.FormValue("page"))
	user, _ := ctx.Session.Get("user")
	comments, pager, err := model.GetCommentList(int64(i), 10)
	if err != nil {
		panic(err)
	}
	ctx.Loader("admin").Render("comments.html", map[string]interface{}{
		"Title":    "Comments",
		"Comments": comments,
		"User":     user,
		"Pager":    pager,
	})
}

func CommentAddHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	pid, _ := strconv.Atoi(ctx.Request.FormValue("pid"))
	parent, err := model.GetCommentById(int64(pid))
	if err != nil {
		panic(err)
	}
	if !parent.Approved {
		parent.Approved = true
		parent.Save()
	}
	c := new(model.Comment)
	c.Author = u.Name
	c.Email = u.Email
	c.Website = u.Website
	c.Content = ctx.Request.FormValue("content")
	c.Avatar = utils.Gravatar(c.Email, "50")
	c.Parent = parent.Id
	c.PostId = parent.PostId
	c.Ip = ctx.Request.RemoteAddr
	c.UserAgent = ctx.Request.UserAgent()
	c.UserId = u.Id
	c.Approved = true
	t := time.Now()
	c.CreatedAt = &t
	id, err := c.Save()
	if err != nil {
		panic(err)
	}
	c.Id = id
	ctx.JSON(map[string]interface{}{
		"status":  "success",
		"comment": c.ToJson(),
	})
	model.CreateMessage("comment", c)
}

func CommentUpdateHandler(ctx *golf.Context) {
	id, _ := strconv.Atoi(ctx.Request.FormValue("id"))
	c, err := model.GetCommentById(int64(id))
	if err != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    err.Error(),
		})
	}
	c.Approved = true
	c.Save()
	ctx.JSON(map[string]interface{}{
		"status": "success",
	})
}

func CommentRemoveHandler(ctx *golf.Context) {
	id, _ := strconv.Atoi(ctx.Request.FormValue("id"))
	err := model.DeleteComment(int64(id))
	if err != nil {
		ctx.JSON(map[string]interface{}{
			"status": "success",
			"msg":    err.Error(),
		})
	}
	ctx.JSON(map[string]interface{}{
		"status": "success",
	})
}

func SettingViewHandler(ctx *golf.Context) {
	user, _ := ctx.Session.Get("user")
	ctx.Loader("admin").Render("setting.html", map[string]interface{}{
		"Title":      "Settings",
		"User":       user,
		"Custom":     model.GetCustomSettings(),
		"Navigators": model.GetNavigators(),
	})
}

func SettingUpdateHandler(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	var err error
	ctx.Request.ParseForm()
	for key, value := range ctx.Request.Form {
		setting := new(model.Setting)
		setting.UUID = uuid.Formatter(uuid.NewV4(), uuid.CleanHyphen)
		setting.Key = key
		setting.Value = value[0]
		setting.Type = ""
		setting.CreatedBy = u.Id
		now := time.Now()
		setting.CreatedAt = &now
		err = model.SaveSetting(setting)
		if err != nil {
			panic(err)
			ctx.JSON(map[string]interface{}{
				"status": "error",
				"msg":    err.Error(),
			})
		}
	}
	ctx.JSON(map[string]interface{}{
		"status": "success",
	})
}

func SettingCustomHandler(ctx *golf.Context) {
	ctx.Request.ParseForm()
	keys := ctx.Request.Form["key"]
	values := ctx.Request.Form["value"]
	for i, k := range keys {
		if len(k) < 1 {
			continue
		}
		model.SetSetting(k, values[i], "custom")
	}
	ctx.JSON(map[string]interface{}{
		"status": "success",
	})
}

func SettingNavHandler(ctx *golf.Context) {
	ctx.Request.ParseForm()
	labels := ctx.Request.Form["label"]
	urls := ctx.Request.Form["url"]
	model.SetNavigators(labels, urls)
	ctx.JSON(map[string]interface{}{
		"status": "success",
	})
}

func AdminPasswordPage(ctx *golf.Context) {
	user, _ := ctx.Session.Get("user")
	ctx.Loader("admin").Render("password.html", map[string]interface{}{
		"Title": "Change Password",
		"User":  user,
	})
}

func AdminPasswordChange(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	oldPassword := ctx.Request.FormValue("old")
	if !u.CheckPassword(oldPassword) {
		ctx.SendStatus(400)
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    "Old password incorrect.",
		})
		return
	}
	newPassword := ctx.Request.FormValue("new")
	u.ChangePassword(newPassword)
	ctx.JSON(map[string]interface{}{
		"status": "success",
	})
}

func AdminMonitorPage(ctx *golf.Context) {
	user, _ := ctx.Session.Get("user")
	ctx.Loader("admin").Render("monitor.html", map[string]interface{}{
		"Title":   "Monitor",
		"User":    user,
		"Monitor": utils.ReadMemStats(),
	})
}
