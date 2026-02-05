declare module '@dotcom-reliability-kit/client-metrics-web' {
	export type MetricsClientOptions = {
		allowedHostnamePattern?: RegExp;
		systemCode: string;
		systemVersion?: string;
	};

	export class MetricsClient {
		constructor(options: MetricsClientOptions);
		get isEnabled(): boolean;
		enable(): void;
		disable(): void;
		recordEvent(namespace: string, eventData?: Record<string, any>): void;
	}

	export type MetricsEvent = {
		namespace: string;
		[key: string]: any;
	};
}
