import * as vscode from 'vscode';

const generateJSDoc = () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    // Get user selection
    const selection = editor.selection;
    // Get text of current line
    const { text } = editor.document.lineAt(editor.selection.active.line);
    // Get texts of the selection or current line content if no selection
    const selectionText = editor.document.getText(selection) || text;
    const getParamReg = /\(([^)]*)\)/;

    const isClass = /class/i.test(selectionText);
    
    if (isClass) {
        editor.edit(editBuilder => {
            // Insert text above current line
            const selectionLine = editor.document.lineAt(selection.start.line);
            const insertPosition = selectionLine.range.start;
            const whitespace = selectionLine.firstNonWhitespaceCharacterIndex;
            let text = '/** Your class description */\r';
            const padSpaceStr = ' '.repeat(whitespace);
            text = text.replace(/\r/g, `\r${padSpaceStr} `);
            text = `${padSpaceStr}${text}`;
            text = text.slice(0, text.length - whitespace - 1);
            editBuilder.insert(insertPosition, text);
        });
        return;
    }
    // Check if the line matches function params;
    const m = selectionText.match(getParamReg);
    if (!m) {
        return;
    }
    const paramList = m[1].replace(/[\t\s\r]/g, '').split(',').filter(s => s !== '');

    let jsdocExist = editor.document.lineAt(editor.selection.active.line - 1).text.indexOf(' */') !== -1;
    let _line = editor.selection.active.line - 2;
    if(jsdocExist){
        while(editor.document.lineAt(_line).text.indexOf("/**") === -1){
            if(editor.document.lineAt(_line).text.indexOf("*") === -1){
                jsdocExist = false;
                break;
            }
            _line -= 1;
        }
    }


    editor.edit(editBuilder => {
        // Insert text above current line
        const selectionLine = editor.document.lineAt(selection.start.line);
        const insertPosition = selectionLine.range.start;
        let text = '/**\r';
        text += `* Description\r`;
        // Parameters
        text += paramList
            .map(param => {
                // Typescript type
                if (param.split(":").length === 2) {
                    let paramName = param.split(":")[0].trim();
                    let paramType = param.split(":")[1].trim();
                    return `* @param {${paramType}} ${paramName}\r`;
                }
                return `* @param {any} ${param}\r`;
            })
            .join('');
        // return value
        if (!/constructor/i.test(selectionText)) {
            text += `* @returns {any}\r`;
        }
        text += `*/\r`;

        const whitespace = selectionLine.firstNonWhitespaceCharacterIndex;
        const padSpaceStr = ' '.repeat(whitespace);
        text = text.replace(/\r/g, `\r${padSpaceStr} `);
        text = `${padSpaceStr}${text}`;
        text = text.slice(0, text.length - whitespace - 1);

        if(jsdocExist){
            editBuilder.delete(new vscode.Range(new vscode.Position(_line, 0), new vscode.Position(editor.selection.active.line, 0)));
        }
        // Insert the text :)
        editBuilder.insert(insertPosition, text);
    });
};
export default generateJSDoc;