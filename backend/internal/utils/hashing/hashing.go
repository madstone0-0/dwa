package hashing

import (
	"golang.org/x/crypto/bcrypt"
)

const ROUNDS int = 10

func Hash(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), ROUNDS)
	return string(bytes), err
}

func Compare(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
