'use strict';

const { OperationalError } = require('@dotcom-reliability-kit/errors');
const { logRecoverableError } = require('@dotcom-reliability-kit/log-error');
const logger = require('@dotcom-reliability-kit/logger');

module.exports.example = async (event) => {
	if (event.status === 'bad') {
		throw new OperationalError({
			code: 'MALFORMED_EVENT',
			message: 'Malformed event data'
		});
	}

	if (event.status === 'questionable') {
		logRecoverableError({
			error: new OperationalError({
				code: 'UNEXPECTED_EVENT',
				message: 'Unexpected event data',
				event
			}),
			// Note that you need to pass in a logger here, because
			// otherwise log-error will use n-logger, which in a Lambda
			// context does not support JSON-formatted logs.
			logger
		});

		// continue processing
	}

	return {
		message: 'Function executed successfully',
		event
	};
};
