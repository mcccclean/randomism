# randomism

A random number generator.

It aims to provide a clean, memorable API for doing basically everything you'd
want to do with random number generation for games, bots and procedural
generation.

Numeric and string seeds are supported, it'll generate numbers along custom 
distribution curves (so you can weight generation toward low or high numbers,
for example), it'll shuffle arrays, and has a bunch of handy methods for
choosing things from a collection.

The focus is on ease-of-use and predictability rather than speed or
cryptographic security, so if those are priorities for you, this probably
isn't the package you're looking for. 

Really basic usage:

```javascript
var RNG = require('randomism');

var generator = new RNG('my favourite seed');

var x = generator.random() * map_width;
var y = generator.random() * map_height;

var numApples = generator.randomInt(0, 5);

var job = generator.choose(['Mayor', 'Baker', 'Alchemist']);
var deck = generator.shuffle(['A', 'K', 'Q', 'J', '10', '9', ...]);
```

Nifty usage:

```javascript
var RNG = require('randomism');

var generator = new RNG('another seed');
var straws = ['long', 'long', 'long', 'long', 'short'];
var myChoice = generator.pluck(straws);  // will remove one from the array

// clone this generator and weight it so now it'll be
// much more likely to generate lower numbers
var lowNumbersProbably = generator.clone().weightFront();
var number = lowNumbersProbably.randomInt(0, 6); 

// why not join the two approaches:
var lootRemaining = ['trash', 'common', 'uncommon', 'rare', 'epic'];
var drop = lowNumbersProbably.pluck(lootRemaining);
```

<a name="Generator"></a>

## Generator
A random number generator. By default, it uses an implementation of the
Mersenne twister algorithm (from the `mersenne-twister` npm package).

If a number is provided, it'll be used to seed the generator.
If a string is provided, it'll be hashed (using the `string-hash` package) and then used as a seed.
If nothing is provided, a random seed will be used.

If an object is provided, the generator will use the `random` property
of that object as a random number source instead of using its own.

**Kind**: global class  

* [Generator](#Generator)
    * [new Generator([seed])](#new_Generator_new)
    * [.clone()](#Generator+clone) ⇒ <code>[Generator](#Generator)</code>
    * [.weightCustom(curve)](#Generator+weightCustom) ⇒ <code>[Generator](#Generator)</code>
    * [.weightFront()](#Generator+weightFront) ⇒ <code>[Generator](#Generator)</code>
    * [.weightBack()](#Generator+weightBack) ⇒ <code>[Generator](#Generator)</code>
    * [.random()](#Generator+random) ⇒ <code>number</code>
    * [.randomInt(min, max)](#Generator+randomInt) ⇒ <code>int</code>
    * [.choose(array)](#Generator+choose) ⇒
    * [.pluck(array, [limit])](#Generator+pluck) ⇒
    * [.pluckCycle(array, [limit])](#Generator+pluckCycle) ⇒
    * [.shuffle(array)](#Generator+shuffle) ⇒
    * [.shuffleInPlace(array)](#Generator+shuffleInPlace) ⇒

<a name="new_Generator_new"></a>

### new Generator([seed])

| Param | Type | Description |
| --- | --- | --- |
| [seed] | <code>string</code> &#124; <code>number</code> &#124; <code>object</code> | The seed or source for this generator. |

**Example**  
```js
// use Math.random instead of Mersenne twister
var rng = new Generator({ random: () => Math.random() });
```
<a name="Generator+clone"></a>

### generator.clone() ⇒ <code>[Generator](#Generator)</code>
Create a new generator with the same random source.
That is, any action that advances this generator's source will
also advance the newly-created generator's source and vice-versa.

This is useful if you want to use some weighted generation and some
non-weighted from the same seed, and don't want to have to keep setting
and un-setting the source.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
<a name="Generator+weightCustom"></a>

### generator.weightCustom(curve) ⇒ <code>[Generator](#Generator)</code>
Change the weighting curve of this generator to a custom function.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: <code>[Generator](#Generator)</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| curve | <code>Generator~curve</code> | the function to apply to numbers generated                      by this new generator. |

<a name="Generator+weightFront"></a>

### generator.weightFront() ⇒ <code>[Generator](#Generator)</code>
Alter the curve of this generator so that results are weighted
toward the low end of the [0, 1) range. (the new results will 
average around 1/3).
This is achieved by squaring the results.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: <code>[Generator](#Generator)</code> - this  
<a name="Generator+weightBack"></a>

### generator.weightBack() ⇒ <code>[Generator](#Generator)</code>
Alter the curve of this generator so that results are weighted
toward the high end of the [0, 1) range. (the new results will 
average around 2/3).
This is achieved by taking the square root of each result.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: <code>[Generator](#Generator)</code> - this  
<a name="Generator+random"></a>

### generator.random() ⇒ <code>number</code>
Generate a random number in the range [0, 1).

**Kind**: instance method of <code>[Generator](#Generator)</code>  
<a name="Generator+randomInt"></a>

### generator.randomInt(min, max) ⇒ <code>int</code>
Generate a random integer in the range [min, max).
(that is, including min, not including max),
If the max argument is omitted, the min argument will
be used instead and will return [0, min).

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: <code>int</code> - random integer  

| Param | Type | Description |
| --- | --- | --- |
| min | <code>int</code> | Lowest value (or highest if it's the only argument) |
| max | <code>int</code> | Maximum value (not inclusive) |

<a name="Generator+choose"></a>

### generator.choose(array) ⇒
Return a random element of the given array.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: a random element  

| Param | Type | Description |
| --- | --- | --- |
| array | <code>array</code> | the source array. |

<a name="Generator+pluck"></a>

### generator.pluck(array, [limit]) ⇒
Return a random element of the given array, removing it from 
the array.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: a random element  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| array | <code>array</code> |  | the source array (will be modified) |
| [limit] | <code>int</code> | <code>0</code> | the number of elements from the end of the array                   to ignore. This is mainly to be used internally by                  pluckCycle. Defaults to none. |

<a name="Generator+pluckCycle"></a>

### generator.pluckCycle(array, [limit]) ⇒
Return a random element of the given array, placing it at
the end of the array. Note that limit defaults to 1 in this function,
NOT zero, unlike pluck! The reason for this is that this function is 
designed to be called multiple times in a row to generate a sequence 
that is semi-random, but with the additional property that any individual
item will be guaranteed to be separated by at least `limit` other items.

This is especially neat if the generator has been created via

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: a random element  
**Link**: <code>Generator~curve</code> that weights generation to lower numbers. Repeated 
calls to this function with the same array will result in a very poor shuffle,
with items roughly in their original order but with some perturbation.

This is great for situations like footstep sound effects, which occur very 
regularly and sound awful if the same sound is played consecutive and also
if there's a recognisable repeating sequence.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| array | <code>array</code> |  | the source array (will be modified) |
| [limit] | <code>int</code> | <code>1</code> | the number of elements from the end of the array                  to ignore. |

<a name="Generator+shuffle"></a>

### generator.shuffle(array) ⇒
Create a copy of the given array and shuffle it.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: a shuffled copy of the array  

| Param | Type | Description |
| --- | --- | --- |
| array | <code>array</code> | the source array. Will not be modified. |

<a name="Generator+shuffleInPlace"></a>

### generator.shuffleInPlace(array) ⇒
Randomly rearrange the elements of a given array.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: the given array  

| Param | Type | Description |
| --- | --- | --- |
| array | <code>array</code> | the array to shuffle |

