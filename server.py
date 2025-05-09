import json

from flask import Flask, request, jsonify

from main import ExceptionThread
from tokenizer import Tokenizer
from vee_parser import Parser
from evaluator import ClassEncoder, Evaluator, TimeoutException, EvaluationException
from compiler import Compiler

app = Flask(__name__)
VERSION = '0.1.1'
API_BASE = '/api/vee'

@app.route(API_BASE + '/')
def hello():
    return "Hello World!"

@app.route(API_BASE + '/info')
def info():
    return json.dumps({'version': VERSION})

@app.route(API_BASE + '/health')
def health():
    return json.dumps({'status': 'ok'})

@app.route(API_BASE + '/eval', methods=['POST'])
def api_eval():
    data = request.json['data']
    source = data['source']
    ast = _tokenize(source)
    output = _evaluate(ast)

    return jsonify({
        'output': json.loads(json.dumps(output, cls=ClassEncoder)),
    })

@app.route(API_BASE + '/compile', methods=['POST'])
def api_compile():
    data = request.json['data']
    source = data['source']
    ast = _tokenize(source)
    output = _evaluate(ast)

    return jsonify({
        'output': _compile_to_runtime(ast),
    })


def _tokenize(src):
    tokenzier = Tokenizer()
    tokens = tokenzier.tokenize(src)
    # print_tokens(tokens)

    parser = Parser(tokens)
    ast = parser.parse()
    # ast.pretty_print(indent='', is_last=True)
    return ast


def _evaluate(ast):
    evaluator = Evaluator('', out=[])

    try:
        thread = ExceptionThread(target=lambda:evaluator.evaluate(ast))
        thread.start()
        thread.join(2) # 2 seconds timeout

        if thread.is_alive():
            evaluator.stop()
            thread.join()
        return evaluator.out
    # except TimeoutException as e:
    #     return [[str(e)]]
    # except EvaluationException as e:
    #     return [[str(e)]]
    except Exception as e:
        return [[str(e)]]

def _compile_to_runtime(ast):
    compiler = Compiler('')
    compiler.compile_ast(ast)
    return compiler.get_linked_out()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
