package model

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/dinever/dingo/app/utils"
)

type Setting struct {
	Id        int
	Key       string
	Value     string
	Type      string // general, content, navigation, custom
	CreatedAt *time.Time
	CreatedBy int64
}

type Navigator struct {
	Label string `json:"label"`
	Url   string `json:"url"`
}

func GetNavigators() []*Navigator {
	var navs []*Navigator
	navStr := GetSettingValue("navigation")
	json.Unmarshal([]byte(navStr), &navs)
	return navs
}

func SetNavigators(labels, urls []string) error {
	var navs []*Navigator
	for i, l := range labels {
		if len(l) < 1 {
			continue
		}
		navs = append(navs, &Navigator{l, urls[i]})
	}
	navStr, err := json.Marshal(navs)
	if err != nil {
		return err
	}

	s := NewSetting("navigation", string(navStr), "navigation")
	return s.Save()
}

func GetSetting(k string) (*Setting, error) {
	row := db.QueryRow(`SELECT id, key, value, type, created_at, created_by from settings where key = ?`, k)
	s := new(Setting)
	err := scanSetting(row, s)
	return s, err
}

func GetSettingValue(k string) string {
	row := db.QueryRow(`SELECT id, key, value, type, created_at, created_by from settings where key = ?`, k)
	s := new(Setting)
	scanSetting(row, s)
	return s.Value
}

func scanSetting(row Row, setting *Setting) error {
	var nullValue sql.NullString
	err := row.Scan(&setting.Id, &setting.Key, &nullValue, &setting.Type, &setting.CreatedAt, &setting.CreatedBy)
	if err != nil {
		return err
	}
	setting.Value = nullValue.String
	return nil
}

func GetCustomSettings() []*Setting {
	return GetSettings("custom")
}

func GetSettings(t string) []*Setting {
	settings := make([]*Setting, 0)
	rows, err := db.Query(`SELECT id, key, value, type, created_at, created_by from settings where type = ?`, t)
	if err != nil {
		return settings
	}
	defer rows.Close()
	if err != nil {
		return settings
	}
	for rows.Next() {
		setting := new(Setting)
		err := scanSetting(rows, setting)
		if err != nil {
			return settings
		}
		settings = append(settings, setting)
	}
	return settings
}

func (s *Setting) Save() error {
	writeDB, err := db.Begin()
	if err != nil {
		writeDB.Rollback()
		return err
	}
	_, err = db.Exec(`INSERT OR REPLACE INTO settings (id, key, value, type, created_at, created_by) VALUES ((SELECT id FROM settings WHERE key = ?), ?, ?, ?, ?, ?)`, s.Key, s.Key, s.Value, s.Type, s.CreatedAt, s.CreatedBy)
	if err != nil {
		writeDB.Rollback()
		return err
	}
	return writeDB.Commit()
}

func NewSetting(k, v, t string) *Setting {
	return &Setting{
		Key:       k,
		Value:     v,
		Type:      t,
		CreatedAt: utils.Now(),
	}
}

func SetSettingIfNotExists(k, v, t string) error {
	_, err := GetSetting(k)
	if err != nil {
		s := NewSetting(k, v, t)
		return s.Save()
	}
	return err
}
