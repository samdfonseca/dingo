package utils

import "github.com/dinever/golf"

func RegisterFuncMap(app *golf.Application) {
	app.View.FuncMap["DateFormat"] = DateFormat
	app.View.FuncMap["DateInt64"] = DateInt64
	app.View.FuncMap["DateString"] = DateString
	app.View.FuncMap["DateTime"] = DateTime
	app.View.FuncMap["Now"] = Now
	app.View.FuncMap["Html2Str"] = Html2Str
	app.View.FuncMap["FileSize"] = FileSize
	app.View.FuncMap["Md2html"] = Markdown2HtmlTemplate
}
