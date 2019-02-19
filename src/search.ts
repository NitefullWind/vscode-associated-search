import * as vscode from 'vscode';

export class SearchResult {
	resultItems: SearchResultItem[] = [];

	constructor() {
	}
}

export class SearchResultItem {
	uri: vscode.Uri;
	range: vscode.Range;
	value: string;
	array: RegExpExecArray;
	children?: SearchResult;

	constructor(uri: vscode.Uri, range: vscode.Range, value: string, array: RegExpExecArray) {
		this.uri = uri;
		this.range = range;
		this.value = value;
		this.array = array;
	}
}


/**
 * 在文档中搜索
 * 
 * @param regexp 要搜索的正则表达式
 * @param document 要搜索的文档
 * @return 搜索结果SearchResult对象
 */
export function searchInDocument(regexp: RegExp, document: vscode.TextDocument): Thenable<SearchResult> {
	let search_result: SearchResult = new SearchResult;
	let docText = document.getText();
	let execResults: RegExpExecArray | null;
	while((execResults = regexp.exec(docText)) !== null) {
		let value = execResults[0];
		let startPos = document.positionAt(regexp.lastIndex - value.length);
		let endPos = document.positionAt(regexp.lastIndex);
		let range = document.validateRange(new vscode.Range(startPos, endPos));

		search_result.resultItems.push(new SearchResultItem(document.uri, range, value, execResults));
	}

	return Promise.resolve(search_result);
}

export function searchInFiles(regexp: RegExp, files: vscode.Uri[]): Thenable<SearchResult> {
	return new Promise(async(resolve) => {
		let search_result: SearchResult = new SearchResult;
		for (const file of files) {
			let doc = await vscode.workspace.openTextDocument(file);
			let tmpRst = await searchInDocument(regexp, doc);
			if(tmpRst.resultItems.length > 0) {
				search_result.resultItems.concat(tmpRst.resultItems);
			}
		}
		resolve(search_result);
	});
}