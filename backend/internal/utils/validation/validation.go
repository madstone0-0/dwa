package validation

import (
	"backend/internal/logging"
	"errors"
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

var (
	validate *validator.Validate = validator.New(validator.WithRequiredStructEnabled())
)

// Define this type somewhere in your package
type ValidationErrorList struct {
	Errors []string
}

func (v *ValidationErrorList) Error() string {
	return strings.Join(v.Errors, "; ")
}

func (v *ValidationErrorList) Unwrap() []error {
	result := make([]error, len(v.Errors))
	for i, msg := range v.Errors {
		result[i] = errors.New(msg)
	}
	return result
}

func ValidateStruct(s any) error {
	var errs error

	err := validate.Struct(s)
	logging.Infof("Validation errors: %v", err)
	if err != nil {
		var invalidValidationError *validator.InvalidValidationError
		if errors.As(err, &invalidValidationError) {
			return invalidValidationError
		}

		var validationErrors validator.ValidationErrors
		if errors.As(err, &validationErrors) {
			logging.Infof("Validation errors: %v", validationErrors)
			var errMsgs []string
			for _, fieldError := range validationErrors {
				errMsgs = append(errMsgs, fmt.Sprintf("Field '%s' failed validation with tag '%s'", fieldError.Field(), fieldError.Tag()))
			}

			errs = &ValidationErrorList{Errors: errMsgs}
		}
	}

	return errs
}

func ValidateVar(v any, tags string) error {
	errs := validate.Var(v, tags)

	if errs != nil {
		return errs
	}
	return nil
}
