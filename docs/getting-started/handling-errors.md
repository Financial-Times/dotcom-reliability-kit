
# Getting started: handling errors

We've covered creating and throwing good errors, now let's talk about handling errors. The way you handle errors, particularly in Express, is important. You can end up writing a lot of code in different parts of your app if you're not careful. More code isn't always bad, but duplicated error handling can lead to your errors not being surfaced to where they're needed.

  * [Bubbling up in Express](#bubbling-up-in-express)
    * [Synchronous handlers](#synchronous-handlers)
    * [Asynchronous handlers](#asynchronous-handlers)
    * [Registering error handlers](#registering-error-handlers)
  * [Don't fear the try/catch block](#dont-fear-the-trycatch-block)
    * [Error checking](#error-checking)
    * [Multiple try/catch blocks](#multiple-trycatch-blocks)
  * [Handling recoverable errors](#handling-recoverable-errors)


## Bubbling up in Express

In Express, error handlers can be bound at the Application and Route level. This allows you to write lots of error handling code in one place, and you can rely on your Express error handler to do things such as [log the appropriate error detail](./logging-errors.md), forward them on to a service like Splunk, or render a custom error page.

**The following is not a great pattern**, as Express has no chance to log the error to a central place. This means our logs could be missing information that's essential to debugging this error:

```js
app.get('/', (request, response) => {
    try {
        exampleFunctionWhichThrowsAnError();
    } catch (error) {
        response.status(500).send(error.message);
    }
});
```

The way you make sure errors are handled by the main Express error handler is by always passing errors on. The way you do this will depend on whether your route handler is `async` or not.

### Synchronous handlers

For non-`async` route handlers, any errors thrown will immediately be handled by Express:

```js
// This is better because Express will get hold of the error, potentially
// log it, and render a page with a `500` status code
app.get('/', (request, response) => {
    exampleFunctionWhichThrowsAnError();
});
```

This keeps things simple, and if you're throwing your _own_ error in this route then you can do so with the regular `throw` keyword:

```js
throw new Error('Something went wrong');
```

### Asynchronous handlers

For `async` route handlers, it's very important that you either use a module like [`express-async-errors`](https://www.npmjs.com/package/express-async-errors) (to avoid app crashes) or wrap your handler in an outer try/catch block.

This is because unhandled Promise exceptions will crash your app entirely, instead of just serving an error to the one user request which caused the error (see [Express documentation on error handling](http://expressjs.com/en/advanced/best-practice-performance.html#handle-exceptions-properly)).

Example of wrapping with an outer try/catch and using `next`:

```js
app.get('/', async (request, response, next) => {
    try {
        await exampleFunctionWhichThrowsAnError();
    } catch (error) {
        // With a wrapping try/catch block, it's important to
        // pass the error onto the next route handler so that
        // it can be logged and an appropriate error page can
        // be rendered
        next(error);
    }
});
```

Example of using the `express-async-errors` module (looks a lot like the sync example, right?):

```js
// This should be in your app setup, the same place you
// `require` in Express and before you make any calls to
// `app.use` or `app.get` etc.
require('express-async-errors');

app.get('/', async (request, response, next) => {
    await exampleFunctionWhichThrowsAnError();
});
```

This way of handling async errors will also be [built-in in Express v5](https://expressjs.com/en/guide/migrating-5.html#rejected-promises).

**Note: the rest of the examples in this documentation assume that you're _not_ including `express-async-errors`. If you do use this library then you can simplify a lot when you're implementing in your own app.**

### Registering error handlers

The Express documentation covers [writing centralised error handlers](https://expressjs.com/en/guide/error-handling.html#writing-error-handlers), but Reliability Kit provides some of it's own which can be used to [log errors in a consistent and centralised way](./logging-errors.md). It's generally better to rely on these than to write your own error handlers for your app.


## Don't fear the try/catch block

One of the tools we have to make sure [thrown errors are specific](./throwing-errors.md#being-specific) is the `try`/`catch` block. In previous examples we've wrapped all our code in a single `try`/`catch` block and sent the error on to the Express error handler. If we want to be _really_ specific about what went wrong in our code, then this is often not enough.

We have a couple of different ways that we update our `try`/`catch` to help us to handle errors and rethrow more specific ones. We can use either or both of these.

### Error checking

In our final `catch` we can inspect the error object we get and either send it to Express as-is or throw our own error if the original doesn't give us the detail we need, e.g. if a third-party library doesn't throw particularly useful errors:

```js
// E.g. GET https://your-app/fruit/feijoa
app.get('/fruit/:name', async (request, response, next) => {
    try {

        // Add some basic validation of the param
        assert.notStrictEqual(request.params.name, '');

        // Make an API request using an example API client
        const fruit = await fruitApiClient.getByName(request.params.name);
        response.send(fruit);

    } catch (error) {
        next(error);
    }
});
```

In this scenario we have the following possible errors which we know can make it into our final `try`/`catch`:

  * The `name` parameter is an empty string, throwing an `AssertionError`

  * The fruit API is down and the client throws an error with a `statusCode` property set to `503`

  * The fruit API does not have a fruit matching `request.params.name` and so the client throws an error with a `statusCode` property set to `404`

Let's update our `catch` block to handle these cases (Note: this example uses `UpstreamServiceError` and `UserInputError` from the [`@dotcom-reliability-kit/errors`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#readme) package):

```js
// E.g. GET https://your-app/fruit/feijoa
app.get('/fruit/:name', async (request, response, next) => {
    try {
        // [The code in the example above, excluded for brevity]
    } catch (error) {
        
        // If the name parameter is not set, let's throw a more
        // friendly 400 error. We know that we're dealing with
        // that error if we have a `AssertionError` or if
        // `error.code` is "ERR_ASSERTION". We throw a 400 error
        // in this case to indicate that the input was invalid
        if (error.code === 'ERR_ASSERTION') {
            return next(new UserInputError({
                code: 'FRUIT_NAME_NOT_PROVIDED',
                message: 'A fruit name was not provided'
            }));
        }

        // If the fruit was not found, we throw a new 404 error
        // with some added detail
        if (error.statusCode === 404) {
            return next(new UserInputError({
                statusCode: 404,
                code: 'FRUIT_NOT_FOUND',
                message: `The fruit ${request.params.name} was not found in the fruit API`
            }));
        }

        // If the fruit API was down, let's throw an error which
        // better describes what's happened. We switch the status
        // code to 502 because that matches what's happening – we
        // received an invalid response from an upstream server.
        // We can also indicate the system which caused the error
        if (error.statusCode === 503) {
            return next(new UpstreamServiceError({
                statusCode: 502,
                code: 'FRUIT_API_FAILED',
                message: 'The fruit API was not reachable',
                relatesToSystems: ['fruit-api']
            }));
        }

        // We default to passing on the error as-is, because
        // this is probably a programmer error rather than
        // operational and we want to let the app decide how
        // to handle it later
        next(error);
    }
});
```

With this checking in place you can be confident that your error logging (and any dashboards powered by it) will display easy to understand errors and make debugging much easier. However, this checking is quite simplistic; what if we make multiple API requests, any of which can fail?

### Multiple try/catch blocks

Please don't be scared of multiple `try`/`catch` blocks. It's a way we can be _certain_ what the error we're throwing relates to, and it's very powerful when multiple `try`/`catch` are used _within_ a wrapping block. Let's say we have this code, which interacts with multiple APIs before returning a response.

In this example we have two example APIs which have clients, a `person` API, a `fruit` API:

```js
// E.g. GET https://your-app/people/rowanm/favourite-fruit
app.get('/people/:person/favourite-fruit', async (request, response, next) => {
    try {

        // First get the person details
        const person = await personApiClient.getByName(request.params.person);

        // Then get details about their favourite fruit
        const fruit = await fruitApiClient.getByName(person.favouriteFruit);
        response.send(fruit);

    } catch (error) {
        next(error);
    }
});
```

In this scenario we have quite a few possible errors which can occur:

  * The person API is down and the client throws an error with a `statusCode` property set to `503`

  * The person API does not have a person matching `request.params.person` and so the client throws an error with a `statusCode` property set to `404`

  * The fruit API is down and the client throws an error with a `statusCode` property set to `503`

  * The fruit API does not have a fruit matching `person.favouriteFruit` and so the client throws an error with a `statusCode` property set to `404`

Now in our final `catch` block, we can't tell which API is down if we recieve an `error` with a `statusCode` of `503`. We can handle this by nesting our `try`/`catch` blocks and throwing appropriate errors. For brevity, we've handled both `404` errors in one place in this example:

```js
// E.g. GET https://your-app/people/rowanm/favourite-fruit
app.get('/people/:person/favourite-fruit', async (request, response, next) => {
    try {

        // First get the person details
        let person;
        try {
            person = await personApiClient.getByName(request.params.person);
        } catch (error) {
            // We throw here rather than passing to `next` because it allows
            // us to handle all of that in one place – the final try/catch
            if (error.statusCode === 503) {
                throw new UpstreamServiceError({
                    statusCode: 502,
                    code: 'PERSON_API_FAILED',
                    message: 'The person API was not reachable',
                    relatesToSystems: ['person-api']
                });
            }
            // We still want to throw if we have a different error
            // from this service
            throw error;
        }

        // Then get details about their favourite fruit
        try {
            const fruit = await fruitApiClient.getByName(person.favouriteFruit);
            response.send(fruit);
        } catch (error) {
            // We throw here rather than passing to `next` because it allows
            // us to handle all of that in one place – the final try/catch
            if (error.statusCode === 503) {
                throw new UpstreamServiceError({
                    statusCode: 502,
                    code: 'FRUIT_API_FAILED',
                    message: 'The fruit API was not reachable',
                    relatesToSystems: ['fruit-api']
                });
            }
            // We still want to throw if we have a different error
            // from this service
            throw error;
        }

    } catch (error) {

        // Handle the 404 case
        if (error.statusCode === 404) {
            return next(new HttpError({
                statusCode: 404,
                code: 'FAVOURITE_FRUIT_NOT_FOUND',
                message: `A favourite fruit cannot be found for ${request.params.person}`
            }));
        }

        // If we get here, we could have either an unknown programmer error or
        // one of our specially thrown 502 errors
        next(error);
    }
});
```

With this checking and multiple `try`/`catch` blocks in place you can be confident about exactly which part of your app is failing. If an API is down then you get a message which specifically outlines which. Your tooling/reporting can also confidently say X% of requests fail because this specific API is down a lot and you can prioritise some work to address this.


## Handling recoverable errors

Sometimes an error in your code is recoverable, and a page can continue to be rendered even if something failed. We call these recoverable errors. Even when an error is recoverable, it's still useful to have logs to help us understand how frequently certain parts of a website are missing.

An error we recover from might look something like this (back to using our fruit API example). **This is a poor example because we lose a lot of error information by logging very little**:

```js
// E.g. GET https://your-app/fruit/feijoa
app.get('/fruit/:name', async (request, response, next) => {
    try {

        // Make an API request using an example API client
        const fruit = await fruitApiClient.getByName(request.params.name);

        // Add stock level to the fruit. This is a recoverable error because
        // we still want to send fruit information to the user if the stock
        // level cannot be retrieved
        try {
            fruit.stockLevel = await fruitApiClient.getStockLevel(fruit.id);
        } catch (error) {
            console.warn('Fruit stock information could not be retrieved');
            fruit.stockLevel = null;
        }

        response.send(fruit);

    } catch (error) {
        next(error);
    }
});
```

In our `catch` block for the fruit stock level, we're ignoring the error entirely and logging a warning. We can still make some improvements here and make our reporting/debugging much easier. Let's use the `serializeError` function from the [`@dotcom-reliability-kit/serialize-error`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/serialize-error#readme) package):

```js
// E.g. GET https://your-app/fruit/feijoa
app.get('/fruit/:name', async (request, response, next) => {
    try {
        const fruit = await fruitApiClient.getByName(request.params.name);

        try {
            fruit.stockLevel = await fruitApiClient.getStockLevel(fruit.id);
        } catch (error) {
            // We log as much error detail as possible, and in the same format
            // as the errors we throw so that we have some consistency across
            // our logging
            console.warn({
                event: 'RECOVERABLE_ERROR',
                error: serializeError(new OperationalError({
                    code: 'FRUIT_STOCK_LEVEL_FAILED',
                    message: `The Fruit API did not return a stock level for ID ${fruit.id}`,
                    relatesToSystems: ['fruit-api'],
                    cause: error
                }))
            });
            fruit.stockLevel = null;
        }

        response.send(fruit);

    } catch (error) {
        next(error);
    }
});
```

We've started to introduce some logging of our errors and consistent serialization. We'll cover more about logging errors in the next section.



| ← Previous                              | Next →                                |
| :-------------------------------------- | ------------------------------------: |
| [Throwing errors](./throwing-errors.md) | [Logging errors](./logging-errors.md) |
