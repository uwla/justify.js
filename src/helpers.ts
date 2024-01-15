export const REGEX_BLANK = "^[\\s\\t]*$";
export const REGEX_BULLET = "\\d+[\\.\\)]|[\\*-]|\\\\item|\\[\\d+\\]";
export const REGEX_LIST_ITEM = `^(${REGEX_BULLET}) `;
export const REGEX_LIST_ITEM_INDENTED = `^[\\s\t]+(${REGEX_BULLET}) `;
export const REGEX_LATEX_CMD = "^\\\\[a-z]+(\\[.*?\\])?{.*?}$";
export const REGEX_MARKDOWN_TITLE = "^#+ .+";

export function match(text: string, regex: string) {
    return text.match(regex as any) !== null;
}

export function isBlank(line: string): Boolean {
    return match(line, REGEX_BLANK);
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
    let blocks : string[] = [];
    let block : string = "";

    for (let i = 0; i < l; i += 1) {
        let line : string = lines[i];

        if (isBlank(line) || isLatexCommand(line)) {
            if (block !== "") {
                blocks.push(block);
            }
            blocks.push(line);
            block = "";
        } else if (isStartOfListItem(line)) {
            if (block !== "") {
                blocks.push(block);
            }
            block = line;
        } else  {
            if (block !== '') {
                block += '\n';
            }
            block += line;
        }

        // We are in the last line and have a non-empty block, so add it.
        // If block is blank, it was already added.
        if (i === l-1 && !isBlank(block)) {
            blocks.push(block);
        }
    }

    return blocks;
}

export function detectIndentation(text: string): string {
    const lines = text.split("\n");
    const l = lines.length;

    if (l === 0) {
        throw new Error('No lines detected');
    }

    let firstLine = lines[0];
    const match = firstLine.match(/^[\s\t]+/);
    if (match === null) {
        return '';
    }

    const indentation = match[0];
    for (let line of lines) {
        if (! line.startsWith(indentation) ) {
            return '';
        }
    }

    return indentation;
}

export function detectMultilinePrefix(text: string): string {
    const lines =  text.split("\n");
    const l = lines.length;

    if (l < 2) {
        return '';
    }

    let firstLine = lines[0];
    let linesAfterTheFirst = lines.slice(0, l-1);
    let prefix = '';
    let i = 0;
    while (true) {
        let stop = false;

        // first line ended
        if (firstLine.length <= i) {
            break;
        }

        let currentCharacter =  firstLine[i];

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
    if (isIndentedStartOfListItem(prefix)) {
        return '';
    }

    // remove alpha numeric characters from pattern
    prefix = prefix.replace(/\w.*/, '');

    // return it
    return prefix;
}

export function removeMultilinePrefix(text: string, prefix: string) {
    const lines = text.split("\n");
    let newText = '';
    for (let line of lines) {
        let newLine = line.replace(prefix as any, '');
        newText += newLine + "\n";
    }
    return newText;
}

export function prependMultilinePrefix(text: string, prefix: string) {
    const lines = text.split("\n");
    let newText = '';
    for (let line of lines) {
        newText += prefix + line + "\n";
    }
    return newText;
}