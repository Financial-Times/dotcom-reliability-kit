const createFetchErrorHandler = require('./create-handler');

exports.createFetchErrorHandler = createFetchErrorHandler;
exports.handleFetchErrors = createFetchErrorHandler();
