const chapterMenuButton = document.getElementById("chapterMenuButton");
const chapterMenuButtonText = document.getElementById("chapterMenuButtonText");
const chapterMenuOverlay = document.getElementById("chapterMenuOverlay");
const chapterMenu = document.getElementById("chapterMenu");
const chapterMenuCloseButton = document.getElementById("chapterMenuCloseButton");
const chapterMenuTitle = document.getElementById("chapterMenuTitle");
const chapterMenuStatus = document.getElementById("chapterMenuStatus");
const chapterLinks = document.getElementById("chapterLinks");

const PLAYER_PROFILE_STORAGE_KEY = "la-fantasia-pythonica.profile.v1";
let lastMenuFocus = null;

function getSavedProfile() {
    try {
        const profile = JSON.parse(localStorage.getItem(PLAYER_PROFILE_STORAGE_KEY));

        if (
            profile &&
            (profile.lang === "ja" || profile.lang === "en") &&
            typeof profile.playerName === "string" &&
            profile.playerName.trim() !== ""
        ) {
            return {
                lang: profile.lang,
                playerName: profile.playerName.trim()
            };
        }
    } catch {
        // Ignore malformed or unavailable local storage data.
    }

    return null;
}

function saveProfile(profile) {
    try {
        localStorage.setItem(PLAYER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
        // The game remains playable when storage is unavailable.
    }
}

function applyProfile(profile) {
    game.lang = profile.lang;
    game.playerName = profile.playerName;
    document.documentElement.lang = profile.lang;
}

function isChapterMenuOpen() {
    return !chapterMenuOverlay.classList.contains("hidden");
}

function renderChapterMenu() {
    const profile = getSavedProfile();
    const menuLang = profile?.lang ?? game.lang;

    chapterMenuButtonText.textContent = uiText.chapterMenuButton[menuLang];
    chapterMenuTitle.textContent = uiText.chapterMenu[menuLang];
    chapterMenuCloseButton.setAttribute("aria-label", uiText.close[menuLang]);
    chapterLinks.setAttribute("aria-label", uiText.chapterMenu[menuLang]);
    chapterMenuStatus.textContent = profile
        ? uiText.chapterMenuProfileReady[menuLang].replace(
            "{player}",
            profile.playerName
        )
        : uiText.chapterMenuProfileRequired[menuLang];

    chapterLinks.replaceChildren();

    chapters.forEach((chapter, targetIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chapterLink";
        button.disabled = profile === null;
        button.textContent = `${uiText.chapterLabel[menuLang].replace(
            "{number}",
            chapter.chapterNumber
        )} — ${chapter.title[menuLang]}`;
        button.addEventListener("click", () => startChapterFromMenu(targetIndex));
        chapterLinks.append(button);
    });
}

function openChapterMenu() {
    lastMenuFocus = document.activeElement;
    renderChapterMenu();
    chapterMenuOverlay.classList.remove("hidden");
    chapterMenuButton.setAttribute("aria-expanded", "true");
    chapterMenuCloseButton.focus();
}

function closeChapterMenu(restoreFocus = true) {
    chapterMenuOverlay.classList.add("hidden");
    chapterMenuButton.setAttribute("aria-expanded", "false");

    if (restoreFocus && lastMenuFocus instanceof HTMLElement) {
        lastMenuFocus.focus();
    }

    lastMenuFocus = null;
}

function resetForChapterJump() {
    game.sessionId++;
    game.isBusy = false;
    game.mistakeCount = 0;
    game.currentQuestion = null;
    game.questionSolved = false;

    clearSceneTimer();
    resetPythonWorker();

    flashOverlay.classList.add("hidden");
    flashOverlay.classList.remove("flash");
    chapterTitleScreen.classList.add("hidden");
    chapterTitleScreen.classList.remove("show");
    codeScreen.classList.add("hidden");
    toBeContinued.classList.add("hidden");
    successHint.classList.remove("clickable");
    successHint.classList.add("hidden");
    hideMessageBox();
}

function startChapterFromMenu(targetIndex) {
    const profile = getSavedProfile();
    const targetChapter = chapters[targetIndex];

    if (!profile || !targetChapter) {
        renderChapterMenu();
        return;
    }

    closeChapterMenu(false);
    resetForChapterJump();
    applyProfile(profile);

    titleScreen.classList.add("hidden");
    contractScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    currentChapter = targetChapter;
    chapterIndex = targetIndex;
    index = 0;
    showMessage();
}

chapterMenuButton.addEventListener("click", () => {
    if (isChapterMenuOpen()) {
        closeChapterMenu();
    } else {
        openChapterMenu();
    }
});

chapterMenuCloseButton.addEventListener("click", () => closeChapterMenu());

chapterMenuOverlay.addEventListener("click", (event) => {
    if (event.target === chapterMenuOverlay) {
        closeChapterMenu();
    }
});

chapterMenuOverlay.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") {
        return;
    }

    const focusableElements = chapterMenu.querySelectorAll("button:not(:disabled)");
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement || !lastElement) {
        return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
    }
});

window.addEventListener("player-profile-saved", (event) => {
    saveProfile(event.detail);
    renderChapterMenu();
});

const savedProfile = getSavedProfile();

if (savedProfile) {
    applyProfile(savedProfile);
}

renderChapterMenu();
