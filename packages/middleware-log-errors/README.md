
## @dotcom-reliability-kit/middleware-log-errors

Express middleware to consistently log errors. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [`createErrorLogger`](#createerrorlogger)
    * [configuration options](#configuration-options)
      * [`includeHeaders`](#optionsincludeheaders)
  * [Contributing](#contributing)
  * [License](#license)


## Usage

Install `@dotcom-reliability-kit/middleware-log-errors` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/middleware-log-errors
```

Include in your code:

```js
import createErrorLogger from '@dotcom-reliability-kit/middleware-log-errors';
// or
const createErrorLogger = require('@dotcom-reliability-kit/middleware-log-errors');
```

### `createErrorLogger`

The `createErrorLogger` function can be used to generate Express middleware which logs errors to the console and Splunk via [n-logger](https://github.com/Financial-Times/n-logger).

> **Warning**
> This middleware **must** be added to your Express app _after_ all your application routes – you won't get error logs for any routes which are mounted after this middleware.

```js
const app = express();
// App routes go here
app.use(createErrorLogger());
```

This will automatically [serialize error objects](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/serialize-error#readme) and log them along with [a serialized HTTP request](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/serialize-request#readme) which lead to the error being thrown. The information logged looks like this:

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
        nodeVersion: '16.16.0',
        region: 'EU',
        releaseDate: '2022-07-25T01:37:00Z'
    }
}
```

> **Note**
> If you're also using [n-raven v6.1+](https://github.com/Financial-Times/n-raven) in your application then the Raven error logging will be deactivated so that you don't get double-logged errors.

### Configuration options

Config options can be passed into the `createErrorLogger` function as an object with any of the keys below.

```js
app.use(createErrorLogger({
    // Config options go here
}));
```

#### `options.includeHeaders`

An array of request headers to include in the serialized request object. This must be an `Array` of `String`s, with each string being a header name. It's important that you do not include headers which include personally-identifiable-information, API keys, or other privileged information. This option gets passed directly into [`dotcom-reliability-kit/serialize-request`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/serialize-request#readme) which has further documentation.

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
app.use(createErrorLogger({
    includeHeaders: [
        'accept',
        'content-length',
        'content-type',
        'user-agent'
    ]
}));
```

The default set of headers is also available to use, so that you don't need to repeat them if you want to add new included headers. You'll need to import `@dotcom-reliability-kit/serialize-request`, then these headers are available:

```js
const { DEFAULT_INCLUDED_HEADERS } = require('@dotcom-reliability-kit/serialize-request');

app.use(createErrorLogger({
    includeHeaders: [
        ...DEFAULT_INCLUDED_HEADERS,
        'my-custom-header'
    ]
}));
```

> **Note**
> There's no need to include the `x-request-id` header in this array, as this is automatically included as `request.id` in the logs.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
