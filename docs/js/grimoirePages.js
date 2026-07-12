export const grimoirePages = [
    {
        id: "print",

        title: {
            ja: "第一頁: 声を世界へ届ける術",
            en: "Page One: The Spell That Gives Voice",
        },

        description: {
            ja: "print() は、文字や数を画面に表示するための命令です。",
            en: "print() displays text or numbers on the screen.",
        },

        code: 'print("Hello")',

        output: "Hello",
    },

    {
        id: "variable",

        title: {
            ja: "第二頁: 名を器に宿す術",
            en: "Page Two: The Spell of Binding a Name",
        },

        description: {
            ja: "変数は、値に名前を付けて保存する仕組みです。",
            en: "A variable stores a value under a name.",
        },

        code: 'name = "Alice"\nprint(name)',

        output: "Alice",
    },
];