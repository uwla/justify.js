export const REGEX_BLANK = "^[\\s\\t]*$";
export const REGEX_INDENTED = "^(\\t+|\\s\\s)+"
export const REGEX_ALPHANUMERIC = "([a-z]|\\d+|x?v?i{0,3}|i?[xv])"
export const REGEX_BULLET = `${REGEX_ALPHANUMERIC}[\\.\\)]|\\-|\\\\item|\\[${REGEX_ALPHANUMERIC}\\]`;
export const REGEX_LIST_ITEM = `^(${REGEX_BULLET}) `;
export const REGEX_LIST_ITEM_INDENTED = `^[\\s\\t]*(${REGEX_BULLET}) `;
export const REGEX_LATEX_CMD = "^(\\t|\\s)*\\\\[a-z]+(\\[.*?\\])?{.*?}$";
export const REGEX_MARKDOWN_TITLE = "^#+ .+";
export const REGEX_MULTILINE_COMMENT = "^(\\t|\\s\\s)*(//|--|\"|\\*|#)"

export function match(text: string, regex: string) {
    return text.match(regex as any) !== null;
}

export function isBlank(line: string): Boolean {
    return match(line, REGEX_BLANK);
}

export function isIndented(line: string): Boolean {
    return match(line, REGEX_INDENTED);
}

export function isStartOfListItem(line: string): Boolean {
    return match(line, REGEX_LIST_ITEM);
}

export function isIndentedStartOfListItem(line: string): Boolean {
    return match(line, REGEX_LIST_ITEM_INDENTED);
}

export function isLatexCommand(line: string): Boolean {
    return match(line, REGEX_LATEX_CMD);
}

export function isMarkdownTitle(line: string): Boolean {
    return match(line, REGEX_MARKDOWN_TITLE);
}

export function isManPageTitle(line: string): Boolean {
    return match(line, "^(\\w\\s?)+") && !match(line, "[a-z]");
}

export function isTitle(line: string): Boolean {
    return isMarkdownTitle(line) || isManPageTitle(line);
}

export function textToBlocks(text: string): string[] {
    const lines = text.split("\n");
    const l = lines.length;
    let blocks: string[] = [];
    let block: string = "";
    let line : string;
    let otherLine: string;
    let indentation : string;
    let regex : string;
    let i : number;
    let j : number;

    for (i = 0; i < l; i += 1) {
        line = lines[i];

        // handle blank lines and begin/end latex blocks
        if (isBlank(line) || isLatexCommand(line)) {
            if (block !== "") {
                blocks.push(block);
            }
            blocks.push(line);
            block = "";
            continue;
        }

        // handle list items
        if (isStartOfListItem(line)) {
            if (block !== "") {
                blocks.push(block);
            }
            block = line;
            continue;
        }

        // handle indentation
        if (isIndented(line)) {
            if (block !== "") {
                blocks.push(block);
            }
            block = line;

            let isList = isIndentedStartOfListItem(line);
            indentation = detectIndentation(line);
            regex = `^${indentation}[^\\t\\s]+`;
            for (j = i+1; j < l; j+=1) {
                otherLine = lines[j];
                if (! match(otherLine, regex)) {
                    break
                }
                if (isList && (isIndentedStartOfListItem(otherLine) || isLatexCommand(otherLine))) {
                    break;
                }
                block += "\n" + otherLine;
            }

            // get the prefix to apply heuristics to edge cases.
            let prefix = detectMultilinePrefix(block);

            // edge case when prefix is the same as line
            if (prefix === line) {
                blocks.push(line) 
                block = '';
                continue;
            }

            // heuristic to handle edge cases where the indentation  logic  ends
            // up including lines which have the same indentation but  different
            // prefixes (such as in code comments).
            if (prefix !== indentation && j !== i+1) {
                // if prefix is distinct than indentation, it may be a comment,
                // which is usually followed by a space after the prefix.
                if (! prefix.endsWith(" ")) {
                    prefix += " ";
                }

                // if our assumption is right, we want to include only  prefixed
                // lines in the block we will attach.
                if (line.startsWith(prefix)) {
                    block = line;
                    for (j = i+1; j < l; j+=1) {
                        otherLine = lines[j];
                        if (! otherLine.startsWith(prefix)) { 
                            break;
                        }
                        block += "\n" + otherLine;
                    }
                }
            }

            // update i, because we checked the next lines.
            i = j-1;

            // add block
            blocks.push(block);
            block = '';

            continue;
        }

        // normal line
        if (block !== "") {
            block += "\n";
        }
        block += line;
    }

    // if block isn't blank, it means it has text that wans't added.
    // so, we add the remaining text.
    if (!isBlank(block)) {
        blocks.push(block);
    }

    return blocks;
}

export function detectIndentation(text: string): string {
    const lines = text.split("\n");
    const l = lines.length;

    if (l === 0) {
        throw new Error("No lines detected");
    }

    let firstLine = lines[0];
    const match = firstLine.match(/^[\s\t]+/);
    if (match === null) {
        return "";
    }

    const indentation = match[0];
    for (let line of lines) {
        if (!line.startsWith(indentation)) {
            return "";
        }
    }

    return indentation;
}

export function detectMultilinePrefix(text: string): string {
    const lines = text.split("\n");
    const l = lines.length;

    if (l < 2) {
        return "";
    }

    let firstLine = lines[0];
    let linesAfterTheFirst = lines.slice(1, l);
    let prefix = "";
    let i = 0;
    while (true) {
        let stop = false;

        // first line ended
        if (firstLine.length <= i) {
            break;
        }

        let currentCharacter = firstLine[i];

        // check if all other lines match the current prefix
        for (let line of linesAfterTheFirst) {
            if (i >= line.length || line[i] !== currentCharacter) {
                stop = true;
                break;
            }
        }

        if (stop) {
            break;
        }

        prefix += currentCharacter;
        i += 1;
    }

    // Some list item bullets such as *, -, \item, are  not  treated  like  prefixes
    // because such prefixes only apply  to  the  first  line,  not  to  all  lines.
    // Therefore, if pattern matches a list item, it is not a prefix.
    if (match(prefix, '^[\\s\\t]+[^\\s\\t]')) {
        if (isStartOfListItem(firstLine.replace('^[\\s\\t]+', ''))) {
            return "";
        }
    }

    if (match(prefix, REGEX_MULTILINE_COMMENT + ' +$')) {
        return prefix.replace('/ +$/', '')
    }

    // remove alpha numeric characters from pattern
    prefix = prefix.replace(/\w.*/, "");

    // return it
    return prefix;
}

export function removeMultilinePrefix(text: string, prefix: string) {
    const lines = text.split("\n");
    let newText = "";
    let lastLine = lines.pop() as any;
    for (let line of lines) {
        let newLine = line.replace(prefix as any, "");
        newText += newLine + "\n";
    }
    newText += lastLine.replace(prefix as any, "");
    return newText;
}

export function prependMultilinePrefix(text: string, prefix: string) {
    const lines = text.split("\n");
    let newText = "";
    let lastLine = lines.pop();
    for (let line of lines) {
        newText += prefix + line + "\n";
    }
    newText += prefix + lastLine;
    return newText;
}
