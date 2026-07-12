const startJaButton = document.getElementById("startJaButton");
const startEnButton = document.getElementById("startEnButton");

const titleScreen = document.getElementById("titleScreen");
const contractScreen = document.getElementById("contractScreen");
const gameScreen = document.getElementById("gameScreen");
const messageBox = document.getElementById("messageBox");

const menuButton = document.getElementById("menuButton");
const menuOverlay = document.getElementById("menuOverlay");
const sideMenu = document.getElementById("sideMenu");
const closeMenuButton = document.getElementById("closeMenuButton");
const menuTitle = document.getElementById("menuTitle");
const grimoireLink = document.getElementById("grimoireLink");

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

const replayQuestionModal = document.getElementById("replayQuestionModal");
const replayQuestionText = document.getElementById("replayQuestionText");
const playQuestionButton = document.getElementById("playQuestionButton");
const skipQuestionButton = document.getElementById("skipQuestionButton");

const memoryButton = document.getElementById("memoryButton");
const memoryModal = document.getElementById("memoryModal");
const memoryTitle = document.getElementById("memoryTitle");
const memoryDescription = document.getElementById("memoryDescription");
const memoryChapterList = document.getElementById("memoryChapterList");
const closeMemoryButton = document.getElementById("closeMemoryButton");

let currentChapter = chapter0;
let chapterIndex = 0;

const chapters = [
    chapter0,
    chapter1,
    chapter2
];

const settings = {
    language: localStorage.getItem("language"),
    playerName: localStorage.getItem("playerName") || ""
};

const game = {
    lang: null,
    playerName: "",
    mistakeCount: 0,
    currentQuestion: null,
    questionSolved: false,
    isBusy: false,
    isReplay: false
};

let pendingReplayQuestionId = null;

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
        pythonWorker = new Worker("./js/python-worker.js", { type: "module" });
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

function openMenu() {
    menuOverlay.classList.remove("hidden");
    menuButton.setAttribute("aria-expanded", "true");
}

function closeMenu() {
    menuOverlay.classList.add("hidden");
    menuButton.setAttribute("aria-expanded", "false");
}

function updateMenuLanguage() {
    if (game.lang === "ja") {
        menuTitle.textContent = "Menu";
        grimoireLink.textContent = "魔導書";

        menuButton.setAttribute("aria-label", "Open Menu");
        closeMenuButton.setAttribute("aria-label", "Close Menu");
        return;
    }

    if (game.lang === "en") {
        menuTitle.textContent = "Menu";
        grimoireLink.textContent = "Grimoire";

        menuButton.setAttribute("aria-label", "Open Menu");
        closeMenuButton.setAttribute("aria-label", "Close Menu");
        return;
    }

    menuTitle.textContent = "Menu";
    grimoireLink.textContent = "Grimoire / 魔導書";

    menuButton.setAttribute("aria-label", "Menu");
    closeMenuButton.setAttribute(
        "aria-label",
        "Close Menu"
    );
}

menuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    openMenu();
});

closeMenuButton.addEventListener("click", closeMenu);

sideMenu.addEventListener("click", (event) => {
    event.stopPropagation();
});

menuOverlay.addEventListener("click", closeMenu);

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        !menuOverlay.classList.contains("hidden")
    ) {
        closeMenu();
    }
});

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
        markChapterCleared(
            Number(currentChapter.chapterNumber)
        );

        if (game.isReplay) {
            game.isReplay = false;

            hideMessageBox();
            codeScreen.classList.add("hidden");
            gameScreen.classList.add("hidden");
            titleScreen.classList.remove("hidden");

            openMemory();
            return;
        }

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
    settings.language = selectedLang;

    localStorage.setItem("language", selectedLang);

    updateMenuLanguage();

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
    localStorage.setItem("playerName", name);

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

        if (game.isReplay) {
            showReplayQuestionChoice(
                currentMessage.questionId
            );
        } else {
            startQuestionById(
                currentMessage.questionId
            );
        }

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

function formatExecutionError(error) {
    if (!Number.isInteger(error?.line) || error.line < 1) {
        return uiText.executionErrors.unknown[game.lang];
    }

    const messages = uiText.executionErrors;
    const message = messages[error.kind] ?? messages.generic;
    return message[game.lang].replace("{line}", error.line);
}

