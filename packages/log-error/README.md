
## @dotcom-reliability-kit/log-error

A method to consistently log error object with optional request information. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [`logHandledError`](#loghandlederror)
    * [`logRecoverableError`](#logrecoverableerror)
    * [`logUnhandledError`](#logunhandlederror)
    * [configuration options](#configuration-options)
      * [`error`](#optionserror)
      * [`includeHeaders`](#optionsincludeheaders)
      * [`request`](#optionsrequest)
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

The `logHandledError` function can be used to log errors consistently to the console and Splunk via [n-logger](https://github.com/Financial-Times/n-logger). This method is used to indicate that the error being logged has been correctly handled and the application can continue to run.

```js
logHandledError({
    error: new Error('Something went wrong')
});
```

This will automatically [serialize error objects](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/serialize-error#readme) and log them. The information logged looks like this:

```js
{
    event: 'HANDLED_ERROR',

    error: {
        // See `@dotcom-reliability-kit/serialize-error` (linked above)
        // for information about the logged properties
    },

    app: {
        name: 'example-app',
        region: 'EU'
    }
}
```

### `logRecoverableError`

The `logRecoverableError` function can be used to log errors consistently to the console and Splunk via [n-logger](https://github.com/Financial-Times/n-logger). This method is used to indicate that the error being logged was completely recoverable, with no error page sent to a user.

```js
logRecoverableError({
    error: new Error('Something went wrong')
});
```

The information logged looks like this:

```js
{
    event: 'RECOVERABLE_ERROR',

    error: {
        // See `@dotcom-reliability-kit/serialize-error` (linked above)
        // for information about the logged properties
    },

    app: {
        name: 'example-app',
        region: 'EU'
    }
}
```

### `logUnhandledError`

The `logUnhandledError` function can be used to log errors consistently to the console and Splunk via [n-logger](https://github.com/Financial-Times/n-logger). This method is used to indicate that the error being logged was not recoverable and resulted in an application crashing.

```js
logUnhandledError({
    error: new Error('Something went wrong')
});
```

The information logged looks like this:

```js
{
    event: 'RECOVERABLE_ERROR',

    error: {
        // See `@dotcom-reliability-kit/serialize-error` (linked above)
        // for information about the logged properties
    },

    app: {
        name: 'example-app',
        region: 'EU'
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

An array of request headers to include in the serialized request object (if one is provided with `options.request`). This must be an `Array` of `String`s, with each string being a header name. It's important that you do not include headers which include personally-identifiable-information, API keys, or other privileged information. This defaults to `['accept', 'content-type']`. This option gets passed directly into [`dotcom-reliability-kit/serialize-request`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/serialize-request#readme) which has further documentation.

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

    error: {
        // See `@dotcom-reliability-kit/serialize-error` (linked above)
        // for information about the logged properties
    },

    request: {
        // See `@dotcom-reliability-kit/serialize-request` (linked above)
        // for information about the logged properties
    },

    app: {
        name: 'example-app',
        region: 'EU'
    }
}
```


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
