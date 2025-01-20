
# Migration guide for @dotcom-reliability-kit/middleware-log-errors

This document outlines how to migrate to the latest version of the Reliability Kit middleware-log-errors package. Throughout this guide we use the following emoji and labels to indicate the level of change required:

Emoji           | Label             | Meaning
----------------|:------------------|:-------
:red_circle:    | Breaking          | A breaking change which will likely require code or config changes to resolve
:orange_circle: | Possibly Breaking | A breaking change that is unlikely to require code changes but things outside of the code (e.g. logs) may have changed

* [Migrating from v1 to v2](#migrating-from-v1-to-v2)
  * [Node.js 14 is no longer supported](#nodejs-14-is-no-longer-supported)
* [Migrating from v2 to v3](#migrating-from-v2-to-v3)
  * [Switch to Reliability Kit logger](#switch-to-reliability-kit-logger)
  * [Remove Sentry workarounds](#remove-sentry-workarounds)
* [Migrating from v3 to v4](#migrating-from-v3-to-v4)
  * [Node.js 16 is no longer supported](#nodejs-16-is-no-longer-supported)
* [Migrating from v4 to v5](#migrating-from-v4-to-v5)
  * [Node.js 18 is no longer supported](#nodejs-18-is-no-longer-supported)


## Migrating from v1 to v2

### Node.js 14 is no longer supported

**:red_circle: Breaking:** this version drops support for Node.js v14. If your app is already using Node.js v16 or above then you can migrate with no code changes.


## Migrating from v2 to v3

### Switch to Reliability Kit logger

**:orange_circle: Possibly Breaking:** this version switches to use [Reliability Kit's logger](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/logger#readme) by default. This means that logs will not be sent directly to Splunk but will be sent to `stdout`. This may mean you lose some logs if you haven't configured your app to forward these logs somewhere more permanent.

You may not need to change anything for this upgrade, for example, if your app uses Heroku log drains _or_ a Lambda log forwarder. [The logger migration guide has more information](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/packages/logger/docs/migration.md#n-logger-where-logs-get-sent).

If you can't switch to Reliability Kit logger yet, then you can still use [n-logger](https://github.com/Financial-Times/n-logger) (the previous default logger) by manually passing it as an option when initialising the middleware:

```js
const createErrorLogger = require('@dotcom-reliability-kit/middleware-log-errors');
const nLogger = require('@financial-times/n-logger').default;

// ...

app.use(createErrorLogger({
    logger: nLogger
}));
```

### Remove Sentry workarounds

**:orange_circle: Possibly Breaking:** this only impacts apps that use [n-express](https://github.com/Financial-Times/n-express) v27 or older. Previously, this module contained code to disable the default [Sentry](https://sentry.io/) error handling which was enabled by n-express.

You can safely migrate to this version of the error logging middleware if your app is either _not_ using n-express or is using n-express v28 or above.


## Migrating from v3 to v4

### Node.js 16 is no longer supported

**:red_circle: Breaking:** this version drops support for Node.js v16. If your app is already using Node.js v18 or above then you can migrate with no code changes.


## Migrating from v4 to v5

### Node.js 18 is no longer supported

**:red_circle: Breaking:** this version drops support for Node.js v18. If your app is already using Node.js v20 or above then you can migrate with no code changes.
