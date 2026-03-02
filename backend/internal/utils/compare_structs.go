package utils

import (
	"fmt"
	"reflect"
	"time"
)

func IsEqualStructs(a, b interface{}) (bool, []string, error) {
	if a == nil || b == nil {
		return a == b, nil, nil
	}

	oldVal := reflect.ValueOf(a)
	newVal := reflect.ValueOf(b)

	// Разыменовываем указатели один раз
	for oldVal.Kind() == reflect.Ptr {
		oldVal = oldVal.Elem()
	}
	for newVal.Kind() == reflect.Ptr {
		newVal = newVal.Elem()
	}

	// Проверяем, что оба значения — структуры и одного типа
	if oldVal.Kind() != reflect.Struct || newVal.Kind() != reflect.Struct {
		return false, nil, fmt.Errorf("both arguments must be structs, got %s and %s", oldVal.Kind(), newVal.Kind())
	}
	if oldVal.Type() != newVal.Type() {
		return false, nil, fmt.Errorf("cannot compare different struct types: %s and %s", oldVal.Type(), newVal.Type())
	}

	var changedFields []string
	structType := oldVal.Type()
	numFields := oldVal.NumField()

	for i := range numFields {
		fieldMeta := structType.Field(i)

		// Пропускаем неэкспортируемые поля (те, что с маленькой буквы)
		if fieldMeta.PkgPath != "" {
			continue
		}

		fOld := oldVal.Field(i)
		fNew := newVal.Field(i) // Теперь мы уверены, что индексы совпадают, так как типы идентичны

		// Оптимизация: используем DeepEqual только если значения не сравнимы напрямую
		// или если это сложные типы (slice, map, struct)
		if !fOld.CanInterface() {
			continue
		}

		valOld := fOld.Interface()
		valNew := fNew.Interface()

		// 1. Специальная обработка для time.Time
		if tOld, ok := valOld.(time.Time); ok {
			tNew, ok := valNew.(time.Time)
			if ok {
				// Метод Equal сравнивает именно моменты времени,
				// игнорируя локацию и монотонный таймер
				if !tOld.Equal(tNew) {
					changedFields = append(changedFields, fieldMeta.Name)
				}
				continue // Переходим к следующему полю
			}
		}

		// 2. Для остальных типов используем DeepEqual
		if !reflect.DeepEqual(valOld, valNew) {
			fieldName := fieldMeta.Name
			// // Пытаемся взять имя из json тега, если он есть (полезно для фронтенда)
			// fieldName := fieldMeta.Tag.Get("json")
			// if fieldName == "" || fieldName == "-" {
			// 	fieldName = fieldMeta.Name
			// }
			changedFields = append(changedFields, fieldName)
		}
	}

	return len(changedFields) == 0, changedFields, nil
}

// func IsEqualStructs(a, b interface{}) (bool, []string, error) {
// 	var changedFields []string
// 	oldValue := reflect.ValueOf(a)
// 	newValue := reflect.ValueOf(b)

// 	if oldValue.Kind() == reflect.Ptr {
// 		oldValue = oldValue.Elem() // Dereference the pointer
// 	}
// 	if newValue.Kind() == reflect.Ptr {
// 		newValue = newValue.Elem() // Dereference the pointer
// 	}

// 	if oldValue.Kind() != reflect.Struct || newValue.Kind() != reflect.Struct {
// 		return false, nil, fmt.Errorf("variables must be structs")
// 	}

// 	// Получаем тип обеих структур
// 	typeOfStruct := oldValue.Type()

// 	// Итерируемся по полям
// 	for i := 0; i < oldValue.NumField(); i++ {
// 		fieldOldValue := oldValue.Field(i)
// 		fieldName := typeOfStruct.Field(i).Name
// 		fieldNewValue := newValue.FieldByName(fieldName)

// 		if !fieldNewValue.IsValid() {
// 			continue
// 		}

// 		// Сравниваем значения полей. Для простых типов можно использовать прямое сравнение.
// 		// Для более сложных типов (слайсы, карты) может потребоваться reflect.DeepEqual.
// 		if !reflect.DeepEqual(fieldOldValue.Interface(), fieldNewValue.Interface()) {
// 			changedFields = append(changedFields, fieldName)
// 		}
// 	}

// 	return len(changedFields) == 0, changedFields, nil
// }
