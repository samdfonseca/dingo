package model

import (
	"time"

	"github.com/dinever/dingo/app/utils"
	"github.com/russross/meddler"
	"golang.org/x/crypto/bcrypt"
)

const stmtGetUserById = `SELECT * FROM users WHERE id = ?`
const stmtGetUserBySlug = `SELECT * FROM users WHERE slug = ?`
const stmtGetUserByName = `SELECT * FROM users WHERE name = ?`
const stmtGetUserByEmail = `SELECT * FROM users WHERE email = ?`
const stmtInsertRoleUser = `INSERT INTO roles_users (id, role_id, user_id) VALUES (?, ?, ?)`
const stmtGetUsersCountByEmail = `SELECT count(*) FROM users where email = ?`
const stmtGetNumberOfUsers = `SELECT COUNT(*) FROM users`

type User struct {
	Id             int64      `meddler:"id,pk"`
	Name           string     `meddler:"name"`
	Slug           string     `meddler:"slug"`
	HashedPassword string     `meddler:"password"`
	Email          string     `meddler:"email"`
	Image          string     `meddler:"image"`    // NULL
	Cover          string     `meddler:"cover"`    // NULL
	Bio            string     `meddler:"bio"`      // NULL
	Website        string     `meddler:"website"`  // NULL
	Location       string     `meddler:"location"` // NULL
	Accessibility  string     `meddler:"accessibility"`
	Status         string     `meddler:"status"`
	Language       string     `meddler:"language"`
	Lastlogin      *time.Time `meddler:"last_login"`
	CreatedAt      *time.Time `meddler:"created_at"`
	CreatedBy      int        `meddler:"created_by"`
	UpdatedAt      *time.Time `meddler:"updated_at"`
	UpdatedBy      int        `meddler:"updated_by"`
	Role           int        `meddler:"-"` //1 = Administrator, 2 = Editor, 3 = Author, 4 = Owner
}

var ghostUser = &User{Id: 0, Name: "Dingo User", Email: "example@example.com"}

func NewUser(email, name string) *User {
	return &User{
		Email:     email,
		Name:      name,
		CreatedAt: utils.Now(),
		UpdatedAt: utils.Now(),
	}
}

func (u *User) Create(password string) error {
	var err error
	u.HashedPassword, err = EncryptPassword(password)
	if err != nil {
		return err
	}
	u.CreatedBy = 0
	return u.Save()
}

func (u *User) Save() error {
	err := u.Insert()
	//	err = InsertRoleUser(u.Role, userId)
	//	if err != nil {
	//		return err
	//	}
	return err
}

func (u *User) Update() error {
	u.UpdatedAt = utils.Now()
	// TODO:
	//u.UpdatedBy = ...
	err := meddler.Update(db, "users", u)
	return err
}

func (u *User) ChangePassword(password string) error {
	var err error
	u.HashedPassword, err = EncryptPassword(password)
	if err != nil {
		return err
	}
	err = u.Update()
	return err
}

func EncryptPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func (u *User) CheckPassword(password string) bool {
	err := u.GetUserByEmail()
	if err != nil {
		return false
	}
	err = bcrypt.CompareHashAndPassword([]byte(u.HashedPassword), []byte(password))
	if err != nil {
		return false
	}
	return true
}

func (u *User) Avatar() string {
	return utils.Gravatar(u.Email, "150")
}

func (user *User) GetUserById() error {
	err := meddler.QueryRow(db, user, stmtGetUserById, user.Id)
	return err
}

func (user *User) GetUserBySlug() error {
	err := meddler.QueryRow(db, user, stmtGetUserBySlug, user.Slug)
	return err
}

func (user *User) GetUserByName() error {
	err := meddler.QueryRow(db, user, stmtGetUserByName, user.Name)
	return err
}

func (user *User) GetUserByEmail() error {
	err := meddler.QueryRow(db, user, stmtGetUserByEmail, user.Email)
	return err
}

func (u *User) Insert() error {
	err := meddler.Insert(db, "users", u)
	return err
}

func InsertRoleUser(role_id int, user_id int64) error {
	writeDB, err := db.Begin()
	if err != nil {
		writeDB.Rollback()
		return err
	}
	_, err = writeDB.Exec(stmtInsertRoleUser, nil, role_id, user_id)
	if err != nil {
		writeDB.Rollback()
		return err
	}
	return writeDB.Commit()
}

func (u User) UserEmailExist() bool {
	var count int64
	row := db.QueryRow(stmtGetUsersCountByEmail, u.Email)
	err := row.Scan(&count)
	if count > 0 || err != nil {
		return true
	}
	return false
}

func GetNumberOfUsers() (int64, error) {
	var count int64
	row := db.QueryRow(stmtGetNumberOfUsers)
	err := row.Scan(&count)
	return count, err
}
