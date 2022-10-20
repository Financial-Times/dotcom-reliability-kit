
# @dotcom-reliability-kit/crash-handler

> **Warning**
> This Reliability Kit package is **experimental** and should be used with caution in production applications. Please also let the Customer Products Reliability team know if you intend on using this.

A method to bind an uncaught exception handler to ensure that fatal application errors are logged. It is a replacement for Sentry fatal error logging. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [`registerCrashHandler`](#registercrashhandler)
    * [configuration options](#configuration-options)
      * [`process`](#optionsprocess)
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

The `registerCrashHandler` function can be used to bind an event handler to the [Node.js `process.uncaughtException` event](https://nodejs.org/api/process.html#event-uncaughtexception). This ensures that your application logs a final message before crashing in the event on an unexpected error or promise rejection. This function should only ever be called once in your app, normally alongside all your setup code (e.g. alongside creating an Express app).

```js
registerCrashHandler();
```

If an error is thrown which will crash your application, error information will be logged and then the process will exit with the value of `process.exitCode` or `1`.

> **Warning**
> This function will not work as expected if your app is using [n-raven](https://github.com/Financial-Times/n-raven) or n-express without [the `withSentry` option](https://github.com/Financial-Times/n-express#optional) set to `false`. This is because the way we set up Sentry prevents registering any other uncaught exception handlers. You'll need to [migrate away from Sentry](#migrating-from-sentry) to use this module.

### Configuration options

Config options can be passed into the `registerCrashHandler` function as an object with any of the keys below.

```js
registerCrashHandler({
    // Config options go here
});
```

#### `options.process`

The [Node.js Process](https://nodejs.org/api/process.html#process) object to bind the error handling event to. You may use this if you are using a child process or want to mock the process object in your tests.

```js
registerCrashHandler({
    process: myProcessObject
});
```


## Compatibility

### Migrating from Sentry

The Reliability Kit crash handler is a replacement for Sentry's uncaught exception handling, which your app is likely using. You'll need to migrate away from Sentry in order to use this module. You can do so by:

  1. Remove any references to [n-raven](https://github.com/Financial-Times/n-raven) in your codebase. You may be importing this module yourself, and if you do then `registerCrashHandler` will not work as expected.

  2. If you're using n-express, it must be on [v26.3.0](https://github.com/Financial-Times/n-express/releases/tag/v26.3.0) or higher. This version of n-express introduces the ability to turn off Sentry.

  3. Configure n-express to disable Sentry by setting the [`withSentry` option](https://github.com/Financial-Times/n-express#optional) to `false`. Find your n-express setup and add the option:

      ```js
      express({
          withSentry: false
      });
      ```

  4. Follow the instructions in the [usage guide](#usage) to set up Reliability Kit's crash handler.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
