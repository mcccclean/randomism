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

function Generator(source) {
    this.source = makeSource(source);
}

Generator.prototype.curve = function(curve) {
    return new Generator({
        random: _ => curve(this.source.random())
    });
};

Generator.prototype.random = function() {
    return this.source.random();
};

Generator.prototype.randomInt = function(min, max) {
    if(arguments.length === 1) {
        return Math.floor(this.random() * min);
    } else {
        return Math.floor(this.random() * (max - min) + min);
    }
};

Generator.prototype.choose = function(array) {
    return array[this.randomInt(array.length)];
};

Generator.prototype.shuffle = function(array) {
    return this.shuffleInPlace(array.slice());
};

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
