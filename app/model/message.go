package model

import (
	"github.com/dinever/dingo/app/utils"
	"log"
	"strings"
	"time"
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
	Id        int
	Type      string
	CreatedAt *time.Time
	Data      string
	IsRead    bool
}

func NewMessage(tp string, data interface{}) *Message {
	m := new(Message)
	m.Type = tp
	m.Data = messageGenerator[tp](data)
	if m.Data == "" {
		log.Printf("[Error]: message generator returns empty")
		return nil
	}
	m.CreatedAt = utils.Now()
	m.IsRead = false
	return m
}

func (m *Message) Save() error {
	writeDB, err := db.Begin()
	if err != nil {
		writeDB.Rollback()
	}
	_, err = writeDB.Exec(stmtInsertMessage, nil, m.Type, m.Data, m.IsRead, m.CreatedAt)
	if err != nil {
		writeDB.Rollback()
	}
	return writeDB.Commit()
}

func SetMessageGenerator(name string, fn func(v interface{}) string) {
	messageGenerator[name] = fn
}

func GetUnreadMessages() []*Message {
	messages := make([]*Message, 0)
	rows, err := db.Query(stmtGetUnreadMessages, 10, 0)
	defer rows.Close()
	if err != nil {
		panic(err)
		return messages
	}
	for rows.Next() {
		m := new(Message)
		err := rows.Scan(&m.Id, &m.Type, &m.Data, &m.IsRead, &m.CreatedAt)
		if err != nil {
			panic(err)
			continue
		}
		messages = append(messages, m)
	}
	return messages
}

func generateCommentMessage(co interface{}) string {
	c, ok := co.(*Comment)
	if !ok {
		return ""
	}
	post, err := GetPostById(c.PostId)
	if err != nil {
		panic(err)
	}
	var s string
	if c.Parent < 1 {
		s = "<p>" + c.Author + " commented on post <i>" + string(post.Title) + "</i>: </p><p>"
		s += utils.Html2Str(c.Content) + "</p>"
	} else {
		p, err := GetCommentById(c.Parent)
		if err != nil {
			s = "<p>" + c.Author + " commented on post <i>" + string(post.Title) + "</i>: </p><p>"
		} else {
			s = "<p>" + c.Author + " replied " + p.Author + "'s comment on <i>" + string(post.Title) + "</i>: </p><p>"
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
