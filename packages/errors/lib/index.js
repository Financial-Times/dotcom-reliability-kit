module.exports = {
	DataStoreError: require('./data-store-error'),
	HttpError: require('./http-error'),
	OperationalError: require('./operational-error'),
	UpstreamServiceError: require('./upstream-service-error'),
	UserInputError: require('./user-input-error')
};

module.exports.default = module.exports;
