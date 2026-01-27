const { beforeEach, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const createLegacyMaskTransform = require('../../../../lib/transforms/legacy-mask.js');

describe('@dotcom-reliability-kit/logger', () => {
	it('exports a function', () => {
		assert.ok(createLegacyMaskTransform instanceof Function);
	});

	describe('createLegacyMaskTransform(options)', () => {
		let transform;

		beforeEach(() => {
			transform = createLegacyMaskTransform();
		});

		it('returns a function', () => {
			assert.ok(transform instanceof Function);
		});

		describe('transform(logObject)', () => {
			it('returns a new object', () => {
				const logData = {
					message: 'hello'
				};
				const result = transform(logData);
				assert.deepStrictEqual(result, {
					message: 'hello'
				});
				assert.ok(result !== logData);
			});

			describe('when called with sensitive properties', () => {
				it('returns an object with masked properties', () => {
					assert.deepStrictEqual(
						transform({
							email: 'mock',
							firstName: 'mock',
							'ft-backend-key': 'mock',
							'ft-session-id': 'mock',
							FTSession_s: 'mock',
							FTSession: 'mock',
							lastName: 'mock',
							password: 'mock',
							phone: 'mock',
							postcode: 'mock',
							primaryTelephone: 'mock',
							session: 'mock',
							sessionId: 'mock'
						}),
						{
							email: '*****',
							firstName: '*****',
							'ft-backend-key': '*****',
							'ft-session-id': '*****',
							FTSession_s: '*****',
							FTSession: '*****',
							lastName: '*****',
							password: '*****',
							phone: '*****',
							postcode: '*****',
							primaryTelephone: '*****',
							session: '*****',
							sessionId: '*****'
						}
					);
				});
			});

			describe('when called with nested sensitive properties', () => {
				it('returns an object with masked properties', () => {
					assert.deepStrictEqual(
						transform({
							mock: {
								email: 'mock',
								mock: {
									lastName: 'mock'
								}
							}
						}),
						{
							mock: {
								email: '*****',
								mock: {
									lastName: '*****'
								}
							}
						}
					);
				});
			});

			describe('when an object with sensitive properties is in an array', () => {
				it('returns the array with item properties masked', () => {
					assert.deepStrictEqual(
						transform({
							mock: [
								{
									email: 'mock'
								}
							]
						}),
						{
							mock: [
								{
									email: '*****'
								}
							]
						}
					);
				});
			});

			describe('when an object with sensitive properties is in an Error object', () => {
				it('returns a basic serialized error object with properties masked', () => {
					const error = new Error('mock message');
					error.email = 'mock';
					assert.partialDeepStrictEqual(
						transform({
							mock: error
						}),
						{
							mock: {
								message: 'mock message',
								name: 'Error',
								email: '*****'
							}
						}
					);
				});
			});

			describe('when an object has sensitive properties listed within a string', () => {
				it('returns the string with the sensitive data masked', () => {
					assert.deepStrictEqual(transform({ mock: 'foo=bar email=mock' }), {
						mock: 'foo=bar email=*****'
					});
				});

				describe('when the sensitive data uses colons to split field and value', () => {
					it('returns the string with the sensitive data masked', () => {
						assert.deepStrictEqual(transform({ mock: 'foo:bar email:mock' }), {
							mock: 'foo:bar email:*****'
						});
					});
				});

				describe('when the sensitive data has additional whitespace around the field and value split', () => {
					it('returns the string with the sensitive data masked', () => {
						assert.deepStrictEqual(
							transform({
								mock: 'foo  =  bar email = mock1 email   =   mock2'
							}),
							{
								mock: 'foo  =  bar email = ***** email   =   *****'
							}
						);
					});
				});

				describe('when the sensitive data wraps the property in double quotes', () => {
					// TODO something to address when we replace this behaviour
					it('returns the string with the sensitive data masked, but considers value quotes to be part of the sensitive data', () => {
						assert.deepStrictEqual(transform({ mock: 'foo="bar" email="mock"' }), {
							mock: 'foo="bar" email=*****'
						});
					});
				});

				describe('when the sensitive data wraps the property in single quotes', () => {
					// TODO something to address when we replace this behaviour
					it('returns the string with the sensitive data masked, but considers value quotes to be part of the sensitive data', () => {
						assert.deepStrictEqual(transform({ mock: "foo='bar' email='mock'" }), {
							mock: "foo='bar' email=*****"
						});
					});
				});
			});

			describe('when an object with sensitive properties is in a JSON string', () => {
				it('returns the string with item properties masked', () => {
					assert.deepStrictEqual(
						transform({
							mock: '{"email":"mock"}'
						}),
						{
							mock: '{"email":"*****"}'
						}
					);
				});

				describe('when the JSON is invalid', () => {
					// TODO something to address when we replace this behaviour
					it('returns JSON that is invalid in a different way', () => {
						assert.deepStrictEqual(transform({ mock: '{email:"mock"}' }), {
							mock: '{email:*****'
						});
					});
				});

				describe('when the outer JSON is not an object', () => {
					// TODO something to address when we replace this behaviour
					it('breaks the JSON during the masking', () => {
						assert.deepStrictEqual(transform({ mock: '[{"email":"mock"}]' }), {
							mock: '[{"email":*****'
						});
						assert.deepStrictEqual(transform({ mock: '[{"email":"mock"}]' }), {
							mock: '[{"email":*****'
						});
					});
				});
			});

			describe('when an object has non-string properties', () => {
				it('returns the properties unmasked', () => {
					assert.deepStrictEqual(transform({ mock: 123 }), { mock: 123 });
				});
			});

			describe('when called with an object that references itself', () => {
				it('does not recurse infinitely', () => {
					const logData = {
						email: 'mock'
					};
					logData.naughtyLittleSelfReference = logData;
					const result = transform(logData);
					assert.deepStrictEqual(result.email, '*****');
					assert.deepStrictEqual(result.naughtyLittleSelfReference.email, '*****');
				});
			});
		});

		describe('when `options.denyList` is set', () => {
			beforeEach(() => {
				transform = createLegacyMaskTransform({
					denyList: ['extraProperty']
				});
			});

			describe('transform(logObject)', () => {
				describe('when called with one of the configured properties', () => {
					it('returns an object with that property masked', () => {
						assert.deepStrictEqual(transform({ extraProperty: 'mock' }), {
							extraProperty: '*****'
						});
					});
				});
			});
		});

		describe('when `options.allowList` is set', () => {
			beforeEach(() => {
				transform = createLegacyMaskTransform({
					allowList: ['email']
				});
			});

			describe('transform(logObject)', () => {
				describe('when called with one of the configured properties', () => {
					it('returns an object with that property unmasked', () => {
						assert.deepStrictEqual(transform({ email: 'mock' }), {
							email: 'mock'
						});
					});
				});
			});
		});

		describe('when `options.maskString` is set', () => {
			beforeEach(() => {
				transform = createLegacyMaskTransform({
					maskString: '🙈🙉🙊'
				});
			});

			describe('transform(logObject)', () => {
				describe('when called with sensitive properties', () => {
					it('returns an object with that property masked with the configured string', () => {
						assert.deepStrictEqual(transform({ email: 'mock' }), {
							email: '🙈🙉🙊'
						});
					});
				});
			});
		});
	});
});
