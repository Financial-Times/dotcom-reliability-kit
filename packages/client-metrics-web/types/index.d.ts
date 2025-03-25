declare module '@dotcom-reliability-kit/client-metrics-web' {
	export type MetricsClientOptions = {
		awsAppMonitorDomainPattern?: RegExp;
		awsAppMonitorEndpoint?: string;
		awsAppMonitorId?: string;
		awsAppMonitorRegion?: string;
		awsIdentityPoolId?: string;
		hostname?: string;
		samplePercentage?: number;
		systemCode: string;
		systemVersion?: string;
	};

	export class MetricsClient {
		constructor(options: Options): MetricsClient;
		public enable(): void;
		public disable(): void;
		public recordError(error: unknown): void;
		public recordEvent(
			namespace: string,
			eventData?: Record<string, any>
		): void;
	}

	export type MetricsEvent = {
		namespace: string;
		[key: string]: any;
	};
}
