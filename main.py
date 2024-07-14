import argparse
import threading
from tokenizer import Tokenizer, print_tokens
from vee_parser import Parser
from evaluator import Evaluator, TimeoutException
from compiler import Compiler


class ExceptionThread(threading.Thread):
    def __init__(self, *args, **kwargs):
        super(ExceptionThread, self).__init__(*args, **kwargs)
        self.exc = None

    def run(self):
        try:
            if self._target:
                self._target(*self._args, **self._kwargs)
        except BaseException as e:
            self.exc = e

    def join(self, timeout=None):
        super(ExceptionThread, self).join(timeout)
        if self.exc:
            raise self.exc

if __name__ == "__main__":
    arg_parser = argparse.ArgumentParser(description='Vee programming language')
    arg_parser.add_argument('input_file', metavar='input_file', type=str, help='Source file')
    arg_parser.add_argument('-c', dest='compiled_runtime_script', metavar='compiled_runtime_script', type=str, help='Compiled Runtime Script output file (optional)')
    args = arg_parser.parse_args()

    with open(args.input_file, 'r') as src_file:
        tokenzier = Tokenizer()
        tokens = tokenzier.tokenize(src_file.read())
        # print_tokens(tokens)
    
        parser = Parser(tokens)
        ast = parser.parse()
        ast.pretty_print(indent='', is_last=True)

        evaluator = Evaluator(src_file.name)

        try:
            thread = ExceptionThread(target=lambda:evaluator.evaluate(ast))
            thread.start()
            thread.join(2) # 2 seconds timeout

            if thread.is_alive():
                evaluator.stop()
                thread.join()
        except TimeoutException as e:
            print('>>>', e)


        if args.compiled_runtime_script:
            with open(args.compiled_runtime_script, 'w') as compiled_output_file:
                compiler = Compiler(src_file.name)
                compiler.compile_ast(ast)
                for line in compiler.get_linked_out():
                    #print(line)
                    compiled_output_file.write(line + '\n')
