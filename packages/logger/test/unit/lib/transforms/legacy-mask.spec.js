const createLegacyMaskTransform = require('../../../../lib/transforms/legacy-mask');

describe('@dotcom-reliability-kit/logger', () => {
	it('exports a function', () => {
		expect(createLegacyMaskTransform).toBeInstanceOf(Function);
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(createLegacyMaskTransform.default).toStrictEqual(
				createLegacyMaskTransform
			);
		});
	});

	describe('createLegacyMaskTransform(options)', () => {
		let transform;

		beforeEach(() => {
			transform = createLegacyMaskTransform();
		});

		it('returns a function', () => {
			expect(transform).toBeInstanceOf(Function);
		});

		describe('transform(logObject)', () => {
			it('returns a new object', () => {
				const logData = {
					message: 'hello'
				};
				const result = transform(logData);
				expect(result).toEqual({
					message: 'hello'
				});
				expect(result === logData).toBeFalsy();
			});

			describe('when called with sensitive properties', () => {
				it('returns an object with masked properties', () => {
					expect(
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
						})
					).toEqual({
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
					});
				});
			});

			describe('when called with nested sensitive properties', () => {
				it('returns an object with masked properties', () => {
					expect(
						transform({
							mock: {
								email: 'mock',
								mock: {
									lastName: 'mock'
								}
							}
						})
					).toEqual({
						mock: {
							email: '*****',
							mock: {
								lastName: '*****'
							}
						}
					});
				});
			});

			describe('when an object with sensitive properties is in an array', () => {
				it('returns the array with item properties masked', () => {
					expect(
						transform({
							mock: [
								{
									email: 'mock'
								}
							]
						})
					).toEqual({
						mock: [
							{
								email: '*****'
							}
						]
					});
				});
			});

			describe('when an object with sensitive properties is in an Error object', () => {
				it('returns a basic serialized error object with properties masked', () => {
					const error = new Error('mock message');
					error.email = 'mock';
					expect(
						transform({
							mock: error
						})
					).toEqual({
						mock: {
							message: 'mock message',
							name: 'Error',
							stack: expect.stringContaining('mock message'),
							email: '*****'
						}
					});
				});
			});

			describe('when an object has sensitive properties listed within a string', () => {
				it('returns the string with the sensitive data masked', () => {
					expect(transform({ mock: 'foo=bar email=mock' })).toEqual({
						mock: 'foo=bar email=*****'
					});
				});

				describe('when the sensitive data uses colons to split field and value', () => {
					it('returns the string with the sensitive data masked', () => {
						expect(transform({ mock: 'foo:bar email:mock' })).toEqual({
							mock: 'foo:bar email:*****'
						});
					});
				});

				describe('when the sensitive data has additional whitespace around the field and value split', () => {
					it('returns the string with the sensitive data masked', () => {
						expect(
							transform({
								mock: 'foo  =  bar email = mock1 email   =   mock2'
							})
						).toEqual({
							mock: 'foo  =  bar email = ***** email   =   *****'
						});
					});
				});

				describe('when the sensitive data wraps the property in double quotes', () => {
					// TODO something to address when we replace this behaviour
					it('returns the string with the sensitive data masked, but considers value quotes to be part of the sensitive data', () => {
						expect(transform({ mock: 'foo="bar" email="mock"' })).toEqual({
							mock: 'foo="bar" email=*****'
						});
					});
				});

				describe('when the sensitive data wraps the property in single quotes', () => {
					// TODO something to address when we replace this behaviour
					it('returns the string with the sensitive data masked, but considers value quotes to be part of the sensitive data', () => {
						expect(transform({ mock: "foo='bar' email='mock'" })).toEqual({
							mock: "foo='bar' email=*****"
						});
					});
				});
			});

			describe('when an object with sensitive properties is in a JSON string', () => {
				it('returns the string with item properties masked', () => {
					expect(
						transform({
							mock: '{"email":"mock"}'
						})
					).toEqual({
						mock: '{"email":"*****"}'
					});
				});

				describe('when the JSON is invalid', () => {
					// TODO something to address when we replace this behaviour
					it('returns JSON that is invalid in a different way', () => {
						expect(transform({ mock: '{email:"mock"}' })).toEqual({
							mock: '{email:*****'
						});
					});
				});

				describe('when the outer JSON is not an object', () => {
					// TODO something to address when we replace this behaviour
					it('breaks the JSON during the masking', () => {
						expect(transform({ mock: '[{"email":"mock"}]' })).toEqual({
							mock: '[{"email":*****'
						});
						expect(transform({ mock: '[{"email":"mock"}]' })).toEqual({
							mock: '[{"email":*****'
						});
					});
				});
			});

			describe('when an object has non-string properties', () => {
				it('returns the properties unmasked', () => {
					expect(transform({ mock: 123 })).toEqual({ mock: 123 });
				});
			});

			describe('when called with an object that references itself', () => {
				it('does not recurse infinitely', () => {
					const logData = {
						email: 'mock'
					};
					logData.naughtyLittleSelfReference = logData;
					const result = transform(logData);
					expect(result.email).toEqual('*****');
					expect(result.naughtyLittleSelfReference.email).toEqual('*****');
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
						expect(transform({ extraProperty: 'mock' })).toEqual({
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
						expect(transform({ email: 'mock' })).toEqual({
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
						expect(transform({ email: 'mock' })).toEqual({
							email: '🙈🙉🙊'
						});
					});
				});
			});
		});
	});
});
