import * as vscode from 'vscode';
import {searchInDocument, SearchResult} from '../search';

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