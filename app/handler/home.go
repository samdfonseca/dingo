package handler

import (
	"github.com/dinever/dingo/app/model"
	"github.com/dinever/dingo/app/utils"
	"github.com/dinever/golf"
	"html/template"
	"log"
	"net/url"
	"strconv"
	"strings"
	"time"
)

func RegisterFunctions(app *golf.Application) {
	app.View.FuncMap["Tags"] = getAllTags
	app.View.FuncMap["RecentArticles"] = getRecentPosts
}

func HomeHandler(ctx *golf.Context) {
	p := ctx.Param("page")
	page, _ := strconv.Atoi(p)
	articles, pager, err := model.GetPostList(int64(page), 5, false, true, "published_at DESC")
	if err != nil {
		panic(err)
	}
	// theme := model.GetSetting("site_theme")
	data := map[string]interface{}{
		"Title":    "Home",
		"Articles": articles,
		"Pager":    pager,
	}
	//	updateSidebarData(data)
	ctx.Loader("theme").Render("index.html", data)
}

func ContentHandler(ctx *golf.Context) {
	slug := ctx.Param("slug")
	post, err := model.GetPostBySlug(slug)
	if !post.IsPublished {
		ctx.Abort(404)
		return
	}
	if err != nil {
		log.Printf("[Error]: %v", err)
		ctx.Abort(404)
		return
	}
	post.Hits++
	data := map[string]interface{}{
		"Title":    post.Title,
		"Article":  post,
		"Content":  post,
		"Comments": post.Comments,
	}
	if post.IsPage {
		ctx.Loader("theme").Render("page.html", data)
	} else {
		ctx.Loader("theme").Render("article.html", data)
	}
}

func CommentHandler(ctx *golf.Context) {
	id := ctx.Param("id")
	cid, _ := strconv.Atoi(id)
	post, err := model.GetPostById(int64(cid))
	if cid < 1 || err != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
		})
	}
	c := model.NewComment()
	c.Author = ctx.Request.FormValue("author")
	c.Email = ctx.Request.FormValue("email")
	c.Website = ctx.Request.FormValue("website")
	c.Content = strings.Replace(utils.Html2Str(template.HTMLEscapeString(ctx.Request.FormValue("comment"))), "\n", "<br/>", -1)
	c.Avatar = utils.Gravatar(c.Email, "50")
	c.PostId = post.Id
	pid, _ := strconv.Atoi(ctx.Request.FormValue("pid"))
	c.Parent = int64(pid)
	c.Ip = ctx.Request.RemoteAddr
	c.UserAgent = ctx.Request.UserAgent()
	c.UserId = 0
	msg := c.ValidateComment()
	if msg == "" {
		if err := c.Save(); err != nil {
			ctx.JSON(map[string]interface{}{
				"status": "error",
				"msg":    "Can not comment on this post.",
			})
		}
		post.CommentNum++
		err = post.Save()
		if err != nil {
			log.Printf("[Error]: Can not increase comment count for post %v: %v", post.Id, err.Error())
		}
		ctx.JSON(map[string]interface{}{
			"res":     true,
			"comment": c.ToJson(),
		})
		model.NewMessage("comment", c)
	} else {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    msg,
		})
	}
}

func TagHandler(ctx *golf.Context) {
	p := ctx.Param("page")
	page, _ := strconv.Atoi(p)
	t := ctx.Param("tag")
	tagSlug, _ := url.QueryUnescape(t)
	tag, err := model.GetTagBySlug(tagSlug)
	if err != nil {
		NotFoundHandler(ctx)
		return
	}
	posts, pager, err := model.GetPostsByTag(tag.Id, int64(page), 5, true, "published_at DESC")
	data := map[string]interface{}{
		"Articles": posts,
		"Pager":    pager,
		"Tag":      tag,
		"Title":    tag.Name,
	}
	ctx.Loader("theme").Render("tag.html", data)
}

func SiteMapHandler(ctx *golf.Context) {
	baseUrl := model.GetSettingValue("site_url")
	articles, _, _ := model.GetPostList(1, 50, false, true, "published_at DESC")
	navigators := model.GetNavigators()
	now := utils.Now().Format(time.RFC3339)

	articleMap := make([]map[string]string, len(articles))
	for i, a := range articles {
		m := make(map[string]string)
		m["Link"] = strings.Replace(baseUrl+a.Url(), baseUrl+"/", baseUrl, -1)
		m["Created"] = a.PublishedAt.Format(time.RFC3339)
		articleMap[i] = m
	}

	navMap := make([]map[string]string, 0)
	for _, n := range navigators {
		m := make(map[string]string)
		if n.Url == "/" {
			continue
		}
		if strings.HasPrefix(n.Url, "/") {
			m["Link"] = strings.Replace(baseUrl+n.Url, baseUrl+"/", baseUrl, -1)
		} else {
			m["Link"] = n.Url
		}
		m["Created"] = now
		navMap = append(navMap, m)
	}

	ctx.SetHeader("Content-Type", "application/rss+xml;charset=UTF-8")
	ctx.Loader("base").Render("sitemap.xml", map[string]interface{}{
		"Title":      model.GetSettingValue("site_title"),
		"Link":       baseUrl,
		"Created":    now,
		"Articles":   articleMap,
		"Navigators": navMap,
	})
}

func RssHandler(ctx *golf.Context) {
	baseUrl := model.GetSettingValue("site_url")
	articles, _, _ := model.GetPostList(1, 20, false, true, "published_at DESC")
	articleMap := make([]map[string]string, len(articles))
	for i, a := range articles {
		m := make(map[string]string)
		m["Title"] = a.Title
		m["Link"] = a.Url()
		m["Author"] = a.Author.Name
		m["Desc"] = a.Excerpt()
		m["Created"] = a.CreatedAt.Format(time.RFC822)
		articleMap[i] = m
	}

	ctx.SetHeader("Content-Type", "text/xml; charset=utf-8")

	ctx.Loader("base").Loader("base").Render("rss.xml", map[string]interface{}{
		"Title":    model.GetSettingValue("site_title"),
		"Link":     baseUrl,
		"Desc":     model.GetSettingValue("site_description"),
		"Created":  utils.Now().Format(time.RFC822),
		"Articles": articleMap,
	})
}
