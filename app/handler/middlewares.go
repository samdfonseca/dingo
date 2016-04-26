package handler

import (
	"github.com/dinever/dingo/app/model"
	"github.com/dinever/golf"
	"strconv"
)

func AuthMiddleware(next golf.HandlerFunc) golf.HandlerFunc {
	fn := func(ctx *golf.Context) {
		userNum, err := model.GetNumberOfUsers()
		if err == nil && userNum == 0 {
			ctx.Redirect("/signup/")
			return
		}
		tokenStr, err := ctx.Request.Cookie("token-value")
		if err != nil {
			ctx.Redirect("/login/")
			return
		}
		token, err := model.GetTokenByValue(tokenStr.Value)
		if err != nil || !token.IsValid() {
			ctx.Redirect("/login/")
			return
		}
		tokenUser, err := ctx.Request.Cookie("token-user")
		if err != nil {
			ctx.Redirect("/login/")
			return
		}
		uid, _ := strconv.Atoi(tokenUser.Value)
		user, err := model.GetUserById(int64(uid))
		if err != nil {
			panic(err)
		}
		ctx.Session.Set("user", user)
		next(ctx)
	}
	return fn
}
