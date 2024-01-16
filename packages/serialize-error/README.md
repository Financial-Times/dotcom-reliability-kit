
# @dotcom-reliability-kit/serialize-error

A utility function to serialize an error object in a way that's friendly to loggers, view engines, and converting to JSON. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [`serializeError`](#serializeerror)
    * [`SerializedError` type](#serializederror-type)
      * [`SerializedError.fingerprint`](#serializederrorfingerprint)
      * [`SerializedError.name`](#serializederrorname)
      * [`SerializedError.code`](#serializederrorcode)
      * [`SerializedError.message`](#serializederrormessage)
      * [`SerializedError.isOperational`](#serializederrorisoperational)
      * [`SerializedError.relatesToSystems`](#serializederrorrelatestosystems)
      * [`SerializedError.cause`](#serializederrorcause)
      * [`SerializedError.stack`](#serializederrorstack)
      * [`SerializedError.statusCode`](#serializederrorstatuscode)
      * [`SerializedError.data`](#serializederrordata)
  * [Migrating](#migrating)
  * [Contributing](#contributing)
  * [License](#license)


## Usage

Install `@dotcom-reliability-kit/serialize-error` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/serialize-error
```

Include in your code:

```js
import serializeError from '@dotcom-reliability-kit/serialize-error';
// or
const serializeError = require('@dotcom-reliability-kit/serialize-error');
```

### `serializeError`

The `serializeError` function accepts an error-like object (e.g. an instance of `Error` or an object with a `message` property) and returns a plain JavaScript object (conforming to the [`SerializedError` type](#serializederror-type)) which contains the relevant properties:

```js
serializeError(new Error('example message'));
// {
//     fingerprint: '...',
//     name: 'Error',
//     code: 'UNKNOWN',
//     message: 'An error occurred',
//     isOperational: false,
//     relatesToSystems: [],
//     cause: null,
//     stack: '...',
//     statusCode: null,
//     data: {}
// }
```

You can also pass in a plain object if you already have one that looks like an error (e.g. from a JSON API response):

```js
serializeError({
    message: 'example message'
});
```

### `SerializedError` type

The `SerializedError` type documents the return value of the [`serializeError` function](#serializeerror). It will always have the following properties, extracting them from a given error object.

#### `SerializedError.fingerprint`

This is a hash of the first part of the error stack, used to help group errors that occurred in the same part of the codebase. The fingerprint is `null` if the error does not include a stack trace.

> [!WARNING]<br />
> Do not rely on the format or length of the error fingerprint as the underlying hash may change without warning. You _can_ rely on the fingerprint being unique to the type of error being thrown.

#### `SerializedError.name`

This is extracted from the `error.name` property and is always cast to a `String`. It defaults to `"Error"`.

#### `SerializedError.code`

This is extracted from the `error.code` property and is always cast to a `String`. It defaults to `"UNKNOWN"`.

#### `SerializedError.message`

This is extracted from the `error.message` property and is always cast to a `String`. It defaults to `"An error occurred"`, which is not very helpful but we want this library to be resilient to unexpected input data.

#### `SerializedError.isOperational`

This indicates whether the error is operational (known about). See the documentation for [`OperationalError`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#operationalerror) for more information. It is extracted from the `error.isOperational` property. It is always cast to a `Boolean` and defaults to `false`.

#### `SerializedError.relatesToSystems`

This array contains a list of [system codes](https://biz-ops.in.ft.com/list/Systems) which are related to the error. It defaults to an empty array.

#### `SerializedError.cause`

This is an error instance extracted from the `error.cause` property, which is serialized before being assigned. It defaults to `null`.

#### `SerializedError.stack`

This is extracted from the `error.stack` property. If this property is not a string, then it will default to `null`.

#### `SerializedError.statusCode`

This is extracted from the `error.statusCode` property first, then the `error.status` property otherwise (we use look at both properties to maintain compatibility with third-party request and error libraries). These are always cast to a `Number` and this property defaults to `null`.

#### `SerializedError.data`

This is extracted from the `error.data` property. If this property is not a plain object, then it will default to an empty object: `{}`.


## Migrating

Consult the [Migration Guide](./docs/migration.md) if you're trying to migrate to a later major version of this package.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
