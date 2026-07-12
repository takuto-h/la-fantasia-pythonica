import { Compartment, EditorState } from "https://esm.sh/@codemirror/state@6.5.2";
import {
    EditorView,
    drawSelection,
    highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars,
    keymap,
    lineNumbers,
    placeholder
} from "https://esm.sh/@codemirror/view@6.36.2";
import {
    defaultHighlightStyle,
    syntaxHighlighting
} from "https://esm.sh/@codemirror/language@6.11.0";
import {
    defaultKeymap,
    history,
    historyKeymap,
    indentWithTab
} from "https://esm.sh/@codemirror/commands@6.8.1";
import { python } from "https://esm.sh/@codemirror/lang-python@6.1.7";

const editorTheme = EditorView.theme({
    "&": {
        height: "100%",
        backgroundColor: "#111",
        color: "#f3e7c0",
        textAlign: "left"
    },
    ".cm-scroller": {
        overflow: "auto",
        fontFamily: "monospace",
        fontSize: "clamp(16px, 2vw, 20px)",
        lineHeight: "1.4"
    },
    ".cm-content": {
        minHeight: "100%",
        padding: "1rem",
        caretColor: "#ffe59a"
    },
    ".cm-gutters": {
        backgroundColor: "#111",
        color: "#888",
        borderRight: "1px solid #555"
    },
    ".cm-activeLine": {
        backgroundColor: "rgba(255, 229, 154, 0.08)"
    },
    ".cm-activeLineGutter": {
        backgroundColor: "rgba(255, 229, 154, 0.12)",
        color: "#ffe59a"
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "rgba(155, 92, 255, 0.45) !important"
    },
    ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "#ffe59a"
    },
    ".cm-matchingBracket": {
        backgroundColor: "rgba(155, 92, 255, 0.25)",
        outline: "1px solid #9b5cff"
    }
}, { dark: true });

/**
 * Creates the Python editor used by the game and exposes only the operations
 * the game needs, keeping CodeMirror-specific code out of the game flow.
 */
export function createCodeEditor(parent) {
    const editable = new Compartment();
    const view = new EditorView({
        parent,
        state: EditorState.create({
            extensions: [
                lineNumbers(),
                highlightActiveLineGutter(),
                highlightSpecialChars(),
                history(),
                drawSelection(),
                EditorState.allowMultipleSelections.of(true),
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                python(),
                highlightActiveLine(),
                placeholder("Python コードをここに入力してください"),
                keymap.of([
                    indentWithTab,
                    ...defaultKeymap,
                    ...historyKeymap
                ]),
                editable.of(EditorView.editable.of(true)),
                editorTheme
            ]
        })
    });

    view.contentDOM.setAttribute("aria-label", "Python code editor");

    return {
        focus() {
            view.focus();
        },
        getValue() {
            return view.state.doc.toString();
        },
        refresh() {
            requestAnimationFrame(() => view.requestMeasure());
        },
        setDisabled(disabled) {
            view.dispatch({
                effects: editable.reconfigure(EditorView.editable.of(!disabled))
            });
            view.dom.classList.toggle("cm-editor--disabled", disabled);
        },
        setValue(value) {
            const currentValue = view.state.doc.toString();

            if (currentValue === value) {
                return;
            }

            view.dispatch({
                changes: { from: 0, to: currentValue.length, insert: value }
            });
        }
    };
}
