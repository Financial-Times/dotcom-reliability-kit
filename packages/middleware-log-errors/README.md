
# @dotcom-reliability-kit/middleware-log-errors

Express middleware to consistently log errors. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

* [Usage](#usage)
  * [`createErrorLogger`](#createerrorlogger)
  * [Configuration options](#configuration-options)
    * [`options.filter`](#optionsfilter)
    * [`options.includeHeaders`](#optionsincludeheaders)
    * [`options.logger`](#optionslogger)
    * [`options.logUserErrorsAsWarnings`](#optionslogusererrorsaswarnings)
* [Migrating](#migrating)
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

The `createErrorLogger` function can be used to generate Express middleware which logs errors to the console and Splunk via [Reliability Kit logger](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/logger).

> [!CAUTION]<br />
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
        nodeVersion: '22.13.0',
        region: 'EU',
        releaseDate: '2022-07-25T01:37:00Z'
    }
}
```

### Configuration options

Config options can be passed into the `createErrorLogger` function as an object with any of the keys below.

```js
app.use(createErrorLogger({
    // Config options go here
}));
```

#### `options.filter`

A function used to determine whether a particular error or request should be logged. This must be a `Function` which returns a `Boolean` and accepts both an error object and an Express Request object:

```ts
type ErrorLoggingFilter = (error: any, request: express.Request) => boolean;
```

If the function returns `true` then the error and request details will be logged. Otherwise no logs will be output.

> [!WARNING]<br />
> This option can be dangerous, misconfiguring it can result in a loss of log information. Consider whether you _definitely_ need to filter logs before using, sometimes it's better to have a few too many logs than miss an important one.

Example of usage:
```js
app.use(createErrorLogger({
    filter: (error, request) => {
        if (request.url === '/deliberate-erroring-endpoint') {
            return false;
        }
        if (error?.code === 'ERROR_WE_DO_NOT_CARE_ABOUT') {
            return false;
        }
        return true;
    }
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

> [!NOTE]<br />
> There's no need to include the `x-request-id` header in this array, as this is automatically included as `request.id` in the logs.

#### `options.logger`

A logger object which implements two methods, `error` and `warn`, which have the following permissive signature:

```ts
type LogMethod = (...logData: any) => any;
```

This is passed directly onto the relevant log-error method, [see the documentation for that package for more details](../log-error/README.md#optionslogger).

#### `options.logUserErrorsAsWarnings`

A `boolean` indicating whether to log user errors (those with a `400`–`499` `status` property) with a level of `warn` rather than `error`. This helps to reduce the amount of error-level logs that you need to focus on.

This option defaults to `false`.


## Migrating

Consult the [Migration Guide](./docs/migration.md) if you're trying to migrate to a later major version of this package.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
