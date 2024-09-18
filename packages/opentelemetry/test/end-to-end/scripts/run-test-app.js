const { createTestApp } = require('../fixtures/app');
const logger = require('@dotcom-reliability-kit/logger');

const app = createTestApp();

const server = app.listen(4001, () => {
	logger.info('Test app running on port 4001');
});

process.on('beforeExit', () => {
	server.close();
});
