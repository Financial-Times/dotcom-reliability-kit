
# @dotcom-reliability-kit/logger

A simple and fast logger based on [Pino](https://getpino.io/), with FT preferences baked in. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [Log levels](#log-levels)
    * [`Logger`](#logger)
    * [`Logger` configuration options](#logger-configuration-options)
      * [`options.baseLogData`](#optionsbaselogdata)
      * [`options.logLevel`](#optionsloglevel)
      * [`options.serializers`](#optionsserializers)
      * [`options.transforms`](#optionstransforms)
      * [`options.withPrettifier`](#optionswithprettifier)
    * [`logger.log()` and shortcut methods](#loggerlog-and-shortcut-methods)
    * [`logger.flush()`](#loggerflush)
    * [`logger.createChildLogger()`](#loggercreatechildlogger)
    * [Deprecated methods](#deprecated-methods)
      * [`logger.addContext()`](#loggeraddcontext)
      * [`logger.setContext()`](#loggersetcontext)
      * [`logger.clearContext()`](#loggerclearcontext)
    * [Built-in transforms](#built-in-transforms)
      * [`legacyMask` transform](#legacymask-transform)
        * [`legacyMaskOptions.denyList`](#legacymaskoptionsdenylist)
        * [`legacyMaskOptions.allowList`](#legacymaskoptionsallowlist)
        * [`legacyMaskOptions.maskString`](#legacymaskoptionsmaskstring)
    * [Log data serialization](#log-data-serialization)
      * [How different data is serialized](#how-different-data-is-serialized)
      * [Order of precedence](#order-of-precedence)
    * [Local development usage](#local-development-usage)
    * [Production usage](#production-usage)
    * [Testing](#testing)
    * [Compatibility](#compatibility)
  * [Migrating](#migrating)
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

  * `info`: The highest _informational_ log level. This is for key information which is important debugging an application in production. E.g. when the application is ready to receive HTTP traffic.

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

#### `options.serializers`

You can customize the way that the logger converts certain properties to JSON by specifying serializers. This allows you to extract only the information you need or to fully transform a single property value.

This option must be an object. Each key corresponds to the log property you want to serialize, and each value must be a function that performs the serialization. Expressed as a TypeScript type:

```ts
type Serializer = (value, propertyName) => any
```

When you define a serializer for a property, your serializer function will be called every time we encounter that property _at the top level_ of a log data object. E.g.

```js
const fruitEmoji = {
    apple: '🍏',
    banana: '🍌',
    coconut: '🥥'
};
function emojifyFruit(value) {
    return fruitEmoji[value] || value;
}

const logger = new Logger({
    serializers: {
        // If a "snack" property is found in a log, this function will be called
        snack: emojifyFruit
    }
});

logger.info({
    message: 'Hello World',
    snack: 'banana'
});
// Outputs:
// {
//     "level": "info",
//     "message": "Hello World",
//     "snack": "🍌"
// }
```

Some properties cannot be serialized in this way to maintain consistent logs:
 `err`, `error`, `level`, `message`, and `time` are all reserved. Configured serializers for these properties will be ignored.

> [!WARNING]<br />
> It's your responsibility to properly handle unexpected data in your log serializers. You should ideally type guard to avoid your logs failing to send. If an unexpected error is encountered in a serializer then you'll see `LOG_METHOD_FAILURE` errors appear in your logs.
>
> E.g. taking the example above, we would probably ensure that the property we're working with is a string:
>
> ```js
> function emojifyFruit(value) {
>     if (typeof value === 'string' && fruitEmoji[value]) {
>         return fruitEmoji[value];
>     }
>     // Always return the original value if you can't process it, so you don't lose log data
>     return value;
> }

#### `options.transforms`

An array of functions which are called on log data before logs are output. This allows you to apply transformations to the final log object before it's sent.

Each log transform must be a function which accepts a single object argument and returns an object. Expressed as TypeScript types:

```ts
type LogData = {[x: string]: any};
type Transform = (logData: LogData) => LogData
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
    message: 'Hello World',
    example: true
});
// Outputs:
// {
//     "LEVEL": "info",
//     "MESSAGE": "This is a log",
//     "EXAMPLE": true
// }
```

You can also use [built-in transforms](#built-in-transforms) to do things like mask sensitive data.

####  `options.withPrettifier`

Whether to send prettified logs if available. This option has no effect if you have the `NODE_ENV` environment variable set to either `production` or if you have not installed [pino-pretty](https://github.com/pinojs/pino-pretty#readme). See [local development usage](#local-development-usage) for more information.

Must be a `Boolean` and defaults to `true`.

It's also possible to set this option as an environment variable, which is how you configure the default logger. Set the `LOG_DISABLE_PRETTIFIER` environment variable to `true` if you want to force the prettifier not to load.

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

> [!WARNING]<br />
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

> [!WARNING]<br />
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

> [!WARNING]<br />
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

> [!WARNING]<br />
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

### Built-in transforms

As well as writing your own [log transforms](#optionstransforms), you can use the ones provided as part of this package. All built-in transforms are provided as properties of the `transforms` object:

```js
const { transforms } = require('@dotcom-reliability-kit/logger');
```

#### `legacyMask` transform

The legacy mask transform applies the same masking behaviour to the logger as [n-mask-logger](https://github.com/Financial-Times/n-mask-logger), replicating the behaviour exactly. It masks a list of fields you specify so that we don't accidentally log sensitive information in our apps. You can use it like this:

```js
const { Logger, transforms } = require('@dotcom-reliability-kit/logger');

const logger = new Logger({
    transforms: [
        transforms.legacyMask()
    ]
});

logger.info({
    email: 'oops@ft.com'
});
// Outputs:
// {
//     "level": "info",
//     "email": "*****"
// }
```

You can configure the legacy mask transform by passing in an options object:

```js
const logger = new Logger({
    transforms: [
        transforms.legacyMask({
            // options go here
        })
    ]
});
```

##### `legacyMaskOptions.denyList`

An array of strings which indicate the property names in the logs which should have their values masked. Adding new items to the deny list does not alter the default set of property names: `firstName`, `ft-backend-key`, `ft-session-id`, `FTSession_s`, `FTSession`, `lastName`, `password`, `phone`, `postcode`, `primaryTelephone`, `session`, and `sessionId`:

```js
transforms.legacyMask({
    denyList: [ 'myEmailProperty', 'myPasswordProperty' ]
})
```

##### `legacyMaskOptions.allowList`

An array of strings which indicate the property names in the logs which should **not** have their values masked. This is used to override the default fields in cases where you want to log potentially sensitive data. E.g. if your `email` property actually contains a `boolean` indicating whether a user is opted into email, then you might want to do this:

```js
transforms.legacyMask({
    allowList: [ 'email' ]
})
```

##### `legacyMaskOptions.maskString`

A string which is used as the replacement when a property is masked. This defaults to `*****`:

```js
transforms.legacyMask({
    maskString: '🙈🙉🙊'
})
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

    > [!WARNING]<br />
    > It's important to note that only properties that are [serializable as JSON](https://www.rfc-editor.org/rfc/rfc7159) can be logged. Any non-serializable properties (e.g. functions) will not be output.

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

    Errors found in sub-properties of the log data are _not_ serialized like this due to performance reasons: looping over every nested property to check if it's an error is expensive (do **not** do this). Also, be mindful of passing in errors with a custom error property e.g. `myErrorProperty`, as you'll have to serialize them yourself like below:

    ```js
    logger.info({ myErrorProperty: serializeError(new Error('Oops')) });
    ```

    ... if not, you'll get the following output:

    ```js
    logger.info({ myErrorProperty: new Error('Oops') });
    // Outputs:
    // {
    //     "level": "info",
    //     "myErrorProperty": {}
    // }
    ```
    
    The exception to this is if the sub-property name is either `error` or `err`, as these are automatically serialized. E.g.

      ```js
    logger.info({ error: new Error('Oops') });
    // Outputs:
    // {
    //     "level": "info",
    //     "error": {
    //         "cause": null,
    //		"code": "UNKNOWN",
    //		"data": {},
    //		"isOperational": false,
    //		"message": "Oops",
    //		"name": "Error",
    //		"relatesToSystems": [],
    //		"statusCode": null
    //     }
    // }
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

In local development `@dotcom-reliability-kit/logger` does not format or colourize logs by default. You may want to enable this to make reading logs in local development more easy.

To get formatted and colourised logs locally, you need to meet two conditions:

  1. Have the `NODE_ENV` environment variable set to either `development` or don't have it set at all.

  2. Install [pino-pretty](https://github.com/pinojs/pino-pretty#readme) as a **development dependency** in your project. It's very important that this is a development dependency rather than a production one, otherwise you risk prettifying logs in production which makes them appear incorrectly in Splunk:

      ```sh
      npm install -D pino-pretty
      ```

  3. Ensure you don't disable prettification via the [`withPrettifier` option](#optionswithprettifier).

### Production usage

Using `@dotcom-reliability-kit/logger` in production requires that your application can handle logs to `stdout` and sends these logs to somewhere more permanent. On Heroku this means you're required to have [migrated to Log Drains](https://financialtimes.atlassian.net/wiki/spaces/DS/pages/7883555001/Migrating+an+app+to+Heroku+log+drains). On AWS Lambda it means you must be sending logs to CloudWatch ([see tech hub documentation](https://tech.in.ft.com/tech-topics/logging/amazon-cloudwatch-logs#cloudformation-code-for-forwarding-lambda-logs-to-splunk)).

### Testing

If you're using [Jest](https://jestjs.io/) to test your code, you may encounter issues with the tests not exiting when you're mocking `@dotcom-reliability-kit/logger`. You can't rely on Jest's automatic mocking:

```js
jest.mock('@dotcom-reliability-kit/logger');
```

This is because, in order to mock the logger, Jest will still load the original module which creates a fully fledged logger with bindings to `process.stdout`. You can get around this by providing your own manual mock logger, either as a second argument to `jest.mock` or as a file in `__mocks__/@dotcom-reliability-kit/logger.js`. E.g.

```js
jest.mock('@dotcom-reliability-kit/logger', () => ({
    debug: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
}));
```

### Compatibility

`@dotcom-reliability-kit/logger` is compatible with most use cases of [n-logger](https://github.com/Financial-Times/n-logger), [n-mask-logger](https://github.com/Financial-Times/n-mask-logger), and [n-serverless-logger](https://github.com/Financial-Times/n-serverless-logger). We tried hard to make migration as easy as possible from these libraries. The full list of differences are available in the [Migration Guide](./docs/migration.md) as well as tips on migrating.


## Migrating

Consult the [Migration Guide](./docs/migration.md) if you're trying to migrate to a later major version of this package.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
