import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TracerService, TraceStep } from "./services/tracer";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExecutionConfig {
  functionName: string;
  parameterValue: string;
}

const defaultCode = `def func(n):`;

function App() {
  const [code, setCode] = useState(defaultCode);
  const [executionSteps, setExecutionSteps] = useState<TraceStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ExecutionConfig>({
    functionName: "",
    parameterValue: "",
  });

  const handleEditorChange = (value: string | undefined) => {
    if (value) setCode(value);
  };

  const handleRun = async () => {
    setError(null);
    setIsLoading(true);
    setExecutionSteps([]);

    try {
      if (!TracerService.validateCode(code)) {
        throw new Error("Code contains forbidden operations");
      }

      if (code === "def func(n):") {
        throw new Error("Please enter your Python code");
      }

      if (!code.includes("def")) {
        throw new Error("Function definition not found in the code");
      }

      if (!config.functionName) {
        throw new Error("Function name is required");
      }

      if (!config.parameterValue) {
        throw new Error("Parameter value is required");
      }

      if (!code.includes(`def ${config.functionName}`)) {
        throw new Error(
          `Function "${config.functionName}" not found in the code`
        );
      }

      const paramValue = config.parameterValue;

      const { steps } = await TracerService.traceCode(
        code,
        config.functionName,
        paramValue
      );

      setExecutionSteps(steps);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigChange = (field: keyof ExecutionConfig, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="container mx-auto px-4 md:py-6 py-3 space-y-4">
      <h1 className="md:text-3xl text-2xl font-bold mb-4">
        Python Code Tracer
        <span className="text-sm md:pl-4 pl-3">By: Brians Tjipto</span>
      </h1>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <div className="space-y-4 h-full">
          <Card>
            <CardHeader>
              <CardTitle>Code Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <Editor
                height="200px"
                defaultLanguage="python"
                value={code}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />

              <div className="pt-4">
                <div className="space-y-4 px-3">
                  <h1 className="text-xl font-semibold">
                    Execution Configuration
                  </h1>

                  <div className="space-y-2">
                    <Label htmlFor="functionName">Function Name</Label>
                    <Input
                      id="functionName"
                      value={config.functionName}
                      onChange={(e) =>
                        handleConfigChange("functionName", e.target.value)
                      }
                      placeholder="Enter function name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parameterValue">Parameter Value</Label>
                    <Input
                      id="parameterValue"
                      value={config.parameterValue}
                      onChange={(e) =>
                        handleConfigChange("parameterValue", e.target.value)
                      }
                      placeholder="Enter parameter value"
                      type="string"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleRun} disabled={isLoading}>
                      {isLoading ? "Running..." : "Run Code"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Execution Trace</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              {executionSteps.length > 0 ? (
                <div className="space-y-4">
                  {executionSteps.map((step) => (
                    <Card key={step.step}>
                      <CardHeader>
                        <CardTitle>Step {step.step + 1}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="font-mono text-sm">
                          Line {step.line}: {step.code}
                        </pre>
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Variables:</h4>
                          <pre className="bg-muted p-2 rounded-md">
                            {Object.entries(step.variables).map(
                              ([key, value]) => (
                                <div key={key}>
                                  {key}: {JSON.stringify(value)}
                                </div>
                              )
                            )}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Run the code to see execution trace
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
