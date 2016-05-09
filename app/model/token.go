package model

import (
	"fmt"
	"time"

	"github.com/dinever/dingo/app/utils"
	"github.com/dinever/golf"
	"github.com/russross/meddler"
)

type Token struct {
	Id        int64      `meddler:"id,pk"`
	Value     string     `meddler:"value"`
	UserId    int64      `meddler:"user_id"`
	CreatedAt *time.Time `meddler:"created_at"`
	ExpiredAt *time.Time `meddler:"expired_at"`
}

func NewToken(u *User, ctx *golf.Context, expire int64) *Token {
	t := new(Token)
	t.UserId = u.Id
	t.CreatedAt = utils.Now()
	expiredAt := t.CreatedAt.Add(time.Duration(expire) * time.Second)
	t.ExpiredAt = &expiredAt
	t.Value = utils.Sha1(fmt.Sprintf("%s-%s-%d-%d", ctx.ClientIP(), ctx.Request.UserAgent(), t.CreatedAt.Unix(), t.UserId))
	return t
}

func (t *Token) Save() error {
	// NOTE: since medder.Save doesn't support UNIQUE field, it is different from INSERT OR REPLACE...
	// err := meddler.Save(db, "tokens", t) doens't work...
	writeDB, err := db.Begin()
	if err != nil {
		writeDB.Rollback()
		return err
	}
	_, err = writeDB.Exec("INSERT OR REPLACE INTO tokens (id,value, user_id, created_at, expired_at) VALUES (?,?, ?, ?, ?)", t.Id, t.Value, t.UserId, t.CreatedAt, t.ExpiredAt)
	if err != nil {
		writeDB.Rollback()
		return err
	}
	return writeDB.Commit()
}

func (t *Token) GetTokenByValue() error {
	err := meddler.QueryRow(db, t, "SELECT * FROM tokens WHERE value = ?", t.Value)
	return err
}

func (t *Token) IsValid() bool {
	u := &User{Id: t.UserId}
	err := u.GetUserById()
	if err != nil {
		return false
	}
	return t.ExpiredAt.After(*utils.Now())
}
