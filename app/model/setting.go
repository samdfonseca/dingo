package model

import (
	"encoding/json"
	"time"

	"github.com/dingoblog/dingo/app/utils"
	"github.com/russross/meddler"
)

const stmtGetSetting = `SELECT * FROM settings WHERE key = ?`
const stmtSaveSelect = `SELECT id FROM settings WHERE KEY = ?`
const stmtGetSettingsByType = `SELECT * FROM settings WHERE type = ?`

type Setting struct {
	Id        int        `meddler:"id,pk"`
	Key       string     `meddler:"key"`
	Value     string     `meddler:"value"`
	Type      string     `meddler:"type"` // general, content, navigation, custom
	CreatedAt *time.Time `meddler:"created_at"`
	CreatedBy int64      `meddler:"created_by"`
	UpdatedAt *time.Time `meddler:"updated_at"`
	UpdatedBy int64      `meddler:"updated_by"`
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

func (setting *Setting) GetSetting() error {
	err := meddler.QueryRow(db, setting, stmtGetSetting, setting.Key)
	return err
}

func GetSettingValue(k string) string {
	// TODO: error handling
	setting := &Setting{Key: k}
	_ = setting.GetSetting()
	return setting.Value
}

func GetCustomSettings() *Settings {
	return GetSettingsByType("custom")
}

type Settings []*Setting

func GetSettingsByType(t string) *Settings {
	settings := new(Settings)
	err := meddler.QueryAll(db, settings, stmtGetSettingsByType, t)
	if err != nil {
		return nil
	}
	return settings
}

func (s *Setting) Save() error {
	var id int
	row := db.QueryRow(stmtSaveSelect, s.Key)
	if err := row.Scan(&id); err != nil {
		s.Id = 0
	} else {
		s.Id = id
	}
	err := meddler.Save(db, "settings", s)
	return err
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
	s := NewSetting(k, v, t)
	err := s.GetSetting()
	if err != nil {
		return s.Save()
	}
	return err
}
