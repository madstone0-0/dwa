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

	// 	user=jack password=secret host=pg.example.com port=5432 dbname=mydb sslmode=verify-ca pool_max_conns=10 pool_max_conn_lifetime=1h30m
	return fmt.Sprintf(
		"user=%s password=%s host=%s port=%s dbname=%s",
		d.Username,
		d.Password,
		d.Hostname,
		d.Port,
		d.Name,
	), nil
}
