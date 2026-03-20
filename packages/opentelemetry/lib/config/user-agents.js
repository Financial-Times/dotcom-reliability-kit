import appInfo from '@dotcom-reliability-kit/app-info';
import metricExporterPackageJson from '@opentelemetry/exporter-metrics-otlp-proto/package.json' with {
	type: 'json'
};
import traceExporterPackageJson from '@opentelemetry/exporter-trace-otlp-proto/package.json' with {
	type: 'json'
};
import packageJson from '../../package.json' with { type: 'json' };

const BASE_USER_AGENT = `FTSystem/${appInfo.systemCode} (${packageJson.name}/${packageJson.version})`;

export const METRICS_USER_AGENT = `${BASE_USER_AGENT} (${metricExporterPackageJson.name}/${metricExporterPackageJson.version})`;
export const TRACING_USER_AGENT = `${BASE_USER_AGENT} (${traceExporterPackageJson.name}/${traceExporterPackageJson.version})`;
