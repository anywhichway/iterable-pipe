# iterable-pipe Treat iterables like first class arrays without converting them. Make all array functions chainable.

IterablePipe:

1) Keeps your memory footprint down and gets to a first result faster

2) Simplifies code

By:

1) Treating most iterables as pipes with all the power of normal array functions without having to first convert them to arrays.

2) Favoring call sequencing/piping over nesting.

3) Supporting iteration over the same pipe multiple times.

4) Supporting extension to add your own pipeable functions.

Based on the same principles as [nano-pipe](https://github.com/anywhichway/nano-pipe/).

# Installation

npm install iterable-pipe

IterablePipe uses ES2016 and is not provided in transpiled form.

# Usage

Just call `IterablePipe(Iterable)` and chain any other array functions.

```
const results = IterablePipe(new Set([1,2,3])).reverse().map(value => value *2);
for(const value of results()) console.log(value);
```

prints:

```
6
4
2
```

Returning `undefined` from any function removed the value from the chain.

```
const results = IterablePipe(new Set([1,2,3,4])).map(value => value % 2 ===0 ? value : undefined);
for(const value of results()) console.log(value);
```

prints:

```
2
4
```

Using `every` or `some` eliminates all results unless satisfied.

```
const results = IterablePipe(new Set([1,2,3,4])).every(value => value % 2 ===0 ? value : false).map(value => value * 2);
for(const value of results()) console.log(value);
```

prints nothing.



# API

# Release History (reverse chronological order)

2018-04-28 - v0.0.1 First public release