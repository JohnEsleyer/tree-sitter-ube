module.exports = grammar({
  name: 'ube',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$.type_arguments, $.index_expression],
    [$._type, $._expression],
    [$.call_expression, $.generic_type],
    [$.struct_initializer, $._expression],
  ],

  rules: {
    source_file: $ => repeat($._declaration),

    _declaration: $ => choice(
      $.import_declaration,
      $.struct_declaration,
      $.enum_declaration,
      $.trait_declaration,
      $.function_declaration,
      $.extern_function_declaration,
    ),

    comment: $ => token(seq('//', /.*/)),

    // Imports
    import_declaration: $ => seq(
      'import',
      field('path', $.string_literal),
    ),

    // Modifiers
    visibility: $ => 'pub',
    mutability: $ => 'mut',

    // Struct Declaration
    struct_declaration: $ => seq(
      optional($.visibility),
      'struct',
      field('name', $.type_identifier),
      optional(field('type_parameters', $.type_parameters)),
      field('body', $.struct_body),
    ),

    struct_body: $ => seq(
      '{',
      repeat(seq($.field_declaration, optional(','))),
      '}',
    ),

    field_declaration: $ => seq(
      optional($.visibility),
      optional($.mutability),
      field('name', $.identifier),
      ':',
      field('type', $._type),
    ),

    // Enum Declaration
    enum_declaration: $ => seq(
      optional($.visibility),
      'enum',
      field('name', $.type_identifier),
      field('body', $.enum_body),
    ),

    enum_body: $ => seq(
      '{',
      repeat(seq($.variant_declaration, optional(','))),
      '}',
    ),

    variant_declaration: $ => seq(
      field('name', $.identifier),
      optional(seq(
        '(',
        sepBy(',', $._type),
        optional(','),
        ')',
      )),
    ),

    // Trait Declaration
    trait_declaration: $ => seq(
      optional($.visibility),
      'trait',
      field('name', $.type_identifier),
      field('body', $.trait_body),
    ),

    trait_body: $ => seq(
      '{',
      repeat($.trait_method_declaration),
      '}',
    ),

    trait_method_declaration: $ => seq(
      'fn',
      field('name', $.identifier),
      field('parameters', $.parameter_list),
      optional(seq('->', field('return_type', $._type))),
    ),

    // Function Declaration
    function_declaration: $ => seq(
      optional($.visibility),
      'fn',
      optional(field('receiver', $.receiver)),
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      field('parameters', $.parameter_list),
      optional(seq('->', field('return_type', $._type))),
      field('body', $.block),
    ),

    receiver: $ => seq(
      '(',
      optional($.mutability),
      field('name', $.identifier),
      field('type', $._type),
      ')',
    ),

    extern_function_declaration: $ => seq(
      optional($.visibility),
      'extern',
      'fn',
      field('name', $.identifier),
      field('parameters', $.parameter_list),
      optional(seq('->', field('return_type', $._type))),
    ),

    type_parameters: $ => seq(
      '[',
      sepBy1(',', $.type_parameter),
      optional(','),
      ']',
    ),

    type_parameter: $ => seq(
      field('name', $.type_identifier),
      optional(seq(':', field('constraint', $.type_identifier))),
    ),

    parameter_list: $ => seq(
      '(',
      sepBy(',', $.parameter),
      optional(','),
      ')',
    ),

    parameter: $ => seq(
      optional($.mutability),
      field('name', $.identifier),
      ':',
      field('type', $._type),
    ),

    // Types
    _type: $ => choice(
      $.primitive_type,
      $.type_identifier,
      $.generic_type,
      $.slice_type,
      $.array_type,
      $.pointer_type,
      $.optional_type,
      $.result_type,
    ),

    primitive_type: $ => choice(
      'i8', 'i16', 'i32', 'i64',
      'u8', 'u16', 'u32', 'u64',
      'f32', 'f64',
      'bool', 'string', 'StringBuilder', 'void',
    ),

    generic_type: $ => prec(1, seq(
      field('base', choice($.type_identifier, 'Chan', 'Pool', 'Handle')),
      '[',
      sepBy1(',', $._type),
      optional(','),
      ']',
    )),

    slice_type: $ => seq(
      '[]',
      field('element', $._type),
    ),

    array_type: $ => seq(
      '[',
      field('size', $.number_literal),
      ']',
      field('element', $._type),
    ),

    pointer_type: $ => seq(
      '*',
      field('base', $._type),
    ),

    optional_type: $ => prec(2, seq(
      field('inner', $._type),
      '?',
    )),

    result_type: $ => prec.left(2, seq(
      field('ok', $._type),
      '!',
      field('err', $._type),
    )),

    // Statements
    _statement: $ => choice(
      $.let_statement,
      $.assignment_statement,
      $.return_statement,
      $.if_statement,
      $.while_statement,
      $.for_statement,
      $.match_statement,
      $.select_statement,
      $.arena_statement,
      $.unsafe_statement,
      $.defer_statement,
      $.spawn_statement,
      $.loop_control_statement,
      $.expression_statement,
      $.block,
    ),

    block: $ => seq(
      '{',
      repeat($._statement),
      '}',
    ),

    let_statement: $ => seq(
      'let',
      optional($.mutability),
      field('name', $.identifier),
      optional(seq(':', field('type', $._type))),
      '=',
      field('value', $._expression),
    ),

    assignment_statement: $ => seq(
      field('left', $._expression),
      field('operator', choice(
        '=', '+=', '-=', '*=', '/=', '%=',
        '&=', '|=', '^=', '<<=', '>>=',
      )),
      field('right', $._expression),
    ),

    return_statement: $ => seq(
      'return',
      optional($._expression),
    ),

    if_statement: $ => seq(
      'if',
      choice(
        seq('let', field('pattern', $.identifier), '=', field('value', $._expression)),
        field('condition', $._expression),
      ),
      field('consequence', $.block),
      optional(seq(
        'else',
        field('alternative', choice($.if_statement, $.block)),
      )),
    ),

    while_statement: $ => seq(
      'while',
      choice(
        seq('let', field('pattern', $.identifier), '=', field('value', $._expression)),
        field('condition', $._expression),
      ),
      field('body', $.block),
    ),

    for_statement: $ => seq(
      'for',
      field('item', $.identifier),
      'in',
      field('iterable', $._expression),
      field('body', $.block),
    ),

    match_statement: $ => seq(
      'match',
      field('value', $._expression),
      '{',
      repeat($.match_arm),
      '}',
    ),

    match_arm: $ => seq(
      field('pattern', $.match_pattern),
      '=>',
      field('body', choice($.block, $._statement)),
    ),

    match_pattern: $ => seq(
      field('name', $.identifier),
      optional(seq(
        '(',
        sepBy(',', $.identifier),
        optional(','),
        ')',
      )),
    ),

    select_statement: $ => seq(
      'select',
      '{',
      repeat($.select_case),
      optional($.select_default),
      '}',
    ),

    select_case: $ => seq(
      'case',
      field('variable', $.identifier),
      '=',
      '<-',
      field('channel', $._expression),
      ':',
      field('body', $.block),
    ),

    select_default: $ => seq(
      'default',
      ':',
      field('body', $.block),
    ),

    arena_statement: $ => seq(
      'arena',
      field('body', $.block),
    ),

    unsafe_statement: $ => seq(
      'unsafe',
      field('body', $.block),
    ),

    defer_statement: $ => seq(
      'defer',
      field('body', $._expression),
    ),

    spawn_statement: $ => seq(
      'spawn',
      field('call', $.call_expression),
    ),

    loop_control_statement: $ => choice(
      'break',
      'continue',
    ),

    expression_statement: $ => $._expression,

    // Expressions
    _expression: $ => choice(
      $.identifier,
      $.number_literal,
      $.string_literal,
      $.format_string_literal,
      $.boolean_literal,
      $.null_literal,
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.member_expression,
      $.index_expression,
      $.slice_expression,
      $.struct_initializer,
      $.slice_initializer,
      $.array_initializer,
      $.range_expression,
      $.try_expression,
      $.or_else_expression,
      $.parenthesized_expression,
      $.arena_expression,
    ),

    parenthesized_expression: $ => seq(
      '(',
      $._expression,
      ')',
    ),

    arena_expression: $ => seq(
      'arena',
      $.block,
    ),

    number_literal: $ => token(choice(
      /0x[0-9a-fA-F_]+/,
      /0b[01_]+/,
      /0o[0-7_]+/,
      /[0-9][0-9_]*\.[0-9_]+([eE][+-]?[0-9_]+)?/,
      /[0-9][0-9_]*/,
    )),

    string_literal: $ => seq(
      '"',
      repeat(choice(
        token.immediate(prec(1, /[^"\\$\n]+/)),
        $.escape_sequence,
      )),
      '"',
    ),

    format_string_literal: $ => seq(
      'f"',
      repeat(choice(
        token.immediate(prec(1, /[^"\\{\n]+/)),
        $.escape_sequence,
        $.format_substitution,
      )),
      '"',
    ),

    format_substitution: $ => seq(
      '{',
      $._expression,
      '}',
    ),

    escape_sequence: $ => token.immediate(seq(
      '\\',
      choice(
        /[\\'"0abfnrtv]/,
        /x[0-9a-fA-F]{2}/,
        /u[0-9a-fA-F]{4}/,
        /U[0-9a-fA-F]{8}/,
      ),
    )),

    boolean_literal: $ => choice('true', 'false'),
    null_literal: $ => 'null',

    call_expression: $ => prec(14, seq(
      field('function', $._expression),
      optional(field('type_arguments', $.type_arguments)),
      field('arguments', $.argument_list),
    )),

    type_arguments: $ => seq(
      '[',
      sepBy1(',', $._type),
      optional(','),
      ']',
    ),

    argument_list: $ => seq(
      '(',
      sepBy(',', choice(
        seq('mut', $._expression),
        $._expression,
      )),
      optional(','),
      ')',
    ),

    member_expression: $ => prec(15, seq(
      field('target', $._expression),
      '.',
      field('member', $.identifier),
    )),

    index_expression: $ => prec(15, seq(
      field('target', $._expression),
      '[',
      field('index', $._expression),
      ']',
    )),

    slice_expression: $ => prec(15, seq(
      field('target', $._expression),
      '[',
      optional(field('start', $._expression)),
      '..',
      optional(field('end', $._expression)),
      ']',
    )),

    range_expression: $ => prec(5, seq(
      field('start', $._expression),
      '..',
      field('end', $._expression),
    )),

    struct_initializer: $ => prec(13, seq(
      field('type', choice($.type_identifier, $.generic_type)),
      '{',
      sepBy(',', $.field_initializer),
      optional(','),
      '}',
    )),

    field_initializer: $ => seq(
      field('name', $.identifier),
      ':',
      field('value', $._expression),
    ),

    slice_initializer: $ => prec(13, seq(
      '[]',
      field('element', $._type),
      '{',
      sepBy(',', $._expression),
      optional(','),
      '}',
    )),

    array_initializer: $ => prec(13, seq(
      '[',
      field('size', $.number_literal),
      ']',
      field('element', $._type),
      '{',
      sepBy(',', $._expression),
      optional(','),
      '}',
    )),

    try_expression: $ => prec(14, seq(
      field('value', $._expression),
      '?',
    )),

    or_else_expression: $ => prec.left(2, seq(
      field('primary', $._expression),
      'or_else',
      field('fallback', $._expression),
    )),

    unary_expression: $ => prec(12, seq(
      field('operator', choice('-', '!', '~', '*', '&', 'mut')),
      field('operand', $._expression),
    )),

    binary_expression: $ => {
      const table = [
        [10, choice('*', '/', '%')],
        [9, choice('+', '-')],
        [8, choice('<<', '>>')],
        [7, choice('&', '|', '^')],
        [6, choice('==', '!=', '<', '<=', '>', '>=')],
        [4, '&&'],
        [3, '||'],
      ];

      return choice(...table.map(([precedence, operator]) =>
        prec.left(precedence, seq(
          field('left', $._expression),
          field('operator', operator),
          field('right', $._expression),
        ))
      ));
    },

    identifier: $ => /[a-z_][a-zA-Z0-9_]*/,
    type_identifier: $ => /[A-Z][a-zA-Z0-9_]*/,
  },
});

function sepBy1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}

function sepBy(sep, rule) {
  return optional(sepBy1(sep, rule));
}
