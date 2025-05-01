package hashing

import (
	"golang.org/x/crypto/bcrypt"
)

// ROUNDS defines the cost (complexity) of the hashing process.
// Higher values increase security but take more processing time.
const ROUNDS int = 10

// Hasher interface defines methods for hashing and comparing passwords.
type Hasher interface {
	Hash(password string) (string, error)        // Generate a hashed password
	Compare(password, hash string) bool          // Compare plain password with hashed one
}

// BcryptHash is a struct that implements the Hasher interface using bcrypt.
type BcryptHash struct{}

// bcryptHash hashes a plain password using bcrypt with the defined number of rounds.
func bcryptHash(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), ROUNDS)
	return string(bytes), err
}

// bcryptCompare compares a plain password with a hashed password.
// Returns true if they match, false otherwise.
func bcryptCompare(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// Hash implements the Hasher interface using bcrypt.
func (b BcryptHash) Hash(password string) (string, error) {
	return bcryptHash(password)
}

// Compare implements the Hasher interface using bcrypt.
func (b BcryptHash) Compare(password, hash string) bool {
	return bcryptCompare(password, hash)
}
