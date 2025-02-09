package config

import "fmt"

type Database struct {
	Name     string
	Username string
	Password string
	Hostname string
	Port     string
}

func (d *Database) isValid() bool {
	return d.Name != "" && d.Username != "" && d.Hostname != "" && d.Port != ""
}

func (d *Database) DSN() (string, error) {
	if d == nil {
		return "", nil
	}

	if !d.isValid() {
		return "", nil
	}

	return fmt.Sprintf(
		"user=%s password=%s host=%s port=%s dbname=%s",
		d.Username,
		d.Password,
		d.Hostname,
		d.Port,
		d.Name,
	), nil
}
