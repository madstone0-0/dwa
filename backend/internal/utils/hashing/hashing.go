package hashing

import (
	"golang.org/x/crypto/bcrypt"
)

const ROUNDS int = 10

type Hasher interface {
	Hash(password string) (string, error)
	Compare(password, hash string) bool
}

type BcryptHash struct{}

func bcryptHash(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), ROUNDS)
	return string(bytes), err
}

func bcryptCompare(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func (b BcryptHash) Hash(password string) (string, error) {
	return bcryptHash(password)
}

func (b BcryptHash) Compare(password, hash string) bool {
	return bcryptCompare(password, hash)
}
