package handler

import (
	"github.com/dinever/dingo/app/model"
	"github.com/dinever/dingo/app/utils"
	"github.com/dinever/golf"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"path/filepath"
	"strings"
)

const name = "Shawn Ding"
const email = "dingpeixuan911@gmail.com"
const password = "passwordfortest"

func InitTestApp() *golf.Application {
	Initialize()

	utils.RegisterFuncMap(app)
	app.View.FuncMap["Setting"] = model.GetSettingValue
	app.View.FuncMap["Navigator"] = model.GetNavigators

	App.Use(golf.RecoverMiddleware, golf.SessionMiddleware)
	App.View.SetTemplateLoader("base", "view")
	App.View.SetTemplateLoader("admin", filepath.Join("..", "..", "view", "admin"))
	App.View.SetTemplateLoader("theme", filepath.Join("..", "..", "view", "default"))
	App.SessionManager = golf.NewMemorySessionManager()
	App.Error(404, NotFoundHandler)
	return App
}

func makeTestHTTPRequest(body io.Reader, method, url string) *http.Request {
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil
	}
	return req
}

func mockSignUpPostRequest(email, name, password, rePassword string) *golf.Context {
	w := httptest.NewRecorder()
	Initialize()

	form := url.Values{}
	form.Add("email", email)
	form.Add("name", name)
	form.Add("password", password)
	form.Add("re-password", rePassword)
	form.Add("remember-me", "on")
	req := makeTestHTTPRequest(strings.NewReader(form.Encode()), "POST", "/signup")
	req.PostForm = form
	return golf.NewContext(req, w, App)
}

func mockContext(form url.Values, method, path string) *golf.Context {
	w := httptest.NewRecorder()
	Initialize()

	r := makeTestHTTPRequest(strings.NewReader(form.Encode()), method, path)
	r.PostForm = form
	return golf.NewContext(r, w, App)
}

func mockLogInPostContext() *golf.Context {
	w := httptest.NewRecorder()
	Initialize()

	form := url.Values{}
	form.Add("email", email)
	form.Add("password", password)
	form.Add("remember-me", "on")
	req := makeTestHTTPRequest(strings.NewReader(form.Encode()), "POST", "/login/")
	req.PostForm = form
	return golf.NewContext(req, w, App)
}

func retrieveSetCookieValue(rec *httptest.ResponseRecorder, key string) string {
	request := &http.Request{Header: http.Header{"Cookie": rec.HeaderMap["Set-Cookie"]}}
	cookie, _ := request.Cookie(key)
	return cookie.Value
}
