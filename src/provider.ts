import * as vscode from 'vscode';
import { SearchResult, SearchResultItem } from './search';

/**
 * 搜索结果树提供者类
 */
export class Provider implements vscode.TreeDataProvider<ProviderNode>
{
	private _onDidChangeTreeData: vscode.EventEmitter<ProviderNode | null> = new vscode.EventEmitter<ProviderNode | null>();
	readonly onDidChangeTreeData: vscode.Event<ProviderNode | null> = this._onDidChangeTreeData.event;
	private searchResult: SearchResult = new SearchResult;

	getTreeItem(element: ProviderNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	private getProviderNode(searchResult: SearchResult): ProviderNode[] {
		let prNodes: ProviderNode[] = [];
		searchResult.resultItems.forEach(item => {
			let node = new ProviderNode(item);
			node.command = {
				command: "search-results.gotoTheLine",
				title: "Go To The Line",
				arguments: [item]
			};
			prNodes.push(node);
		});
		return prNodes;
	}

	getChildren(element?: ProviderNode): vscode.ProviderResult<ProviderNode[]> {
		if(element) {
			let childrenSearchResult = element.resultItem.children;
			if(childrenSearchResult) {
				return this.getProviderNode(childrenSearchResult);
			}
		} else {
			// root
			return this.getProviderNode(this.searchResult);
		}
	}

	setSearchResult(searchResult: SearchResult): void {
		this.searchResult = searchResult;
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}
}

/**
 * 搜索结果树节点
 */
class ProviderNode extends vscode.TreeItem
{
	readonly resultItem: SearchResultItem;
	constructor(resultItem: SearchResultItem) {
		super(resultItem.getLabel(), resultItem.getCollapsibleState());
		this.resultItem = resultItem;
	}
}