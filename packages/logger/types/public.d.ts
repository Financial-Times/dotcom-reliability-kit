declare module '@dotcom-reliability-kit/logger' {
	type RelaxedError = Error & { [key: string]: any };
	export type LogData = string | { [key: string]: any } | RelaxedError;
	
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
	
	export type LoggerOptions = {
		baseLogData?: LogData;
		logLevel?: LogLevel;
		transforms?: LogTransform[];
		withPrettifier?: boolean;
	};
	
	export type PrivateLoggerOptions = {
		_transport?: LogTransport;
	};
	
	export type LogTransport = {
		level?: string;
		debug: (...args: any) => any;
		error: (...args: any) => any;
		fatal: (...args: any) => any;
		info: (...args: any) => any;
		warn: (...args: any) => any;
		flush?: () => void;
	};
	
	export class Logger {
		private static getLogLevelInfo;
		private static zipLogData;
		constructor(options?: LoggerOptions & PrivateLoggerOptions);
		public get baseLogData(): any;
		public get logLevel(): LogLevel;
		public get transport(): LogTransport;
		public createChildLogger(baseLogData: LogData): Logger;
		public addContext(extraLogData: LogData): void;
		public setContext(contextData: LogData): void;
		public clearContext(): void;
		public log(level: LogLevel, ...logData: LogData[]): void;
		public data(...logData: LogData[]): void;
		public debug(...logData: LogData[]): void;
		public error(...logData: LogData[]): void;
		public fatal(...logData: LogData[]): void;
		public info(...logData: LogData[]): void;
		public silly(...logData: LogData[]): void;
		public verbose(...logData: LogData[]): void;
		public warn(...logData: LogData[]): void;
		public flush(): void;
	}

	export = Logger;
}
