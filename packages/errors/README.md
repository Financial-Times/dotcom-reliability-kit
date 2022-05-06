
## @dotcom-reliability-kit/errors

A suite of error classes which help you throw the most appropriate error in any situation, and identify when errors are known vs unknown. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [`OperationalError`](#operationalerror)
      * [`.isErrorMarkedAsOperational`](#operationalerroriserrormarkedasoperational)
    * [`HttpError`](#httperror)
      * [Why use this over `http-errors`?](#why-use-this-over-http-errors)
  * [Contributing](#contributing)
  * [License](#license)


## Usage

Install `@dotcom-reliability-kit/errors` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/errors
```

Include in your code:

```js
import {OperationalError} from '@dotcom-reliability-kit/errors';
// or
const {OperationalError} = require('@dotcom-reliability-kit/errors');
```

This module exports different Error classes which have different jobs. All can be imported in the same way as the example above.

### `OperationalError`

The `OperationalError` class is the base class for most other error types. "Operational" in this context means "we understand why this error has occurred", so by using this error type you're helping your team to understand when a thrown error is unexpected.

[Joyent's Error Handling docs](https://www.joyent.com/node-js/production/design/errors) have a good explanation of Operational Errors.

It works in the same way as a normal error, expecting a message:

```js
throw new OperationalError('example message');
```

You can alternatively construct an operational error with a data object. This accepts a `code` property, which must be set to a unique identifier for the type of error which is occurring, and a `message` property which contains a human-readable message:

```js
throw new OperationalError({
    message: 'example message',
    code: 'EXAMPLE_CODE'
});
```

Error codes are normalized to be uppercase, alphanumeric, and underscore-delimited. Error properties can be accessed like any other property:

```js
error.message // example message
error.code // EXAMPLE_CODE
```

You may also pass additional properties into an error object, these will be collected and stored on a `data` property on the error. Note: TypeScript will complain about these additional properties, so if you're checking types you will need to ignore the relevant lines:

```js
const error = new OperationalError({
    message: 'example message',
    code: 'EXAMPLE_CODE',
    // @ts-ignore
    article: 'd92acacb-ac53-4505-aa88-eae4b42de994'
});

error.data.article // d92acacb-ac53-4505-aa88-eae4b42de994
```


#### `OperationalError.isErrorMarkedAsOperational()`

You can test whether an error is operational (known about) either by using the `isErrorMarkedAsOperational` method. It accepts an error object of any kind and will return `true` if that error has a truthy `isOperational` property and `false` otherwise:

```js
OperationalError.isErrorMarkedAsOperational(new OperationalError('example message')); // true
OperationalError.isErrorMarkedAsOperational(new Error('example message')); // false
```

### `HttpError`

The `HttpError` class extends `OperationalError` and represents an HTTP error status. It can work in the same way as a normal error, expecting a message. In this case it will represent an HTTP `500`:

```js
throw new HttpError('example message');
```

You can alternatively construct an HTTP error with a data object. This accepts a `statusCode` property, which is a valid HTTP status code number, as well as all of the properties you can set in [`OperationalError`](#operationalerror):

```js
throw new HttpError({
    message: 'your thing was not found',
    statusCode: 404
});
```

It's also possible to create an HTTP error with a status code alone, which will default the message to the corresponding HTTP status message:

```js
throw new HttpError(404);
```

Error properties can be accessed like any other property:

```js
error.message // your thing was not found
error.statusCode // 404
error.status // 404
error.statusMessage // Not Found
error.code // HTTP_404
```

#### Why use this over `http-errors`?

The benefit of using this error rather than the excellent [http-errors](https://github.com/jshttp/http-errors#readme) library is that we extend `OperationalError` by default. This means that all HTTP errors you throw are considered "known errors" by the rest of our tooling. We also set a `code` property by default which results in less code in our monitoring dashboards – we don't need to check both `code` and `statusCode` properties to determine the type of error thrown.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
