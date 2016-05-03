package model

import (
	"database/sql"
	"github.com/dinever/dingo/app/utils"
	"github.com/twinj/uuid"
	"golang.org/x/crypto/bcrypt"
	"time"
)

type User struct {
	Id        int64
	Name      string
	Slug      string
	Avatar    string
	Email     string
	Image     string // NULL
	Cover     string // NULL
	Bio       string // NULL
	Website   string // NULL
	Location  string // NULL
	Role      int    //1 = Administrator, 2 = Editor, 3 = Author, 4 = Owner
	CreatedAt *time.Time
	UpdatedAt *time.Time
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
	hashedPassword, err := EncryptPassword(password)
	if err != nil {
		return err
	}
	return u.Save(hashedPassword, 0)
}

func (u *User) Save(hashedPassword string, createdBy int64) error {
	err := u.Insert(hashedPassword, createdBy)
	if err != nil {
		return err
	}
	//	err = InsertRoleUser(u.Role, userId)
	//	if err != nil {
	//		return err
	//	}
	return nil
}

func (u *User) Update() error {
	writeDB, err := db.Begin()
	if err != nil {
		writeDB.Rollback()
		return err
	}
	u.UpdatedAt = utils.Now()
	_, err = writeDB.Exec(stmtUpdateUser, u.Name, u.Slug, u.Email, u.Image, u.Cover, u.Bio, u.Website, u.Location, u.UpdatedAt, u.Id, u.Id)
	if err != nil {
		writeDB.Rollback()
		return err
	}
	return writeDB.Commit()
}

func (u *User) ChangePassword(password string) error {
	hashedPassword, err := EncryptPassword(password)
	if err != nil {
		return err
	}
	WriteDB, err := db.Begin()
	if err != nil {
		WriteDB.Rollback()
		return err
	}
	_, err = db.Exec("UPDATE users SET password = ? WHERE id = ?", hashedPassword, u.Id)
	if err != nil {
		WriteDB.Rollback()
		return err
	}
	return WriteDB.Commit()
}

func EncryptPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func (u *User) CheckPassword(password string) bool {
	hashedPassword, err := GetHashedPasswordForUser(string(u.Email))
	if err != nil {
		return false
	}
	err = bcrypt.CompareHashAndPassword(hashedPassword, []byte(password))
	if err != nil {
		return false
	}
	return true
}

func scanUser(user *User, row *sql.Row) error {
	var (
		nullImage    sql.NullString
		nullCover    sql.NullString
		nullBio      sql.NullString
		nullWebsite  sql.NullString
		nullLocation sql.NullString
	)
	err := row.Scan(&user.Id, &user.Name, &user.Slug, &user.Email, &nullImage, &nullCover, &nullBio, &nullWebsite, &nullLocation)
	user.Avatar = utils.Gravatar(user.Email, "150")
	user.Image = nullImage.String
	user.Cover = nullCover.String
	user.Bio = nullBio.String
	user.Website = nullWebsite.String
	user.Location = nullLocation.String
	return err
}

func GetHashedPasswordForUser(email string) ([]byte, error) {
	var hashedPassword []byte
	row := db.QueryRow(stmtGetHashedPasswordByEmail, email)
	err := row.Scan(&hashedPassword)
	if err != nil {
		return []byte{}, err
	}
	return hashedPassword, nil
}

func GetUserById(id int64) (*User, error) {
	user := new(User)
	// Get user
	row := db.QueryRow(stmtGetUserById, id)
	err := scanUser(user, row)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func GetUserBySlug(slug string) (*User, error) {
	user := new(User)
	// Get user
	row := db.QueryRow(stmtGetUserBySlug, slug)
	err := scanUser(user, row)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func GetUserByName(name string) (*User, error) {
	user := new(User)
	// Get user
	row := db.QueryRow(stmtGetUserByName, name)
	err := scanUser(user, row)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func GetUserByEmail(email string) (*User, error) {
	user := new(User)
	// Get user
	row := db.QueryRow(stmtGetUserByEmail, email)
	err := scanUser(user, row)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (u *User) Insert(password string, created_by int64) error {
	writeDB, err := db.Begin()
	if err != nil {
		writeDB.Rollback()
		return err
	}
	result, err := writeDB.Exec(stmtInsertUser, nil, uuid.Formatter(uuid.NewV4(), uuid.CleanHyphen), u.Name, u.Slug, password, u.Email, u.Image, u.Cover, u.CreatedAt, created_by, u.UpdatedAt, created_by)
	if err != nil {
		writeDB.Rollback()
		return err
	}
	userId, err := result.LastInsertId()
	if err != nil {
		writeDB.Rollback()
		return err
	}
	if err := writeDB.Commit(); err != nil {
		return err
	}
	u.Id = userId
	return nil
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

func UserEmailExist(email string) bool {
	var count int64
	row := db.QueryRow(stmtGetUsersCountByEmail, email)
	err := row.Scan(&count)
	if count > 0 || err != nil {
		return true
	}
	return false
}

func GetNumberOfUsers() (int64, error) {
	var count int64
	row := db.QueryRow("SELECT COUNT(*) FROM users")
	err := row.Scan(&count)
	return count, err
}
