const startJaButton = document.getElementById("startJaButton");
const startEnButton = document.getElementById("startEnButton");

const titleScreen = document.getElementById("titleScreen");
const contractScreen = document.getElementById("contractScreen");
const gameScreen = document.getElementById("gameScreen");
const messageBox = document.getElementById("messageBox");

const chapterTitleScreen = document.getElementById("chapterTitleScreen");
const chapterNumber = document.getElementById("chapterNumber");
const chapterTitleText = document.getElementById("chapterTitleText");

const contractTitle = document.getElementById("contractTitle");
const contractText = document.getElementById("contractText");
const nameInput = document.getElementById("nameInput");
const signButton = document.getElementById("signButton");

const speaker = document.getElementById("speaker");
const message = document.getElementById("message");
const clickText = document.getElementById("clickText");
const toBeContinued = document.getElementById("toBeContinued");

const codeScreen = document.getElementById("codeScreen");
const lineNumbers = document.getElementById("lineNumbers");
const codeInput = document.getElementById("codeInput");
const runButton = document.getElementById("runButton");
const consoleOutput = document.getElementById("consoleText");
const consoleElement = document.getElementById("console");
const instruction = document.getElementById("instruction");
const futureSightButton = document.getElementById("futureSightButton");

const successHint = document.getElementById("successHint");
const successText = document.getElementById("successText");

const flashOverlay = document.getElementById("flashOverlay");

let currentChapter = chapter0;
let chapterIndex = 0;

const chapters = [
    chapter0,
    chapter1,
    chapter2
];

const game = {
    lang: "ja",
    playerName: "",
    mistakeCount: 0,
    currentQuestion: null,
    questionSolved: false,
    isBusy: false
};

let index = 0;

const DEFAULT_EXECUTION_TIMEOUT_MS = 3000;
const PYODIDE_LOAD_TIMEOUT_MS = 30000;
let pythonWorker = null;
let pythonRequestId = 0;

function resetPythonWorker() {
    if (pythonWorker) {
        pythonWorker.terminate();
    }

    pythonWorker = null;
}

function getPythonWorker() {
    if (!pythonWorker) {
        pythonWorker = new Worker("python-worker.js", { type: "module" });
    }

    return pythonWorker;
}

function executePython(code, context, timeoutMs) {
    const worker = getPythonWorker();
    const id = ++pythonRequestId;

    return new Promise((resolve, reject) => {
        let timer = setTimeout(() => {
            cleanup();
            resetPythonWorker();
            reject({ type: "load-timeout" });
        }, PYODIDE_LOAD_TIMEOUT_MS);

        function cleanup() {
            clearTimeout(timer);
            worker.removeEventListener("message", onMessage);
            worker.removeEventListener("error", onWorkerError);
        }

        function onWorkerError() {
            cleanup();
            resetPythonWorker();
            reject({ type: "worker-error" });
        }

        function onMessage(event) {
            if (event.data?.id !== id) {
                return;
            }

            if (event.data.phase === "running") {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    cleanup();
                    resetPythonWorker();
                    reject({ type: "execution-timeout" });
                }, timeoutMs);
                return;
            }

            cleanup();

            if (event.data.workerError) {
                resetPythonWorker();
                reject({ type: "worker-error", detail: event.data.error });
                return;
            }

            resolve(event.data);
        }

        worker.addEventListener("message", onMessage);
        worker.addEventListener("error", onWorkerError);
        worker.postMessage({ id, code, context });
    });
}

function playFlash() {
    game.isBusy = true;
    hideMessageBox();

    flashOverlay.classList.remove("hidden");
    flashOverlay.classList.remove("flash");

    void flashOverlay.offsetWidth;

    flashOverlay.classList.add("flash");

    setTimeout(() => {
        flashOverlay.classList.add("hidden");
        flashOverlay.classList.remove("flash");

        game.isBusy = false;

        index++;
        showMessage();
    }, 2500);
}

function hideMessageBox() {
    messageBox.classList.add("hidden");
    messageBox.classList.remove("clickable");
}

function showChapterTitle() {
    game.isBusy = true;
    hideMessageBox();

    chapterNumber.textContent = uiText.chapterLabel[game.lang].replace(
        "{number}",
        currentChapter.chapterNumber
    );
    chapterTitleText.textContent = `〜${currentChapter.title[game.lang]}〜`;

    chapterTitleScreen.classList.remove("hidden");
    chapterTitleScreen.classList.remove("show");

    void chapterTitleScreen.offsetWidth;

    chapterTitleScreen.classList.add("show");

    setTimeout(() => {
        chapterTitleScreen.classList.add("hidden");
        chapterTitleScreen.classList.remove("show");

        game.isBusy = false;

        index++;
        showMessage();
    }, 3000);
}

