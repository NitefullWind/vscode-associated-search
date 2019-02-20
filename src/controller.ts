import * as vscode from 'vscode';
import { SearchResult, SearchResultItem } from './search';
import { searchIDFunctionInWorkspace } from './example/searchIDFunc';

export class Controller {
	context: vscode.ExtensionContext;
	
	constructor(context: vscode.ExtensionContext) {
		this.context = context;
	}

	/**
	 * 弹出搜索输入框进入搜索
	 */
	search(): Thenable<SearchResult> {
		return new Promise(resolve => {
			let activeEditor = vscode.window.activeTextEditor;
			let selectStr: string = "";
			if(activeEditor) {
				selectStr = activeEditor.document.getText(activeEditor.selection);
			}
			
			var inputBoxOpts = <vscode.InputBoxOptions>{
				prompt: "输入搜索内容",
				placeHolder: "Search",
				value: selectStr
			};
			
			vscode.window.showInputBox(inputBoxOpts).then(inputValue => {
				if(inputValue) {
					let searchResults = searchIDFunctionInWorkspace(inputValue, "**/*.lua");
					resolve(searchResults);
				}
			});
		});
	}

	/**
	 * 跳转到SearchResultItem所在行
	 */
	gotoTheLine(searchResultItem: SearchResultItem): void {
        let editor = vscode.window.activeTextEditor;
        if(editor === undefined || editor.document.uri !== searchResultItem.uri) {                // 打开文档的指定行
            vscode.window.showTextDocument(searchResultItem.uri, {selection: searchResultItem.range});
        } else if(editor) {                                                                 // 跳转到指定行
            editor.revealRange(searchResultItem.range, vscode.TextEditorRevealType.InCenter);
        }
	}
}