function formatExecutionResult(result) {
    return [
        result.stdout,
        result.stderr,
        result.error ? formatExecutionError(result.error) : ""
    ]
        .filter((text) => text !== "")
        .join("\n");
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
            handleWrongAnswer();
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

    handleWrongAnswer();
}

function handleWrongAnswer() {
    const question = currentChapter.questions[game.currentQuestion];
    game.mistakeCount++;

    const hintIndex = Math.min(
        game.mistakeCount - 1,
        question.hints.length - 1
    );

    const hint = fillText(question.hints[hintIndex][game.lang]);
    consoleOutput.textContent = hint;
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

const savedLanguage = localStorage.getItem("language");

if (savedLanguage === "ja" || savedLanguage === "en") {
    game.lang = savedLanguage;
}

updateMenuLanguage();

const CLEARED_CHAPTERS_KEY = "clearedChapters";

function getClearedChapters() {
    const raw = localStorage.getItem(CLEARED_CHAPTERS_KEY);

    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(Number.isInteger);
    } catch {
        return [];
    }
}

function markChapterCleared(chapterNumber) {
    const cleared = getClearedChapters();

    if (!cleared.includes(chapterNumber)) {
        cleared.push(chapterNumber);
        cleared.sort((a, b) => a - b);

        localStorage.setItem(
            CLEARED_CHAPTERS_KEY,
            JSON.stringify(cleared)
        );
    }
}

function showReplayQuestionChoice(questionId) {
    pendingReplayQuestionId = questionId;

    replayQuestionText.textContent =
        game.lang === "ja"
            ? "魔法の練習をしておこうかな？"
            : "Should I try the exercise of the magic?";

    playQuestionButton.textContent =
        game.lang === "ja"
            ? "練習する"
            : "Try the exercise";

    skipQuestionButton.textContent =
        game.lang === "ja"
            ? "スキップして思い出に浸る"
            : "Skip and reminisce";

    replayQuestionModal.classList.remove("hidden");
}

playQuestionButton.addEventListener("click", () => {
    replayQuestionModal.classList.add("hidden");

    startQuestionById(
        pendingReplayQuestionId
    );

    pendingReplayQuestionId = null;
});

skipQuestionButton.addEventListener("click", () => {
    replayQuestionModal.classList.add("hidden");

    pendingReplayQuestionId = null;

    index++;
    showMessage();
});

function getUiLanguage() {
    const storedLanguage = localStorage.getItem("language");

    if (storedLanguage === "ja" || storedLanguage === "en") {
        return storedLanguage;
    }

    return null;
}

