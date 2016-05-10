package model

import (
	"log"
	"strings"
	"time"

	"github.com/dinever/dingo/app/utils"
	"github.com/russross/meddler"
)

var (
	messageGenerator map[string]func(v interface{}) string
)

func init() {
	messageGenerator = make(map[string]func(v interface{}) string)
	messageGenerator["comment"] = generateCommentMessage
	messageGenerator["backup"] = generateBackupMessage
}

type Message struct {
	Id        int        `meddler:"id,pk"`
	Type      string     `meddler:"type"`
	Data      string     `meddler:"data"`
	IsRead    bool       `meddler:"is_read"`
	CreatedAt *time.Time `meddler:"created_at"`
}

type Messages []*Message

func (m Messages) Get(i int) *Message {
	return m[i]
}

func NewMessage(tp string, data interface{}) *Message {
	mData := messageGenerator[tp](data)
	if mData == "" {
		log.Printf("[Error]: message generator returns empty")
		return nil
	}
	return &Message{
		Type:      tp,
		Data:      mData,
		CreatedAt: utils.Now(),
		IsRead:    false,
	}
}

func (m *Message) Insert() error {
	err := meddler.Insert(db, "messages", m)
	return err
}

func SetMessageGenerator(name string, fn func(v interface{}) string) {
	messageGenerator[name] = fn
}

func (messages *Messages) GetUnreadMessages() {
	err := meddler.QueryAll(db, messages, stmtGetUnreadMessages)
	if err != nil {
		panic(err)
	}
	return
}

func generateCommentMessage(co interface{}) string {
	c, ok := co.(*Comment)
	if !ok {
		return ""
	}
	post := &Post{Id: c.PostId}
	err := post.GetPostById()
	if err != nil {
		panic(err)
	}
	var s string
	if c.Parent < 1 {
		s = "<p>" + c.Author + " commented on post <i>" + string(post.Title) + "</i>: </p><p>"
		s += utils.Html2Str(c.Content) + "</p>"
	} else {
		pc := &Comment{Id: c.Parent}
		err = pc.GetCommentById()
		if err != nil {
			s = "<p>" + c.Author + " commented on post <i>" + string(post.Title) + "</i>: </p><p>"
		} else {
			s = "<p>" + c.Author + " replied " + pc.Author + "'s comment on <i>" + string(post.Title) + "</i>: </p><p>"
			s += utils.Html2Str(c.Content) + "</p>"
		}
	}
	return s
}

func generateBackupMessage(co interface{}) string {
	str := co.(string)
	if strings.HasPrefix(str, "[0]") {
		return "Failed to back up the site: " + strings.TrimPrefix(str, "[0]") + "."
	}
	return "The site is successfully backed up at: " + strings.TrimPrefix(str, "[1]")
}

const stmtGetUnreadMessages = `SELECT * FROM messages WHERE is_read = 0 ORDER BY created_at DESC LIMIT 10 OFFSET 0`
