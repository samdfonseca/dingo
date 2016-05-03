package handler

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/dinever/dingo/app/model"
	"github.com/dinever/golf"
)

type JWTPostBody struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func JWTAuthLoginHandler(ctx *golf.Context) {
	var email string
	var password string
	if ctx.Header("Content-Type") == "application/json" {
		defer ctx.Request.Body.Close()
		body, err := ioutil.ReadAll(ctx.Request.Body)
		if err != nil {
			ctx.SendStatus(http.StatusInternalServerError)
			ctx.JSON(map[string]interface{}{"status": "error: unable to read request body"})
			return
		}
		var unmarshalledRequestBody JWTPostBody
		json.Unmarshal(body, &unmarshalledRequestBody)
		email = unmarshalledRequestBody.Email
		password = unmarshalledRequestBody.Password
	} else {
		email = ctx.Request.FormValue("email")
		password = ctx.Request.FormValue("password")
	}

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
