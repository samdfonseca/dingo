package handler

import (
	"os"
	"path/filepath"

	"github.com/dinever/dingo/app/model"
	"github.com/dinever/dingo/app/utils"
	"github.com/dinever/golf"
)

var (
	App *golf.Application
)

func Initialize() {
	App = golf.New()

	App.Config.Set("app/static_dir", "static")
	App.Config.Set("app.log_dir", "tmp/log")
	App.Config.Set("app/upload_dir", "upload")
	upload_dir, _ := App.Config.GetString("app/upload_dir", "upload")
	registerMiddlewares()
	registerFuncMap()
	RegisterFunctions(App)
	theme := model.GetSettingValue("theme")
	App.View.SetTemplateLoader("base", "view")
	App.View.SetTemplateLoader("admin", filepath.Join("view", "admin"))
	App.View.SetTemplateLoader("theme", filepath.Join("view", theme))
	//      static_dir, _ := App.Config.GetString("app/static_dir", "static")
	App.Static("/upload/", upload_dir)
	App.Static("/", filepath.Join("view", "admin", "assets"))
	App.Static("/", filepath.Join("view", theme, "assets"))

	App.SessionManager = golf.NewMemorySessionManager()
	App.Error(404, NotFoundHandler)

	registerAdminURLHandlers()
	registerHomeHandler()
	registerAPIHandler()
}

func registerFuncMap() {
	App.View.FuncMap["DateFormat"] = utils.DateFormat
	App.View.FuncMap["DateInt64"] = utils.DateInt64
	App.View.FuncMap["DateString"] = utils.DateString
	App.View.FuncMap["DateTime"] = utils.DateTime
	App.View.FuncMap["Now"] = utils.Now
	App.View.FuncMap["Html2Str"] = utils.Html2Str
	App.View.FuncMap["FileSize"] = utils.FileSize
	App.View.FuncMap["Setting"] = model.GetSettingValue
	App.View.FuncMap["Navigator"] = model.GetNavigators
	App.View.FuncMap["Md2html"] = utils.Markdown2HtmlTemplate
}

func registerMiddlewares() {
	App.Use(
		golf.LoggingMiddleware(os.Stdout),
		golf.RecoverMiddleware,
		golf.SessionMiddleware,
	)
}

func registerAdminURLHandlers() {
	authChain := golf.NewChain(AuthMiddleware)
	App.Get("/login/", AuthLoginPageHandler)
	App.Post("/login/", AuthLoginHandler)

	App.Get("/signup/", AuthSignUpPageHandler)
	App.Post("/signup/", AuthSignUpHandler)

	App.Get("/logout/", AuthLogoutHandler)

	App.Get("/admin/", authChain.Final(AdminHandler))

	App.Get("/admin/profile/", authChain.Final(ProfileHandler))
	App.Post("/admin/profile/", authChain.Final(ProfileChangeHandler))

	App.Get("/admin/editor/post/", authChain.Final(PostCreateHandler))
	App.Post("/admin/editor/post/", authChain.Final(PostSaveHandler))

	App.Get("/admin/editor/page/", authChain.Final(PageCreateHandler))
	App.Post("/admin/editor/page/", authChain.Final(PageSaveHandler))

	App.Get("/admin/posts/", authChain.Final(AdminPostHandler))
	App.Get("/admin/editor/:id/", authChain.Final(PostEditHandler))
	App.Post("/admin/editor/:id/", authChain.Final(PostSaveHandler))
	App.Delete("/admin/editor/:id/", authChain.Final(PostRemoveHandler))

	App.Get("/admin/pages/", authChain.Final(AdminPageHandler))

	App.Get("/admin/comments/", authChain.Final(CommentViewHandler))
	App.Post("/admin/comments/", authChain.Final(CommentAddHandler))
	App.Put("/admin/comments/", authChain.Final(CommentUpdateHandler))
	App.Delete("/admin/comments/", authChain.Final(CommentRemoveHandler))

	App.Get("/admin/setting/", authChain.Final(SettingViewHandler))
	App.Post("/admin/setting/", authChain.Final(SettingUpdateHandler))
	App.Post("/admin/setting/custom/", authChain.Final(SettingCustomHandler))
	App.Post("/admin/setting/nav/", authChain.Final(SettingNavHandler))
	//
	App.Get("/admin/files/", authChain.Final(FileViewHandler))
	App.Delete("/admin/files/", authChain.Final(FileRemoveHandler))
	App.Post("/admin/files/upload/", authChain.Final(FileUploadHandler))

	App.Get("/admin/password/", authChain.Final(AdminPasswordPage))
	App.Post("/admin/password/", authChain.Final(AdminPasswordChange))

	App.Get("/admin/monitor/", authChain.Final(AdminMonitorPage))
}

func registerHomeHandler() {
	statsChain := golf.NewChain()
	App.Get("/", statsChain.Final(HomeHandler))
	App.Get("/page/:page/", HomeHandler)
	App.Post("/comment/:id/", CommentHandler)
	App.Get("/tag/:tag/", TagHandler)
	App.Get("/tag/:tag/page/:page/", TagHandler)
	App.Get("/feed/", RssHandler)
	App.Get("/sitemap.xml", SiteMapHandler)
	App.Get("/:slug/", statsChain.Final(ContentHandler))
}

func registerAPIHandler() {
	// Auth
	App.Post("/auth", JWTAuthLoginHandler)
	App.Get("/auth", JWTAuthValidateHandler)

	// register the API handler
	App.Get("/api", APIDocumentationHandler)

	// Posts
	App.Get("/api/posts", APIPostsHandler)
	App.Get("/api/posts/:id", APIPostHandler)
	App.Get("/api/posts/slug/:slug", APIPostSlugHandler)

	// Tags
	App.Get("/api/tags", APITagsHandler)
	App.Get("/api/tags/:id", APITagHandler)
	App.Get("/api/tags/slug/:slug", APITagSlugHandler)

	// Users
	App.Get("/api/users", APIUsersHandler)
	App.Get("/api/users/:id", APIUserHandler)
	App.Get("/api/users/slug/:slug", APIUserSlugHandler)
	App.Get("/api/users/email/:email", APIUserEmailHandler)
}
