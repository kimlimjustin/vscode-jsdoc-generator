import * as vscode from 'vscode';
import generateJSDoc from "./main";

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('jsdoc-generator.generateJSDoc', generateJSDoc);

	context.subscriptions.push(disposable);
}

export function deactivate() { }
