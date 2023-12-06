
# @dotcom-reliability-kit/crash-handler

A method to bind an uncaught exception handler to ensure that fatal application errors are logged. It is a replacement for Sentry fatal error logging. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

* [Usage](#usage)
  * [`registerCrashHandler`](#registercrashhandler)
  * [Configuration options](#configuration-options)
    * [`options.logger`](#optionslogger)
    * [`options.process`](#optionsprocess)
* [Compatibility](#compatibility)
  * [Migrating from Sentry](#migrating-from-sentry)
* [Contributing](#contributing)
* [License](#license)


## Usage

Install `@dotcom-reliability-kit/crash-handler` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/crash-handler
```

Include in your code:

```js
import registerCrashHandler from '@dotcom-reliability-kit/crash-handler';
// or
const registerCrashHandler = require('@dotcom-reliability-kit/crash-handler');
```

### `registerCrashHandler`

The `registerCrashHandler` function can be used to bind an event handler to the [Node.js `process.uncaughtException` event](https://nodejs.org/api/process.html#event-uncaughtexception). This ensures that your application logs a final message before crashing in the event on an unexpected error or promise rejection.

This function should only ever be called once in your app, normally alongside all your setup code (e.g. alongside creating an Express app).

> [!NOTE]<br />
> It's not a requirement, but generally the earlier the better with registering an uncaught exception handler – the sooner you register it the more likely you are to catch uncaught exceptions.

```js
registerCrashHandler();
```

If an error is thrown which will crash your application, error information will be logged and then the process will exit with the value of `process.exitCode` or `1`.

### Configuration options

Config options can be passed into the `registerCrashHandler` function as an object with any of the keys below.

```js
registerCrashHandler({
    // Config options go here
});
```

#### `options.logger`

A logger object which implements two methods, `error` and `warn`, which have the following permissive signature:

```ts
type LogMethod = (...logData: any) => any;
```

This is passed directly onto the relevant log-error method, [see the documentation for that package for more details](../log-error/README.md#optionslogger).

#### `options.process`

The [Node.js Process](https://nodejs.org/api/process.html#process) object to bind the error handling event to. You may use this if you are using a child process or want to mock the process object in your tests.

```js
registerCrashHandler({
    process: myProcessObject
});
```


## Compatibility

### Migrating from Sentry

The Reliability Kit crash handler is a replacement for Sentry's uncaught exception handling, which your app is likely to be using. You'll need to migrate away from Sentry in order to use this module. [We maintain a migration guide for this on Confluence](https://financialtimes.atlassian.net/l/cp/eeTWSAxe).


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
