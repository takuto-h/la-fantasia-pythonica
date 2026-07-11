# Local Development

## Run the game locally

Pyodide runs in a module Web Worker. Browser security rules therefore prevent
the game from working when `docs/index.html` is opened directly as a `file://`
URL.

Start the included local server from the project directory instead:

```sh
python3 serve.py
```

The game opens at <http://127.0.0.1:8000/>. Press `Ctrl+C` in the terminal to
stop the server.

To start it without opening a browser automatically:

```sh
python3 serve.py --no-browser
```

You can also choose another port:

```sh
python3 serve.py --port 8080
```
