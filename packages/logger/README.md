
## @dotcom-reliability-kit/logger

> **Warning**
> This Reliability Kit package is **experimental** and should not be used in critical production applications until we've reached a stable version (the latest major version is greater than `0`).

A simple and fast logger based on [Pino](https://getpino.io/), with FT preferences baked in. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [Log levels](#log-levels)
    * [`Logger`](#logger)
    * [`Logger` configuration options](#logger-configuration-options)
      * [`options.baseLogData`](#optionsbaselogdata)
      * [`options.logLevel`](#optionsloglevel)
      * [`options.transforms`](#optionstransforms)
      * [`options.withTimestamps`](#optionswithtimestamps)
    * [`logger.log()` and shortcut methods](#loggerlog-and-shortcut-methods)
    * [`logger.flush()`](#loggerflush)
    * [`logger.createChildLogger()`](#loggercreatechildlogger)
    * [Deprecated methods](#deprecated-methods)
      * [`logger.addContext()`](#loggeraddcontext)
      * [`logger.setContext()`](#loggersetcontext)
      * [`logger.clearContext()`](#loggerclearcontext)
    * [Log data serialization](#log-data-serialization)
      * [How different data is serialized](#how-different-data-is-serialized)
      * [Order of precedence](#order-of-precedence)
    * [Local development usage](#local-development-usage)
    * [Production usage](#production-usage)
    * [Compatibility](#compatibility)
      * [Migrating from n-logger](./docs/migration.md#migrating-from-n-logger)
      * [Migrating from n-serverless-logger](./docs/migration.md#migrating-from-n-serverless-logger)
  * [Contributing](#contributing)
  * [License](#license)


## Usage

Install `@dotcom-reliability-kit/logger` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/logger
```

Include in your code:

```js
import logger from '@dotcom-reliability-kit/logger';
// or
const logger = require('@dotcom-reliability-kit/logger');
```

Perform logging at different levels using methods with the same name:

```js
// Info-level log with a message
logger.info('Saying hello');

// Warning-level log with a message
logger.warn('Everything’s mostly cool');

// Error-level log with a message and additional data
logger.error('Uh-oh', { field: 'some value' });

// Info-level log with no message but some additional data
logger.info({ event: 'UPDATE_NOTIFICATION', data: data });

// Error-level log with an error object and additional data
const error = new Error('Whoops!');
logger.error('Uh-oh', error, { extra_field: 'boo' });
```

### Log levels

Understanding log levels is key to using the logger. Setting a log level explains to the person debugging your application what level of information (or error severity) they're working with.

The valid levels are:

  * `debug`: The lowest log level. This is for high-volume information which isn't critical to monitoring and running the app, but may be useful when debugging in local development. E.g. logging transformed article information before rendering.

  * `info`: The highest _informational_ log level. This is for key information which is important debugging an application in production. E.g. when the application is ready to recieve HTTP traffic.

  * `warn`: The lowest _error_ log level. This is for when something _may_ cause an issue but it does not have a large impact on the end user. E.g. a deprecated method is being used which may be removed the next time a dependency is updated.

  * `error`: The general _error_ log level. This is for when an error occurs which impacts the end user. E.g. an upstream service failed and so a page cannot be rendered.

  * `fatal`: The highest _error_ log level. This is for when an error occurs and is severe enough that the application cannot recover. This should always be accompanied with the application process being exited.

### `Logger`

The default export of `@dotcom-reliability-kit/logger` is an instance of the `Logger` class with some sensible configurations. You can also create your own logger by importing this class and instantating it yourself with [some options](#logger-configuration-options).

```js
import { Logger } from '@dotcom-reliability-kit/logger';
// or
const { Logger } = require('@dotcom-reliability-kit/logger');

const myLogger = new Logger({
    // options go here
});
```

### `Logger` configuration options

Config options can be passed into the `Logger` constructor to change the behaviour of the logger.

#### `options.baseLogData`

Base log data which is added to every log output made by the [logging methods](#loggerlog-and-shortcut-methods). This allows you to add consistent data to a logger, e.g. information about the app. This must be an `Object` but it can have any properties. E.g.

```js
const logger = new Logger({
    baseLogData: {
        app: {
            version: '1.2.3'
        }
    }
});

logger.info('This is a log');
// Outputs:
// {
//     "level": "info",
//     "message": "This is a log",
//     "app": {
//         "version": '1.2.3'
//     }
// }
```

#### `options.logLevel`

The maximum log level to output during logging. Logs at levels beneath this will be ignored. This option must be a `String` which is set to one of the [supported log levels](#log-levels).

```js
const logger = new Logger({
    logLevel: 'warn'
});

logger.info('This is some info'); // Outputs: nothing
logger.warn('This is a warning'); // Outputs: the message
```

It's also possible to set this option as an environment variable, which is how you configure the default logger. The following environment variables are read from:

  * `LOG_LEVEL`: The preferred way to set log level in an environment variable
  * `SPLUNK_LOG_LEVEL`: The legacy way to set log level, to maintain compatibility with [n-logger](https://github.com/Financial-Times/n-logger)

#### `options.transforms`

An array of functions which are called on log data before logs are output. This allows you to apply transformations to the final log object before it's sent.

Each log transform must be a function which accepts a single object argument and returns an object. Expressed as TypeScript types:

```ts
type LogData = {[x: string]: any};
type Tranform = (logData: LogData) => LogData
```

You can pass as many transforms as you need, though you must consider performance – each function will be called on every log that's sent.

```js
function uppercaseProperties(logData) {
    const entries = Object.entries(logData).map(([property, value]) => {
        return [property.toUpperCase(), value];
    });
    return Object.fromEntries(entries);
}

const logger = new Logger({
    transforms: [
        uppercaseProperties
    ]
});

logger.info({
    time: 1234567890,
    message: 'Hello World'
});
// Outputs:
// {
//     "LEVEL": "info",
//     "MESSAGE": "This is a log",
//     "TIME": 1234567890
// }
```

#### `options.withTimestamps`

Whether to send the timestamp that each log method was called. Because this module logs asynchronously the timestamp when the log is sent to Splunk is not necessarily accurate. Sending the timestamp as a `time` property on each log gives you accurate timings.

Must be a `Boolean` and defaults to `true` for backwards-compatibility with [n-serverless-logger](https://github.com/Financial-Times/n-serverless-logger). This is not _technically_ compatible with [n-logger](https://github.com/Financial-Times/n-logger) which is why the option to turn it off exists.

```js
const logger = new Logger({
    withTimestamps: true
});

logger.info('This is a log');
// Outputs:
// {
//     "level": "info",
//     "message": "This is a log",
//     "time": 1234567890
// }
```

### `logger.log()` and shortcut methods

The `log` method of a [`Logger`](#logger) can be used to send a JSON-formatted log to `stdout` with a message and additional information. This method requires a `level` parameter set to a valid [log level](#log-levels). It can accept any number of other arguments which must be either a `String`, and `Object`, or an instance of `Error`.

```js
logger.log('debug', 'This is a message', { extraData: 123 }, new Error('Oops'));
```

It's generally easier and less error-prone to use one of the shortcut methods rather than `log(level)`. There are shortcut methods for each of the log levels:

  * `logger.debug(...logData)`: Log with a level of "debug"
  * `logger.info(...logData)`: Log with a level of "info"
  * `logger.error(...logData)`: Log with a level of "error"
  * `logger.warn(...logData)`: Log with a level of "warn"
  * `logger.fatal(...logData)`: Log with a level of "fatal"

As well as the valid log levels, there are a couple of deprecated legacy levels. These are only present to maintain backwards-compatibility with [n-logger](https://github.com/Financial-Times/n-logger).

> **Warning**
> These methods are deprecated and will log a warning message the first time they're used.

  * `logger.data(...logData)`: Aliases `logger.debug()`
  * `logger.silly(...logData)`: Aliases `logger.debug()`
  * `logger.verbose(...logData)`: Aliases `logger.debug()`

### `logger.flush()`

Most logs are queued up and sent asynchronously, as this keeps your application performant and minimises the impact of logging. Sometimes (very rarely) you may need to manually flush the queue of logs. You can do so by using the `flush` method:

```js
logger.flush();
```

Logs are automatically flushed if the application stops running, to ensure log information is not lost in the event of an application crash.

### `logger.createChildLogger()`

Create a new logger with the same config options as the current logger, but with additional [base log data](#optionsbaselogdata) merged in. This allows you to create loggers which add extra information depending on where in the codebase you are. You must pass an `Object` to set the base log data of the child logger.

Express example where you have an application logger and a child logger for use within Express routes:

```js
const app = express();
const appLogger = new Logger({
    baseLogData: {
        appName: 'my-app'
    }
});

app.use((request, response) => {
    request.log = appLogger.createChildLogger({
        requestUrl: request.url
    });
});

app.get('/mock-url', (request, response) => {
    request.log.info('We got a request');
    // Outputs:
    // {
    //     "level": "info",
    //     "message": "We got a request",
    //     "appName": "my-app",
    //     "requestUrl": "/mock-url"
    // }
});
```

### Deprecated methods

#### `logger.addContext()`

Add additional [base log data](#optionsbaselogdata) to the logger via merging objects together. You must pass an `Object` which will be merged with the existing base log data.

> **Warning**
> This method is deprecated and will log a warning message the first time it's used. This is just for compatibility with n-logger and you should use either `baseLogData` or [`createChildLogger`](#loggercreatechildlogger) instead.

```js
const logger = new Logger({
    baseLogData: {
        appName: 'my-app'
    }
});

logger.addContext({
    myExtraData: 'extra data'
});

logger.info('Example');
// Outputs:
// {
//     "level": "info",
//     "message": "Example",
//     "appName": "my-app",
//     "myExtraData": "extra data"
// }
```

#### `logger.setContext()`

Add a `context` property to the logger's [base log data](#optionsbaselogdata). You must pass an `Object` which will be added as a `context` property to all logs.

> **Warning**
> This method is deprecated and will log a warning message the first time it's used. This is just for compatibility with [n-serverless-logger](https://github.com/Financial-Times/n-serverless-logger) and you should use either `baseLogData` or [`createChildLogger`](#loggercreatechildlogger) instead.

```js
const logger = new Logger();

logger.setContext({
    myExtraData: 'extra data'
});

logger.info('Example');
// Outputs:
// {
//     "level": "info",
//     "message": "Example",
//     "context": {
//         "myExtraData": "extra data"
//     }
// }
```

#### `logger.clearContext()`

Remove the `context` property from the logger's [base log data](#optionsbaselogdata).

> **Warning**
> This method is deprecated and will log a warning message the first time it's used. This is just for compatibility with [n-serverless-logger](https://github.com/Financial-Times/n-serverless-logger) and you should use either `baseLogData` or [`createChildLogger`](#loggercreatechildlogger) instead.

```js
const logger = new Logger({
    baseLogData: {
        context: {
            appName: 'my-app'
        }
    }
});

logger.clearContext();

logger.info('Example');
// Outputs:
// {
//     "level": "info",
//     "message": "Example"
// }
```

### Log data serialization

The logger can accept data in a variety of formats, and it combines all the different data you give it into a single object which is then stringified as JSON. Each logging method can accept any number of objects, strings, and errors as log data:

```js
logger.info('This is a string', { thisIsData: true }, { thisIsMoreData: true });
// Outputs:
// {
//     "level": "info",
//     "message": "This is a string",
//     "thisIsData": true,
//     "thisIsMoreData": true
// }
```

#### How different data is serialized

Different types of data are serialized differently before being output as JSON:

  * **Objects** are left as they are, all of their properties are extracted and logged as regular JSON. E.g.

      ```js
      logger.info({ hello: 'world' });
      // Outputs:
      // {
      //     "level": "info",
      //     "hello": "world"
      // }
      ```

  * **Strings** are moved into the `message` property of the output log. E.g.

      ```js
      logger.info('Hello world');
      // Outputs:
      // {
      //     "level": "info",
      //     "message": "Hello World!"
      // }
      ```

  * **Errors** are moved into the `error` property of the output log and serialized using the [Reliability Kit `serializeError` method](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/serialize-error#readme). E.g.

      ```js
      logger.info(new Error('Oops'));
      // Outputs:
      // {
      //     "level": "info",
      //     "error": {
      //         "name": "Error",
      //         "message": "Oops",
      //         ...etc
      //     }
      // }
      ```

      Errors found in sub-properties of the log data are _not_ serialized like this. This is for performance reasons: looping over every nested property to check if it's an error is expensive. Do **not** do this:

      ```js
      logger.info({ err: new Error('Oops') });
      // Outputs:
      // {
      //     "level": "info",
      //     "err": {}
      // }
      ```

      If you _need_ to pass error objects as a property, you must serialize it yourself:

      ```js
      logger.info({ err: serializeError(new Error('Oops')) });
      ```

#### Order of precedence

The order of the log data items is meaningful, and when a property is encountered the first instance of it will be used. This is the opposite behaviour to JavaScript's [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign):

```js
logger.info({ example: 1 }, { example: 2 }, { example: 3 });
// Outputs:
// {
//     "level": "info",
//     "example": 1
// }
```

### Local development usage

`@dotcom-reliability-kit/logger` does not format or colourize logs, which can make reading them in local development more difficult. If reading raw JSON isn't your thing then we suggest using [pino-pretty](https://github.com/pinojs/pino-pretty#readme) in local development to colourize and format log lines.

You can do this by installing pino-pretty as a development dependency:

```sh
npm install -D pino-pretty
```

and then piping your application start into the `pino-pretty` binary. The following ensures that the log message appears as the top highlighted line:

```sh
npm start | pino-pretty --messageKey message
```

### Production usage

Using `@dotcom-reliability-kit/logger` in production requires that your application can handle logs to `stdout` and sends these logs to somewhere more permanent. On Heroku this means you're required to have [migrated to Log Drains](https://financialtimes.atlassian.net/wiki/spaces/DS/pages/7883555001/Migrating+an+app+to+Heroku+log+drains). On AWS Lambda it means you must be sending logs to CloudWatch.

### Compatibility

`@dotcom-reliability-kit/logger` is compatible with most use cases of [n-logger](https://github.com/Financial-Times/n-logger) and [n-serverless-logger](https://github.com/Financial-Times/n-serverless-logger). We tried hard to make migration as easy as possible from these libraries. The full list of differences are available in the [Migration Guide](./docs/migration.md) as well as tips on migrating.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
