const example = require('..');

describe('packages/example', () => {
	it('exports an object', () => {
		expect(example).toBeInstanceOf(Object);
	});

	describe('example.Hello', () => {
		it('is set to "World"', () => {
			expect(example.Hello).toStrictEqual('World');
		});
	});
});
