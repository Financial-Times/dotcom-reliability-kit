declare module '@dotcom-reliability-kit/client-metrics-web' {
	export type MetricsClientOptions = {
		allowedHostnamePattern?: RegExp;
		awsAppMonitorId: string;
		awsAppMonitorRegion: string;
		awsIdentityPoolId: string;
		samplePercentage?: number;
		systemCode: string;
		systemVersion?: string;
	};

	export class MetricsClient {
		constructor(options: Options): MetricsClient;
		get isAvailable(): boolean;
		get isEnabled(): boolean;
		enable(): void;
		disable(): void;
		recordError(error: unknown): void;
		recordEvent(namespace: string, eventData?: Record<string, any>): void;
	}

	export type MetricsEvent = {
		namespace: string;
		[key: string]: any;
	};
}
