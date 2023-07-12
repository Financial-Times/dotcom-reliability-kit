const {
	DataStoreError,
	HttpError,
	OperationalError,
	UpstreamServiceError,
	UserInputError
} = require('../../lib');

module.exports = {
	// DataStoreError tests
	DataStoreError: new DataStoreError(),
	'DataStoreError with message': new DataStoreError('mock message'),
	'DataStoreError with code': new DataStoreError({
		code: 'mock_code'
	}),
	'DataStoreError with message and code': new DataStoreError('mock message', {
		code: 'mock_code'
	}),
	'DataStoreError with cause': new DataStoreError({
		cause: new Error('mock cause')
	}),
	'DataStoreError with related systems': new DataStoreError({
		relatesToSystems: ['mock-system']
	}),
	'DataStoreError with extra data': new DataStoreError({
		mockData: 123
	}),

	// HttpError tests
	HttpError: new HttpError(),
	'HttpError with message': new HttpError('mock message'),
	'HttpError with status code as message': new HttpError(404),
	'HttpError with code': new HttpError({
		code: 'mock_code'
	}),
	'HttpError with message and code': new HttpError('mock message', {
		code: 'mock_code'
	}),
	'HttpError with cause': new HttpError({
		cause: new Error('mock cause')
	}),
	'HttpError with related systems': new HttpError({
		relatesToSystems: ['mock-system']
	}),
	'HttpError with status code': new HttpError({
		statusCode: 404
	}),
	'HttpError with extra data': new HttpError({
		mockData: 123
	}),

	// OperationalError tests
	OperationalError: new OperationalError(),
	'OperationalError with message': new OperationalError('mock message'),
	'OperationalError with code': new OperationalError({
		code: 'mock_code'
	}),
	'OperationalError with message and code': new OperationalError(
		'mock message',
		{
			code: 'mock_code'
		}
	),
	'OperationalError with cause': new OperationalError({
		cause: new Error('mock cause')
	}),
	'OperationalError with related systems': new OperationalError({
		relatesToSystems: ['mock-system']
	}),
	'OperationalError with extra data': new OperationalError({
		mockData: 123
	}),

	// UpstreamServiceError tests
	UpstreamServiceError: new UpstreamServiceError(),
	'UpstreamServiceError with message': new UpstreamServiceError('mock message'),
	'UpstreamServiceError with status code as message': new UpstreamServiceError(
		404
	),
	'UpstreamServiceError with code': new UpstreamServiceError({
		code: 'mock_code'
	}),
	'UpstreamServiceError with message and code': new UpstreamServiceError(
		'mock message',
		{
			code: 'mock_code'
		}
	),
	'UpstreamServiceError with cause': new UpstreamServiceError({
		cause: new Error('mock cause')
	}),
	'UpstreamServiceError with related systems': new UpstreamServiceError({
		relatesToSystems: ['mock-system']
	}),
	'UpstreamServiceError with status code': new UpstreamServiceError({
		statusCode: 404
	}),
	'UpstreamServiceError with extra data': new UpstreamServiceError({
		mockData: 123
	}),

	// UserInputError tests
	UserInputError: new UserInputError(),
	'UserInputError with message': new UserInputError('mock message'),
	'UserInputError with status code as message': new UserInputError(404),
	'UserInputError with code': new UserInputError({
		code: 'mock_code'
	}),
	'UserInputError with message and code': new UserInputError('mock message', {
		code: 'mock_code'
	}),
	'UserInputError with cause': new UserInputError({
		cause: new Error('mock cause')
	}),
	'UserInputError with related systems': new UserInputError({
		relatesToSystems: ['mock-system']
	}),
	'UserInputError with status code': new UserInputError({
		statusCode: 404
	}),
	'UserInputError with extra data': new UserInputError({
		mockData: 123
	})
};
