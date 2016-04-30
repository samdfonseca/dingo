package handler

import (
	"log"
	"net/http"

	"github.com/dinever/dingo/app/model"
	"github.com/dinever/golf"
)

func JWTAuthLoginHandler(ctx *golf.Context) {
	email := ctx.Request.FormValue("email")
	password := ctx.Request.FormValue("password")

	user, err := model.GetUserByEmail(email)
	if user == nil || err != nil {
		ctx.SendStatus(http.StatusUnauthorized)
		ctx.JSON(map[string]interface{}{"status": "error"})
		return
	}
	if !user.CheckPassword(password) {
		ctx.SendStatus(http.StatusUnauthorized)
		ctx.JSON(map[string]interface{}{"status": "error"})
		return
	}

	token, err := model.NewJWT(user)
	if err != nil {
		log.Printf("Unable to sign token: %v\n", err)
		ctx.SendStatus(http.StatusInternalServerError)
		ctx.JSON(map[string]interface{}{"status": "error"})
		return
	}

	ctx.SendStatus(http.StatusOK)
	ctx.JSON(token)
}

func JWTAuthValidateHandler(ctx *golf.Context) {
	tokenHeader := ctx.Header("X-SESSION-TOKEN")
	if tokenHeader == "" {
		ctx.SendStatus(http.StatusBadRequest)
		ctx.JSON(map[string]interface{}{"status": "error"})
		return
	}

	token, err := model.ValidateJWT(tokenHeader)
	if err != nil {
		ctx.SendStatus(http.StatusUnauthorized)
		ctx.JSON(map[string]interface{}{"status": "error"})
		return
	}

	ctx.SendStatus(http.StatusOK)
	ctx.JSON(model.NewJWTFromToken(token))
}
