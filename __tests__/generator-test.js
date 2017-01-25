var RNG = require('../');

describe('Basic generating', () => {
    
    function check(cb, amount) {
        var amt = amount || 10000;
        var result = {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE,
            mean: 0
        };
        for(var i = 0; i < amt; ++i) {
            var r = cb();
            result.mean += r / amt;
            result.max = Math.max(result.max, r);
            result.min = Math.min(result.min, r);
        }
        return result;
    }

    it('Should have an average of 0.5 on real', () => {
        var rng = new RNG();
        expect(check(_ => rng.random()).mean).toBeCloseTo(0.5, 1);
    });

    it('Should simulate a d6 correctly', () => {
        var rng = new RNG();
        var result = check(_ => rng.randomInt(0, 6) + 1);
        expect(result.min).toEqual(1);
        expect(result.max).toEqual(6);
        expect(result.mean).toBeCloseTo(3.5, 1);
    });

});
