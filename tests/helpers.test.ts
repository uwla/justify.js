import { test, expect } from "vitest";
import {
    detectMultilinePrefix,
    isBlank,
    isLatexCommand,
    isStartOfListItem,
    prependMultilinePrefix,
    removeMultilinePrefix,
    textToBlocks,
} from "../src/helpers";

test("recognizes blank lines", () => {
    const tests_1 = [
        "",
        "\n",
        " ".repeat(4),
        " ".repeat(8),
        "\t",
        "\t".repeat(3),
        "\t".repeat(2) + " ".repeat(2),
    ];
    const tests_2 = [
        "Hello",
        "       World",
        "\t\t\t\t\t\t!",
        "               :-)",
    ];

    for (let test of tests_1) {
        expect(isBlank(test)).toBe(true);
    }
    for (let test of tests_2) {
        expect(isBlank(test)).toBe(false);
    }
});

test("recognizes start of list item", () => {
    const tests_1 = [
        "- test test test test.",
        "* test test test test.",
        "5. test test test test.",
        "5) test test test test.",
        "15. test test test test.",
        "15) test test test test.",
        "[2] test test test test.",
        "[12] test test test test.",
        "\\item Test test test.",
    ];
    const tests_2 = [
        "-test test test test.",
        "-- test test test test.",
        "** test test test test.",
        "5 test test test test.",
        "5.test test test test.",
        "5)test test test test.",
        "15 test test test test.",
        "15.test test test test.",
        "15)test test test test.",
        "20] test test test test.",
        "[20 test test test test.",
        "[20]test test test test.",
    ];

    for (let test of tests_1) {
        expect(isStartOfListItem(test)).toBe(true);
    }
    for (let test of tests_2) {
        expect(isStartOfListItem(test)).toBe(false);
    }
});

test("recognizes LaTeX commands", () => {
    const tests_1 = [
        "\\section{Chapter 1}",
        "\\begin{center}",
        "\\includegraphics{image.png}",
        "\\includegraphics[width=1]{image.png}",
        "\\end{center}",
    ];
    const tests_2 = [
        "begin{center}",
        "\\textbf{Python}: a programming language",
        "end{center}",
    ];

    for (let test of tests_1) {
        expect(isLatexCommand(test)).toBe(true);
    }
    for (let test of tests_2) {
        expect(isLatexCommand(test)).toBe(false);
    }
});

test("parses text to blocks", () => {
    const tests = [
        "\nA quo autem hic quis id neque. Dolor numquam non iure.\nQuod ipsum officia ad repudiandae est id.\n\nEveniet dolores quis debitis. Deserunt quod tempora rerum ea hic cum.\nEst aperiam velit corrupti.\nLaudantium et laboriosam placeat quia consequatur perspiciatis id molestias.\n\nBlanditiis magnam consequatur aperiam rerum rerum.\nVoluptas cumque rerum et molestias quos at quis.",
        "A quo autem hic quis id neque. Dolor numquam non iure.\n\n\n\nBlanditiis magnam consequatur aperiam rerum rerum.\nVoluptas cumque rerum et molestias quos at quis.",
    ];
    const expected = [
        [
            "",
            "A quo autem hic quis id neque. Dolor numquam non iure.\nQuod ipsum officia ad repudiandae est id.",
            "",
            "Eveniet dolores quis debitis. Deserunt quod tempora rerum ea hic cum.\nEst aperiam velit corrupti.\nLaudantium et laboriosam placeat quia consequatur perspiciatis id molestias.",
            "",
            "Blanditiis magnam consequatur aperiam rerum rerum.\nVoluptas cumque rerum et molestias quos at quis.",
        ],
        [
            "A quo autem hic quis id neque. Dolor numquam non iure.",
            "",
            "",
            "",
            "Blanditiis magnam consequatur aperiam rerum rerum.\nVoluptas cumque rerum et molestias quos at quis.",
        ],
    ];

    for (let i = 0; i < tests.length; i += 1) {
        expect(textToBlocks(tests[i])).toEqual(expected[i]);
    }
});

