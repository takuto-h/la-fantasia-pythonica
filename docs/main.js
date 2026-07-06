const startJaButton = document.getElementById("startJaButton");
const startEnButton = document.getElementById("startEnButton");

const titleScreen = document.getElementById("titleScreen");
const contractScreen = document.getElementById("contractScreen");
const gameScreen = document.getElementById("gameScreen");
const messageBox = document.getElementById("messageBox");

const contractTitle = document.getElementById("contractTitle");
const contractText = document.getElementById("contractText");
const nameInput = document.getElementById("nameInput");
const signButton = document.getElementById("signButton");

const speaker = document.getElementById("speaker");
const message = document.getElementById("message");
const clickText = document.getElementById("clickText");
const toBeContinued = document.getElementById("toBeContinued");

const codeScreen = document.getElementById("codeScreen");
const codeInput = document.getElementById("codeInput");
const runButton = document.getElementById("runButton");
const consoleOutput = document.getElementById("console");
const instruction = document.getElementById("instruction");

const successHint = document.getElementById("successHint");
const successText = document.getElementById("successText");

const game = {
    lang: "ja",
    playerName: "",
    mistakeCount: 0,
    currentQuestion: null,
    questionSolved: false
};

let index = 0;

function nextMessage() {
    index++;

    if (index >= scenario.length) {
        game.currentQuestion = "print_name";
        startQuestion();

        instruction.textContent =
            game.lang === "ja"
                ? "name を世界へ響かせてください。"
                : "Output name.";

        return;
    }

    showMessage();
}

document.addEventListener("keydown", (event) => {
    if (event.target === codeInput || event.target === nameInput) {
        return;
    }

    if (
        game.questionSolved &&
        (event.key === "Enter" || event.key === " ")
    ) {
        event.preventDefault();
        finishQuestion();
        return;
    }

    if (gameScreen.classList.contains("hidden")) {
        return;
    }

    if (codeScreen && !codeScreen.classList.contains("hidden")) {
        return;
    }

    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        nextMessage();
    }
});

const scenario = [
    {
        speaker: {
            ja: "案内人",
            en: "Guide"
        },
        text: {
            ja: "{player}よ、契約は成立しました。",
            en: "{player}, the contract is complete."
        }
    },
    {
        speaker: {
            ja: "案内人",
            en: "Guide"
        },
        text: {
            ja: "この世界では、文字はただの言葉ではありません。",
            en: "In this world, letters are not mere words."
        }
    },
    {
        speaker: {
            ja: "案内人",
            en: "Guide"
        },
        text: {
            ja: "コードです。",
            en: "They are code."
        }
    },
    {
        speaker: {
            ja: "案内人",
            en: "Guide"
        },
        text: {
            ja: "では次に、自らの名をこの世界へ出力してみましょう。",
            en: "Now, let us output your name into this world."
        }
    }
];

function startContract(selectedLang) {
    game.lang = selectedLang;

    titleScreen.classList.add("hidden");
    contractScreen.classList.remove("hidden");

    contractTitle.textContent =
        game.lang === "ja"
            ? "始まりの契約"
            : "The Contract of Initiation";

    contractText.textContent =
        game.lang === "ja"
            ? "羊皮紙に名を刻みなさい。"
            : "Write your name upon the parchment.";

    signButton.textContent =
        game.lang === "ja"
            ? "契約する"
            : "Sign";

    nameInput.placeholder =
        game.lang === "ja"
            ? "汝の名を記せ"
            : "Fill in your name";

    nameInput.value = "";
    nameInput.focus();
}

function signContract() {
    const name = nameInput.value.trim();

    if (name === "") {
        alert(
            game.lang === "ja"
                ? "汝の名を記されたし。"
                : "Please enter your name."
        );
        return;
    }

    game.playerName = name;

    contractScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    index = 0;
    showMessage();
}

function showMessage() {
    speaker.textContent = scenario[index].speaker[game.lang];

    message.textContent = scenario[index].text[game.lang].replace(
        "{player}",
        game.playerName
    );

    clickText.textContent =
        game.lang === "ja"
            ? "クリックして進む "
            : "Click to continue ";
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

codeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        runCode();
    }
});

messageBox.addEventListener("click", nextMessage);

function startQuestion() {
    game.mistakeCount = 0;
    game.questionSolved = false;

    codeInput.value = "";
    consoleOutput.textContent = "";

    codeScreen.classList.remove("hidden");
    messageBox.classList.add("hidden");

    codeInput.focus();

    successHint.classList.add("hidden");
}

function endQuestion() {
    codeScreen.classList.add("hidden");
}

function runCode() {
    const code = codeInput.value.trim();

    if (code === "print(name)") {
        game.questionSolved = true;

        consoleOutput.textContent =
            game.lang === "ja"
                ? `あなたの名前は\n\n ✨ ${game.playerName} ✨\n\n最初の魔法が世界に響きました。`
                : `Your name is\n\n ✨ ${game.playerName} ✨\n\nYour first spell echoed through the world.`;

        successText.textContent =
            game.lang === "ja"
                ? "クリックして進む "
                : "Click to continue ";

        successHint.classList.remove("hidden");

        codeInput.disabled = true;
        runButton.disabled = true;

        return;
    }

    game.mistakeCount++;

    if (game.lang === "ja") {

        if (game.mistakeCount === 1) {

            consoleOutput.textContent =
`契約で刻んだ名前は
変数 name に

name = "${game.playerName}"

として宿っています。

name を出力してください。`;

        } else {

            consoleOutput.textContent =
`もう少しです。

print(name)

としてみましょう。`;

        }

    } else {

        if (game.mistakeCount === 1) {

            consoleOutput.textContent =
`The name you inscribed upon the contract
now dwells within the variable name as

name = "${game.playerName}"

Output name.`;

        } else {

            consoleOutput.textContent =
`Try

print(name)`;

        }

    }
};

function finishQuestion() {
    endQuestion();
    toBeContinued.classList.remove("hidden");
}

codeScreen.addEventListener("click", () => {
    if (!game.questionSolved) return;
    finishQuestion();
});