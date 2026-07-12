function replayChapter(chapterId) {
    sessionStorage.setItem(
        "replayChapter",
        String(chapterId)
    );

    location.href = "./index.html";
}