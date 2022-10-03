
# Getting started: throwing errors

Throwing good errors is key to producing a reliable application. Most of Reliability Kit's packages rely on sensible errors being thrown if a fault is encountered in your app, and without reviewing your existing errors you won't get as much value from using it.

  * [Types of error](#types-of-error)
    * [Operational errors](#operational-errors)
    * [Programmer errors](#programmer-errors)
  * [Types of error in code](#types-of-error-in-code)
    * [Operational errors in library code](#operational-errors-in-library-code)
  * [What does a good error look like?](#what-does-a-good-error-look-like)
    * [Using error objects](#using-error-objects)
    * [Making errors human readable](#making-errors-human-readable)
    * [Making errors machine readable](#making-errors-machine-readable)
      * [Error codes](#error-codes)
      * [Error classes](#error-classes)
    * [Adding more data](#adding-more-data)
    * [Being specific](#being-specific)


## Types of error

Errors can be sorted into two broad categories. It's important to understand the difference, because they should be handled differently by your application. These take inspiration from the [Joyent error handling documentation](https://web.archive.org/web/20220223020910/https://www.joyent.com/node-js/production/design/errors), which is also worth a read.

### Operational errors

An error can be considered "Operational" when they are _expected_ to occur as part of day-to-day running of an application. They normally represent that something went wrong outside of the control of the application code, e.g. a remote service failed. You can also consider an error operational for things like end-user mistakes, e.g. filling out a form incorrectly.

Some operational errors may be recoverable (as in the page can continue to render even if they occur). Some operational errors may not be recoverable, and in the context of a web service these will result in a non-`200` status code for an end-user. Both of these cases are still "Operational" if they're part of the expected running of the app.

Operational errors should never result in an application crashing unexpectedly.

### Programmer errors

An error is considered to be a "Programmer Error" (or "Non-Operational") if it is unexpected and occurs because of a bug in the code. This category of error can always be avoided or fixed by making a code change. These errors can not be handled properly since the code in question is broken, e.g. `tried to call property X of "undefined"` – this is a result of code that doesn't properly validate the data it handles.


## Types of error in code

Reliability Kit provides a package to help us differentiate between Operational (known) errors, and Programmer (unknown) errors: [`@dotcom-reliability-kit/errors`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#readme).

The `OperationalError` class (explained fully in the [package documentation](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#operationalerror)) allows you to throw errors which are explicitly marked as "known". Any errors created with this constructor will include an `isOperational` property set to `true`, which can be used by our tooling later to help us understand the health of a system.

```js
throw new OperationalError({
    code: 'EXAMPLE_ERROR',
    message: 'This is an operational error'
});
```

This (and further error classes which extend it) should ideally be used _anywhere_ that you understand how to handle an error. This means in your app you might do something like this:

```js
// E.g. GET https://your-app/pokemon/oddish
app.get('/pokemon/:name', async (request, response, next) => {
    try {
        // We make a request to an API, we understand that sometimes this API will fail
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon-species/${request.params.name}`
        );

        // If the API request failed, we understand that this is an issue with a remote
        // service which is expected occasionally as part of running our app. Let's throw
        if (!response.ok) {
            throw new OperationalError({
                code: 'POKEMON_API_FAILED',
                message: `The Pokemon API responded with a ${response.status} status`,
                relatesToSystems: ['pokeapi']
            });
        }

        response.send(await response.json());

    } catch (error) {
        // Pass any errors onto the Express error handler
        next(error);
    }
});
```

> **Note**
> We do provide many more error classes in Reliability Kit, and it's always good to use the most specific one. Most of our examples use `OperationalError` for simplicity (and to not overload you with information), but the section on [error classes](#error-classes) covers some of these other error types.

### Operational errors in library code

Operational errors should not be used in places where an error may be caused by a programmer who's _using_ your library. For example, if you publish the following library to be used by other engineers:

```js
function uppercaseAll(array) {
    return array.map(item => item.toUpperCase());
}
```

Then you may want to add in some code to check that the data passed in is _definitely_ an array, because otherwise your code won't work correctly. You might add something like this, **which is incorrect** (explained below example):

```js
function uppercaseAll(array) {
    if (!Array.isArray(array)) {
        throw new OperationalError({
            message: 'uppercaseAll function expects an array'
        });
    }
    return array.map(item => item.toUpperCase());
}
```

In this case `OperationalError` is **not** the correct error type to use. This is because you, as the publisher of this library, do not know whether a consuming application actually knows how to recover from this error. You can't assume that an error like this is operational – it could easily be a programmer error.

In the above case, you should use JavaScript's built-in errors so that the engineers who maintain the consuming application can catch them and decide for themselves whether they're operational or not:

```js
function uppercaseAll(array) {
    if (!Array.isArray(array)) {
        throw new TypeError('uppercaseAll function expects an array');
    }
    return array.map(item => item.toUpperCase());
}
```


## What does a good error look like?

Good errors are descriptive and can be easily understood by both humans (e.g. an engineer trying to debug a problem) and machines (e.g. a logging dashboard used to group errors by type). In this section we'll talk through how to do this.

Whenever you're throwing an error, you should be thinking about the different audiences to whom that error matters. Who are they and what do they need?

  * Yourself in six month's time when this error starts being thrown at 4am

  * Your logging dashboard, which groups errors so you can easily see when specific ones spike

  * Your first-line support team, who want to know why a system is crashing

### Using error objects

When you're throwing errors, _always_ use an `Error` object (or a class which extends `Error`). The `Error` object includes a lot of useful information for free, including the `stack` property which indicates where the error was thrown. Without this, errors become far more difficult to debug.

**Don't do this:**

```js
throw {message: 'something went wrong'};
throw 'Something went wrong';
Promise.reject('something went wrong');
```

**Do this:**

```js
throw new Error('Something went wrong');
Promise.reject(new Error('something went wrong'));
```

You can enforce this rule in your application by turning on the [ESLint](https://eslint.org/) rules:

  * [`no-throw-literal`](https://eslint.org/docs/rules/no-throw-literal)
  * [`prefer-promise-reject-errors`](https://eslint.org/docs/rules/prefer-promise-reject-errors)

### Making errors human readable

All errors in JavaScript support a `message` property, which is a medium-length description of the error that has occurred. `message` is ideal for catering for the "human readable" requirement of an error object, and should be written in a way that humans can read.

Some examples of good human-readable errors:

```js
throw new Error(`Config file at path ${filePath} does not exist`);

throw new TypeError(`The name parameter must be a string, ${typeof name} was given`);

throw new RangeError(`Age must be between 18 and 137. ${age} was given`);
```

A common theme in the above is that we're not trying to cater for machines. We're writing instructions which tell an engineer exactly why an error was thrown. We're also including data in the error message which make it non-generic, so it explicitly can't be easily parsed by a machine – that's not the job of the error message.

### Making errors machine readable

It's still important for errors to be machine readable. With the errors above, it's not very easy to group errors in a dashboard or report because the messages are designed for humans. If we have the following error:

```js
throw new Error(`Config file at path ${filePath} does not exist`);
```

Then we might see the following errors in our logging dashboard:

```
Config file at path config/production/default.yml does not exist
Config file at path mock/config.json does not exist
```

Great for humans, but bad if we want to run a report like "how many times does the app crash because our config loader fails"? That's where the error `code` property is useful.

#### Error codes

Node.js uses `error.code` internally to help us identify error types, e.g.

```js
try {
    const example = require('nope');
} catch (error) {
    console.log(error.code); // "MODULE_NOT_FOUND" - for machines!
    console.log(error.message); // "Cannot find module 'nope'" - for humans!
}
```

Setting your own `code` property on an built-in error type can be tedious, that's where `OperationalError` comes in:

```js
// Instead of doing this:
const error = new Error('A "turnip" is not a valid fruit');
error.code = 'INVALID_FRUIT';
throw error;

// You can do this:
throw new OperationalError({
    message: 'A "turnip" is not a valid fruit',
    code: 'INVALID_FRUIT'
});
```

Your error codes should uniquely identify a _type_ of error your app can throw. It's up to your team whether you'd like to include a prefix or something to help organise, e.g. `API_` when a third-party API fails in some way, or `INVALID_` when the error is a result of user input.

#### Error classes

As well as error codes, you can identify the _class_ of error by using different JavaScript classes which extend the base `Error` object. `OperationalError` is one example, but there are also built-in error classes which you may have come across before, e.g.

  * [`TypeError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError) which indicates that a value was not of the expected type
  * [`RangeError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RangeError) which indicates that a value was not in the expected range

There's a subtle difference between error classes and error codes. It's helpful to think of the error class (and thus the error's `name` property) as an indicator of the general classification of error encountered, and the `code` property as unique to the specific type of error being thrown.

Let's illustrate this with an example. Let's say the Pokémon API from our previous examples fails with a `503` status code, we could use:

  * a _class_ of `UpstreamServiceError`, which would help our tooling to understand how often all our systems error due to upstream services failing
  * a _code_ of `POKEMON_API_UNAVAILABLE` which helps our tooling identify specifically _which_ upstream services are failing and why

In code it'd look something like this, using Reliability Kit's [`UpstreamServiceError`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#upstreamserviceerror):

```js
throw new UpstreamServiceError({
    code: 'POKEMON_API_UNAVAILABLE',
    message: `The Pokemon API responded with a 503 status`,
    relatesToSystems: ['pokeapi']
});
```

You can do this relatively easily by using Reliability Kit's built-in error classes, [`DataStoreError`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#datastoreerror), [`HttpError`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#httperror), [`UpstreamServiceError`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#upstreamserviceerror), and [`UserInputError`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#userinputerror). Or you could extend one of these errors yourself to get something more suitable to your needs:

```js
class PermissionsError extends OperationalError {
    name = 'PermissionsError';
}
```

### Adding more data

It's also sometimes useful to add extra details to an error so that further debugging of them can be done once we've determined what _type_ of error they are using via the `code` value. Useful information might be the actual value of any input which caused an error, or further details about application state (e.g. the ID of the user this error occurred for).

Taking the example from above where we set the code, we might want to provide the input fruit name alongside our message and code:

```js
// Assuming the user input is:
const fruitName = 'turnip';

// You can add any extra data you want here
throw new OperationalError({
    message: `A "${fruitName}" is not a valid fruit`,
    code: 'INVALID_FRUIT',
    input: fruitName
});
```

You might create an `OperationalError` instance in reaction to an error that has been caught. The root cause error and all the diagnostic information it contains can be included in the `OperationalError` instance by setting it as the value of the `cause` property.

If the error is caused by interfacing with external systems, the names of those systems can be included as the value of the `relatesToSystems` property.

```js
try {
    fruit.stockLevel = await fruitApiClient.getStockLevel(fruit.id);
} catch (error) {
    throw new OperationalError({
        message: `A "${fruitName}" is not a valid fruit`,
        code: 'INVALID_FRUIT',
        relatesToSystems: ['fruit-api'],
        cause: error
    });
}
```

### Being specific

When you're working on more complex code than our previous examples and catching errors in places where they could have been caused by multiple things, it's important to throw _specific_ errors which identify the cause rather than a generic one.

Let's switch back to the example of using a third-party API. This example code could be improved:

```js
// E.g. GET https://your-app/pokemon/oddish
app.get('/pokemon/:name', async (request, response, next) => {
    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon-species/${request.params.name}`
        );

        if (!response.ok) {
            throw new OperationalError({
                code: 'POKEMON_API_FAILED',
                message: `The Pokemon API responded with a ${response.status} status`
            });
        }

        response.send(await response.json());
    } catch (error) {
        next(error);
    }
});
```

In this example, there are actually multiple ways the API could fail. We're just throwing a generic `POKEMON_API_FAILED` error which doesn't tell us _why_ the API failed, which could be one of the following:

  * The API is down and so it responds with a `503` status code

  * The Pokemon with the name in `request.params.name` does not exist and so it responds with a `404` status code

  * The API responds with a _different_ status code that we don't know how to handle

In this scenario it pays to be specific, because our error reporting will be able to differentiate between a server error (the API is down) versus a user error (someone asked for a Pokemon that doesn't exist). Let's fix our example:

```js
// E.g. GET https://your-app/pokemon/oddish
app.get('/pokemon/:name', async (request, response, next) => {
    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon-species/${request.params.name}`
        );

        if (!response.ok) {

            // Handle the specific case where the Pokemon does not exist
            if (response.status === 404) {
                throw new OperationalError({
                    code: 'POKEMON_DOES_NOT_EXIST',
                    message: `The Pokemon ${request.params.name} does not exist`,
                    pokemonName: request.params.name
                });
            }

            // Handle the specific case where the API is down
            if (response.status === 503) {
                throw new OperationalError({
                    code: 'POKEMON_API_DOWN',
                    message: `The Pokemon API responded with a 503 status`
                });
            }

            // Fall back to a generic error, as it's better than nothing and means
            // we're handling all error states
            throw new OperationalError({
                code: 'POKEMON_API_FAILED',
                message: `The Pokemon API responded with a ${response.status} status`
            });
        }

        response.send(await response.json());
    } catch (error) {
        next(error);
    }
});
```

Now we're talking! When this endpoint fails, you'll know why it's erroring at a glance by reading the error message; your dashboard can deprioritise errors with a code of `POKEMON_DOES_NOT_EXIST` because it's a user error; your first-line support can see if the root cause is in a third-party API and handle it appropriately (and probably not call you at 4am).


| ← Previous          | Next →                                  |
| :------------------ | --------------------------------------: |
| [Setup](./setup.md) | [Handling errors](./handling-errors.md) |
