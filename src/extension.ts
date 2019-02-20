// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Controller } from './controller';
import { SearchResult } from './search';
import { Provider } from './provider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "associated-search" is now active!');

	let controller: Controller = new Controller(context);

	// TreeView
	const searchResultProvider = new Provider();
	vscode.commands.registerCommand("associatedSearch.refreshResults", () => searchResultProvider.refresh());
	vscode.commands.registerCommand("search-results.gotoTheLine", searchResultItem => controller.gotoTheLine(searchResultItem));

	vscode.window.registerTreeDataProvider("search-results", searchResultProvider);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('associatedSearch.search', () => {
		controller.search().then(searchResult => {
			console.log("===search succes:", searchResult);
			searchResultProvider.setSearchResult(searchResult);
			searchResultProvider.refresh();
		}, reason => {
			console.log("===search error:", reason);
			searchResultProvider.setSearchResult(new SearchResult);
			searchResultProvider.refresh();
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
