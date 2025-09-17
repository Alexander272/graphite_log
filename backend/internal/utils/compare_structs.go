package utils

import (
	"fmt"
	"reflect"
)

func IsEqualStructs(a, b interface{}) (bool, []string, error) {
	var changedFields []string
	oldValue := reflect.ValueOf(a)
	newValue := reflect.ValueOf(b)

	if oldValue.Kind() == reflect.Ptr {
		oldValue = oldValue.Elem() // Dereference the pointer
	}
	if newValue.Kind() == reflect.Ptr {
		newValue = newValue.Elem() // Dereference the pointer
	}

	if oldValue.Kind() != reflect.Struct || newValue.Kind() != reflect.Struct {
		return false, nil, fmt.Errorf("variables must be structs")
	}

	// Получаем тип обеих структур
	typeOfStruct := oldValue.Type()

	// Итерируемся по полям
	for i := 0; i < oldValue.NumField(); i++ {
		fieldOldValue := oldValue.Field(i)
		fieldName := typeOfStruct.Field(i).Name
		fieldNewValue := newValue.FieldByName(fieldName)

		if !fieldNewValue.IsValid() {
			continue
		}

		// Сравниваем значения полей. Для простых типов можно использовать прямое сравнение.
		// Для более сложных типов (слайсы, карты) может потребоваться reflect.DeepEqual.
		if !reflect.DeepEqual(fieldOldValue.Interface(), fieldNewValue.Interface()) {
			changedFields = append(changedFields, fieldName)
		}
	}

	return len(changedFields) == 0, changedFields, nil
}
