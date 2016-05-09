package model

import (
	"fmt"
	"github.com/dinever/dingo/app/utils"
	"github.com/dinever/golf"
	"time"
)

type Token struct {
	Value     string
	UserId    int64
	CreatedAt *time.Time
	ExpiredAt *time.Time
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
	writeDB, err := db.Begin()
	if err != nil {
		writeDB.Rollback()
		return err
	}
	_, err = writeDB.Exec(stmtUpdateToken, t.Value, t.UserId, t.CreatedAt, t.ExpiredAt)
	if err != nil {
		writeDB.Rollback()
		return err
	}
	return writeDB.Commit()
}

func GetTokenByValue(v string) (*Token, error) {
	t := new(Token)
	row := db.QueryRow(stmtGetTokenByValue, v)
	err := row.Scan(&t.Value, &t.UserId, &t.CreatedAt, &t.ExpiredAt)
	if err != nil {
		return nil, err
	}
	return t, nil
}

func (t *Token) IsValid() bool {
	u := &User{Id: t.UserId}
	err := u.GetUserById()
	if err != nil {
		return false
	}
	return t.ExpiredAt.After(*utils.Now())
}
