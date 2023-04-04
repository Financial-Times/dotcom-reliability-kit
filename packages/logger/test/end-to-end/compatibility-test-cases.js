// These test cases illustrate where n-logger and reliability kit are the same
// and where they differ. Look for "DIFFERENCE" comments in this file which
// explain when there are differences between the two.
//
// These test cases are run in `compatibility.spec.js`.

/**
 * @typedef {object} CompatibilityTestCase
 * @property {string} id
 *     A unique identifier for the test case.
 * @property {string} description
 *     A short description for use in test output.
 * @property {object} call
 *     The method and arguments to call on each logging library.
 * @property {string} call.method
 *     The log method to call.
 * @property {Array<any>} call.args
 *     An array of arguments to call the method with.
 * @property {object} expectedOutput
 *     The outputs expected for each logging library.
 * @property {Object<string, any>} [expectedOutput.nextLogger]
 *     What the expected output is for n-logger when called with the given arguments.
 * @property {Object<string, any>} [expectedOutput.reliabilityKit]
 *     What the expected output is for Reliability Kit logger when called with the given arguments.
 */

/**
 * @type {Array<CompatibilityTestCase>}
 */
module.exports = [
	// Test cases based on the n-logger documentation
	// https://github.com/Financial-Times/n-logger#usage
	{
		id: 'n-logger-docs-1',
		description: '.log() with log level and message (n-logger docs)',
		call: {
			method: 'log',
			args: ['info', 'Saying hello']
		},
		expectedOutput: {
			nextLogger: { level: 'info', message: 'Saying hello' },
			reliabilityKit: { level: 'info', message: 'Saying hello' }
		}
	},
	{
		id: 'n-logger-docs-2',
		description: '.info() with message (n-logger docs)',
		call: {
			method: 'info',
			args: ['Saying hello']
		},
		expectedOutput: {
			nextLogger: { level: 'info', message: 'Saying hello' },
			reliabilityKit: { level: 'info', message: 'Saying hello' }
		}
	},
	{
		id: 'n-logger-docs-3',
		description: '.warn() with message (n-logger docs)',
		call: {
			method: 'warn',
			args: ["Everything's mostly cool"]
		},
		expectedOutput: {
			nextLogger: { level: 'warn', message: "Everything's mostly cool" },
			reliabilityKit: { level: 'warn', message: "Everything's mostly cool" }
		}
	},
	{
		id: 'n-logger-docs-4',
		description: '.error() with message and data (n-logger docs)',
		call: {
			method: 'error',
			args: ['Uh-oh', { field: 'some value' }]
		},
		expectedOutput: {
			nextLogger: { field: 'some value', level: 'error', message: 'Uh-oh' },
			reliabilityKit: { field: 'some value', level: 'error', message: 'Uh-oh' }
		}
	},
	{
		id: 'n-logger-docs-5',
		description: '.info() with data (n-logger docs)',
		call: {
			method: 'info',
			args: [{ event: 'UPDATE_NOTIFICATION', data: { isMockData: true } }]
		},
		// DIFFERENCE:
		// Reliability kit does not send the `message` as an empty string
		// if one is not present – it explicitly sets it to `null`.
		expectedOutput: {
			nextLogger: {
				data: { isMockData: true },
				event: 'UPDATE_NOTIFICATION',
				level: 'info',
				message: ''
			},
			reliabilityKit: {
				data: { isMockData: true },
				event: 'UPDATE_NOTIFICATION',
				level: 'info',
				message: null
			}
		}
	},
	{
		id: 'n-logger-docs-6',
		description: '.error() with message, error, and data (n-logger docs)',
		call: {
			method: 'error',
			args: ['Uh-oh', new Error('Whoops!'), { extra_field: 'boo' }]
		},
		// DIFFERENCE:
		// Reliability kit uses the @dotcom-reliability-kit/serialize-error package
		// when it encounters an error object. We deliberately wanted to improve the
		// existing n-logger behaviour here because it doesn't give us the information
		// we need.
		expectedOutput: {
			nextLogger: {
				error_message: 'Whoops!',
				error_name: 'Error',
				extra_field: 'boo',
				level: 'error',
				message: 'Uh-oh'
			},
			reliabilityKit: {
				error: {
					cause: null,
					code: 'UNKNOWN',
					data: {},
					isOperational: false,
					message: 'Whoops!',
					name: 'Error',
					relatesToSystems: [],
					statusCode: null
				},
				extra_field: 'boo',
				level: 'error',
				message: 'Uh-oh'
			}
		}
	},

	// Test cases based on the n-serverless-logger documentation
	// https://github.com/Financial-Times/n-serverless-logger#usage
	{
		id: 'n-serverless-logger-docs-1',
		description: '.info() with data (n-serverless-logger docs)',
		call: {
			method: 'info',
			args: [
				{
					event: 'EVENT_RECEIVED',
					message: 'I just ran.'
				}
			]
		},
		// DIFFERENCE:
		// We can't directly test n-serverless-logger here because the
		// output format is not JSON. We can test what we expect
		// Reliability Kit and n-logger to do when given the same data.
		expectedOutput: {
			nextLogger: {
				level: 'info',
				event: 'EVENT_RECEIVED',
				message: 'I just ran.'
			},
			reliabilityKit: {
				level: 'info',
				event: 'EVENT_RECEIVED',
				message: 'I just ran.'
			}
		}
	},

	// Test cases based on the n-mask-logger documentation
	// https://github.com/Financial-Times/n-mask-logger#usage
	{
		id: 'n-mask-logger-docs-1',
		description: '.info() with user information (n-mask-logger docs)',
		call: {
			method: 'info',
			args: [
				{
					name: 'L. Ogger',
					age: 32,
					email: 'logger@ft.com',
					password: 'passw0rd',
					role: 'Developer'
				}
			]
		},
		// DIFFERENCE:
		// Reliability kit does not send the `message` as an empty string
		// if one is not present – it explicitly sets it to `null`.
		expectedOutput: {
			nextMaskLogger: {
				level: 'info',
				name: 'L. Ogger',
				age: 32,
				email: '*****',
				password: '*****',
				role: 'Developer',
				message: ''
			},
			reliabilityKitMaskLogger: {
				level: 'info',
				name: 'L. Ogger',
				age: 32,
				email: '*****',
				password: '*****',
				role: 'Developer',
				message: null
			}
		}
	},
	{
		id: 'n-mask-logger-docs-2',
		description: '.info() with user info in sub-fields (n-mask-logger docs)',
		call: {
			method: 'info',
			args: [
				{
					foo: 'bar',
					inner: {
						some: 'field',
						deep: { password: 'passw0rd' },
						email: 'logger@ft.com'
					}
				}
			]
		},
		// DIFFERENCE:
		// Reliability kit does not send the `message` as an empty string
		// if one is not present – it explicitly sets it to `null`.
		expectedOutput: {
			nextMaskLogger: {
				level: 'info',
				foo: 'bar',
				inner: {
					some: 'field',
					deep: { password: '*****' },
					email: '*****'
				},
				message: ''
			},
			reliabilityKitMaskLogger: {
				level: 'info',
				foo: 'bar',
				inner: {
					some: 'field',
					deep: { password: '*****' },
					email: '*****'
				},
				message: null
			}
		}
	},
	{
		id: 'n-mask-logger-docs-3',
		description: '.info() with user data in message (n-mask-logger docs)',
		call: {
			method: 'info',
			args: ['Oh look password = 123abc']
		},
		expectedOutput: {
			nextMaskLogger: {
				level: 'info',
				message: 'Oh look password = *****'
			},
			reliabilityKitMaskLogger: {
				level: 'info',
				message: 'Oh look password = *****'
			}
		}
	},

	// Test cases for all non-deprecated methods
	{
		id: 'non-deprecated-debug',
		description: '.debug() with message and data',
		call: {
			method: 'debug',
			args: ['Test 1', { property: true }]
		},
		expectedOutput: {
			nextLogger: {
				level: 'debug',
				message: 'Test 1',
				property: true
			},
			reliabilityKit: {
				level: 'debug',
				message: 'Test 1',
				property: true
			}
		}
	},
	{
		id: 'non-deprecated-error',
		description: '.error() with message and data',
		call: {
			method: 'error',
			args: ['Test 1', { property: true }]
		},
		expectedOutput: {
			nextLogger: {
				level: 'error',
				message: 'Test 1',
				property: true
			},
			reliabilityKit: {
				level: 'error',
				message: 'Test 1',
				property: true
			}
		}
	},
	{
		id: 'non-deprecated-fatal',
		description: '.fatal() with message and data',
		call: {
			method: 'fatal',
			args: ['Test 1', { property: true }]
		},
		// DIFFERENCE:
		// n-logger does not support fatal-level logging, so we get no
		// output for this test
		expectedOutput: {
			reliabilityKit: {
				level: 'fatal',
				message: 'Test 1',
				property: true
			}
		}
	},
	{
		id: 'non-deprecated-info',
		description: '.info() with message and data',
		call: {
			method: 'info',
			args: ['Test 1', { property: true }]
		},
		expectedOutput: {
			nextLogger: {
				level: 'info',
				message: 'Test 1',
				property: true
			},
			reliabilityKit: {
				level: 'info',
				message: 'Test 1',
				property: true
			}
		}
	},
	{
		id: 'non-deprecated-warn',
		description: '.warn() with message and data',
		call: {
			method: 'warn',
			args: ['Test 1', { property: true }]
		},
		expectedOutput: {
			nextLogger: {
				level: 'warn',
				message: 'Test 1',
				property: true
			},
			reliabilityKit: {
				level: 'warn',
				message: 'Test 1',
				property: true
			}
		}
	},

	// Test cases for all deprecated methods
	{
		id: 'deprecated-data',
		description: '.data() with message and data',
		call: {
			method: 'data',
			args: ['Test 1', { property: true }]
		},
		// DIFFERENCE:
		// n-logger does has a data method, however it never
		// seems to output anything. We're mainly adding it to
		// Reliability Kit logger in order to see where it's
		// used to see if we can understand it better
		expectedOutput: {
			reliabilityKit: {
				level: 'debug',
				message: 'Test 1',
				property: true
			},
			deprecation: {
				level: 'warn',
				event: 'LOG_LEVEL_DEPRECATED',
				message: "The 'data' log level is deprecated",
				deprecatedLevel: 'data',
				suggestedLevel: 'debug'
			}
		}
	},
	{
		id: 'deprecated-silly',
		description: '.silly() with message and data',
		call: {
			method: 'silly',
			args: ['Test 1', { property: true }]
		},
		expectedOutput: {
			nextLogger: {
				level: 'silly',
				message: 'Test 1',
				property: true
			},
			reliabilityKit: {
				level: 'debug',
				message: 'Test 1',
				property: true
			},
			deprecation: {
				level: 'warn',
				event: 'LOG_LEVEL_DEPRECATED',
				message: "The 'silly' log level is deprecated",
				deprecatedLevel: 'silly',
				suggestedLevel: 'debug'
			}
		}
	},
	{
		id: 'deprecated-verbose',
		description: '.verbose() with message and data',
		call: {
			method: 'verbose',
			args: ['Test 1', { property: true }]
		},
		expectedOutput: {
			nextLogger: {
				level: 'verbose',
				message: 'Test 1',
				property: true
			},
			reliabilityKit: {
				level: 'debug',
				message: 'Test 1',
				property: true
			},
			deprecation: {
				level: 'warn',
				event: 'LOG_LEVEL_DEPRECATED',
				message: "The 'verbose' log level is deprecated",
				deprecatedLevel: 'verbose',
				suggestedLevel: 'debug'
			}
		}
	},

	// Test cases designed to ensure that edge-cases match up
	{
		id: 'edge-case-message-precedence',
		description: '.info() with message in multiple places',
		call: {
			method: 'info',
			args: ['Test 1', { message: 'Test 2' }, { message: 'Test 3' }, 'Test 4']
		},
		expectedOutput: {
			nextLogger: {
				level: 'info',
				message: 'Test 1'
			},
			reliabilityKit: {
				level: 'info',
				message: 'Test 1'
			}
		}
	},
	{
		id: 'edge-case-property-precedence',
		description: '.info() with properties in multiple places',
		call: {
			method: 'info',
			args: ['Test Message', { testProp: '1' }, { testProp: '2' }]
		},
		expectedOutput: {
			nextLogger: {
				level: 'info',
				message: 'Test Message',
				testProp: '1'
			},
			reliabilityKit: {
				level: 'info',
				message: 'Test Message',
				testProp: '1'
			}
		}
	},
	{
		id: 'edge-case-error-precedence',
		description: '.info() with errors in multiple places',
		call: {
			method: 'info',
			args: [
				'Test Message',
				new Error('Test 1'),
				new TypeError('Test 2'),
				{ error: 'Test 3' },
				{ error_message: 'Test 4' }
			]
		},
		// DIFFERENCE:
		// Reliability kit uses the @dotcom-reliability-kit/serialize-error package
		// when it encounters an error object, whereas n-logger serializes basic
		// properties only
		expectedOutput: {
			nextLogger: {
				level: 'info',
				message: 'Test Message',
				error_message: 'Test 1',
				error_name: 'Error',
				error: 'Test 3'
			},
			reliabilityKit: {
				level: 'info',
				message: 'Test Message',
				error: {
					message: 'Test 1',
					name: 'Error',
					cause: null,
					code: 'UNKNOWN',
					data: {},
					isOperational: false,
					relatesToSystems: [],
					statusCode: null
				},
				error_message: 'Test 4'
			}
		}
	},
	{
		id: 'edge-case-message-after-data',
		description: '.info() with a message defined after data',
		call: {
			method: 'info',
			args: [{ testProp: '1' }, 'Test Message']
		},
		expectedOutput: {
			nextLogger: {
				level: 'info',
				message: 'Test Message',
				testProp: '1'
			},
			reliabilityKit: {
				level: 'info',
				message: 'Test Message',
				testProp: '1'
			}
		}
	},
	{
		id: 'edge-case-error-as-property',
		description: '.info() with an error as a property',
		call: {
			method: 'info',
			args: ['Test Message', { issue: new Error('Test 1') }]
		},
		expectedOutput: {
			nextLogger: {
				level: 'info',
				message: 'Test Message',
				issue: {}
			},
			reliabilityKit: {
				level: 'info',
				message: 'Test Message',
				issue: {}
			}
		}
	},
	{
		id: 'edge-case-masking-arrays',
		description: '.info() with array objects which contain masked fields',
		call: {
			method: 'info',
			args: [
				{
					message: 'Test message',
					list: [
						{
							email: 'logger@ft.com',
							subList: [
								{
									postcode: 'EC4M 9BT'
								}
							]
						},
						'password = abc123'
					]
				}
			]
		},
		expectedOutput: {
			nextMaskLogger: {
				level: 'info',
				message: 'Test message',
				list: [
					{
						email: '*****',
						subList: [
							{
								postcode: '*****'
							}
						]
					},
					'password = *****'
				]
			},
			reliabilityKitMaskLogger: {
				level: 'info',
				message: 'Test message',
				list: [
					{
						email: '*****',
						subList: [
							{
								postcode: '*****'
							}
						]
					},
					'password = *****'
				]
			}
		}
	},
	{
		id: 'edge-case-masking-errors',
		description: '.info() with error objects which contain masked fields',
		call: {
			method: 'info',
			args: [
				new Error('password = abc123'),
				{
					nestedError: new Error('email = logger@ft.com')
				}
			]
		},
		// DIFFERENCE:
		// Reliability kit uses the @dotcom-reliability-kit/serialize-error package
		// when it encounters an error object, whereas n-logger serializes basic
		// properties only. Reliability Kit also doesn't deal with errors found in
		// other properties, this is for backwards compatibility with n-logger.
		expectedOutput: {
			nextMaskLogger: {
				level: 'info',
				message: 'password = *****',
				name: 'Error',
				nestedError: {
					message: 'email = *****',
					name: 'Error'
				}
			},
			reliabilityKitMaskLogger: {
				level: 'info',
				message: null,
				error: {
					cause: null,
					code: 'UNKNOWN',
					data: {},
					isOperational: false,
					message: 'password = *****',
					name: 'Error',
					relatesToSystems: [],
					statusCode: null
				},
				nestedError: {
					message: 'email = *****',
					name: 'Error'
				}
			}
		}
	},
	{
		id: 'edge-case-function-serialization',
		description: '.info() with function in log object',
		call: {
			method: 'info',
			args: [
				'mock message',
				{ example: () => 'hello', nested: { fn: () => {} } }
			]
		},
		expectedOutput: {
			nextLogger: {
				level: 'info',
				message: 'mock message',
				nested: {}
			},
			reliabilityKit: {
				level: 'info',
				message: 'mock message',
				nested: {}
			}
		}
	},

	// Test cases based on real-world usage of n-logger
	{
		id: 'next-article-1',
		description: '.error() with data and error (next-article)',
		call: {
			method: 'error',
			args: [
				{ event: 'CREATE_GIFT_LINK', contentUUID: 'mock-uuid' },
				new Error('mock-error')
			]
		},
		// DIFFERENCE:
		// Reliability kit does not send the `message` as an empty string
		// if one is not present – it explicitly sets it to `null`.
		//
		// DIFFERENCE:
		// Reliability kit uses the @dotcom-reliability-kit/serialize-error package
		// when it encounters an error object, whereas n-logger serializes basic
		// properties only
		expectedOutput: {
			nextLogger: {
				level: 'error',
				message: '',
				event: 'CREATE_GIFT_LINK',
				contentUUID: 'mock-uuid',
				error_name: 'Error',
				error_message: 'mock-error'
			},
			reliabilityKit: {
				level: 'error',
				message: null,
				event: 'CREATE_GIFT_LINK',
				contentUUID: 'mock-uuid',
				error: {
					cause: null,
					code: 'UNKNOWN',
					data: {},
					isOperational: false,
					message: 'mock-error',
					name: 'Error',
					relatesToSystems: [],
					statusCode: null
				}
			}
		}
	},
	{
		id: 'next-article-2',
		description: '.info() with data (next-article)',
		call: {
			method: 'info',
			args: [{ event: 'ALPHAVILLE_MARKETSLIVE_REDIRECT', url: 'mock-url' }]
		},
		// DIFFERENCE:
		// Reliability kit does not send the `message` as an empty string
		// if one is not present – it explicitly sets it to `null`.
		expectedOutput: {
			nextLogger: {
				level: 'info',
				message: '',
				event: 'ALPHAVILLE_MARKETSLIVE_REDIRECT',
				url: 'mock-url'
			},
			reliabilityKit: {
				level: 'info',
				message: null,
				event: 'ALPHAVILLE_MARKETSLIVE_REDIRECT',
				url: 'mock-url'
			}
		}
	},
	{
		id: 'next-express-1',
		description: '.warn() with data (n-express)',
		call: {
			method: 'warn',
			args: [
				{
					event: 'EXPRESS_START',
					message: 'Express application example started',
					app: 'example',
					port: 1234,
					nodeVersion: 'v16.17.0'
				}
			]
		},
		expectedOutput: {
			nextLogger: {
				level: 'warn',
				event: 'EXPRESS_START',
				message: 'Express application example started',
				app: 'example',
				port: 1234,
				nodeVersion: 'v16.17.0'
			},
			reliabilityKit: {
				level: 'warn',
				event: 'EXPRESS_START',
				message: 'Express application example started',
				app: 'example',
				port: 1234,
				nodeVersion: 'v16.17.0'
			}
		}
	},
	{
		id: 'next-stream-page-1',
		description: '.error() with data and error property (next-stream-page)',
		call: {
			method: 'error',
			args: [{ event: 'FAILED_TO_GET_FT_LIVE_EVENT', error: new Error('Oops') }]
		},
		// DIFFERENCE:
		// Reliability kit does not send the `message` as an empty string
		// if one is not present – it explicitly sets it to `null`.
		expectedOutput: {
			nextLogger: {
				level: 'error',
				event: 'FAILED_TO_GET_FT_LIVE_EVENT',
				message: '',
				error: {} // Empty object because this is invalid, it says so in the n-logger docs
			},
			reliabilityKit: {
				level: 'error',
				event: 'FAILED_TO_GET_FT_LIVE_EVENT',
				message: null,
				error: {} // Empty object because this is invalid, it says so in the n-logger docs
			}
		}
	},

	// Test cases based on real-world usage of n-mask-logger
	{
		id: 'next-profile-1',
		description:
			'.info() with message and data, no masked fields (next-profile)',
		call: {
			method: 'info',
			args: [
				'updateProfile',
				{
					result: 'success',
					userId: 'abc123',
					apiEnv: 'PROD'
				}
			]
		},
		expectedOutput: {
			nextMaskLogger: {
				level: 'info',
				message: 'updateProfile',
				result: 'success',
				userId: 'abc123',
				apiEnv: 'PROD'
			},
			reliabilityKitMaskLogger: {
				level: 'info',
				message: 'updateProfile',
				result: 'success',
				userId: 'abc123',
				apiEnv: 'PROD'
			}
		}
	},
	{
		id: 'next-profile-2',
		description: '.error() with additional response data (next-profile)',
		// Note: this is semi-theoretical based on looking through the way we log failed requests
		// to our APIs. If the API returned any user information on a failure state we'd get this log
		call: {
			method: 'error',
			args: [
				{
					message: 'editBillingDetails',
					error: {
						url: '/example',
						status: 500,
						method: 'post',
						responseBody: {
							user: {
								email: 'abc@example.com'
							}
						},
						headers: {
							'X-Request-Id': '123'
						}
					}
				}
			]
		},
		expectedOutput: {
			nextMaskLogger: {
				level: 'error',
				message: 'editBillingDetails',
				error: {
					url: '/example',
					status: 500,
					method: 'post',
					responseBody: {
						user: {
							email: '*****'
						}
					},
					headers: {
						'X-Request-Id': '123'
					}
				}
			},
			reliabilityKitMaskLogger: {
				level: 'error',
				message: 'editBillingDetails',
				error: {
					url: '/example',
					status: 500,
					method: 'post',
					responseBody: {
						user: {
							email: '*****'
						}
					},
					headers: {
						'X-Request-Id': '123'
					}
				}
			}
		}
	}
];
