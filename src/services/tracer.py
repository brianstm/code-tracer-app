import inspect
import sys
import json
from copy import deepcopy
from typing import Callable, Any, Dict, List


class CodeTracer:
    def __init__(self):
        self.steps = []
        self.step_count = 0

    def trace_function(self, frame, event, arg):
        if event == 'line':
            code_line = inspect.getsource(frame.f_code).splitlines()[
                frame.f_lineno - frame.f_code.co_firstlineno]

            locals_copy = {}
            for var_name, var_value in frame.f_locals.items():
                try:
                    locals_copy[var_name] = deepcopy(var_value)
                except:
                    locals_copy[var_name] = str(var_value)

            self.steps.append({
                'step': self.step_count,
                'line': frame.f_lineno,
                'code': code_line.strip(),
                'variables': locals_copy
            })
            self.step_count += 1

        return self.trace_function

    def run_trace(self, func: Callable, *args, **kwargs) -> Any:
        self.steps = []
        self.step_count = 0

        sys.settrace(self.trace_function)
        try:
            result = func(*args, **kwargs)
            return {'result': result, 'steps': self.steps}
        finally:
            sys.settrace(None)


if __name__ == "__main__":
    input_data = sys.stdin.read()
    try:
        data = json.loads(input_data)
        code = data['code']
        function_name = data['functionName']
        parameter_value = data['parameterValue']

        namespace = {}
        exec(code, namespace)

        func = namespace[function_name]
        tracer = CodeTracer()

        trace_result = tracer.run_trace(func, parameter_value)

        print(json.dumps(trace_result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
