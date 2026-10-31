# tree-sitter-ube

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Official [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for the **Ube** programming language.

Ube is a sweet, grounded systems language combining Go-like ergonomics with C-like performance, regional memory bump arenas, and zero garbage collection.

---

## 📦 Features & Syntax Coverage

This grammar provides complete AST parsing for all Ube language constructs:

- **Declarations**:
  - Functions, receiver methods (`fn (mut c Counter) bump(...)`), generic functions (`fn id[T](x: T) -> T`)
  - Struct declarations with public/mutable fields
  - Tagged enums with payload variants
  - Traits and trait constraints (`[T: Printable]`)
  - C FFI foreign declarations (`extern fn puts(...) -> i32`)
  - Imports (`import "file.ube"`)
- **Control Flow**:
  - `if`, `else if`, `else`, `if let` unwrapping
  - `while`, `while let` loops
  - `for .. in` iteration over slices, arrays, and ranges
  - Exhaustive pattern matching (`match`)
  - Channel multiplexing (`select { case ... default: ... }`)
- **Memory & Safety**:
  - Regional memory bump arenas (`arena { ... }`)
  - Memory promotion (`promote(...)`)
  - Concurrency primitives (`spawn worker(...)`)
  - Deferred cleanup (`defer cleanup()`)
  - Unsafe blocks (`unsafe { ... }`)
  - Disjoint mutable loans (`mut x`)
- **Types & Expressions**:
  - Primitives: `i8`..`i64`, `u8`..`u64`, `f32`, `f64`, `bool`, `string`, `StringBuilder`, `void`
  - Dynamic slices (`[]T`) and fixed-size arrays (`[N]T`)
  - Channels (`Chan[T]`), generational pools (`Pool[T]`), handles (`Handle[T]`)
  - Optionals (`T?`), Results (`T ! E`), try operator (`?`), and fallback (`or_else`)
  - String interpolation format strings (`f"count: {x}"`)
  - Binary and compound assignment operators

---

## 🛠️ Development & Building

### Prerequisites

- Node.js (18+)
- Tree-sitter CLI (`npm install -g tree-sitter-cli` or via `npx`)
- Standard C compiler (`gcc` or `clang`)

### Generate Parser C Code

```sh
# Install dependencies
npm install

# Compile grammar.js into src/parser.c
npx tree-sitter generate
```

This generates `src/parser.c` and the required C headers under `src/tree_sitter/`.

### Run Syntax Tests

```sh
npx tree-sitter test
```

### Parse a Source File Interactively

```sh
npx tree-sitter parse path/to/file.ube
```

---

## 💻 Editor Integration

### Zed

This grammar powers the official [Ube Zed Extension](https://github.com/JohnEsleyer/ube/tree/main/editors/zed). In your Zed `extension.toml`:

```toml
[grammars.ube]
repository = "https://github.com/johnesleyer/tree-sitter-ube"
rev = "<commit-hash>"
```

### Neovim (`nvim-treesitter`)

Add `tree-sitter-ube` to your Neovim configuration:

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()

parser_config.ube = {
  install_info = {
    url = "https://github.com/johnesleyer/tree-sitter-ube",
    files = { "src/parser.c" },
    branch = "main",
  },
  filetype = "ube",
}
```

### Helix

Add the grammar to `languages.toml`:

```toml
[[grammar]]
name = "ube"
source = { git = "https://github.com/johnesleyer/tree-sitter-ube", rev = "main" }

[[language]]
name = "ube"
scope = "source.ube"
file-types = ["ube"]
roots = ["main.ube"]
comment-token = "//"
indent = { tab-width = 4, unit = "    " }
grammar = "ube"
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
