import { loadPyodide, PyodideInterface } from "pyodide";

export interface TraceStep {
  step: number;
  line: number;
  code: string;
  variables: Record<string, unknown>;
}

let pyodide: PyodideInterface | null = null;

export class TracerService {
  static async initPyodide() {
    if (!pyodide) {
      pyodide = await loadPyodide();
    }
  }

  static async traceCode(
    code: string,
    functionName: string,
    parameterValue: number | string
  ): Promise<{ steps: TraceStep[] }> {
    await this.initPyodide();

    const escapedCode = code.replace(/\\/g, "\\\\");

    const tracePythonScript = `
import sys
import json
from copy import deepcopy

class CodeTracer:
    def __init__(self, code_lines):
        self.steps = []
        self.step_count = 0
        self.code_lines = code_lines

    def trace_function(self, frame, event, arg):
        if event == 'line':
            line_number = frame.f_lineno - 1

            # Ensure line number is valid
            if 0 <= line_number < len(self.code_lines):
                code_line = self.code_lines[line_number]
            else:
                code_line = f'Line number out of bounds (line: {frame.f_lineno})'

            locals_copy = {}
            for var_name, var_value in frame.f_locals.items():
                try:
                    # Attempt to serialize the value
                    json.dumps(var_value)
                    locals_copy[var_name] = deepcopy(var_value)
                except (TypeError, ValueError):
                    # If serialization fails, store a string representation
                    locals_copy[var_name] = repr(var_value)

            self.steps.append({
                'step': self.step_count,
                'line': frame.f_lineno,
                'code': code_line.strip(),
                'variables': locals_copy
            })
            self.step_count += 1

        return self.trace_function


    def run_trace(self, func, *args):
        self.steps = []
        self.step_count = 0

        sys.settrace(self.trace_function)
        try:
            result = func(*args)
            return {'result': result, 'steps': self.steps}
        finally:
            sys.settrace(None)

code_lines = ${JSON.stringify(escapedCode.split("\n"))}

namespace = {}

compiled_code = compile("\\n".join(code_lines), "<string>", "exec")
exec(compiled_code, namespace)

func = namespace["${functionName}"]
tracer = CodeTracer(code_lines)

trace_result = tracer.run_trace(func, ${parameterValue})
json.dumps(trace_result)
`;

    try {
      const traceResult = await pyodide?.runPythonAsync(tracePythonScript);
      const parsedResult = JSON.parse(traceResult);
      return { steps: parsedResult.steps };
    } catch (err) {
      throw new Error("Failed to trace the code: " + err);
    }
  }

  static validateCode(code: string): boolean {
    const forbiddenPatterns = ["import os", "import sys", "exec", "eval"];
    for (const pattern of forbiddenPatterns) {
      if (code.includes(pattern)) {
        return false;
      }
    }
    return true;
  }
}
