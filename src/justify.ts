import {
    REGEX_LIST_ITEM,
    detectIndentation,
    detectMultilinePrefix,
    isBlank,
    isIndented,
    isStartOfListItem,
    prependMultilinePrefix,
    removeMultilinePrefix,
    textToBlocks,
} from "./helpers";

type Sentence = {
    length: number;
    words: Array<string>;
};

export function justifyBlock(text: string, n: number = 80): string {
    const words = (text as any).replace(/[\s\n]+/g, " ").split(" ");

    // this data structure will be used to build the text
    let sentences: Sentence[] = [{ length: 0, words: [] }];

    // build the sentence structure
    let currentSentenceLength = 0;
    for (let word of words) {
        let wordLength = word.length;

        if (n <= currentSentenceLength + wordLength) {
            currentSentenceLength = wordLength;
            sentences.push({
                length: wordLength,
                words: [word],
            });
        } else {
            let sentence = sentences[sentences.length - 1] as Sentence;
            sentence.words.push(word);

            // extra offset due to space preceding the word
            let spaceOffset = 1;

            // the first word is not preceded by a space
            if (sentence.length === 0) {
                spaceOffset = 0;
            }

            sentence.length += wordLength + spaceOffset;
            currentSentenceLength += wordLength + spaceOffset;
        }
    }

    const l = sentences.length;
    let newText = "";

    // justify single sentence
    for (let i = 0; i < l - 1; i += 1) {
        let sentence = sentences[i] as Sentence;
        let line = "";
        let words = sentence.words.slice(0).reverse(); // slice returns a copy
        let nWords = words.length;

        if (nWords === 0) {
            continue;
        }

        // extra spaces logic
        let totalExtraSpaces, spaceGaps, spacePerGap, remainingSpaces;

        if (nWords === 1) {
            totalExtraSpaces = 0;
            remainingSpaces = 0;
            spacePerGap = 0;
        } else {
            totalExtraSpaces = n - sentence.length;
            spaceGaps = nWords - 1;
            spacePerGap = Math.floor(totalExtraSpaces / spaceGaps);
            remainingSpaces = totalExtraSpaces - spaceGaps * spacePerGap;
        }

        // adds extra spaces between words evenly
        for (let j = 0; j < nWords - 1; j += 1) {
            let word = words[j];
            let extraSpaces;
            if (remainingSpaces > 0) {
                extraSpaces = spacePerGap + 1;
                remainingSpaces -= 1;
            } else {
                extraSpaces = spacePerGap;
            }
            let spaces = " " + " ".repeat(extraSpaces);
            line = spaces + word + line;
        }

        // last line has different logic
        line = words[nWords - 1] + line;

        // append line to text
        newText += line + "\n";
    }

    // last sentence is also handled different.
    let lastSentence = sentences[l - 1] as Sentence;

    // join the words of the last sentence and trim whitespace
    newText += lastSentence.words.join(" ").replace(/\s+$/, "");

    return newText;
}

export function justifyListItem(text: string, n: number): string {
    const match = text.match(REGEX_LIST_ITEM);
    if (match === null) {
        throw Error("Provided text is not a list item");
    }

    const bullet = match[0];
    const indentationOffset = bullet.length;
    const indentation = " ".repeat(indentationOffset);

    // first, we remove the bullet
    let newText = text.replace(bullet, "");

    // then, we add indentation to all lines
    newText = justifyBlock(newText, n - indentationOffset);

    // indent the other lines
    newText = prependMultilinePrefix(newText, indentation);

    // put bullet again in the first line
    newText = newText.replace(indentation, bullet);

    return newText;
}

// TODO: add option for tabs
export function justify(
    text: string,
    n: number = 80,
    depth: number = 3,
): string {
    let newText = "";
    let textIndentation = detectIndentation(text);
    let blocks;

    if (textIndentation !== "") {
        blocks = textToBlocks(removeMultilinePrefix(text, textIndentation));
    } else {
        blocks = textToBlocks(text);
    }

    let m = n - textIndentation.length;

    let nBlocks = blocks.length;
    for (let i = 0; i < nBlocks; i += 1) {
        let block = blocks[i] as any;

        if (isStartOfListItem(block)) {
            block = justifyListItem(block, m);
            block = block.replace(/\n/g, "\n" + textIndentation);
            newText += textIndentation + block;
        } else if (!isBlank(block)) {
            let blockPrefix = detectMultilinePrefix(block);
            if (blockPrefix === "") {
                blockPrefix = detectIndentation(block);
            }
            let l = blockPrefix.length;
            if (l > 0) {
                block = removeMultilinePrefix(block, blockPrefix);
            }
            if (depth > 0 && l > 0) {
                block = justify(block, m - l, depth - 1);
            } else {
                block = justifyBlock(block, m - l);
            }
            block = prependMultilinePrefix(
                block,
                textIndentation + blockPrefix,
            );
            newText += block;
        }

        if (i !== nBlocks - 1) {
            newText += "\n";
        }
    }

    return newText;
}

export default justify;