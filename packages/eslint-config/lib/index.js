/**
 * @type {import('@dotcom-reliability-kit/eslint-config')}
 */
const config = {
	env: {
		browser: true,
		es2022: true,
		mocha: true,
		node: true
	},
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	},
	rules: {
		'array-callback-return': 'error',
		eqeqeq: 'error',
		'constructor-super': 'error',
		'for-direction': 'error',
		'getter-return': 'error',
		'no-class-assign': 'error',
		'no-cond-assign': 'error',
		'no-const-assign': 'error',
		'no-constant-condition': 'error',
		'no-debugger': 'error',
		'no-dupe-args': 'error',
		'no-dupe-class-members': 'error',
		'no-dupe-else-if': 'error',
		'no-dupe-keys': 'error',
		'no-duplicate-case': 'error',
		'no-duplicate-imports': 'error',
		'no-ex-assign': 'error',
		'no-extend-native': 'error',
		'no-fallthrough': 'error',
		'no-func-assign': 'error',
		'no-import-assign': 'error',
		'no-inner-declarations': 'error',
		'no-irregular-whitespace': 'error',
		'no-new-native-nonconstructor': 'error',
		'no-obj-calls': 'error',
		'no-setter-return': 'error',
		'no-sparse-arrays': 'error',
		'no-template-curly-in-string': 'error',
		'no-this-before-super': 'error',
		'no-undef': 'error',
		'no-unexpected-multiline': 'error',
		'no-unreachable': 'error',
		'no-unsafe-negation': 'error',
		'no-unsafe-optional-chaining': 'error',
		'no-unused-private-class-members': 'error',
		'no-unused-vars': 'error',
		'require-atomic-updates': 'warn',
		'use-isnan': 'error',
		'valid-typeof': 'error',
		'no-global-assign': 'error',
		'no-invalid-this': 'warn',
		'no-iterator': 'error',
		'no-multi-str': 'error',
		'no-new-func': 'error',
		'no-proto': 'error',
		'no-sequences': 'error',
		'no-useless-catch': 'error',
		radix: 'error'
	}
};

module.exports = config;
