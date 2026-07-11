import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs";

let pyodidePromise = loadPyodide();

const runner = `
import io
import traceback
from contextlib import redirect_stdout, redirect_stderr

_pythonica_stdout = io.StringIO()
_pythonica_stderr = io.StringIO()
_pythonica_error = None

try:
    with redirect_stdout(_pythonica_stdout), redirect_stderr(_pythonica_stderr):
        exec(compile(__pythonica_code, "<player-code>", "exec"), globals())
except BaseException as exc:
    _pythonica_error = f"{type(exc).__name__}: {exc}"
    traceback.print_exc(file=_pythonica_stderr)

_pythonica_stdout_value = _pythonica_stdout.getvalue()
_pythonica_stderr_value = _pythonica_stderr.getvalue()
`;

self.onmessage = async (event) => {
    const { id, code, context } = event.data;
    let dict;
    let globals;

    try {
        const pyodide = await pyodidePromise;
        self.postMessage({ id, phase: "running" });

        dict = pyodide.globals.get("dict");
        globals = dict(Object.entries(context));
        globals.set("__pythonica_code", code);

        await pyodide.runPythonAsync(runner, { globals });

        const error = globals.get("_pythonica_error");
        self.postMessage({
            id,
            stdout: globals.get("_pythonica_stdout_value"),
            stderr: globals.get("_pythonica_stderr_value"),
            ...(error === null ? {} : { error })
        });
    } catch (error) {
        self.postMessage({
            id,
            stdout: "",
            stderr: "",
            error: error instanceof Error ? error.message : String(error),
            workerError: true
        });
    } finally {
        if (globals) {
            globals.destroy();
        }
        if (dict) {
            dict.destroy();
        }
    }
};
