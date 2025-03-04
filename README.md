# Vee lang
The Vee programming language

[Playground](https://siwei.dev/test/vee/)

## Usage
- `<input_file>`
- `-t` Print tokens
- `-a` Print AST
- `-e` Evaluate AST
- `-c <output_runtime_script_file>` Compile to [Runtime Script](https://github.com/yjlo123/runtime-script)

Example:
```
python3 main.py sample.vee -e -c out.runtime
```

## AST

### Node Definition
```
Node = Object{
    type: NodeType
    token: Object{
        value: string
        type: TokenType
        line: integer
        column: integer
    }
    children: Node[]
}
```

### Node Types
```
NodeType = Enum{
    IMPORT      import statement
    EXPR_LIST   expression list
    STMT_LIST   statement list
    OPERATOR    operator
    IDENT       identifier
    VALUE       value
    FUNC_CALL   function call
    FUNC_DEF    function definition 
    ARG_LIST    argument list
    FOR         for loop
    WHILE       while loop
    IF          if expression
    RETURN      return statement
    CLASS       class definition
}
```

### Token Types
```
TypeType = Enum{
    KEY: keyword
    IDN: identifier
    NUM: number
    STR: string
    NEL: newline
    SYM: symbol
    EOF: end of file
}
```

### Examples
#### Identifier
```
Node{
    type: IDENT
    token: Token{
        value: 'my_var'
        type: IDN
    }
    children: []
}
```
#### Value
```
Node{
    type: VALUE
    token: Token{
        value: 24
        type: NUM
    }
    children: []
}
```

#### Operator
```
Node{
    type: OPERATOR
    token: Token{
        value: '+'
        type: SYM
    }
    children: [
        Node{<operand>},
        Node{<operand>}
    ]
}
```
