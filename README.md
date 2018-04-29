# iterable-pipe Treat iterables as first class arrays without converting them. Make all array functions chainable.

IterablePipe:

1) Keeps your memory footprint down and gets to a first result faster

2) Simplifies code

3) Straight forward use of async generators.

By:

1) Treating most iterables as pipes with all the power of normal array functions without having to first convert them to arrays.

2) Favoring call sequencing/piping over nested function calls.

3) Supporting iteration over the same pipe multiple times.

4) Requiring just one `await` statement.

5) Allowing extension to add your own pipeable functions.

Based on the same principles as [nano-pipe](https://github.com/anywhichway/nano-pipe/).

# Installation

npm install iterable-pipe

IterablePipe uses ES2016 and is not provided in transpiled form.

Version 9x of NodeJS requires the use of the --harmony flag.

You can use the code un-transpiled in the most recent versions of Chrome and Firefox. Edge requires transpiling.


# Usage

Just call `IterablePipe(Iterable)` and chain any other array functions.

```
const results = IterablePipe(new Set([1,2,3])).reverse().map(value => value *2);
for await(const value of results()) console.log(value);
```

prints:

```
6
4
2
```

Returning `undefined` from `map` function removes the value from the chain.

```
const results = IterablePipe(new Set([1,2,3,4])).map(value => value % 2 ===0 ? value : undefined);
for await(const value of results()) console.log(value);
```

prints:

```
2
4
```

Using `every` or `some` eliminates all results unless satisfied.

```
const results = IterablePipe(new Set([1,2,3,4])).every(value => value % 2 ===0 ? value : false).map(value => value * 2);
for await(const value of results()) console.log(value);
```

prints nothing.

Passing in a function returning an instantiated generator alows multiple passes.

```
const results = IterablePipe(() => function*() { yield 1; yield 2; yield 3;}());
for await(const value of results()) console.log(value);
for await(const value of results()) console.log(value);
```

Asyhchronous generators are also supported:

```
const results = IterablePipe(() => async function*() { yield 1; yield 2; yield 3;}());
for await(const value of results()) console.log(value);
for await(const value of results()) console.log(value);
```

And, you can add your own functions!


```
function render(template,useWith) { // render a value into a string literal template
	return useWith ? Function("with(this) { return `" + template + "`; }").call(this) : Function("return `" + template + "`").call(this);
}
IterablePipe.pipeable(render);
const results = IterablePipe([{name: "Joe"}]).render("Name: ${this.name}");
for await(const value of results()) console.log(value);

```

prints:

```
Name: Joe
```

# API

`IterablePipe.pipeable(function)` - You can pass in any of the following function types to make the function available as part of a pipe:

1) function() {}

2) async function() {}

3) function*() {}

4) async function*() { }

The following array methods are supported. Unless otherwise marked with an asterisk, `*`, each passes down the pipe the same value it would return if the source were an array. If the function takes an argument the return value of which will not impact the values passed down the pipe, it is called an forgotten. If the return value might impact the values passed it is called and returned Promises are awaited. This means you can apply potentialy complex, time consuming, asynchronous methods to sorting and searching without locking-up the JavaScript event thread:

`concat(...args)` - Adds `args` to the end of the values passed down the pipe.

`count(f[,block])` - Calls `f(count)` with the final count. If `block` is truthy, forces resolution of all values; otherwise, it `f` will be called when the pipe finishes processing. Does not await `f`.

`entries()` - Converts the values passed in to `[index,value]` pairs and passed them down the pipe.

`every(f)` - Stops passing values down the pipe unless all values return truthy for `f(value)`. Forces resolution of all values. Awaits `f`.

`filter(f)` - Only passes those values down the pipe that return truthy for `f(value)`. Awaits `f`.

`find(f)` - Only passed down the pipe the first value that satisfies `f(value)`. Awaits `f`.

`findIndex(f)` - Passes down the pipe the first index at which `f(value)` is true. Awaits `f`.

`flatten(i=1)` - Passes down the pipe all values flattened to the level `i`. If a value is not an array, it is passed down the pipe.

`flatMap(f)` -  Passes down the pipe the flattend version of the value returned by `f(value)` unless the value returned is `undefined`.

`forEach(f)` - Calls `f(value,index,iterator)` on each value it is passed and passes all values down the pipe.

`indexOf(value)` - Passes down the pipe the index of `value` and `-1` if it does not exist in the pipe. It will force resolution up to the point it finds `value` and skip all other values.

`keys()` - Passes down the pipe all the indexes in the pipe as though it were an array. To pass the keys of objects in the pipe use, `flatMap(value => typeof(value)==="object" ? Object.keys(value) : [])`.

`lastIndexOf(value)` - Passes down the pipe the last index of `value` and `-1` if it does not exist in the pipe. It will force resolution up to of all possible values in the pipe.

`map(f)` - Passes down the pipe the value returned by `f(value)` unless the value returned is `undefined`.

*`push(value[,f])` - Adds value as the last value passed down the pipe. If `f` is provided, calls `f(count)` with the final count of values in the pipe.

*`pop(f)` - Removes the last value from the pipe. If `f` is provided calls `f(value,count)` with the value and final count of values in the pipe. To pass just the last value out of the pipe use `slice(-1,)`.

`reduce(f[,init])` - Passes down the pipe the value returned by `f(value)` unless the value returned is `undefined`.

`reverse()` - Reverses the order of values flowing down the pipe. Forces resolution of all values in the pipe.

*`shift(f)` - Removes the first value from the pipe. If `f' is provided, calls `f(value)` with the value removed. Use `slice(0,1)` to pass just the first value down the pipe. The `count` is not provided because it would require resolving all values and slow processing.

`slice(start=0[,end=count])` - Passes the values between `start` (inclusive) and `end` (exclusive) down the pipe. Providing no arguments effectively has no impact. Using negative numbers indexes from the end of the value stream and forces complete resolution of all values.

`some(f)` - Stops passing values down the pipe unless some value returns truthy for `f(value)`. Forces resolution of all values.

`sort(f)` - Sorts values is according to string Unicode code points (ascending) unless `f` is provided. If `f` is provided it is called with two adjacent elements as `f(a,b)`. if is returns less than 0, a is placed before b. If it returns 0, no change is made. If it returns greater than zero, b is placed before a. Forces resolution of all values.

`splice(start[,deleteCount=0[,item1[,item2[,...]]]])` - Passes all values prior to and including `start`. After `start` skips `deleteCount` elements and then adds items `itemN`.

*`unshift(value[,f[,block])` - Adds `value` as the first value passed down the array. If `f` is provided `f(count)` will be called with the final count close to the end of processing. If `block` is truthy, resolution of all values will be forced and `f` will be called immediatley.

`values(f)` - Passes all values down the pipe. If `f` is provided calls `f(value)` To pass the values of objects in the pipe use, `flatMap(value => typeof(value)==="object" ? Object.values(value) : [])`.
	

# Release History (reverse chronological order)

2018-04-29 - v0.0.2 Added "use strict", async support and unit tests

2018-04-28 - v0.0.1 First public release