var Mersenne = require('mersenne-twister');
var stringHash = require('string-hash');

function makeSource(source) {
    switch(typeof source) {
        case 'undefined':
            return new Mersenne();
        case 'number':
            return new Mersenne(source);
        case 'string':
            return new Mersenne(stringHash(source));
        default:
            return source;
    }
}

/**
 * @class
 * A random number generator. By default, it uses an implementation of the
 * Mersenne twister algorithm (from the `mersenne-twister` npm package).
 *
 * If a number is passed to the constructor, it'll be used to seed the generator.
 * If a string is provided, it'll be hashed (using the `string-hash` package) and then used as a seed.
 * If nothing is provided, a random seed will be used.
 *
 * If an object is provided, the generator will use the `random` property
 * of that object as a random number source instead of using its own.
 *
 * @example
 * // use Math.random instead of Mersenne twister
 * var rng = new Generator({ random: () => Math.random() });
 * 
 * @param {string|number|object} [seed] The seed or source for this generator.
 */
function Generator(source) {
    this.source = makeSource(source);
    this.curve = function(n) { return n; };
}

/**
 * Create a new generator with the same random source.
 * That is, any action that advances this generator's source will
 * also advance the newly-created generator's source and vice-versa.
 *
 * This is useful if you want to use some weighted generation and some
 * non-weighted from the same seed, and don't want to have to keep setting
 * and un-setting the source.
 *
 * @returns {Generator} 
 */
Generator.prototype.clone = function() {
    return new Generator(this.source);
};

/**
 * Change the weighting curve of this generator to a custom function.
 *
 * `curve` should take one parameter, a number in [0, 1), and return 
 * a number of the same format.
 *
 * For example, the default curve is `(n) => n`, while the front-weighted
 * curve is `(n) => n * n`.
 *
 * You can also use a curve function that returns numbers outside those 
 * bounds; that can give some interesting behaviour to the number generators
 * but the array functions (choose, pluck etc) will certainly stop working
 * correctly.
 *
 * @param {function} curve - the function to apply to numbers generated
 *                      by this new generator.
 * @returns {Generator} this
 */
Generator.prototype.weightCustom = function(curve) {
    this.curve = curve;
    return this;
};

/**
 * A function to modify generated values.
 * @callback {Generator~curve}
 * @param {number} n - The number to modify, in the range [0, 1).
 * @returns {number}
 */
function curve(n) { return 1; }

/**
 * Alter the curve of this generator so that results are weighted
 * toward the low end of the [0, 1) range. (the new results will 
 * average around 1/3).
 * This is achieved by squaring the results.
 * @returns {Generator} this
 */
Generator.prototype.weightFront = function() {
    this.curve = function(n) { return n * n; };
    return this;
};

/**
 * Alter the curve of this generator so that results are weighted
 * toward the high end of the [0, 1) range. (the new results will 
 * average around 2/3).
 * This is achieved by taking the square root of each result.
 * @returns {Generator} this
 */
Generator.prototype.weightBack = function() {
    this.curve = function(n) { return Math.sqrt(n); };
    return this;
};

/**
 * Generate a random number in the range [0, 1).
 * @returns {number} 
 */
Generator.prototype.random = function() {
    return this.curve(this.source.random());
};

/**
 * Generate a random integer in the range [min, max).
 * (that is, including min, not including max),
 * If the max argument is omitted, the min argument will
 * be used instead and will return [0, min).
 * @param {int} min - Lowest value (or highest if it's the only argument)
 * @param {int} max - Maximum value (not inclusive)
 * @returns {int} random integer
 */
Generator.prototype.randomInt = function(min, max) {
    if(arguments.length === 1) {
        return Math.floor(this.random() * min);
    } else {
        return Math.floor(this.random() * (max - min) + min);
    }
};

/**
 * Return a random element of the given array.
 * @param {array} array - the source array.
 * @returns {*} a random element
 */
Generator.prototype.choose = function(array) {
    return array[this.randomInt(array.length)];
};

/**
 * Return a random element of the given array, removing it from 
 * the array.
 * @param {array} array - the source array (will be modified)
 * @param {int} [limit=0] - the number of elements from the end of the array 
 *                  to ignore. This is mainly to be used internally by
 *                  pluckCycle. Defaults to none.
 * @returns {*} a random element
 */
Generator.prototype.pluck = function(array, limit) {
    if(array.length <= (limit || 0)) { 
        throw new Error();
    }
    var index = this.randomInt(array.length - (limit || 0));   
    return array.splice(index, 1);
};

/**
 * Return a random element of the given array, placing it at
 * the end of the array. Note that limit defaults to 1 in this function,
 * NOT zero, unlike pluck! The reason for this is that this function is 
 * designed to be called multiple times in a row to generate a sequence 
 * that is semi-random, but with the additional property that any individual
 * item will be guaranteed to be separated by at least `limit` other items.
 * 
 * This is especially neat if the generator has been weighted to generate
 * lower numbers. Repeated calls to this function with the same array will 
 * result in a very half-hearted shuffle, with items roughly in their original
 * order but with some perturbation.
 *
 * This is great for situations like footstep sound effects, which occur very 
 * regularly and sound awful if the same sound is played consecutive and also
 * if there's a recognisable repeating sequence.
 *
 * @param {array} array - the source array (will be modified)
 * @param {int} [limit=1] - the number of elements from the end of the array
 *                  to ignore.
 * @returns {*} a random element
 */
Generator.prototype.pluckCycle = function(array, limit) {
    var item = this.pluck(array, limit);
    array.push(item);
    return item;
};

/**
 * Create a copy of the given array and shuffle it.
 * @param {array} array - the source array. Will not be modified.
 * @returns {array} a shuffled copy of the array
 */
Generator.prototype.shuffle = function(array) {
    return this.shuffleInPlace(array.slice());
};

/**
 * Randomly rearrange the elements of a given array.
 * @param {array} array - the array to shuffle
 * @returns {array} the given array
 */
Generator.prototype.shuffleInPlace = function(array) {
    for(var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(this.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

module.exports = Generator;
