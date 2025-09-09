package models

import "errors"

var (
	ErrNoRows        = errors.New("row not found")
	ErrAlreadyExists = errors.New("already exists")

	ErrWasIssued = errors.New("graphite was issued")

	ErrSessionEmpty = errors.New("user session not found")

	ErrNotValid = errors.New("data is not valid")
)
