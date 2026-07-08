const chapter1 = {
    id: "chapter1",
    chapterNumber: 1,
    title: {
        ja: "目覚め",
        en: "Awakening"
    },

    scenario: [
        {
            type: "chapterTitle"
        },
        {
            speaker: { ja: "", en: "" },
            text: {
                ja: "数年が経った。",
                en: "Several years have passed."
            }
        },
        {
            speaker: { ja: "{player}", en: "{player}" },
            text: {
                ja: "あの頃から、時折近い未来が視えるような気がする。",
                en: "Since then, I sometimes feel as though I can glimpse the near future."
            }
        },
        {
            speaker: { ja: "{player}", en: "{player}" },
            text: {
                ja: "あれは夢だったのかもしれない。",
                en: "That might have been a dream."
            }
        },
        {
            speaker: { ja: "{player}", en: "{player}" },
            text: {
                ja: "だが、たまに思い出したように名前を響かせて遊ぶことがある。",
                en: "But sometimes, as if recalling a memory, I play with the sound of my name."
            }
        },
        {
            type: "question",
            questionId: "print_name"
        },
        {
            speaker: { ja: "{player}", en: "{player}" },
            text: {
                ja: "......声にしたつもりはない。だが、世界そのものが我が名を響かせた。",
                en: "...I did not intend to speak it aloud. Yet, the world itself echoed my name."
            }
        },
        {
            speaker: { ja: "{player}", en: "{player}" },
            text: {
                ja: "今日も響いた。やはり夢ではないのか。",
                en: "It echoed again today. Perhaps it was not a dream after all."
            }
        },
        {
            speaker: { ja: "", en: "" },
            text: {
                ja: "(ノックの音)",
                en: "(Knock)"
            }
        }
    ],

    questions: {
        print_name: {
            instruction: {
                ja: "あなたの name を世界へ響かせてください。",
                en: "Echo your name into the world."
            },

            answer: "print(name)",

            preview: {
                empty: {
                    ja: "🔮 未来視 🔮\n\nまだ未来は見えない。",
                    en: "🔮 Future Insight 🔮\n\nNo future can be seen yet."
                },
                correct: {
                    ja: "🔮 未来視 🔮\n\n{player}",
                    en: "🔮 Future Insight 🔮\n\n{player}"
                },
                wrong: {
                    ja: "🔮 未来視 🔮\n\nこのままでは魔法が乱れそう。",
                    en: "🔮 Future Insight 🔮\n\nThe spell will fail as it is."
                }
            },

            success: {
                ja: "あなたの名前は\n\n ✨ {player} ✨\n\n最初の魔法が世界に響きました。",
                en: "Your name is\n\n ✨ {player} ✨\n\nYour first spell echoed through the world."
            },

            hints: [
                {
                    ja: "契約で刻んだ名前は 変数 name に\n\nname = \"{player}\"\n\nとして宿っています。\n\nname を出力してください。",
                    en: "The name you inscribed upon the contract now dwells within the variable name as\n\nname = \"{player}\"\n\nOutput name."
                },
                {
                    ja: "もう少しです。\n\nprint(name)\n\nとしてみましょう。",
                    en: "Try\n\nprint(name)"
                }
            ]
        }
    }
};