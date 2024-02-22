declare module '@dotcom-reliability-kit/logger' {
	type ErrorLike = Error & { [key: string]: any };
	export type LogData = string | { [key: string]: any } | ErrorLike;

	export type LogLevel =
		| 'silly'
		| 'data'
		| 'debug'
		| 'verbose'
		| 'info'
		| 'warn'
		| 'error'
		| 'fatal';

	export type LogTransform = (logData: { [key: string]: any }) => {
		[key: string]: any;
	};

	export type LegacyMaskTransformOptions = {
		denyList?: string[];
		allowList?: string[];
		maskString?: string;
	};

	export interface Transforms {
		legacyMask: (options?: LegacyMaskTransformOptions) => LogTransform;
	}

	export type LoggerOptions = {
		baseLogData?: LogData;
		logLevel?: LogLevel;
		transforms?: LogTransform[];
		withPrettifier?: boolean;
	};

	export interface GenericLogger {
		debug: (...args: any) => any;
		error: (...args: any) => any;
		fatal: (...args: any) => any;
		info: (...args: any) => any;
		warn: (...args: any) => any;
	}

	export type LogTransport = GenericLogger & {
		level?: string;
		flush?: () => void;
	};

	export class Logger {
		constructor(options?: LoggerOptions);
		get baseLogData(): any;
		get logLevel(): LogLevel;
		get transport(): LogTransport;
		createChildLogger(baseLogData: LogData): Logger;

		/** @deprecated */
		addContext(extraLogData: LogData): void;
		/** @deprecated */
		setContext(contextData: LogData): void;
		/** @deprecated */
		clearContext(): void;

		log(level: LogLevel, ...logData: LogData[]): void;
		debug(...logData: LogData[]): void;
		error(...logData: LogData[]): void;
		fatal(...logData: LogData[]): void;
		info(...logData: LogData[]): void;
		warn(...logData: LogData[]): void;
		flush(): void;

		/** @deprecated */
		data(...logData: LogData[]): void;
		/** @deprecated */
		silly(...logData: LogData[]): void;
		/** @deprecated */
		verbose(...logData: LogData[]): void;

		private static getLogLevelInfo;
		private static zipLogData;
	}

	class DefaultLogger extends Logger {
		tranforms: Transforms;
		Logger: typeof Logger
	}

	// export default new DefaultLogger();
	exports = new DefaultLogger();
	// exports = new Logger & { Logger, transforms };
}
