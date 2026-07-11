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
                ja: "......声にしたつもりはない。だが、世界そのものが我が名を轟かせた。",
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
            speaker: { ja: " ", en: "" },
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

            expectedOutput: "{player}",

            executionMessages: {
                loading: {
                    ja: "古の術式 Python を召喚しています……",
                    en: "Summoning the ancient art of Python..."
                },
                timeout: {
                    ja: "術式が終わりなき環へ迷い込みました。魔力の奔流を断ち切ります。",
                    en: "The spell has strayed into an endless circle. Its flow of magic has been severed."
                },
                loadError: {
                    ja: "術式 Python との交信が途絶えています。魔力の経路を確かめ、もう一度発動してください。",
                    en: "The link to Python has been lost. Check the arcane pathway, then cast once more."
                },
                previewHeading: {
                    ja: "🔮 未来視 🔮",
                    en: "🔮 Future Insight 🔮"
                },
                noOutput: {
                    ja: "世界はまだ、何も語らない。",
                    en: "The world remains silent."
                }
            },

            preview: {
                empty: {
                    ja: "🔮 未来視 🔮\n\nまだ未来は見えない。",
                    en: "🔮 Future Insight 🔮\n\nNo future can be seen yet."
                }
            },

            success: {
                ja: "✨ {player} ✨\nどこか遠くまで声が届いた気がした。",
                en: "✨ {player} ✨\nI felt as though the voice reached somewhere far away."
            },

            hints: [
                {
                    ja: "契約で刻んだ名前は 変数 name に\nname = \"{player}\"\nとして宿っています。\nname を出力してください。",
                    en: "The name you inscribed upon the contract now dwells within the variable name as\nname = \"{player}\"\nOutput name."
                },
                {
                    ja: "もう少しです。\nprint(name)\nとしてみましょう。",
                    en: "Try\nprint(name)"
                }
            ]
        }
    }
};
