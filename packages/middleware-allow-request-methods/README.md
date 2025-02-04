
# @dotcom-reliability-kit/middleware-allow-request-methods

Express middleware that returns 405 (rather than 404) for disallowed request methods. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [Configuration options](#configuration-options)
      * [`options.allowedMethods`](#optionsallowedmethods)
      * [`options.message`](#optionsmessage)
      * [`options.logger`](#optionslogger)
  * [Migrating](#migrating)
  * [Contributing](#contributing)
  * [License](#license)


## Usage

Install `@dotcom-reliability-kit/middleware-allow-request-methods` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/middleware-allow-request-methods
```

Include in your code:

```js
import allowRequestMethods from '@dotcom-reliability-kit/middleware-allow-request-methods';
// or
const allowRequestMethods = require('@dotcom-reliability-kit/middleware-allow-request-methods');
```

Example usage:

```js
const express = require('express');
const allowRequestMethods = require('@dotcom-reliability-kit/middleware-allow-request-methods');

const app = express();

// Apply the middleware to specific routes, for example:
app.use('/', allowRequestMethods(['GET'])); // Allow only GET requests on '/'
app.use('/submit', allowRequestMethods(['POST'])); // Allow only POST requests on '/submit'

// Define your routes
app.get('/', (req, res) => {
  res.send('Homepage');
});

app.post('/submit', (req, res) => {
  res.send('Form submitted');
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Configuration options

Config options can be passed into the `allowRequestMethods` function as an object with any of the keys below.

```js
app.use(allowRequestMethods({
    // Config options go here
}));
```

#### `options.allowedMethods`

An array of HTTP methods that are allowed for the route. This must be an `Array` of `String`s, with each string being an HTTP method. It's important that you do not include methods which are not supported by the route.

This option defaults to `[]`.

#### `options.message`

A string to be used as the response body when a request is made with an unsupported method.

This option defaults to `'Method Not Allowed'`.

#### `options.logger`

A logger object which implements two methods, `error` and `warn`, which have the following permissive signature:

```ts
type LogMethod = (...logData: any) => any;
```

This is passed directly onto the relevant log-error method, [see the documentation for that package for more details](../log-error/README.md#optionslogger).

## Migrating

Consult the [Migration Guide](./docs/migration.md) if you're trying to migrate to a later major version of this package.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2025, The Financial Times Ltd.