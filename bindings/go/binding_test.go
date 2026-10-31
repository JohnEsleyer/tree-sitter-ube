package tree_sitter_ube_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-ube"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_ube.Language())
	if language == nil {
		t.Errorf("Error loading Ube grammar")
	}
}
