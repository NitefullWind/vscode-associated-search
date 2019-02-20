import * as vscode from 'vscode';
import {searchInDocument, SearchResult, searchInFiles} from '../search';

export function searchIDFunction(id: string, document: vscode.TextDocument): Thenable<SearchResult>
{
	return new Promise(async(resolve) => {
		let defineIdRst = await searchInDocument(new RegExp("^(\\w+)\\s*=\\s*"+id, "gim"), document);		// ABC = 123

		for (const defineIdRstKey in defineIdRst.resultItems) {
			let defineIdRstItem = defineIdRst.resultItems[defineIdRstKey];
			
			let defineId = defineIdRstItem.array[1];				
			let defineFuncRst = await searchInDocument(
				new RegExp("\\s+id\\s*==\\s*" + defineId + "\\s+then\\s+(\\w+)", "gim"), document
			);																							// id == ABC then funcABC();
			defineIdRstItem.children = defineFuncRst;

			for (const defineFuncRstKey in defineFuncRst.resultItems) {
				let defineFuncRstItem = defineFuncRst.resultItems[defineFuncRstKey];

				let defineFunc = defineFuncRstItem.array[1];
				let defineFinalRst = await searchInDocument(
					new RegExp("^" + defineFunc + "\\s*=\\s*function\\(.*\\)", "gim"), document
				);																						// funcABC = function()
				defineFuncRstItem.children = defineFinalRst;
			}
		}

		resolve(defineIdRst);
	});
}

export function searchIDFunctionInWorkspace(id: string, include: vscode.GlobPattern, exclude?: vscode.RelativePattern | null | undefined): Thenable<SearchResult>
{
	return new Promise(async(resolve) => {
		let files = await vscode.workspace.findFiles(include, exclude);
		let defineIdRst = await searchInFiles(new RegExp("^(\\w+)\\s*=\\s*((\""+id+"\")|("+ id + "))", "gm"), files);		// ABC = 123

		for (const defineIdRstKey in defineIdRst.resultItems) {
			let defineIdRstItem = defineIdRst.resultItems[defineIdRstKey];
			
			let defineId = defineIdRstItem.array[1];				
			let defineFuncRst = await searchInFiles(
				new RegExp(".+\\s*==\\s*" + defineId + "\\s+then.*\\s+return\\s+(\\w+)", "gm"), files
			);																							// id == ABC then funcABC();
			defineIdRstItem.children = defineFuncRst;

			for (const defineFuncRstKey in defineFuncRst.resultItems) {
				let defineFuncRstItem = defineFuncRst.resultItems[defineFuncRstKey];

				let defineFunc = defineFuncRstItem.array[1];
				let defineFinalRst = await searchInFiles(
					new RegExp("((^function\\s+" + defineFunc + "\\s*\\(.*\\))|(" + defineFunc + "\\s*=\\s*function\\(.*\\)))", "gm"), files
				);																						// funcABC = function()
				defineFuncRstItem.children = defineFinalRst;
			}
		}

		resolve(defineIdRst);
	});
}