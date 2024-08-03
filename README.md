# vee-lang
The Vee programming language

[Playground](https://siwei.dev/test/vee/)

## Usage
- `<input_file>`
- `-t` Print tokens
- `-a` Print AST
- `-e` Evaluate AST
- `-c <output_runtime_script_file>` Compile to Runtime Script

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
    IMPORT
    EXPR_LIST
    STMT_LIST
    OPERATOR
    IDENT
    VALUE
    FUNC_CALL
    FUNC_DEF
    ARG_LIST
    FOR
    WHILE
    IF
    RETURN
    CLASS
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
#### Identity
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
