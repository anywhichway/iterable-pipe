var chai,
	expect,
	IterablePipe;
if(typeof(window)==="undefined") {
	chai = require("chai");
	expect = chai.expect;
	IterablePipe = require("../index.js");
}

function render(template,useWith) { // render a value into a string literal template
	return useWith ? Function("with(this) { return `" + template + "`; }").call(this) : Function("return `" + template + "`").call(this);
}
async function renderAsync(template,useWith) { // render a value into a string literal template
	return useWith ? Function("with(this) { return `" + template + "`; }").call(this) : Function("return `" + template + "`").call(this);
}
function* renderGenerator(template,useWith) { // render a value into a string literal template
	yield useWith ? Function("with(this) { return `" + template + "`; }").call(this) : Function("return `" + template + "`").call(this);
}
async function* renderAsyncGenerator(template,useWith) { // render a value into a string literal template
	for await(const value of this) {
		yield useWith ? Function("with(this) { return `" + template + "`; }").call(value) : Function("return `" + template + "`").call(value);
	}
}

let pipe,
	asyncPipe,
	generatorPipe,
	asyncGeneratorPipe;
describe("Test",function () {
	it("toArray Array", async function() {
		const array = await IterablePipe([1,2,3]).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(3);
	});
	it("toArray Set", async function() {
		const array = await IterablePipe(new Set([1,2,3])).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(3);
	});
	it("concat", async function() {
		const array = await IterablePipe(new Set([1,2,3])).concat(3,4,5).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(6);
	});
	it("count", function(done) {
		IterablePipe(new Set([1,2,3])).count(count => { expect(count).equal(3); done();} ).toArray();
	});
	it("count block", function(done) {
		IterablePipe(new Set([1,2,3])).count(count => { expect(count).equal(3); done();},true).toArray();
	});
	it("entries", async function() {
		const array = await IterablePipe(new Set([1,2,3])).entries().toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(3);
		expect(array[0][0]).equal(0);
		expect(array[0][1]).equal(1);
	});
	it("every", async function() {
		const array = await IterablePipe(new Set([1,2,3])).every(value => value>0).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(3);
	});
	it("not every", async function() {
		const array = await IterablePipe(new Set([1,2,3])).every(value => value<0).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(0);
	});
	it("filter", async function() {
		const array = await IterablePipe(new Set([1,2,3])).filter(value => value>1).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(2);
	});
	it("find", async function() {
		const array = await IterablePipe(new Set([1,2,3])).find(value => value>1).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(1);
		expect(array[0]).equal(2);
	});
	it("findIndex", async function() {
		const array = await IterablePipe(new Set([1,2,3])).findIndex(value => value>1).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(1);
		expect(array[0]).equal(1);
	});
	it("not findIndex", async function() {
		const array = await IterablePipe(new Set([1,2,3])).findIndex(value => value>3).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(1);
		expect(array[0]).equal(-1);
	});
	it("flatten", async function() {
		const array = await IterablePipe([[1,2,3],4]).flatten().toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(4);
	});
	it("flatMap", async function() {
		const array = await IterablePipe([[1,2,3],4]).flatMap(value => value).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(4);
	});
	it("forEach", async function() {
		let count = 0;
		const array = await IterablePipe([1,2,3]).forEach(value => count++).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(3);
		expect(count).equal(3);
	});
	it("indexOf", async function() {
		const array = await IterablePipe([1,2,3]).indexOf(2).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(1);
		expect(array[0]).equal(1);
	});
	it("not indexOf", async function() {
		const array = await IterablePipe([1,2,3]).indexOf(4).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(1);
		expect(array[0]).equal(-1);
	});
	it("keys", async function() {
		const array = await IterablePipe([1,2,3]).keys().toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(3);
		expect(array[0]).equal(0);
	});
	it("keys for Object", async function() {
		const array = await IterablePipe([{name: "Joe"}]).flatMap(value => typeof(value)==="object" ? Object.keys(value) : []).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(1);
		expect(array[0]).equal("name");
	});
	it("map", async function() {
		const array = await IterablePipe([1,2,3]).map(value => value * 2).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(3);
		expect(array[0]).equal(2);
	});
	it("map undefined", async function() {
		const array = await IterablePipe([1,2,3]).map(value => value===1 ? value * 2 : undefined).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(1);
		expect(array[0]).equal(2);
	});
	it("push", async function() {
		const array = await IterablePipe([1,2,3]).push(0).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(4);
		expect(array[3]).equal(0);
	});
	it("pop", function(done) {
		IterablePipe([1,2,3]).pop((value,count) => { expect(value).equal(3); expect(count).equal(3); done(); }).toArray().
		then(array => {
			expect(Array.isArray(array)).equal(true);
			expect(array.length).equal(2);
		});
	});
	it("pop no f", function(done) {
		IterablePipe([1,2,3]).pop().toArray().
		then(array => {
			expect(Array.isArray(array)).equal(true);
			expect(array.length).equal(2);
			done();
		});
	});
	it("reduce", async function() {
		const array = await IterablePipe([1,2,3]).reduce((accum,value) => accum + value).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(1);
		expect(array[0]).equal(6);
	});
	it("reverse", async function() {
		const array = await IterablePipe([1,2,3]).reverse().toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(3);
		expect(array[0]).equal(3);
	});
	it("shift", function(done) {
		IterablePipe([1,2,3]).shift(value => { expect(value).equal(1); done(); }).toArray().
		then(array => {
			expect(Array.isArray(array)).equal(true);
			expect(array.length).equal(2);
		});
	});
	it("shift no f", function(done) {
		IterablePipe([1,2,3]).shift().toArray().
		then(array => {
			expect(Array.isArray(array)).equal(true);
			expect(array.length).equal(2);
			done();
		});
	});
	it("slice with end", async function() {
		const array = await IterablePipe([1,2,3]).slice(0,2).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(2);
		expect(array[0]).equal(1);
	});
	it("slice default end", async function() {
		const array = await IterablePipe([1,2,3]).slice(1).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(2);
		expect(array[0]).equal(2);
	});
	it("slice from end", async function() {
		const array = await IterablePipe([1,2,3]).slice(0,-1).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(2);
		expect(array[0]).equal(1);
	});
	it("some", async function() {
		const array = await IterablePipe([1,2,3]).some(value => value===3).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(3);
	});
	it("not some", async function() {
		const array = await IterablePipe([1,2,3]).some(value => value===4).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(0);
	});
	it("sort", async function() {
		const array = await IterablePipe([3,2,1]).sort((a,b) => a - b).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(3);
		expect(array[0]).equal(1);
	});
	it("splice remove", async function() {
		const array = await IterablePipe([1,2,3]).splice(1,1).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(2);
		expect(array[1]).equal(3);
	});
	it("splice add", async function() {
		const array = await IterablePipe([1,2,3]).splice(2,0,4).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(4);
		expect(array[3]).equal(4);
	});
	it("splice remove and add", async function() {
		const array = await IterablePipe([1,2,3]).splice(2,1,4).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(3);
		expect(array[2]).equal(4);
	});
	it("sort no f", async function() {
		const array = await IterablePipe([3,2,1]).sort().toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(3);
		expect(array[0]).equal(1);
	});
	it("unshift", async function() {
		const array = await IterablePipe([1,2,3]).unshift(0).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(4);
		expect(array[0]).equal(0);
	});
	it("unshift f", function(done) {
		IterablePipe([1,2,3]).unshift(0,count => { expect(count).equal(3); done(); }).toArray()
		.then(array => {
			expect(Array.isArray(array)).equal(true);
			expect(array.length).equal(4);
			expect(array[0]).equal(0);
		});
	});
	it("unshift f block", function(done) {
		IterablePipe([1,2,3]).unshift(0,count => { expect(count).equal(4); done(); },true).toArray()
		.then(array => {
			expect(Array.isArray(array)).equal(true);
			expect(array.length).equal(4);
			expect(array[0]).equal(0);
		});
	});
	it("values", async function() {
		const array = await IterablePipe([1,2,3]).values().toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(3);
		expect(array[0]).equal(1);
	});
	it("values for Object", async function() {
		const array = await IterablePipe([{name: "Joe"}]).flatMap(value => typeof(value)==="object" ? Object.values(value) : []).toArray();
		expect(Array.isArray(array)).equal(true);
		expect(array.length).equal(1);
		expect(array[0]).equal("Joe");
	});
	it("add pipeable function", async function() {
		IterablePipe.pipeable(render);
		expect(typeof(IterablePipe.prototype.render)).equal("function");
		let array = await IterablePipe([{name: "Joe"}]).render("${this.name}").toArray();
		expect(array[0]).equal("Joe");
		array = await IterablePipe([{name: "Joe"}]).render("${name}",true).toArray();
		expect(array[0]).equal("Joe");
	});
	it("add pipeable async function", async function() {
		IterablePipe.pipeable(renderAsync);
		expect(typeof(IterablePipe.prototype.renderAsync)).equal("function");
		let array = await IterablePipe([{name: "Joe"}]).renderAsync("${this.name}").toArray();
		expect(array[0]).equal("Joe");
		array = await IterablePipe([{name: "Joe"}]).renderAsync("${name}",true).toArray();
		expect(array[0]).equal("Joe");
	});
	it("add pipeable generator function", async function() {
		IterablePipe.pipeable(renderGenerator);
		expect(typeof(IterablePipe.prototype.renderGenerator)).equal("function");
		let array = await IterablePipe([{name: "Joe"}]).renderGenerator("${this.name}").toArray();
		expect(array[0]).equal("Joe");
		array = await IterablePipe([{name: "Joe"}]).renderGenerator("${name}",true).toArray();
		expect(array[0]).equal("Joe");
	});
	it("add pipeable async generator function",async function() {
		IterablePipe.pipeable(renderAsyncGenerator);
		expect(typeof(IterablePipe.prototype.renderAsyncGenerator)).equal("function");
		let array = await IterablePipe([{name: "Joe"}]).renderAsyncGenerator("${this.name}").toArray();
		expect(array[0]).equal("Joe");
		array = await IterablePipe([{name: "Joe"}]).renderAsyncGenerator("${name}",true).toArray();
		expect(array[0]).equal("Joe");
	});
});

if(typeof(mocha)!=="undefined") {
		const runner = mocha.run();
}