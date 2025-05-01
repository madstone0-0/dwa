package validation

import (
	"backend/internal/logging"
	"errors"
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

// Initialize a validator instance with struct-level validation enabled.
var (
	validate *validator.Validate = validator.New(validator.WithRequiredStructEnabled())
)

// ValidationErrorList is a custom error type that holds multiple validation error messages.
type ValidationErrorList struct {
	Errors []string // Slice to store individual error messages
}

// Error implements the error interface, returning all validation errors as a single string.
func (v *ValidationErrorList) Error() string {
	return strings.Join(v.Errors, "; ")
}

// Unwrap returns the individual error messages wrapped as Go error types.
func (v *ValidationErrorList) Unwrap() []error {
	result := make([]error, len(v.Errors))
	for i, msg := range v.Errors {
		result[i] = errors.New(msg)
	}
	return result
}

// ValidateStruct validates a struct's fields based on the validation tags.
// It returns a list of field-specific errors if validation fails.
func ValidateStruct(s any) error {
	var errs error

	// Validate the struct
	err := validate.Struct(s)
	logging.Infof("Validation errors: %v", err)

	// Check for invalid struct validation (e.g., passing a non-struct)
	if err != nil {
		var invalidValidationError *validator.InvalidValidationError
		if errors.As(err, &invalidValidationError) {
			return invalidValidationError
		}

		// Handle actual validation errors (e.g., missing required fields)
		var validationErrors validator.ValidationErrors
		if errors.As(err, &validationErrors) {
			logging.Infof("Validation errors: %v", validationErrors)

			var errMsgs []string
			for _, fieldError := range validationErrors {
				// Create a readable error message for each field
				errMsgs = append(errMsgs, fmt.Sprintf("Field '%s' failed validation with tag '%s'", fieldError.Field(), fieldError.Tag()))
			}

			// Wrap messages into a custom error list
			errs = &ValidationErrorList{Errors: errMsgs}
		}
	}

	return errs
}

// ValidateVar validates a single variable based on provided validation tags.
// Returns an error if the value does not meet the validation rules.
func ValidateVar(v any, tags string) error {
	errs := validate.Var(v, tags)

	if errs != nil {
		return errs
	}
	return nil
}
