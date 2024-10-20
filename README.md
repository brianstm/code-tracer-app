# Code Tracer App

[Code Tracer App](https://code-tracer-app.vercel.app)

## Overview

The **Code Tracer App** is an interactive web-based tool that allows you to write Python code, configure a function's name and parameters, and visualize the code execution step-by-step. It traces the execution of the function and displays the variables and lines of code executed at each step. This app is especially useful for debugging and understanding how Python code behaves during execution.

## Features

- **Code Editor**: Write and edit Python code directly in the browser using the Monaco Editor.
- **Execution Trace**: Visualizes the code execution steps, showing the executed line of code and the state of variables at each step.
- **Function Tracing**: Specify the function name and input parameter value to trace the execution flow.
- **Error Handling**: Detects and shows errors like missing function definitions or forbidden operations.

### Usage

1. Write or paste your Python code in the editor.
2. Enter the function name and the parameter value you want to test.
3. Click **Run Code** to start the trace.
4. View the step-by-step execution trace, which includes:
   - Line of code executed.
   - Current variables and their values.

## Limitations

- Forbidden operations such as `exec`, `eval`, and dangerous imports like `os` and `sys` are blocked for security reasons.
- The app only supports Python code for tracing.

## Contributing

Feel free to open issues or submit pull requests if you have any suggestions for improvements or new features.

## License

This project is licensed under the MIT License.
