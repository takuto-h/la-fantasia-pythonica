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
                    ja: "古の知識体系への接続を試みています......",
                    en: "Attempting to connect to an ancient body of knowledge..."
                },
                timeout: {
                    ja: "術式が終わりなき環へ迷い込みました。魔力の奔流を断ち切ります......",
                    en: "The spell woven from the ancient system of magic has become trapped in an endless loop. Severing the flow of mana..."
                },
                loadError: {
                    ja: "古の魔法体系との交信が途絶えています。魔力の経路を確かめ、もう一度接続を試みてください。",
                    en: "Communication with the ancient system of magic has been lost. Check the flow of mana and try establishing the connection again."
                },
                previewHeading: {
                    ja: "🔮 未来視 🔮",
                    en: "🔮 Future Insight 🔮"
                },
                noOutput: {
                    ja: "世界は、何も語らない。",
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
                    ja: "もう少しです。\nprint(name)\nとしてみましょう。\nname = \"なんらかの文字\" を既に入れてしまった場合は\nname = \"{player}\" としたのち、\nprint(name)\nとしてみましょう。",
                    en: "Almost there.\nTry typing: print(name)\nIf you've already changed name = \"some text\", set it back to\nname = \"{player}\"\nand then try: print(name)"
                }
            ]
        }
    }
};
