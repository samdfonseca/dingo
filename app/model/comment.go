package model

import (
	"database/sql"
	"time"

	"github.com/dingoblog/dingo/app/utils"
	"github.com/russross/meddler"
)

// Comment struct defines a comment item data.
type Comment struct {
	Id        int64      `meddler:"id,pk"`
	PostId    int64      `meddler:"post_id"`
	Author    string     `meddler:"author"`
	Email     string     `meddler:"author_email"`
	Avatar    string     `meddler:"author_avatar"`
	Website   string     `meddler:"author_url"`
	Ip        string     `meddler:"author_ip"`
	CreatedAt *time.Time `meddler:"created_at"`
	Content   string     `meddler:"content"`
	Approved  bool       `meddler:"approved"`
	UserAgent string     `meddler:"agent"`
	Type      string     `meddler:"type"`
	Parent    int64      `meddler:"parent"`
	UserId    int64      `meddler:"user_id"`
}

type Comments []*Comment

func (c Comments) Len() int {
	return len(c)
}

func (c Comments) Get(i int) *Comment {
	return c[i]
}

func (c Comments) GetAll() []*Comment {
	return c
}

func NewComment() *Comment {
	return &Comment{
		CreatedAt: utils.Now(),
	}
}

func (c *Comment) Save() error {
	c.Avatar = utils.Gravatar(c.Email, "50")
	err := meddler.Save(db, "comments", c)
	return err
}

func (c *Comment) ToJson() map[string]interface{} {
	m := make(map[string]interface{})
	m["id"] = c.Id
	m["author"] = c.Author
	m["email"] = c.Email
	m["website"] = c.Website
	m["avatar"] = c.Avatar
	m["content"] = c.Content
	m["create_time"] = c.CreatedAt.Unix()
	m["pid"] = c.Parent
	m["approved"] = c.Approved
	m["ip"] = c.Ip
	m["user_agent"] = c.UserAgent
	m["parent_content"] = c.ParentContent()
	return m
}

func (c *Comment) ParentContent() string {
	if c.Parent < 1 {
		return ""
	}

	comment := &Comment{Id: c.Parent}
	err := comment.GetCommentById()
	if err != nil {
		return "> Comment not found."
	}
	str := "> @" + comment.Author + "\n\n"
	str += "> " + comment.Content + "\n"
	return str
}

func GetNumberOfComments() (int64, error) {
	var count int64
	var row *sql.Row
	row = db.QueryRow(stmtGetAllCommentCount)
	err := row.Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (comments *Comments) GetCommentList(page, size int64) (*utils.Pager, error) {
	var pager *utils.Pager

	count, err := GetNumberOfComments()
	pager = utils.NewPager(page, size, count)

	err = meddler.QueryAll(db, comments, stmtGetCommentList, size, pager.Begin-1)
	return pager, err
}

func (comment *Comment) GetCommentById() error {
	err := meddler.QueryRow(db, comment, stmtGetCommentById, comment.Id)
	return err
}

func (comments *Comments) GetCommentsByPostId(id int64) error {
	err := meddler.QueryAll(db, comments, stmtGetCommentsByPostId, id)
	return err
}

func DeleteComment(id int64) error {
	writeDB, err := db.Begin()
	if err != nil {
		writeDB.Rollback()
		return err
	}
	_, err = writeDB.Exec(stmtDeleteCommentById, id)
	if err != nil {
		writeDB.Rollback()
		return err
	}
	return writeDB.Commit()
}

func (c *Comment) ValidateComment() string {
	if utils.IsEmptyString(c.Author) || utils.IsEmptyString(c.Content) {
		return "Name, Email and Content are required fields."
	}
	if !utils.IsEmail(c.Email) {
		return "Email format not valid."
	}
	if !utils.IsEmptyString(c.Website) && !utils.IsURL(c.Website) {
		return "Website URL format not valid."
	}
	return ""
}

const stmtGetAllCommentCount = `SELECT count(*) FROM comments`
const stmtDeleteCommentById = `DELETE FROM comments WHERE id = ?`
const stmtGetCommentList = `SELECT * FROM comments ORDER BY created_at DESC LIMIT ? OFFSET ?`
const stmtGetCommentById = `SELECT * FROM comments WHERE id = ?`
const stmtGetCommentsByPostId = `SELECT * FROM comments WHERE post_id = ? AND approved = 1`
