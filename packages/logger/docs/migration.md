
# Migration guide for @dotcom-reliability-kit/logger

This document outlines how to migrate to the latest version of the Reliability Kit logger. Throughout this guide we use the following emoji and labels to indicate the level of change required:

Emoji           | Label             | Meaning
----------------|:------------------|:-------
:red_circle:    | Breaking          | A breaking change which will definitely require code changes to resolve
:orange_circle: | Possibly Breaking | A breaking change to the output of the library which may require extra steps
:yellow_circle: | Deprecation       | A deprecated feature which will require code changes in the future

## Table of contents

  * [Migrating from n-logger](#migrating-from-n-logger)
    * [Where logs get sent](#n-logger-where-logs-get-sent)
    * [Error serialization changes](#n-logger-error-serialization-changes)
    * [Log timestamps](#n-logger-log-timestamps)
    * [Log level changes](#n-logger-log-level-changes)
    * [Logger method changes](#n-logger-method-changes)
    * [Environment variable changes](#n-logger-environment-variable-changes)
    * [Proxy incompatibility](#n-logger-proxy-incompatibility)
  * [Migrating from n-mask-logger](#migrating-from-n-mask-logger)
    * [API changes](#n-mask-logger-api-changes)
    * [where logs get sent](#n-mask-logger-where-logs-get-sent)
    * [log timestamps](#n-mask-logger-log-timestamps)
    * [method changes](#n-mask-logger-method-changes)
    * [environment variable changes](#n-mask-logger-environment-variable-changes)
  * [Migrating from n-serverless-logger](#migrating-from-n-serverless-logger)
    * [Where logs get sent](#n-serverless-logger-where-logs-get-sent)
    * [Error serialization changes](#n-serverless-logger-error-serialization-changes)
    * [Logger property changes](#n-serverless-logger-property-changes)
    * [Logger method changes](#n-serverless-logger-method-changes)
    * [Environment variable changes](#n-serverless-logger-environment-variable-changes)

## Migrating from n-logger

We tried to maintain as much compatibility with [n-logger](https://github.com/Financial-Times/n-logger) as possible to make switching relatively easy. This guide covers the differences and how to migrate your application. This guide assumes you're using the latest major version of n-logger.

### n-logger: where logs get sent

**:orange_circle: Possibly Breaking:** The Splunk HEC Logger has been removed. `@dotcom-reliability-kit/logger` does not directly log to Splunk, it logs to `process.stdout` and relies on your application forwarding these errors to Splunk. This is the same behaviour as n-logger with the `MIGRATE_TO_HEROKU_LOG_DRAINS` environment variable set.

If your app is on Heroku and you've migrated to use Heroku Log Drains, then this change will not impact you. If you haven't [migrated to Heroku Log Drains](https://financialtimes.atlassian.net/l/cp/sUC4vnnN) yet then you'll need to do that before using this package.

If your app runs on AWS Lambda then you need to ensure that logs are forwarded to Splunk.

### n-logger: error serialization changes

**:orange_circle: Possibly Breaking:** The format of errors has changed in the log outputs between n-logger and `@dotcom-reliability-kit/logger`. We now run instances of `Error` through the [serialize-error package](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/serialize-error#readme) which enriches the logs a lot more.

This is technically not a backwards-compatible change, if you have dashboards which are based on the old error properties (`error_name`, `error_message`, `error_stack`) then you'll need to update these after migrating.

The differences are:

```js
logger.info(new TypeError('Example Error'));
```

```diff
{
-    "error_name": "TypeError",
-    "error_message": "Example Error",
-    "error_stack": "..."
+    "error": {
+        "name": "TypeError",
+        "code": "UNKNOWN",
+        "message": "Example Error",
+        "stack": "...",
+        "isOperational": false,
+       // ...all other serialized properties
+    }
}
```

### n-logger: log timestamps

**:orange_circle: Possibly Breaking:** Because [Pino](https://getpino.io/) (the default underlying log transport) logs asynchronously, the time that it takes logs to reach `process.stdout` isn't predictable. That means that the time captured alongside logs may be slightly inaccurate, though they will all still be in the correct order.

Now, by default, a `time` property is sent on every log to capture the exact time that a log method was called. If your app is already using a `time` property then this may be a breaking change.

It's possible to switch off this behaviour for backwards-compatibility, set the [`withTimestamps` option](../README.md#optionswithtimestamps) to `false` in order to not capture log timestamps.

### n-logger: log level changes

**:yellow_circle: Deprecation:** The log levels which this logger supports are different to n-logger, [we've reduced and simplified the number of levels and made it clear what each is for](../README.md#log-levels). The older log level methods have been deprecated or removed as follows:

  * `data`: This level is now an alias of `debug` and any logs sent with this method will be changed to have a level of `debug`. A warning will also be logged to explain the deprecation. While it's not essential yet, it's worth switching from `data` to `debug` explicitly in your code.

  * `silly`: This level is now an alias of `debug` and any logs sent with this method will be changed to have a level of `debug`. A warning will also be logged to explain the deprecation. While it's not essential yet, it's worth switching from `silly` to `debug` explicitly in your code.

  * `verbose`: This level is now an alias of `debug` and any logs sent with this method will be changed to have a level of `debug`. A warning will also be logged to explain the deprecation. While it's not essential yet, it's worth switching from `verbose` to `debug` explicitly in your code.

### n-logger: method changes

**:yellow_circle: Deprecation:** The `logger.addContext` method has been deprecated and will be removed in a later version of Reliability Kit logger. It currently works in exactly the same way as n-logger, so migration isn't strictly necessary but you'll get warning logs. [The README documents some alternatives](../README.md#loggeraddcontext).

We want to avoid making modifications to a global logger as this can have unexpected consequences. It's better to create a new logger for your specific purpose, and you can now do so by creating child loggers:

```js
// The old way
const logger = require('@dotcom-reliability-kit/logger').default;
logger.addContext({ example: true });
logger.info('Hello');
// { "level": "info", "message": "Hello", "example": true }

// The new way (#1): not modifying the default logger
const logger = require('@dotcom-reliability-kit/logger').default;
const childLogger = logger.createChildLogger({ example: true });
childLogger.info('Hello');
// { "level": "info", "message": "Hello", "example": true }

// The new way (#2): creating a brand new logger with base data
const { Logger } = require('@dotcom-reliability-kit/logger');
const logger = new Logger({
    baseLogData: { example: true }
});
logger.info('Hello');
// { "level": "info", "message": "Hello", "example": true }
```

### n-logger: environment variable changes

**:yellow_circle: Deprecation:** The following environment variables no longer do anything:

  * **`MIGRATE_TO_HEROKU_LOG_DRAINS`:** This is no longer required as the Reliability Kit logger doesn't not work without log drains.

  * **`SPLUNK_HEC_TOKEN`:** This is no longer required as the Reliability Kit logger does not directly connect to Splunk.

  * **`CONSOLE_LOG_LEVEL`:** This has been replaced with a more generic `LOG_LEVEL` environment variable. This means that in local development you might see more logs until you reconfigure. This removal has no impact on production environments.

  * **`CONSOLE_LOG_UNCOLORIZED`:** This is no longer required as the Reliability Kit logger does not colourize logs by default. See the [local development usage guide](../README.md#local-development-usage) if you want colourized logs when running locally.

The following environment variables have been deprecated.

  * **`SPLUNK_LOG_LEVEL`:** This environment variable will be used if a `LOG_LEVEL` environment variable is not present, however it may be removed in a later version of the Reliability Kit logger. It's best to migrate to `LOG_LEVEL` early.

### n-logger: proxy incompatibility

**:red_circle: Breaking:** due to our use of [private class features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields) in the new logger, using [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) objects is no longer possible. This is a known JavaScript incompatibility between private fields and proxies.

We decided to continue using private fields because `Proxy` use at the FT is uncommon and private fields allow us to ensure internal APIs aren't used in places that they shouldn't be.


## Migrating from n-mask-logger

We tried to maintain as much compatibility with [n-mask-logger](https://github.com/Financial-Times/n-mask-logger) as possible to make switching relatively easy. This guide covers the differences and how to migrate your application. This guide assumes you're using the latest major version of n-mask-logger.

### n-mask-logger: API changes

**:red_circle: Breaking:** n-mask-logger's public API has been completely revised, and you'll need to make code changes in order to migrate to the Reliability Kit logger. We've tried to keep this as minimal as possible. For basic n-mask-logger usage, you'll need to replace as follows:

```diff
- const MaskLogger = require('@financial-times/n-mask-logger');
+ const { Logger, transforms } = require('@dotcom-reliability-kit/logger');

- const logger = new MaskLogger();
+ const logger = new Logger({
+     transforms: [
+         transforms.legacyMask()
+     ]
+ });
```

If you're using arguments to configure n-mask-logger, you'll need to switch those to named options on the legacy mask transform:

```diff
- const logger = new MaskLogger(
-     ['example', 'deny', 'list'],
-     ['example', 'allow', 'list'],
-     'example mask string'
- );
+ const logger = new Logger({
+     transforms: [
+         transforms.legacyMask({
+             denyList: ['example', 'deny', 'list'],
+             allowList: ['example', 'allow', 'list'],
+             maskString: 'example mask string'
+         })
+     ]
+ });
```

### n-mask-logger: where logs get sent

**:orange_circle: Possibly Breaking:** n-mask-logger uses n-logger under the hood, so [the same breaking changes potentially apply](#n-logger-where-logs-get-sent). As with n-logger, if your app is on Heroku and you've migrated to use Heroku Log Drains, then this change will not impact you.

### n-mask-logger: log timestamps

**:orange_circle: Possibly Breaking:** As with n-logger, we now add a `time` property to logs. This is potentially a breaking change. See the [migration guide for n-logger](#n-logger-log-timestamps) for more information.

### n-mask-logger: method changes

**:red_circle: Breaking:** The `logger.mask` method has been removed and is no longer available. We could not find any use of this method across our systems so you should be safe, but check just in case.

### n-mask-logger: environment variable changes

**:yellow_circle: Deprecation:** n-mask-logger reads the same environment variables as n-logger, please refer to the [n-logger migration guide](#n-logger-environment-variable-changes) for more information.


## Migrating from n-serverless-logger

We tried to maintain as much compatibility with [n-serverless-logger](https://github.com/Financial-Times/n-serverless-logger) as possible to make switching relatively easy. This guide covers the differences and how to migrate your application. This guide assumes you're using the latest major version of n-serverless-logger.

### n-serverless-logger: where logs get sent

**:red_circle: Breaking:** The Splunk logger has been removed. `@dotcom-reliability-kit/logger` does not directly log to Splunk, it logs to `process.stdout` and relies on your application forwarding these errors to Splunk. This is a breaking change.

Your logs will still be sent to CloudWatch, but you'll need to ensure that these logs are forwarded to Splunk.

### n-serverless-logger: error serialization changes

**:orange_circle: Possibly Breaking:** The format of errors has changed in the log outputs between n-serverless-logger and `@dotcom-reliability-kit/logger`. We now run instances of `Error` through the [serialize-error package](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/serialize-error#readme) which enriches the logs a lot more.

See the [error serialization changes for n-logger](#n-logger-error-serialization-changes) for more information.

### n-serverless-logger: property changes

**:red_circle: Breaking:** The `logger.withTimestamps` property is no longer accessible as it's no longer a trivial task to change the timestamp settings after a logger is constructed. Timestamps are included by default, if you need to disable them then you should create a new Logger instance with the configuration set:

```js
const { Logger } = require('@dotcom-reliability-kit/logger');
const logger = new Logger({
    withTimestamps: false
});
```

### n-serverless-logger: method changes

**:yellow_circle: Deprecation:** The `logger.setContext` and `logger.clearContext` methods have been deprecated and will be removed in a later version of Reliability Kit logger. They currently work in exactly the same way as n-serverless-logger, so migration isn't strictly necessary but you'll get warning logs. [The README documents some alternatives](../README.md#loggersetcontext).

We want to avoid making modifications to a global logger as this can have unexpected consequences. It's better to create a new logger for your specific purpose, and you can now do so by creating child loggers:

```js
// The old way
const logger = require('@dotcom-reliability-kit/logger').default;
logger.setContext({ example: true });
logger.info('Hello');
// { "level": "info", "message": "Hello", "context": { "example": true } }

// The new way (#1): not modifying the default logger
const logger = require('@dotcom-reliability-kit/logger').default;
const childLogger = logger.createChildLogger({ context: { example: true } });
childLogger.info('Hello');
// { "level": "info", "message": "Hello", "context": { "example": true } }

// The new way (#2): creating a brand new logger with base data
const { Logger } = require('@dotcom-reliability-kit/logger');
const logger = new Logger({
    baseLogData: { context: { example: true } }
});
logger.info('Hello');
// { "level": "info", "message": "Hello", "context": { "example": true } }
```

### n-serverless-logger: environment variable changes

**:yellow_circle: Deprecation:** The following environment variables no longer do anything:

  * **`AWS_LAMBDA_FUNCTION_NAME`:** This is no longer required as the Reliability Kit logger does not directly connect to Splunk.

  * **`SPLUNK_HEC_TOKEN`:** This is no longer required as the Reliability Kit logger does not directly connect to Splunk.

  * **`SPLUNK_HEC_URL`:** This is no longer required as the Reliability Kit logger does not directly connect to Splunk.

The following environment variables have been deprecated.

  * **`SPLUNK_LOG_LEVEL`:** This environment variable will be used if a `LOG_LEVEL` environment variable is not present, however it may be removed in a later version of the Reliability Kit logger. It's best to migrate to `LOG_LEVEL` early.