function nextMessage() {
    index++;

    if (index >= currentChapter.scenario.length) {
        chapterIndex++;

        if (chapterIndex >= chapters.length) {
            hideMessageBox();
            codeScreen.classList.add("hidden");
            gameScreen.classList.remove("hidden");
            toBeContinued.classList.remove("hidden");
            return;
        }

        currentChapter = chapters[chapterIndex];
        index = 0;
        showMessage();
        return;
    }

    showMessage();
}

document.addEventListener("keydown", (event) => {
    if (game.isBusy) {
        event.preventDefault();
        return;
    }

    if (event.target === codeInput || event.target === nameInput) {
        return;
    }

    if (
        game.questionSolved &&
        !successHint.classList.contains("hidden") &&
        (event.key === "Enter" || event.key === " ")
    ) {
        event.preventDefault();
        finishQuestion();
        return;
    }

    if (codeScreen && !codeScreen.classList.contains("hidden")) {
        return;
    }

    const isMessageVisible = !messageBox.classList.contains("hidden");

    if (
        isMessageVisible &&
        (event.key === "Enter" || event.key === " ")
    ) {
        event.preventDefault();
        nextMessage();
    }
});

function startContract(selectedLang) {
    game.lang = selectedLang;

    titleScreen.classList.add("hidden");

    currentChapter = chapters[0];
    chapterIndex = 0;
    index = 0;

    showMessage();
}

function showContractScreen() {
    gameScreen.classList.add("hidden");
    contractScreen.classList.remove("hidden");

    contractTitle.textContent = uiText.contractTitle[game.lang];
    contractText.textContent = uiText.contractInstruction[game.lang];
    signButton.textContent = uiText.signButton[game.lang];
    nameInput.placeholder = uiText.namePlaceholder[game.lang];

    nameInput.value = "";
    nameInput.focus();
}

function signContract() {
    const name = nameInput.value.trim();

    if (name === "") {
        alert(uiText.nameRequired[game.lang]);
        return;
    }

    game.playerName = name;

    contractScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    index++;
    showMessage();
}

function showMessage() {
    const currentMessage = currentChapter.scenario[index];

    if (currentMessage.type === "flash") {
        hideMessageBox();
        playFlash();
        return;
    }

    if (currentMessage.type === "contract") {
        hideMessageBox();
        showContractScreen();
        return;
    }

    if (currentMessage.type === "chapterTitle") {
        hideMessageBox();
        showChapterTitle();
        return;
    }

    if (currentMessage.type === "question") {
        hideMessageBox();
        startQuestionById(currentMessage.questionId);
        return;
    }

    gameScreen.classList.remove("hidden");
    messageBox.classList.remove("hidden");

    speaker.textContent = currentMessage.speaker[game.lang].replace(
        "{player}",
        game.playerName
    );

    message.textContent = currentMessage.text[game.lang].replace(
        "{player}",
        game.playerName
    );

    clickText.textContent = uiText.continue[game.lang];

    messageBox.classList.remove("hidden");
    messageBox.classList.add("clickable");
}

startJaButton.addEventListener("click", () => {
    startContract("ja");
});

startEnButton.addEventListener("click", () => {
    startContract("en");
});

signButton.addEventListener("click", signContract);

let isComposing = false;

nameInput.addEventListener("compositionstart", () => {
    isComposing = true;
});

nameInput.addEventListener("compositionend", () => {
    isComposing = false;
});

nameInput.addEventListener("keydown", (event) => {
    if (isComposing) {
        return;
    }

    if (event.key === "Enter") {
        signContract();
    }
});

runButton.addEventListener("click", (event) => {
    event.stopPropagation();
    runCode();
});

codeInput.addEventListener("click", (event) => {
    event.stopPropagation();
});

function updateLineNumbers() {
    const count = codeInput.value.split("\n").length;

    lineNumbers.textContent = Array.from(
        { length: count },
        (_, i) => i + 1
    ).join("\n");
}

codeInput.addEventListener("scroll", () => {
    lineNumbers.scrollTop = codeInput.scrollTop;
});

codeInput.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
        event.preventDefault();

        const start = codeInput.selectionStart;
        const end = codeInput.selectionEnd;

        codeInput.value =
            codeInput.value.substring(0, start) +
            "    " +
            codeInput.value.substring(end);

        codeInput.selectionStart = start + 4;
        codeInput.selectionEnd = start + 4;

        updateLineNumbers();
    }
});

codeInput.addEventListener("input", updateLineNumbers);

updateLineNumbers();

messageBox.addEventListener("click", nextMessage);

