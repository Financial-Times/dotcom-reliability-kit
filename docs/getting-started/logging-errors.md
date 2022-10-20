
# Getting started: logging errors

Logging when errors occur is important when it comes to debugging an issue with your app. Doing your error logging consistently per app (and across all our apps) helps to make debugging more efficient: if you know how to find the information to debug one app then you _should_ also be able to help debug any other app.

  * [What to log](#what-to-log)
    * [What not to log](#what-not-to-log)
    * [Extracting logging information](#extracting-logging-information)
  * [Appropriate logging levels](#appropriate-logging-levels)
  * [One way of logging](#one-way-of-logging)
  * [Unhandled errors](#unhandled-errors)


## What to log

When you're logging errors, think about all the detail you might need to debug if this error occurs. The information you have available will differ depending on where you're logging, but one consistent thing you should have is an error object (assuming you're following the guidance in [throwing](./throwing-errors.md) and [handling](./handling-errors.md) errors).

In error logs, we generally want to be able to see:

  * The human-readable error message
  * The machine-readable error code, so that we can filter via our logging dashboards
  * The full error stack, which includes the file and line the error was thrown on
  * Whether the error was operational (expected) or programmer (unexpected)
  * Any additional properties on the error object
  * If the error was thrown as a result of a HTTP request, then information which would allow us to replicate the error locally
  * Some app details, like what region the app is running in


### What not to log

It's also a good idea to think about what we _don't_ want to log. We at least don't want to log these by default without proper consideration:

  * Personally Identifiable Information which we're not expecting to handle, e.g. a user's email address
  * Information which could lead to elevation of privileges, e.g. cookie values
  * Long or irrelevant request header values which won't aid debugging and result in log bloat, making it hard to spot real issues
  * Unsanitized user input, e.g. the raw HTTP request body, as this could bloat logs and gives an attacker a way to target our ability to debug


### Extracting logging information

Errors can contain a lot of information about what happened, but passing an error object directly to a logging method does not always work as expected. Depending on the logger you're using you might get just the error name and message, or even just an empty object (`{}`) if the logger doesn't know how to serialize error objects.

Extracting the information we do want can result in a lot of boilerplate code littered around our systems. To aid this, Reliability Kit provides a couple of packages to help with this task.

> **Note**
> The code examples in this section are illustrative to help understand what we're doing under the hood. For our recommended implementation of error logging, see the [One way of logging](#one-way-of-logging) section.

[`@dotcom-reliability-kit/serialize-error`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/serialize-error#readme)  provides a `serializeError` function which accepts an error object and converts it to a plain object with all of the data extracted for logging. If you were logging something manually you could get all error information like this:

```js
try {
    // Something that might throw an error
} catch (error) {
    logger.error({
        error: serializeError(error)
    });
}
```

In a request/response cycle, e.g. in Express, we likely also want information about the request that lead to the throwing of the error. Similar to errors, Request objects do not serialize nicely and may also contain <abbr title="Personally Identifiable Information">PII</abbr> which we don't want to manage the storage of. Reliability Kit also provides [`@dotcom-reliability-kit/serialize-request`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/serialize-request#readme) which works in a similar way to `serializeError`:

```js
// E.g. GET https://your-app/fruit/feijoa
app.get('/fruit/:name', async (request, response, next) => {
    try {
        // Something that might throw an error
    } catch (error) {
        logger.error({
            error: serializeError(error),
            request: serializeRequest(request)
        });
        next(error);
    }
});
```

The above examples work well but will likely result in a lot of repeated code. That's why it's important to rely on centralised logging, outlined below.


## Appropriate logging levels

When logging errors it's important to consider the level of the log you send. The level can be used to indicate the severity of the error. For example:

  * If an error is recoverable, and doesn't result in a `4xx` or `5xx` status code for a user, then consider logging it as a "warning" rather than an error, because it likely doesn't require immediate attention from an engineer:

    ```js
    try {
        // Something that might throw a recoverable error
    } catch (error) {
        logger.warn({
            error: serializeError(error)
        });
    }
    ```

  * If an error is not recoverable, e.g. it results in a `4xx` or `5xx` status code for a user, then consider a level of "error" is appropriate, as it indicates that an engineer might need to debug this issue:

    ```js
    try {
        // Something that might throw a non-recoverable error
    } catch (error) {
        logger.error({
            error: serializeError(error)
        });
    }
    ```

  * If an error is not recoverable at all and throws the app into an unstable state, e.g. an initial database connection cannot be established, then consider a level of "fatal" or "critical" if your logger supports it (currently [n-logger](https://github.com/Financial-Times/n-logger) does not support critical logs but we'll be investigating adding this in future).


## One way of logging

If you're handling errors correctly and have read through [bubbling up in Express](./handling-errors.md#bubbling-up-in-express), then you know that moving our error handling to a centralised place is a sensible way to avoid boilerplate code and make sure that everything we do is consistent.

Reliability Kit has a package which helps you with this if you're running an Express application: [`@dotcom-reliability-kit/middleware-log-errors`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/middleware-log-errors#readme) is a middleware which logs error, request, and application information. You can register it _after_ your application routes like this:

```js
import createErrorLogger from '@dotcom-reliability-kit/middleware-log-errors';

// All your app setup and routes

// Assume `app` is an Express application
app.use(createErrorLogger());
```

Now all your routes need to do is pass on any errors and they'll be logged consistently:

```js
// E.g. GET https://your-app/fruit/feijoa
app.get('/fruit/:name', async (request, response, next) => {
    try {
        // Something that might throw an error
    } catch (error) {
        // No in-route logging necessary here
        next(error);
    }
});
```

Reliability Kit also provides methods to log errors which are [recoverable](./handling-errors.md#handling-recoverable-errors), you can do this with the [`@dotcom-reliability-kit/log-error`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/log-error#readme) package. It's best to use these centralised methods for logging as they ensure that:

  1. The same information is always logged in a [consistent format](#extracting-logging-information)

  2. The appropriate [log level](#appropriate-logging-levels) is used

```js
import { logRecoverableError } from '@dotcom-reliability-kit/log-error';

logRecoverableError({
    error: new Error('Something went wrong')
});
```

If you're in an Express route, then it's also a good idea to include request information. the `log-error` package also allows you to do this:

```js
// E.g. GET https://your-app/fruit/feijoa
app.get('/fruit/:name', async (request, response, next) => {
    try {
        // Something that might throw an error
    } catch (error) {
        logRecoverableError({
            error,
            request
        });
        response.render('fruit');
    }
});
```


## Unhandled errors

There are times where an unexpected error can occur in your app and your code is not designed to handle that error. This is OK, and it's where the [Node.js `uncaughtException` event](https://nodejs.org/api/process.html#event-uncaughtexception) comes in.

Uncaught exception handling should never attempt to keep the app alive. If an error is thrown in a place where no handling is present then it's correct for the application to crash, _however_ if the app is crashing then we need to be sure that the fatal error is logged somewhere:

> **Note**
> This code examples is illustrative, you should not use this in your application but it helps us explain how logging fatal errors works. For a production solution, see the later examples under this heading.

```js
process.on('uncaughtException', (error) => {
    console.log(`The app is crashing because ${error.message}`);
    process.exit(1);
});
```

[`@dotcom-reliability-kit/crash-handler`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/crash-handler#readme) offers a way to register a consistent error handler in your apps, which [provides as much error information as possible](#extracting-logging-information). Using this will make fatal errors in your app a lot easier to debug.

It abstracts the actual uncaught exception handling code away into a neat function call:

```js
registerCrashHandler({ process });
```



| ← Previous                              | Next → |
| :-------------------------------------- | -----: |
| [Handling errors](./handling-errors.md) | -      |
