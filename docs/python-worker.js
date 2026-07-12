import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs";

let pyodidePromise = loadPyodide();

const runner = `
_pythonica_player_globals = dict(globals())

import io
from contextlib import redirect_stdout, redirect_stderr

_pythonica_stdout = io.StringIO()
_pythonica_stderr = io.StringIO()
_pythonica_error_kind = None
_pythonica_error_line = None

try:
    with redirect_stdout(_pythonica_stdout), redirect_stderr(_pythonica_stderr):
        exec(
            compile(__pythonica_code, "<player-code>", "exec"),
            _pythonica_player_globals,
        )
except BaseException as exc:
    if isinstance(exc, (IndentationError, TabError)):
        _pythonica_error_kind = "indentation"
    elif isinstance(exc, SyntaxError):
        _pythonica_syntax_message = str(exc).lower()
        _pythonica_open_markers = (
            "was never closed",
            "unterminated string",
            "unterminated triple-quoted string",
            "unexpected eof",
            "eof while scanning",
            "expecting '}'",
        )
        _pythonica_error_kind = (
            "unclosed"
            if any(marker in _pythonica_syntax_message for marker in _pythonica_open_markers)
            else "generic"
        )
    elif isinstance(exc, NameError):
        _pythonica_error_kind = "name"
    elif isinstance(exc, TypeError):
        _pythonica_error_kind = "type"
    elif isinstance(exc, ZeroDivisionError):
        _pythonica_error_kind = "zeroDivision"
    else:
        _pythonica_error_kind = "generic"

    if isinstance(exc, SyntaxError):
        _pythonica_error_line = exc.lineno
    else:
        _pythonica_traceback = exc.__traceback__
        while _pythonica_traceback is not None:
            if _pythonica_traceback.tb_frame.f_code.co_filename == "<player-code>":
                _pythonica_error_line = _pythonica_traceback.tb_lineno
            _pythonica_traceback = _pythonica_traceback.tb_next

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

        const errorKind = globals.get("_pythonica_error_kind");
        const hasExecutionError = errorKind !== null && errorKind !== undefined;
        self.postMessage({
            id,
            stdout: globals.get("_pythonica_stdout_value"),
            stderr: globals.get("_pythonica_stderr_value"),
            ...(hasExecutionError ? {
                error: {
                    kind: errorKind,
                    line: globals.get("_pythonica_error_line")
                }
            } : {})
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
