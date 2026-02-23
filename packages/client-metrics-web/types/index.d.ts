declare module '@dotcom-reliability-kit/client-metrics-web' {
	export type MetricsClientOptions = {
		systemCode: string;
		systemVersion?: string;
		environment?: 'production' | 'test';
		batchSize?: number;
		retentionPeriod?: number;
	};

	export class MetricsClient {
		constructor(options: MetricsClientOptions);
		get isAvailable(): boolean;
		get isEnabled(): boolean;
		get endpoint(): string;
		get batchSize(): number;
		get retentionPeriod(): number;
		get systemVersion(): string;
		get queue(): BatchedEvent[];
		clearQueue(): void;
		enable(): void;
		disable(): void;
		recordEvent(namespace: string, eventData?: Record<string, any>): void;
	}

	export type MetricsEvent = {
		namespace: string;
		[key: string]: any;
	};

	export type BatchedEvent = {
		namespace: string;
		timestamp: number;
		data: { [key: string]: any };
	};
}
