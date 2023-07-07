
# @dotcom-reliability-kit/log-error

A method to consistently log error object with optional request information. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

* [Usage](#usage)
  * [`logHandledError`](#loghandlederror)
  * [`logRecoverableError`](#logrecoverableerror)
  * [`logUnhandledError`](#logunhandlederror)
  * [Configuration options](#configuration-options)
    * [`options.error`](#optionserror)
    * [`options.includeHeaders`](#optionsincludeheaders)
    * [`options.logger`](#optionslogger)
    * [`options.request`](#optionsrequest)
* [Contributing](#contributing)
* [License](#license)


## Usage

Install `@dotcom-reliability-kit/log-error` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/log-error
```

Include in your code:

```js
import {logRecoverableError} from '@dotcom-reliability-kit/log-error';
// or
const {logRecoverableError} = require('@dotcom-reliability-kit/log-error');
```

### `logHandledError`

The `logHandledError` function can be used to log errors consistently to the console and Splunk via [Reliability Kit logger](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/logger). This method is used to indicate that the error being logged has been correctly handled and the application can continue to run.

```js
logHandledError({
    error: new Error('Something went wrong')
});
```

This will automatically [serialize error objects](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/serialize-error#readme) and log them. The information logged looks like this:

```js
{
    event: 'HANDLED_ERROR',
    message: 'Error: something went wrong',

    error: {
        code: 'EXAMPLE_CODE',
        message: 'Something went wrong'
        // etc. (see `@dotcom-reliability-kit/serialize-error` linked above
        // for information about the logged properties
    },

    app: {
        commit: '137da65185397a7d699ed54c3052d10d83e82137',
        name: 'example-app',
        nodeVersion: '18.16.1',
        region: 'EU',
        releaseDate: '2022-07-25T01:37:00Z'
    }
}
```

### `logRecoverableError`

The `logRecoverableError` function can be used to log errors consistently to the console and Splunk via [Reliability Kit logger](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/logger). This method is used to indicate that the error being logged was completely recoverable, with no error page sent to a user.

```js
logRecoverableError({
    error: new Error('Something went wrong')
});
```

The information logged looks like this:

```js
{
    event: 'RECOVERABLE_ERROR',
    message: 'Error: something went wrong',

    error: {
        code: 'EXAMPLE_CODE',
        message: 'Something went wrong'
        // etc. (see `@dotcom-reliability-kit/serialize-error` linked above
        // for information about the logged properties
    },

    app: {
        commit: '137da65185397a7d699ed54c3052d10d83e82137',
        name: 'example-app',
        nodeVersion: '18.16.1',
        region: 'EU',
        releaseDate: '2022-07-25T01:37:00Z'
    }
}
```

### `logUnhandledError`

The `logUnhandledError` function can be used to log errors consistently to the console and Splunk via [Reliability Kit logger](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/logger). This method is used to indicate that the error being logged was not recoverable and resulted in an application crashing.

```js
logUnhandledError({
    error: new Error('Something went wrong')
});
```

The information logged looks like this:

```js
{
    event: 'UNHANDLED_ERROR',
    message: 'Error: something went wrong',

    error: {
        code: 'EXAMPLE_CODE',
        message: 'Something went wrong'
        // etc. (see `@dotcom-reliability-kit/serialize-error` linked above
        // for information about the logged properties
    },

    app: {
        commit: '137da65185397a7d699ed54c3052d10d83e82137',
        name: 'example-app',
        nodeVersion: '18.16.1',
        region: 'EU',
        releaseDate: '2022-07-25T01:37:00Z'
    }
}
```

### Configuration options

Config options can be passed into all of the provided logging functions as an object, with the keys below:

```js
logRecoverableError({
    // Options go here
});
```

#### `options.error`

The error object to log. This is the only required option.

```js
logRecoverableError({
    error: new Error('Something went wrong')
});
```

#### `options.includeHeaders`

An array of request headers to include in the serialized request object (if one is provided with `options.request`). This must be an `Array` of `String`s, with each string being a header name. It's important that you do not include headers which include personally-identifiable-information, API keys, or other privileged information. This option gets passed directly into [`dotcom-reliability-kit/serialize-request`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/serialize-request#readme) which has further documentation.

This option defaults to:
```js
[
    'accept',
    'accept-encoding',
    'accept-language',
    'content-type',
    'referer',
    'user-agent'
]
```

Example of usage:
```js
logRecoverableError({
    // ...other required options
    includeHeaders: [
        'accept',
        'content-length',
        'content-type',
        'user-agent'
    ]
});
```

The default set of headers is also available to use, so that you don't need to repeat them if you want to add new included headers. You'll need to import `@dotcom-reliability-kit/serialize-request`, then these headers are available:

```js
const { DEFAULT_INCLUDED_HEADERS } = require('@dotcom-reliability-kit/serialize-request');

logRecoverableError({
    // ...other required options
    includeHeaders: [
        ...DEFAULT_INCLUDED_HEADERS,
        'my-custom-header'
    ]
});
```

> **Note**
> There's no need to include the `x-request-id` header in this array, as this is automatically included as `request.id` in the logs.

#### `options.logger`

A logger object which implements two methods: `error` and `warn`. It may implement other methods but they're not used. The methods have a very permissive signature:

```ts
type LogMethod = (...logData: any) => any;
```

Though it's best if they can accept a single object and output results as JSON.

This option defaults to [Reliability Kit logger](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/logger).

#### `options.request`

A request object (e.g. an instance of `Express.Request` or an object with `method` and `url` properties) to include alongside the error in the log. This will be [automatically serialized with `@dotcom-reliability-kit/serialize-request`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/serialize-request#readme).

```js
app.get('/example', (request, response, next) => {
    logRecoverableError({
        // ...other required options
        request: request
    });
    next();
});
```

When this option is defined, the logged data looks includes request data:

```js
{
    event: 'RECOVERABLE_ERROR',
    message: 'Error: something went wrong',

    error: {
        code: 'EXAMPLE_CODE',
        message: 'Something went wrong'
        // etc. (see `@dotcom-reliability-kit/serialize-error` linked above
        // for information about the logged properties
    },

    request: {
        id: 'abc123',
        method: 'GET',
        url: '/'
        // etc. (see `dotcom-reliability-kit/serialize-request` linked above
        // for information about the logged properties)
    },

    app: {
        commit: '137da65185397a7d699ed54c3052d10d83e82137',
        name: 'example-app',
        nodeVersion: '18.16.1',
        region: 'EU',
        releaseDate: '2022-07-25T01:37:00Z'
    }
}
```


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
