import { grimoirePages } from "./grimoirePages.js";

let language = localStorage.getItem("language");

if (language !== "ja" && language !== "en") {
    language = null;
}

const pageList = document.getElementById("pageList");
const pageContent = document.getElementById("pageContent");
const pageTitle = document.getElementById("pageTitle");
const backButton = document.getElementById("backButton");
const languageButtons = document.getElementById("languageButtons");
const jaButton = document.getElementById("jaButton");
const enButton = document.getElementById("enButton");

function applyLanguage(selectedLanguage) {
    language = selectedLanguage;
    localStorage.setItem("language", selectedLanguage);

    jaButton.classList.toggle(
        "active",
        selectedLanguage === "ja"
    );

    enButton.classList.toggle(
        "active",
        selectedLanguage === "en"
    );

    pageTitle.textContent =
        language === "ja"
            ? "魔導書"
            : "Grimoire";

    backButton.textContent =
        language === "ja"
            ? "← 戻る"
            : "← Back";

    renderPageList();

    if (grimoirePages.length > 0) {
        renderPage(grimoirePages[0]);
    }
}

function renderPageList() {
    pageList.innerHTML = "";

    grimoirePages.forEach((page) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "page-list-button";
        button.textContent = page.title[language];

        button.addEventListener("click", () => {
            renderPage(page);

            document
                .querySelectorAll(".page-list-button")
                .forEach((item) => {
                    item.classList.remove("active");
                });

            button.classList.add("active");
        });

        pageList.appendChild(button);
    });
}

function renderPage(page) {
    pageContent.innerHTML = `
        <h2>${escapeHtml(page.title[language])}</h2>

        <p>${escapeHtml(page.description[language])}</p>

        <h3>${language === "ja" ? "術式" : "Syntax"}</h3>

        <pre><code>${escapeHtml(page.code)}</code></pre>

        <h3>${language === "ja" ? "実行結果" : "Output"}</h3>

        <pre><code>${escapeHtml(page.output)}</code></pre>
    `;
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

jaButton.addEventListener("click", () => {
    applyLanguage("ja");
});

enButton.addEventListener("click", () => {
    applyLanguage("en");
});

if (language === "ja" || language === "en") {
    applyLanguage(language);
} else {
    pageTitle.textContent = "Grimoire / 魔導書";
    backButton.textContent = "← Back / 戻る";
    languageButtons.classList.remove("hidden");
}