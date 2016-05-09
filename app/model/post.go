package model

import (
	"database/sql"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/dinever/dingo/app/utils"
	"github.com/russross/meddler"
)

type Post struct {
	Id              int64      `meddler:"id,pk"`
	Title           string     `meddler:"title"`
	Slug            string     `meddler:"slug"`
	Markdown        string     `meddler:"markdown"`
	Html            string     `meddler:"html"`
	Image           string     `meddler:"image"`
	IsFeatured      bool       `meddler:"featured"`
	IsPage          bool       `meddler:"page"`
	AllowComment    bool       `meddler:"allow_comment"`
	CommentNum      int64      `meddler:"comment_num"`
	IsPublished     bool       `meddler:"published"`
	Language        string     `meddler:"language"`
	MetaTitle       string     `meddler:"meta_title"`
	MetaDescription string     `meddler:"meta_description"`
	CreatedAt       *time.Time `meddler:"created_at"`
	CreatedBy       int64      `meddler:"created_by"`
	UpdatedAt       *time.Time `meddler:"updated_at"`
	UpdatedBy       int64      `meddler:"updated_by"`
	PublishedAt     *time.Time `meddler:"published_at"`
	PublishedBy     int64      `meddler:"published_by"`
	Hits            int64      `meddler:"-"`
	Category        string     `meddler:"-"`
}

type Posts []*Post

func (p Posts) Len() int {
	return len(p)
}

func (p Posts) Get(i int) *Post {
	return p[i]
}

func NewPost() *Post {
	return &Post{
		CreatedAt: utils.Now(),
	}
}

func (p *Post) TagString() string {
	tags, _ := GetTagsByPostId(p.Id)
	var tagString string
	for i, t := range tags {
		if i != len(tags)-1 {
			tagString += t.Name + ", "
		} else {
			tagString += t.Name
		}
	}
	return tagString
}

func (p *Post) Url() string {
	return "/" + p.Slug
}

func (p *Post) Tags() []*Tag {
	tags, err := GetTagsByPostId(p.Id)
	if err != nil {
		return nil
	}
	return tags
}

func (p *Post) Author() *User {
	user := &User{Id: p.CreatedBy}
	err := user.GetUserById()
	if err != nil {
		return ghostUser
	}
	return user
}

func (p *Post) Comments() []*Comment {
	comments, err := GetCommentByPostId(p.Id)
	if err != nil {
		return nil
	}
	return comments
}

func (p *Post) Summary() string {
	text := strings.Split(p.Markdown, "<!--more-->")[0]
	return utils.Markdown2Html(text)
}

func (p *Post) Excerpt() string {
	return utils.Html2Excerpt(p.Html, 255)
}

func (p *Post) Save(tags ...*Tag) error {
	p.Slug = strings.TrimLeft(p.Slug, "/")
	p.Slug = strings.TrimRight(p.Slug, "/")
	if p.Slug == "" {
		return fmt.Errorf("Slug can not be empty or root")
	}

	if p.IsPublished {
		p.PublishedAt = utils.Now()
		p.PublishedBy = p.CreatedBy
	}

	p.UpdatedAt = utils.Now()
	p.UpdatedBy = p.CreatedBy

	if p.Id == 0 {
		// Insert post
		if err := p.Insert(); err != nil {
			return err
		}
	} else {
		if err := p.Update(); err != nil {
			return err
		}
	}
	tagIds := make([]int64, 0)
	// Insert tags
	for _, t := range tags {
		t.CreatedAt = utils.Now()
		t.CreatedBy = p.CreatedBy
		t.Hidden = !p.IsPublished
		t.Save()
		tagIds = append(tagIds, t.Id)
	}
	// Delete old post-tag projections
	err := DeletePostTagsByPostId(p.Id)
	// Insert postTags
	if err != nil {
		return err
	}
	for _, tagId := range tagIds {
		err := InsertPostTag(p.Id, tagId)
		if err != nil {
			return err
		}
	}
	return DeleteOldTags()
}

func (p *Post) Insert() error {
	if !PostChangeSlug(p.Slug) {
		p.Slug = generateNewSlug(p.Slug, 1)
	}
	err := meddler.Insert(db, "posts", p)
	return err
}

func InsertPostTag(post_id int64, tag_id int64) error {
	writeDB, err := db.Begin()
	if err != nil {
		writeDB.Rollback()
		return err
	}
	_, err = writeDB.Exec(stmtInsertPostTag, nil, post_id, tag_id)
	if err != nil {
		writeDB.Rollback()
		return err
	}
	return writeDB.Commit()
}

