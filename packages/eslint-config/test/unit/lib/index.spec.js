const eslintConfig = require('../../../lib/index');

describe('The eslint config', () => {
	it('should be exporting an object', () => {
		const objectTypeChecker = () => {
			if (typeof eslintConfig === 'object' && !Array.isArray(eslintConfig)) {
				return true;
			}
		};
		expect(objectTypeChecker()).toBeTruthy();
	});
});
