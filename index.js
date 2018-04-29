(function() {
	"use strict";
	
	function flattenArray(value,depth=1,collector=[]) {
		if(depth===0 || !Array.isArray(value)) {
			collector.push(value);
		} else if(Array.isArray(value) && depth>0) {
			depth--;
			for(const item of value) {
				flattenArray(item,depth,collector);
			}
		}
		return collector;
	}
	
	function IterablePipe(iterable) {
		if(!this || !(this instanceof IterablePipe)) return new IterablePipe(iterable);
		this.steps = [];
		this.iterable = (function() { return this.pipe(typeof(iterable)==="function" ? iterable() : iterable); }).bind(this);
		for(const fname in IterablePipe.prototype) {
			Object.defineProperty(this.iterable,fname,{enumerable:false,configurable:true,writable:true,value:IterablePipe.prototype[fname].bind(this)})
		}
		return this.iterable;
	}
	IterablePipe.pipeable = function(f,name) {
		IterablePipe.prototype[name||f.name] = function(...args) {
			this.steps.push({f,args});
			return this.iterable;
		}
	}
	IterablePipe.prototype.pipe = function(values) {
		this.prvs = async function*() { for await(const value of values) yield value; }();
		for(const step of this.steps) {
			const prvs = this.prvs,
				itrtr = prvs[Symbol.asyncIterator] ? prvs : async function*() { yield prvs; }();
			let f;
			if(Object.getPrototypeOf(step.f)===Object.getPrototypeOf(function(){})) {
				f = async function*(...args) {
					for await(const value of this) {
						const rslt = step.f.call(value,...args);
						if(rslt!==undefined) yield rslt;
					}
				}
			} else if(Object.getPrototypeOf(step.f)===Object.getPrototypeOf(async function(){})) {
				f = async function*(...args) {
					for await(const value of this) {
						const rslt = step.f.call(value,...args);
						if(rslt!==undefined) yield rslt;
					}
				}
			} else if(Object.getPrototypeOf(step.f)===Object.getPrototypeOf(function*(){})) {
				f = async function*(...args) {
					for await(const value of this) {
						for(const rslt of step.f.call(value,...args)) {
							if(rslt!==undefined) yield rslt;
						}
					}
				}
			} else {
				f = step.f;
			}
			this.prvs = f.call(prvs,...step.args);
		}
		const prvs = this.prvs;
		return prvs[Symbol.asyncIterator] ? prvs : async function*() { yield prvs; }();
	}
	IterablePipe.prototype.toArray = async function() {
		const values = [];
		for await(const value of this.iterable()) values.push(value);
		return values;
	}
	async function* concat(...add) {
		for await(const value of this) {
			yield value;
		}
		for(let value of add) {
			if(Array.isArray(value)) {
				for(let value of value) {
					yield value;
				}
			} else {
				yield value;
			}
		}
	}
	async function* count(f,block) {
		if(block) {
			const values = [];
			for await(const value of this) {
				values.push(value);
			}
			f(values.length);
			for(const value of values) {
				yield value;
			}
		} else {
			let i = 0;
			for await(const value of this) {
				yield value;
				i++;
			}
			f(i);
		}
	}
	async function* entries() {
		let i = 0;
		for await(const value of this) {
			yield [i,value];
			i++;
		}
	}
	async function* every(f) {
		const values = [];
		for await(const value of this) {
			if(!(await f(value))) return;
			values.push(value);
		}
		for(let value of values) {
			yield value; 
		}
	}
	async function* filter(f) {
		for await(const value of this) {
			if(await f(value)) yield value;
		}
	}
	async function* find(f) {
		for await(const value of this) {
			if(await f(value)) {
				yield value;
				return;
			}
		}
	}
	async function* findIndex(f) {
		let i = 0;
		for await(const value of this) {
			if(await f(value)) {
				yield i;
				return;
			}
			i++;
		}
		yield -1;
	}
	async function* flatten(depth) {
		for await(const value of this) {
			if(Array.isArray(value)){
				for(const item of flattenArray(value,depth)) {
					yield item;
				}
			} else {
				yield value;
			}
		}
	}
	async function* flatMap(f) {
		let i = 0;
		for await(const value of this) {
			const result = await f(value,i++);
			if(result===undefined) continue;
			if(Array.isArray(result)) {
				for(const value of flattenArray(result)) {
					yield value;
				}
			} else {
				yield result;
			}
		}
	}
	async function* forEach(f) {
		let i = 0;
		for await(const value of this) {
			f(value,i++,this);
			if(value===undefined) continue;
			yield value; 
		}
	}
	async function* indexOf(value) {
		let i = 0;
		for await(const item of this) {
			if(item===value) {
				yield i;
				return;
			}
			i++;
		}
		yield -1;
	}
	async function* keys() {
		let i = 0;
		for await(const value of this) {
			yield i++;
		}
	}
	async function* lastIndexOf(value) {
		let i = 0,
			lastindex = -1;
		for await(const item of this) {
			if(item===value) {
				lastindex = i;
			}
			i++;
		}
		yield lastindex;
	}
	async function* map(f) {
		let i = 0;
		for await(const value of this) {
			const result = await f(value,i++);
			if(result===undefined) continue;
			yield result;
		}
	}
	async function* push(value,f) {
		const values = [];
		for await(const item of this) {
			values.push(item);
		}
		values.push(value);
		if(f) f(values.length);
		for(const item of values) {
			yield item;
		}
	}
	async function* pop(f) {
		let previous, some, i = 0;
		for await(const value of this) {
			i++;
			if(some) {
				yield previous;
			}
			previous = value;
			some = true;
		}
		if(some && f) f(previous,i);
	}
	async function* reduce(f,init) {
		let i = 0;
		const generator = this;
		let accum = Array.isArray(init) ? init.slice() : typeof(init)==="object" ? Object.assign({},init) : init;
		for await(const value of this) {
			if(init===undefined) {
				accum = value;
				init = false;
			} else {
				accum = await f(accum,value);
			}
		}
		yield accum;
	}
	async function* reduceRight(f,init) {
		let i = 0;
		const values = [];
		for await(const value of this) {
			values.push(value);
		}
		let accum = Array.isArray(init) ? init.slice() : typeof(init)==="object" ? Object.assign({},init) : init;
		while(values.length>0) {
			const value = values.pop()
			if(init===undefined) {
				accum = value;
				init = false;
			} else {
				accum = await f(accum,value);
			}
		}
		return accum;
	}
	async function* reverse() {
		const values = [];
		for await(const value of this) {
			values.push(value);
		}
		while(values.length) {
			yield values.pop();
		}
	}
	async function* shift(f) {
		let first = true;
		for await(const value of this) {
			if(first) {
				if(f) f(value);
				first = false;
			} else {
				yield value;
			}
		} 
	}
	async function* slice(start,end) {
		if(start<0 || end<0) {
			const collected = [];
			for await(const value of this) {
				collected.push(value);
			}
			for(const value of collected.slice(start,end)) {
					yield value;
			}
			return;
		}
		let count = 0;
		for await(const value of this) {
			if(count>=start && (end===undefined || count<end)) {
				yield value;
			}
			count++;
		}
	}
	async function* some(f) {
		const values = [];
		let some;
		for await(const value of this) {
			if(await f(value)) some = true;
			if(some) {
				while(values.length>0) {
					yield values.shift();
				}
				yield value; 
			} else {
				values.push(value);
			}
		}
	}
	async function* sort(f) {
		const values = [];
		for await(const value of this) {
			values.push(value);
		}
		await values.sort(f);
		for(let value of values) {
			yield value; 
		}
	}
	async function* splice(start,deleteCount,...add) {
		let count = 0, deleted = 0;
		for await(const value of this) {
			if(count<start) {
				yield value;
			}
			if(count>=start) {
				 if(deleted>=deleteCount) {
					yield value;
				 }
				 deleted++;
			}
			count++;
		}
		for(let value of add) {
			yield value;
		}
	}
	async function* unshift(value,f,block) {
		if(block) {
			const values = [value];
			for await(const value of this) {
				values.push(value);
			}
			if(f) f(values.length);
			for(const value of values) {
				yield value;
			}
		} else {
			yield value;
			let i = 0;
			for await(const value of this) {
				i++;
				yield value;
			}
			if(f) f(i);
		}
	}
	async function* values(f) {
		for await(const value of this) {
			if(f) f(value);
			yield value;
		}
	}
	
	IterablePipe.pipeable(concat);
	IterablePipe.pipeable(count);
	IterablePipe.pipeable(entries);
	IterablePipe.pipeable(every);
	IterablePipe.pipeable(filter);
	IterablePipe.pipeable(find);
	IterablePipe.pipeable(findIndex);
	IterablePipe.pipeable(flatten);
	IterablePipe.pipeable(flatMap);
	IterablePipe.pipeable(forEach);
	IterablePipe.pipeable(indexOf);
	IterablePipe.pipeable(keys);
	IterablePipe.pipeable(lastIndexOf);
	IterablePipe.pipeable(map);
	IterablePipe.pipeable(push);
	IterablePipe.pipeable(pop);
	IterablePipe.pipeable(reduce);
	IterablePipe.pipeable(reverse);
	IterablePipe.pipeable(shift);
	IterablePipe.pipeable(slice);
	IterablePipe.pipeable(some);
	IterablePipe.pipeable(sort);
	IterablePipe.pipeable(splice);
	IterablePipe.pipeable(unshift);
	IterablePipe.pipeable(values);
	IterablePipe.pipeable(concat);

	
	if(typeof(module)!=="undefined") module.exports = IterablePipe;
	if(typeof(window)!=="undefined") window.IterablePipe = IterablePipe;
})();