function startQuestion() {
    game.mistakeCount = 0;
    game.questionSolved = false;
    messageBox.classList.remove("clickable");

    document.getElementById("console").classList.remove("futureSight");
    futureSightButton.disabled = false;

    codeInput.disabled = false;
    runButton.disabled = false;

    codeInput.value = "";
    consoleOutput.textContent = "";
    consoleElement.scrollTop = 0;

    codeScreen.classList.remove("hidden");
    messageBox.classList.add("hidden");

    codeInput.focus();

    successHint.classList.add("hidden");
}

function fillText(text) {
    return text.replace("{player}", game.playerName);
}

function startQuestionById(questionId) {
    game.currentQuestion = questionId;

    startQuestion();

    const question = currentChapter.questions[questionId];

    instruction.textContent = question.instruction[game.lang];

    futureSightButton.textContent = uiText.futureSightButton[game.lang];
    runButton.textContent = uiText.runButton[game.lang];
}

function endQuestion() {
    codeScreen.classList.add("hidden");
}

function setExecutionBusy(isBusy) {
    codeInput.disabled = isBusy;
    futureSightButton.disabled = isBusy;
    runButton.disabled = isBusy;
}

function executionStatusText(type) {
    const question = currentChapter.questions[game.currentQuestion];
    return question.executionMessages[type][game.lang];
}

function formatExecutionResult(result) {
    return [result.stdout, result.stderr]
        .filter((text) => text !== "")
        .join(result.stdout && result.stderr ? "\n" : "");
}

function normalizeOutput(output) {
    return output.replace(/\r?\n$/, "");
}

function getQuestionContext() {
    return { name: game.playerName };
}

async function executeCurrentCode(code, question) {
    setExecutionBusy(true);
    consoleOutput.textContent = executionStatusText("loading");
    consoleElement.scrollTop = 0;

    try {
        return await executePython(
            code,
            getQuestionContext(),
            question.timeoutMs ?? DEFAULT_EXECUTION_TIMEOUT_MS
        );
    } finally {
        if (!game.questionSolved) {
            setExecutionBusy(false);
            codeInput.focus();
        }
    }
}

async function previewCode() {
    const code = codeInput.value;
    const consoleBox = document.getElementById("console");
    const question = currentChapter.questions[game.currentQuestion];

    consoleBox.classList.add("futureSight");

    if (code.trim() === "") {
        consoleOutput.textContent = fillText(question.preview.empty[game.lang]);
        consoleElement.scrollTop = 0;
        return;
    }

    try {
        const result = await executeCurrentCode(code, question);
        const output = formatExecutionResult(result);
        const heading = question.executionMessages.previewHeading[game.lang];
        const noOutput = question.executionMessages.noOutput[game.lang];

        consoleOutput.textContent = `${heading}\n\n${output || noOutput}`;
    } catch (error) {
        consoleOutput.textContent = executionStatusText(
            error.type === "execution-timeout" ? "timeout" : "loadError"
        );
    }
    consoleElement.scrollTop = 0;
}

futureSightButton.addEventListener("click", (event) => {
    event.stopPropagation();
    previewCode();
});

async function runCode() {
    document.getElementById("console").classList.remove("futureSight");
    const code = codeInput.value;
    const question = currentChapter.questions[game.currentQuestion];
    let result;

    try {
        result = await executeCurrentCode(code, question);
    } catch (error) {
        if (error.type === "execution-timeout") {
            handleWrongAnswer(executionStatusText("timeout"));
        } else {
            consoleOutput.textContent = executionStatusText("loadError");
            consoleElement.scrollTop = 0;
        }
        return;
    }

    const expectedOutput = fillText(question.expectedOutput);

    if (!result.error && normalizeOutput(result.stdout) === expectedOutput) {
        game.questionSolved = true;

        consoleOutput.textContent = fillText(question.success[game.lang]);
        consoleElement.scrollTop = 0;

        successText.textContent = uiText.continue[game.lang];

        successHint.classList.remove("hidden");
        successHint.classList.add("clickable");

        setExecutionBusy(true);

        return;
    }

    handleWrongAnswer(formatExecutionResult(result));
}

function handleWrongAnswer(executionOutput) {
    const question = currentChapter.questions[game.currentQuestion];
    game.mistakeCount++;

    const hintIndex = Math.min(
        game.mistakeCount - 1,
        question.hints.length - 1
    );

    const hint = fillText(question.hints[hintIndex][game.lang]);
    consoleOutput.textContent = executionOutput
        ? `${executionOutput}\n\n${hint}`
        : hint;
    consoleElement.scrollTop = 0;
}

function finishQuestion() {
    game.questionSolved = false;
    game.currentQuestion = null;

    successHint.classList.remove("clickable");
    successHint.classList.add("hidden");

    endQuestion();

    index++;
    showMessage();
}

successHint.addEventListener("click", finishQuestion);
