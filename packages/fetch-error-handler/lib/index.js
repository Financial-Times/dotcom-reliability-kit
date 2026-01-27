const createFetchErrorHandler = require('./create-handler.js');

exports.createFetchErrorHandler = createFetchErrorHandler;
exports.handleFetchErrors = createFetchErrorHandler();
