import { HostMetrics } from '@opentelemetry/host-metrics';
import opentelemetry from '@opentelemetry/sdk-node';

declare module '@dotcom-reliability-kit/opentelemetry' {
	export type MetricsOptions = {
		apiGatewayKey?: string;
		endpoint?: string;
	};

	export type TracingOptions = {
		authorizationHeader?: string;
		endpoint?: string;
		samplePercentage?: number;
	};

	export type ViewOptions = {
		httpClientDurationBuckets?: number[];
		httpServerDurationBuckets?: number[];
	};

	export type Options = {
		/** @deprecated */
		authorizationHeader?: string;
		logInternals?: boolean;
		metrics?: MetricsOptions;
		tracing?: TracingOptions;
		views?: ViewOptions;
	};

	export type Instances = {
		sdk: opentelemetry.NodeSDK;
		hostMetrics?: HostMetrics;
	};

	export function setup(options?: Options): Instances;
	export function getMeter(
		name: string,
		version?: string,
		options?: opentelemetry.api.MeterOptions
	): opentelemetry.api.Meter;
}

declare module '@dotcom-reliability-kit/opentelemetry/setup' {
	export {};
}
