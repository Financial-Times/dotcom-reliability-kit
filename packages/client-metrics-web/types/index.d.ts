declare module '@dotcom-reliability-kit/client-metrics-web' {
	export type MetricsClientOptions = {
		systemCode: string;
		systemVersion?: string;
		environment?: 'production' | 'test';
		batchSize?: number;
		retentionPeriod?: number;
		queue?: Queue;
	};

	export class MetricsClient {
		constructor(options: MetricsClientOptions);
		get isAvailable(): boolean;
		get isEnabled(): boolean;
		get endpoint(): string;
		get batchSize(): number;
		get retentionPeriod(): number;
		get systemVersion(): string;
		get queue(): readonly Queue;
		enable(): void;
		disable(): void;
		recordEvent(namespace: string, eventData?: Record<string, any>): void;
	}

	export type MetricsEvent = {
		namespace: string;
		[key: string]: any;
	};

	export type Metric = {
		namespace: string;
		timestamp: number;
		data: { [key: string]: any };
	};

	export type QueueOptions = {
		capacity?: number;
	};

	export class Queue {
		constructor(options: QueueOptions);
		add(item: Metric): void;
		drop(count?: number): void;
		pull(count: number): Metric[];
		get capacity(): number;
		get size(): number;
	}

	export class InMemoryQueue extends Queue {}
}
