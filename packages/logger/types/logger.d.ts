export type LogLevel = 'silly' | 'data' | 'debug' | 'verbose' | 'info' | 'warn' | 'error' | 'fatal';

export type LogLevelInfo = {
	logLevel: LogLevel;
	isDeprecated: boolean;
	isDefaulted: boolean;
};

export type BaseLogData = { [key: string]: any };
export type LogData = string | BaseLogData | Error;

export type LogTransform = (logData: { [key: string]: any }) => {
	[key: string]: any;
};

export type LogSerializer = (value: any, propertyName: string) => any;

export type LogTransport = {
	level?: string;
	debug: (...args: any) => any;
	error: (...args: any) => any;
	fatal: (...args: any) => any;
	info: (...args: any) => any;
	warn: (...args: any) => any;
	flush?: () => void;
};

export type LoggerOptions = {
	baseLogData?: object;
	logLevel?: LogLevel;
	transforms?: LogTransform[];
	serializers?: { [key: string]: LogSerializer };
	withPrettifier?: boolean;
};

export type PrivateLoggerOptions = {
	_transport?: LogTransport;
};

export class Logger {
	constructor(options?: LoggerOptions);
	public get baseLogData(): any;
	public get logLevel(): LogLevel;
	public get transport(): LogTransport;
	public createChildLogger(baseLogData: LogData): Logger;
	public log(level: LogLevel, ...logData: LogData[]): void;
	public debug(...logData: LogData[]): void;
	public error(...logData: LogData[]): void;
	public fatal(...logData: LogData[]): void;
	public info(...logData: LogData[]): void;
	public warn(...logData: LogData[]): void;
	public flush(): void;

	/** @deprecated Please create a child logger with `createChildLogger` or use the `baseLogData` option. */
	public addContext(extraLogData: LogData): void;

	/** @deprecated Please create a child logger with `createChildLogger` or use the `baseLogData` option. */
	public setContext(contextData: LogData): void;

	/** @deprecated Please create a child logger with `createChildLogger` or use the `baseLogData` option. */
	public clearContext(): void;

	/** @deprecated Please use a log level of "debug" instead. */
	public data(...logData: LogData[]): void;

	/** @deprecated Please use a log level of "debug" instead. */
	public silly(...logData: LogData[]): void;

	/** @deprecated Please use a log level of "debug" instead. */
	public verbose(...logData: LogData[]): void;
}

export interface LoggerInterface extends Logger {}
