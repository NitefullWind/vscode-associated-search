import * as assert from 'assert';
import * as vscode from 'vscode';
import {searchInDocument} from '../search';
import {searchIDFunction} from '../example/searchIDFunc';

suite("Search Tests", function() {
	let testDoc: vscode.TextDocument;
	
	suiteSetup(async() => {
		console.log("===Unit test suitSetup===");
		try {
			testDoc = await vscode.workspace.openTextDocument("D:/1.txt");
		} catch (error) {
			assert.fail("缺少测试数据文件："+error);
		}
		console.log("===Unit test suitSetup over===");
	});

	test("search simple", async() => {
		let rst = await searchInDocument(/1001/g, testDoc);
		assert.equal(rst.resultItems.length, 2);
		assert.equal(rst.resultItems[0].uri, testDoc.uri);
	});

	test("search firstId", async() => {
		let rst = await searchInDocument(/firstId/g, testDoc);
		assert.notEqual(rst.resultItems.length, 0);
		assert.ok(rst.resultItems[0].range.isEqual(
			testDoc.validateRange(
				new vscode.Range(testDoc.positionAt(0), testDoc.positionAt(String("firstId").length))
				)
			)
		);
	});

	test("search firstId = 1001", async() => {
		let rst = await searchInDocument(/^(\w+)\s*=\s*\d+/gim, testDoc);
		assert.equal(rst.resultItems.length, 2);
		assert.equal(rst.resultItems[0].value, testDoc.lineAt(0).text);
		assert.equal(rst.resultItems[1].value, testDoc.lineAt(1).text);
		assert.equal(rst.resultItems[0].array[1], "firstId");
		assert.equal(rst.resultItems[1].array[1], "secondId");
	});

	test("example searchIDFunc 1001", async() => {
		let rst = await searchIDFunction("1001", testDoc);
		assert.equal(rst.resultItems.length, 1);
		
		let children1 = rst.resultItems[0].children;
		assert.notEqual(children1, undefined);

		if(children1) {
			assert.equal(children1.resultItems.length, 1);
			let children2 = children1.resultItems[0].children;
			assert.notEqual(children2, undefined);

			if(children2) {
				assert.equal(children2.resultItems.length, 1);
				assert.equal(children2.resultItems[0].value, "firstFunc = function(id)");
			}
		}
	});
});