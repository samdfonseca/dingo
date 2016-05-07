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
	Tags            []*Tag     `meddler:"-"`
}

func NewPost() *Post {
	return &Post{
		CreatedAt: utils.Now(),
	}
}

func (p *Post) TagString() string {
	var tagString string
	for i, t := range p.Tags {
		if i != len(p.Tags)-1 {
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

func (p *Post) Summary() string {
	text := strings.Split(p.Markdown, "<!--more-->")[0]
	return utils.Markdown2Html(text)
}

func (p *Post) Excerpt() string {
	return utils.Html2Excerpt(p.Html, 255)
}

func (p *Post) Save() error {
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
	for _, t := range p.Tags {
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
	currentPost, err := GetPostById(p.Id)
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

func GetPostById(id int64) (*Post, error) {
	// Get post
	post := new(Post)
	//TODO: error
	err := meddler.QueryRow(db, post, "select * from posts where id = ?", id)
	paddingPostData(post)
	return post, err
}

func GetPostBySlug(slug string) (*Post, error) {
	// Get post
	post := new(Post)
	err := meddler.QueryRow(db, post, "select * from posts where slug = ?", slug)
	paddingPostData(post)
	return post, err
}

func paddingPostData(post *Post) error {
	// Evaluate status
	var err error
	// Get tags
	post.Tags, err = GetTagsByPostId(post.Id)
	if err != nil {
		return err
	}
	return nil
}

func GetPostsByTag(tagId, page, size int64, onlyPublished bool, orderBy string) ([]*Post, *utils.Pager, error) {
	var (
		pager *utils.Pager
		count int64
	)
	row := db.QueryRow(stmtGetPostsCountByTag, tagId)
	err := row.Scan(&count)
	if err != nil {
		log.Printf("[Error]: ", err.Error())
		return nil, nil, err
	}
	pager = utils.NewPager(page, size, count)
	rows, err := db.Query(stmtGetPostsByTag, tagId, size, pager.Begin-1)
	defer rows.Close()
	if err != nil {
		log.Printf("[Error]: ", err.Error())
		return nil, nil, err
	}
	posts, err := extractPosts(rows)
	if err != nil {
		return nil, nil, err
	}
	return posts, pager, nil
}

func GetAllPostsByTag(tagId int64) ([]*Post, error) {
	// Get posts
	rows, err := db.Query(stmtGetAllPostsByTag, tagId)
	defer rows.Close()
	if err != nil {
		log.Printf("[Error] Can not get posts from tag: %v", err.Error())
		return nil, err
	}
	posts, err := extractPosts(rows)
	if err != nil {
		log.Printf("[Error] Can not scan posts from tag: %v", err.Error())
		return nil, err
	}
	return posts, nil
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

func GetPostList(page, size int64, isPage bool, onlyPublished bool, orderBy string) ([]*Post, *utils.Pager, error) {
	var pager *utils.Pager
	count, err := GetNumberOfPosts(isPage, onlyPublished)
	pager = utils.NewPager(page, size, count)
	selector := postSelector.Copy()
	if onlyPublished {
		selector.Where(`status = "published"`)
	}
	if isPage {
		selector.Where(`page = 1`)
	} else {
		selector.Where(`page = 0`)
	}
	selector.OrderBy(orderBy)
	// Get posts
	rows, err := db.Query(selector.Limit(`?`).Offset(`?`).SQL(), size, pager.Begin-1)
	defer rows.Close()
	if err != nil {
		log.Printf("[Error]: ", err.Error())
		return nil, nil, err
	}
	posts, err := extractPosts(rows)
	if err != nil {
		return nil, nil, err
	}
	return posts, pager, nil
}

func GetAllPostList(isPage bool, onlyPublished bool, orderBy string) ([]*Post, error) {
	selector := postSelector.Copy()
	if onlyPublished {
		selector.Where(`status = "published"`)
	}
	if isPage {
		selector.Where(`page = 1`)
	} else {
		selector.Where(`page = 0`)
	}
	selector.OrderBy(orderBy)
	// Get posts
	rows, err := db.Query(selector.SQL())
	defer rows.Close()
	if err != nil {
		log.Printf("[Error]: ", err.Error())
		return nil, err
	}
	posts, err := extractPosts(rows)
	if err != nil {
		return nil, err
	}

	return posts, nil
}

func extractPosts(rows *sql.Rows) ([]*Post, error) {
	posts := make([]*Post, 0)
	if err := meddler.ScanAll(rows, &posts); err != nil {
		return nil, err
	}
	return posts, nil
}

func PostChangeSlug(slug string) bool {
	_, err := GetPostBySlug(slug)
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