func (p *Post) Update() error {
	currentPost := &Post{Id: p.Id}
	err := currentPost.GetPostById()
	if err != nil {
		return err
	}
	if p.Slug != currentPost.Slug && !PostChangeSlug(p.Slug) {
		p.Slug = generateNewSlug(p.Slug, 1)
	}
	err = meddler.Update(db, "posts", p)
	return err
}

func DeletePostTagsByPostId(post_id int64) error {
	writeDB, err := db.Begin()
	if err != nil {
		writeDB.Rollback()
		return err
	}
	_, err = writeDB.Exec(stmtDeletePostTagsByPostId, post_id)
	if err != nil {
		writeDB.Rollback()
		return err
	}
	return writeDB.Commit()
}

func DeletePostById(id int64) error {
	writeDB, err := db.Begin()
	if err != nil {
		writeDB.Rollback()
		return err
	}
	_, err = writeDB.Exec(stmtDeletePostById, id)
	if err != nil {
		writeDB.Rollback()
		return err
	}
	err = writeDB.Commit()
	if err != nil {
		return err
	}
	err = DeletePostTagsByPostId(id)
	if err != nil {
		return err
	}
	return DeleteOldTags()
}

func (post *Post) GetPostById() error {
	err := meddler.QueryRow(db, post, "SELECT * FROM posts WHERE id = ?", post.Id)
	return err
}

func (post *Post) GetPostBySlug(slug string) error {
	err := meddler.QueryRow(db, post, "SELECT * FROM posts WHERE slug = ?", slug)
	return err
}

func (posts *Posts) GetPostsByTag(tagId, page, size int64, onlyPublished bool) (*utils.Pager, error) {
	var (
		pager *utils.Pager
		count int64
	)
	row := db.QueryRow(stmtGetPostsCountByTag, tagId)
	err := row.Scan(&count)
	if err != nil {
		log.Printf("[Error]: ", err.Error())
		return nil, err
	}
	pager = utils.NewPager(page, size, count)
	var where string
	if onlyPublished {
		where = "published AND"
	}
	err = meddler.QueryAll(db, posts, fmt.Sprintf("SELECT * FROM posts WHERE %s id IN ( SELECT post_id FROM posts_tags WHERE tag_id = ? ) ORDER BY published_at DESC LIMIT ? OFFSET ?", where), tagId, size, pager.Begin-1)
	return pager, err
}

func (posts *Posts) GetAllPostsByTag(tagId int64) error {
	err := meddler.QueryAll(db, posts, "SELECT * FROM posts WHERE id IN ( SELECT post_id FROM posts_tags WHERE tag_id = ?) ORDER BY published_at DESC ", tagId)
	return err
}

func GetNumberOfPosts(isPage bool, published bool) (int64, error) {
	var count int64
	selector := postCountSelector.Copy()
	if published {
		selector.Where(`published`)
	}
	if isPage {
		selector.Where(`page = 1`)
	} else {
		selector.Where(`page = 0`)
	}
	var row *sql.Row

	row = db.QueryRow(selector.SQL())
	err := row.Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (posts *Posts) GetPostList(page, size int64, isPage bool, onlyPublished bool, orderBy string) (*utils.Pager, error) {
	var pager *utils.Pager
	count, err := GetNumberOfPosts(isPage, onlyPublished)
	pager = utils.NewPager(page, size, count)

	var where string
	if isPage {
		where = `page = 1`
	} else {
		where = `page = 0`
	}
	if onlyPublished {
		where = where + ` AND published`
	}

	err = meddler.QueryAll(db, posts, fmt.Sprintf("SELECT * FROM posts WHERE %s ORDER BY ? LIMIT ? OFFSET ?", where), orderBy, size, pager.Begin-1)
	return pager, err
}

func (posts *Posts) GetAllPostList(isPage bool, onlyPublished bool, orderBy string) error {
	var where string
	if isPage {
		where = `page = 1`
	} else {
		where = `page = 0`
	}
	if onlyPublished {
		where = where + `AND published`
	}
	err := meddler.QueryAll(db, posts, fmt.Sprintf("SELECT * FROM posts WHERE %s ORDER BY ?", where), orderBy)
	return err
}

func PostChangeSlug(slug string) bool {
	post := new(Post)
	err := post.GetPostBySlug(slug)
	if err != nil {
		return true
	}
	return false
}

func generateNewSlug(slug string, suffix int) string {
	newSlug := slug + "-" + strconv.Itoa(suffix)
	if !PostChangeSlug(newSlug) {
		return generateNewSlug(slug, suffix+1)
	}
	return newSlug
}
