const { MetricsClient } = require('@dotcom-reliability-kit/client-metrics-web');

window.metrics = new MetricsClient({
	environment: 'production',
	systemCode: 'dotcom-reliability-kit'
});
