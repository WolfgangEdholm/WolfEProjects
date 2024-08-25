package utils

import (
	"fmt"
)

//const MaxNmWarnings = 20
var warnings []string = nil

// ClearWarnings initializes the warning stack.
func ClearWarnings() {
	warnings = nil
}

// PushWarnings adds a warning to the warning stack.
func PushWarnings(warning string) {
	fmt.Printf("Warning: %s\n", warning)
	warnings = append(warnings, warning)
}

// GetWarnings returns the current warning stack
func GetWarnings() []string {
	fmt.Printf("# Warmings=%d\n", len(warnings))
	for i := 0; i < len(warnings); i++ {
		fmt.Printf("Warming%d: >%s<\n", i, warnings[i])		
	}
	return warnings
}