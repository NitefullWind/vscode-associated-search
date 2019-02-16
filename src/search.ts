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
 * 在当前文档中搜索
 * 
 * @param regexp 要搜索的正则表达式
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