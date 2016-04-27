package handler

import "github.com/dinever/golf"

func RegisterAdminURLHandlers(app *golf.Application) {
	authChain := golf.NewChain(AuthMiddleware)
	app.Get("/login/", AuthLoginPageHandler)
	app.Post("/login/", AuthLoginHandler)

	app.Get("/signup/", AuthSignUpPageHandler)
	app.Post("/signup/", AuthSignUpHandler)

	app.Get("/logout/", AuthLogoutHandler)

	app.Get("/admin/", authChain.Final(AdminHandler))

	app.Get("/admin/profile/", authChain.Final(ProfileHandler))
	app.Post("/admin/profile/", authChain.Final(ProfileChangeHandler))

	app.Get("/admin/editor/post/", authChain.Final(PostCreateHandler))
	app.Post("/admin/editor/post/", authChain.Final(PostSaveHandler))

	app.Get("/admin/editor/page/", authChain.Final(PageCreateHandler))
	app.Post("/admin/editor/page/", authChain.Final(PageSaveHandler))

	app.Get("/admin/posts/", authChain.Final(AdminPostHandler))
	app.Get("/admin/editor/:id/", authChain.Final(PostEditHandler))
	app.Post("/admin/editor/:id/", authChain.Final(PostSaveHandler))
	app.Delete("/admin/editor/:id/", authChain.Final(PostRemoveHandler))

	app.Get("/admin/pages/", authChain.Final(AdminPageHandler))

	app.Get("/admin/comments/", authChain.Final(CommentViewHandler))
	app.Post("/admin/comments/", authChain.Final(CommentAddHandler))
	app.Put("/admin/comments/", authChain.Final(CommentUpdateHandler))
	app.Delete("/admin/comments/", authChain.Final(CommentRemoveHandler))

	app.Get("/admin/setting/", authChain.Final(SettingViewHandler))
	app.Post("/admin/setting/", authChain.Final(SettingUpdateHandler))
	app.Post("/admin/setting/custom/", authChain.Final(SettingCustomHandler))
	app.Post("/admin/setting/nav/", authChain.Final(SettingNavHandler))
	//
	app.Get("/admin/files/", authChain.Final(FileViewHandler))
	app.Delete("/admin/files/", authChain.Final(FileRemoveHandler))
	app.Post("/admin/files/upload/", authChain.Final(FileUploadHandler))

	app.Get("/admin/password/", authChain.Final(AdminPasswordPage))
	app.Post("/admin/password/", authChain.Final(AdminPasswordChange))

	app.Get("/admin/monitor/", authChain.Final(AdminMonitorPage))
}

func RegisterHomeHandler(app *golf.Application) {
	statsChain := golf.NewChain()
	app.Get("/", statsChain.Final(HomeHandler))
	app.Get("/page/:page/", HomeHandler)
	app.Post("/comment/:id/", CommentHandler)
	app.Get("/tag/:tag/", TagHandler)
	app.Get("/tag/:tag/page/:page/", TagHandler)
	app.Get("/feed/", RssHandler)
	app.Get("/sitemap.xml", SiteMapHandler)
	app.Get("/:slug/", statsChain.Final(ContentHandler))
}
