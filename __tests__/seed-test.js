var RNG = require('../');

describe('Seeding', () => {
    it('Should return same value for two same-seeded generators', () => {
        var a = new RNG(99).random();
        var b = new RNG(99).random();
        expect(a).toEqual(b);
    });

    it('Should return a different value for different-seeded generators', () => {
        var a = new RNG(99).random();
        var b = new RNG(66).random();
        expect(a).not.toEqual(b);
    });

    it('Should return different value for two different string seeds', () => {
        var a = new RNG('test one').random();
        var b = new RNG('test two').random();
        expect(a).not.toEqual(b);
    });

    it('Should return the same value for two matching string seeds', () => {
        var a = new RNG('test one').random();
        var b = new RNG('test one').random();
        expect(a).toEqual(b);
    });
});