function renderMemory() {
    const language = getUiLanguage();
    const clearedChapters = getClearedChapters();

    memoryChapterList.innerHTML = "";

    if (language === "ja") {
        memoryTitle.textContent = "記憶";
        memoryDescription.textContent = "魔導書に刻まれた記憶";
        closeMemoryButton.setAttribute("aria-label", "閉じる");
    } else if (language === "en") {
        memoryTitle.textContent = "Memory";
        memoryDescription.textContent =
            "Memories engraved upon the Grimoire";
        closeMemoryButton.setAttribute("aria-label", "Close");
    } else {
        memoryTitle.textContent = "Memory / 記憶";
        memoryDescription.textContent =
            "Memories engraved upon the Grimoire / 魔導書に刻まれた記憶";
        closeMemoryButton.setAttribute(
            "aria-label",
            "Close / 閉じる"
        );
    }

    chapters.forEach((chapter) => {
        const chapterNumber = Number(chapter.chapterNumber);
        const isCleared = clearedChapters.includes(chapterNumber);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "memory-chapter-button";
        button.disabled = !isCleared;

        let title;

        if (!isCleared) {
            title = "???";
        } else if (language === "ja") {
            title = chapter.title.ja;
        } else if (language === "en") {
            title = chapter.title.en;
        } else {
            title = `${chapter.title.en} / ${chapter.title.ja}`;
        }

        button.innerHTML = `
            <span class="memory-chapter-number">
                Chapter ${chapterNumber}
            </span>

            <span class="memory-chapter-title">
                〜 ${escapeHtml(title)} 〜
            </span>
        `;

        if (isCleared) {
            button.addEventListener("click", () => {
                closeMemory();
                startReplay(chapterNumber);
            });
        }

        memoryChapterList.appendChild(button);
    });
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function openMemory() {
    closeMenu();
    renderMemory();
    memoryModal.classList.remove("hidden");
}

function closeMemory() {
    memoryModal.classList.add("hidden");
}

memoryButton.addEventListener("click", openMemory);
closeMemoryButton.addEventListener("click", closeMemory);

memoryModal.addEventListener("click", (event) => {
    if (event.target === memoryModal) {
        closeMemory();
    }
});

function startReplay(chapterNumber) {
    const selectedChapter = chapters.find(
        (chapter) =>
            Number(chapter.chapterNumber) === chapterNumber
    );

    if (!selectedChapter) {
        console.error(`Chapter ${chapterNumber} not found.`);
        return;
    }

    const savedLanguage = getUiLanguage();
    const savedPlayerName =
        localStorage.getItem("playerName") || "";

    game.lang = savedLanguage || "ja";
    game.playerName = savedPlayerName;
    game.isReplay = true;
    game.questionSolved = false;
    game.currentQuestion = null;
    game.isBusy = false;

    currentChapter = selectedChapter;
    chapterIndex = chapters.indexOf(selectedChapter);
    index = 0;

    titleScreen.classList.add("hidden");
    contractScreen.classList.add("hidden");
    codeScreen.classList.add("hidden");
    toBeContinued.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    showMessage();
}

const RETURN_STATE_KEY = "grimoireReturnState";

function saveGrimoireReturnState() {
    let screen = "title";

    if (!contractScreen.classList.contains("hidden")) {
        screen = "contract";
    } else if (!codeScreen.classList.contains("hidden")) {
        screen = "question";
    } else if (!gameScreen.classList.contains("hidden")) {
        screen = "story";
    }

    const state = {
        chapterIndex,
        scenarioIndex: index,
        isReplay: game.isReplay,
        screen,
        playerName: game.playerName,
        language: game.lang,
        currentQuestion: game.currentQuestion,
        code: codeInput.value,
        consoleText: consoleOutput.textContent
    };

    sessionStorage.setItem(
        RETURN_STATE_KEY,
        JSON.stringify(state)
    );
}

grimoireLink.addEventListener("click", () => {
    saveGrimoireReturnState();
});

function restoreGrimoireReturnState() {
    const raw = sessionStorage.getItem(RETURN_STATE_KEY);

    if (!raw) {
        return false;
    }

    sessionStorage.removeItem(RETURN_STATE_KEY);

    let state;

    try {
        state = JSON.parse(raw);
    } catch {
        return false;
    }

    if (
        !Number.isInteger(state.chapterIndex) ||
        !chapters[state.chapterIndex]
    ) {
        return false;
    }

    chapterIndex = state.chapterIndex;
    currentChapter = chapters[chapterIndex];
    index = Number.isInteger(state.scenarioIndex)
        ? state.scenarioIndex
        : 0;

    game.lang =
        state.language === "en"
            ? "en"
            : "ja";

    game.playerName =
        typeof state.playerName === "string"
            ? state.playerName
            : "";

    game.isReplay = Boolean(state.isReplay);
    game.currentQuestion = state.currentQuestion ?? null;
    game.questionSolved = false;
    game.isBusy = false;

    titleScreen.classList.add("hidden");
    contractScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    codeScreen.classList.add("hidden");
    messageBox.classList.add("hidden");
    toBeContinued.classList.add("hidden");

    updateMenuLanguage();

    if (state.screen === "contract") {
        showContractScreen();

        nameInput.value = game.playerName;
        return true;
    }

    if (state.screen === "question") {
        gameScreen.classList.remove("hidden");

        startQuestionById(state.currentQuestion);

        codeInput.value =
            typeof state.code === "string"
                ? state.code
                : "";

        consoleOutput.textContent =
            typeof state.consoleText === "string"
                ? state.consoleText
                : "";

        updateLineNumbers();
        return true;
    }

    if (state.screen === "story") {
        gameScreen.classList.remove("hidden");
        showMessage();
        return true;
    }

    titleScreen.classList.remove("hidden");
    return true;
}

const restoredFromGrimoire =
    restoreGrimoireReturnState();

if (!restoredFromGrimoire) {
    updateMenuLanguage();
}
