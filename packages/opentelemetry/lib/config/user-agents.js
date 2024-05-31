const appInfo = require('@dotcom-reliability-kit/app-info');
const packageJson = require('../../package.json');
const traceExporterPackageJson = require('@opentelemetry/exporter-trace-otlp-proto/package.json');

const BASE_USER_AGENT = `FTSystem/${appInfo.systemCode} (${packageJson.name}/${packageJson.version})`;

exports.TRACING_USER_AGENT = `${BASE_USER_AGENT} (${traceExporterPackageJson.name}/${traceExporterPackageJson.version})`;
