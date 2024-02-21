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
		private static getLogLevelInfo;
		private static zipLogData;
		constructor(options?: LoggerOptions);
		public get baseLogData(): any;
		public get logLevel(): LogLevel;
		public get transport(): LogTransport;
		public createChildLogger(baseLogData: LogData): Logger;

		/** @deprecated */
		public addContext(extraLogData: LogData): void;
		/** @deprecated */
		public setContext(contextData: LogData): void;
		/** @deprecated */
		public clearContext(): void;

		public log(level: LogLevel, ...logData: LogData[]): void;
		public debug(...logData: LogData[]): void;
		public error(...logData: LogData[]): void;
		public fatal(...logData: LogData[]): void;
		public info(...logData: LogData[]): void;
		public warn(...logData: LogData[]): void;
		public flush(): void;

		/** @deprecated */
		public data(...logData: LogData[]): void;
		/** @deprecated */
		public silly(...logData: LogData[]): void;
		/** @deprecated */
		public verbose(...logData: LogData[]): void;
	}

	export const transforms: Transforms;

	// const DefaultLogger = new Logger() & { Logger, transforms };

	export default new Logger();
	// exports = new Logger & { Logger, transforms };
	exports = '.';
}
