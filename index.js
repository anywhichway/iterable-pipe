(function() {
	"use strict";
	function IterablePipe(iterable) {
		if(!this || !(this instanceof IterablePipe)) return new IterablePipe(iterable);
		this.steps = [];
		const me = this;
		this.iterable = function() { return me.pipe(iterable); };
		for(const fname in IterablePipe.prototype) {
			Object.defineProperty(this.iterable,fname,{enumerable:false,configurable:true,writeable:true,value:IterablePipe.prototype[fname].bind(this)});
		}
		return this.iterable;
	}
	IterablePipe.pipeable = function(f,name) {
		IterablePipe.prototype[name||f.name] = function(...args) {
			this.steps.push({f,args});
			return this.iterable;
		}
	}
	IterablePipe.prototype.pipe = function*(values) {
		this.prvs = function*() { for (const value of values) yield value; }();
		for(const step of this.steps) {
			const prvs = this.prvs,
				itrtr = prvs[Symbol.iterator] ? prvs : function*() { yield prvs; }();
			let f;
			if(Object.getPrototypeOf(step.f)===Object.getPrototypeOf(function(){})) {
				f = function*(...args) {
					for (const value of this) {
						const rslt = step.f.call(value,...args);
						if(rslt!==undefined) yield rslt;
					}
				}
			} else {
				f = step.f;
			}
			this.prvs = f.call(prvs,...step.args);
		}
		const prvs = this.prvs,
			itrtr = prvs[Symbol.iterator] ? prvs : function*() { yield prvs; }();
		for (const rslt of itrtr) yield rslt;
	}
	function* concat(...add) {
		for (let item of this) {
			yield item;
		}
		for(let item of add) {
			if(Array.isArray(item)) {
				for(let value of item) {
					yield value;
				}
			} else {
				yield item;
			}
		}
	}
	function* entries(f) {
		let i = 0;
		for(const item of this) {
			yield [i,item];
			i++;
		}
	}
	function* every(f) {
		const items = [];
		for(let value of this) {
			if(!(f(value))) return;
			items.push(value);
		}
		for(let item of items) {
			yield item; 
		}
	}
	function* filter(f) {
		for(let item of this) {
			if(f(item)) yield item;
		}
	}
	function* find(f) {
		for(const item of this) {
			if(f(item)) {
				yield item;
				return;
			}
		}
	}
	function* findIndex(f) {
		let i = 0;
		for(const item of this) {
			if(f(item)) {
				yield i;
				return;
			}
			i++;
		}
		yield -1;
	}
	function* flatten() {
		for(let item of this) {
			if(Array.isArray(item)){
				for(let value of item) yield value;
			} else {
				yield item;
			}
		}
	}
	function* forEach(f) {
		let i = 0;
		for(const item of this) {
			f(item,i++,this);
			if(item===undefined) continue;
			yield item; 
		}
	}
	function* indexOf(value) {
		let i = 0;
		for(const item of this) {
			if(item===value) {
				yield i;
				return;
			}
			i++;
		}
		yield -1;
	}
	function* keys() {
		let i = 0;
		for(const item of this) {
			yield i++;
		}
	}
	function* lastIndexOf(value) {
		let i = 0,
			lastindex = -1;
		for(const item of this) {
			if(item===value) {
				lastindex = i;
			}
			i++;
		}
		yield lastindex;
	}
	function* map(f) {
		let i = 0;
		for(const item of this) {
			const value = f(item,i++);
			if(value===undefined) continue;
			yield value;
		}
	}
	function* nth(index) {
		let i = 0;
		const values = [];
		for(const item of this) {
			if(index<0) {
				values.push(item)
			} else if(i===index) {
				yield item;
				return;
			}
			i++;
		}
		if(values.length>0) { // negative index
			yield values[values.length+index];
		}
	}
	function* push(value,f) {
		const values = [];
		for(let value of this) {
			values.push(value);
		}
		values.push(value);
		if(f) f(values.length);
		for(const value of values) {
			yield value;
		}
	}
	function* pop(f) {
		let previous, some;
		for(let item of this) {
			if(some) {
				yield previous;
			}
			previous = item;
			some = true;
		}
		if(some && f) f(previous);
	}
	function reduce(f,init) {
		let i = 0;
		const generator = this;
		let accum = Array.isArray(init) ? init.slice() : typeof(init)==="object" ? Object.assign({},init) : init;
		for(let item of this) {
			if(init===undefined) {
				accum = item;
				init = false;
			} else {
				accum = f(accum,item);
			}
		}
		return accum;
	}
	function reduceRight(f,init) {
		let i = 0;
		const values = [];
		for(let item of this) {
			values.push(item);
		}
		let accum = Array.isArray(init) ? init.slice() : typeof(init)==="object" ? Object.assign({},init) : init;
		while(values.length>0) {
			const value = values.pop()
			if(init===undefined) {
				accum = value;
				init = false;
			} else {
				accum = f(accum,value);
			}
		}
		return accum;
	}
	function* reverse() {
		const values = [];
		for(const value of this) {
			values.push(value);
		}
		let i = 0;
		while(values.length) {
			yield values.pop();
		}
	}
	function* shift(f) {
		let first = true;
		for(const item of this) {
			if(first) {
				if(f) f(item);
				first = false;
			} else {
				yield item;
			}
		} 
	}
	function* slice(start,end) {
		if(start<0 || end<0) {
			const collected = [];
			for(const value of this) {
				collected.push(value);
			}
			if(start<0 && end<0) {
				const values = [];
				for(const value of collected.reverse().slice(start*-1,end*-1)) {
					values.push(value);
				}
				for(const value of values) {
					yield function*() {
						yield value;
					}
				}
			} else {
				for(const value of collected.slice(start)) {
					yield function*() {
						yield value;
					}
				}
			}
			return;
		}
		let count = 0;
		for(const item of this) {
			if(count>=start && (end===undefined || count<end)) {
				yield item;
			}
			count++;
		}
	}
	function* some(f) {
		const items = [];
		for(let item of this) {
			if(f(item)) some = true;
			if(some) {
				while(items.length>0) {
					yield items.shift();
				}
				yield item; 
			} else {
				items.push(item);
			}
		}
	}
	function* sort(f) {
		const items = [];
		for(let item of this) {
			items.push(item);
		}
		items.sort(f);
		for(let item of items) {
			yield item; 
		}
	}
	function* splice(start,deleteCount,...add) {
		let count = 0, deleted = 0;
		for(let item of this) {
			if(count<start) {
				yield item;
			}
			if(count>=start) {
				 if(deleted>=deleteCount) {
					yield item;
				 }
				 deleted++;
			}
			count++;
		}
		for(let item of add) {
			yield item;
		}
	}
	function* unshift(value,f) {
		const values = [value];
		for(const value of this) {
			values.push(value);
		}
		if(f) f(values.length);
		for(const value of values) {
			yield value;
		}
	}
	function* values(value) {
		for(const item of this) {
			yield item;
		}
	}
	
	IterablePipe.pipeable(concat);
	IterablePipe.pipeable(entries);
	IterablePipe.pipeable(every);
	IterablePipe.pipeable(filter);
	IterablePipe.pipeable(find);
	IterablePipe.pipeable(findIndex);
	IterablePipe.pipeable(flatten);
	IterablePipe.pipeable(forEach);
	IterablePipe.pipeable(indexOf);
	IterablePipe.pipeable(keys);
	IterablePipe.pipeable(lastIndexOf);
	IterablePipe.pipeable(map);
	IterablePipe.pipeable(nth);
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