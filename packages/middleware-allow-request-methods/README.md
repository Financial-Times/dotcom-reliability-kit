
# @dotcom-reliability-kit/middleware-allow-request-methods

Express middleware that returns 405 (rather than 404) for disallowed request methods. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [Configuration options](#configuration-options)
      * [`options.allowedMethods`](#optionsallowedmethods)
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
import { allowRequestMethods } from '@dotcom-reliability-kit/middleware-allow-request-methods';
// or
const { allowRequestMethods } = require('@dotcom-reliability-kit/middleware-allow-request-methods');
```

> [!TIP]
> If you're using this package with TypeScript, we recommend using the following settings in your `tsconfig.json` file to avoid type errors:
>
> ```json
> {
>     "esModuleInterop": true,
>     "module": "nodenext",
>     "moduleResolution": "nodenext"
> }
> ```

We recommend always using this middleware globally with app.use as a first middleware in your app. This is because, if a bad actor is making requests to your app to find attack vectors, you throw their request out as early as possible.

Route-specific blocking of methods is an additional layer of protection you can explore. It may be that your app does support POST requests for a form but the main view is GET only. You can filter out further junk requests on a per-route basis by using the app.route('...').all() method or use with a path.

Example usage:

```js
const express = require('express');
const { allowRequestMethods } = require('@dotcom-reliability-kit/middleware-allow-request-methods');

const app = express();

// Allow only certain request methods for the entire app. If you're
// doing this, it must be above ALL routes you want it to apply to:
app.use(allowRequestMethods({ allowedMethods: ['GET', 'HEAD', 'POST'] }));

// Allow only certain request methods for a specific route, e.g. here
// we only allow `GET` and `HEAD` methods for the home page. Note that
// we have to use `all` for the allowed methods here THEN define the get
// request handler:
app
 .route('/')
 .all(allowRequestMethods({ allowedMethods: ['GET', 'HEAD'] }))
 .get((request, response) => {
  response.send('Homepage');
 });

// You can also allow methods for a subset of routes. Remember that this
// applies for all routes that START with the value. E.g. the following
// will also only allow POST requests on `/submit/example`:
app.use('/submit', allowRequestMethods({ allowedMethods: ['POST'] }));

app.post('/submit', (request, response) => {
 response.send('Form submitted');
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


## Migrating

Consult the [Migration Guide](./docs/migration.md) if you're trying to migrate to a later major version of this package.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2025, The Financial Times Ltd.