test("detects multiline prefix", () => {
    const tests = [
        "# Lorem upsum\n# Quae voluptatum earum sapiente unde ab corporis ducimus iure. Debitis\n# voluptatibus id incidunt incidunt doloremque. Est ut laborum dolorum voluptas\n# reiciendis velit itaque voluptatibus. Tempora repellendus iure qui natus rerum",
        "# Quae voluptatum earum sapiente unde ab corporis ducimus iure. Debitis\n# voluptatibus id incidunt incidunt doloremque. Est ut laborum dolorum voluptas\n#\n#\n# reiciendis velit itaque voluptatibus. Tempora repellendus iure qui natus rerum\n# reiciendis",
        "\t\t\tHello\n\t\t\tQuae voluptatum earum sapiente unde ab corporis ducimus iure. Debitis\n\t\t\tvoluptatibus id incidunt incidunt doloremque. Est ut laborum dolorum voluptas\n",
        "    Lorem upsum\n    Quae voluptatum earum sapiente unde ab corporis ducimus iure. Debitis\n    voluptatibus id incidunt incidunt doloremque. Est ut laborum dolorum voluptas\n",
        "    // LOREM UPSUM\n    //\n    // Tempora repellendus iure qui natus rerum\n    // voluptatibus id incidunt incidunt doloremque.\n    // Est ut laborum dolorum voluptas\n    //\n    //\n    // Quae voluptatum earum sapiente unde ab corporis ducimus iure. Debitis",
    ];
    const expected = ["# ", "#", "\t\t\t", "    ", "    //"];

    for (let i = 0; i < test.length; i += 1) {
        expect(detectMultilinePrefix(tests[i])).toBe(expected[i]);
    }
});

test("removes multiline prefix", () => {
    const original =
        "Magnam rerum ea cupiditate pariatur ipsam.\nEst sed sed suscipit et error maxime qui non.\nEt iure sequi nihil enim dolorum.\nConsequatur similique quam culpa et.\n";
    const tests = [
        "# Magnam rerum ea cupiditate pariatur ipsam.\n# Est sed sed suscipit et error maxime qui non.\n# Et iure sequi nihil enim dolorum.\n# Consequatur similique quam culpa et.",
        "    Magnam rerum ea cupiditate pariatur ipsam.\n    Est sed sed suscipit et error maxime qui non.\n    Et iure sequi nihil enim dolorum.\n    Consequatur similique quam culpa et.",
        "//  Magnam rerum ea cupiditate pariatur ipsam.\n//  Est sed sed suscipit et error maxime qui non.\n//  Et iure sequi nihil enim dolorum.\n//  Consequatur similique quam culpa et.",
    ];

    for (let test of tests) {
        const prefix = detectMultilinePrefix(test);
        expect(removeMultilinePrefix(test, prefix)).toBe(original);
    }
});

test("prepends multiline prefix", () => {
    const original =
        "Magnam rerum ea cupiditate pariatur ipsam.\nEst sed sed suscipit et error maxime qui non.\nEt iure sequi nihil enim dolorum.\nConsequatur similique quam culpa et.";
    const tests = ["# ", "    ", "//  "];
    const expected = [
        "# Magnam rerum ea cupiditate pariatur ipsam.\n# Est sed sed suscipit et error maxime qui non.\n# Et iure sequi nihil enim dolorum.\n# Consequatur similique quam culpa et.\n",
        "    Magnam rerum ea cupiditate pariatur ipsam.\n    Est sed sed suscipit et error maxime qui non.\n    Et iure sequi nihil enim dolorum.\n    Consequatur similique quam culpa et.\n",
        "//  Magnam rerum ea cupiditate pariatur ipsam.\n//  Est sed sed suscipit et error maxime qui non.\n//  Et iure sequi nihil enim dolorum.\n//  Consequatur similique quam culpa et.\n",
    ];

    for (let i = 0; i < tests.length; i += 1) {
        const prefix = tests[i];
        expect(prependMultilinePrefix(original, prefix)).toBe(expected[i]);
    }
});
