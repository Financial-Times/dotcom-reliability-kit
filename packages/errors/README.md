
# @dotcom-reliability-kit/errors

A suite of error classes which help you throw the most appropriate error in any situation, and identify when errors are known vs unknown. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [`OperationalError`](#operationalerror)
      * [`.relatesToSystems`](#operationalerrorrelatestosystems)
      * [`.cause`](#operationalerrorcause)
      * [`.isErrorMarkedAsOperational`](#operationalerroriserrormarkedasoperational)
    * [`HttpError`](#httperror)
      * [Why use this over `http-errors`?](#why-use-this-over-http-errors)
    * [`DataStoreError`](#datastoreerror)
    * [`UpstreamServiceError`](#upstreamserviceerror)
    * [`UserInputError`](#userinputerror)
    * [`BaseError`](#baseerror)
  * [Migrating](#migrating)
  * [Contributing](#contributing)
  * [License](#license)


## Usage

Install `@dotcom-reliability-kit/errors` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/errors
```

Include in your code:

```js
import { OperationalError } from '@dotcom-reliability-kit/errors';
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

This module exports different Error classes which have different jobs. All can be imported in the same way as the example above.

### `OperationalError`

The `OperationalError` class is the base class for most other error types. "Operational" in this context means "we understand why this error has occurred", so by using this error type you're helping your team to understand when a thrown error is unexpected.

[Joyent's Error Handling docs](https://web.archive.org/web/20220223020910/https://www.joyent.com/node-js/production/design/errors) have a good explanation of Operational Errors.

It's always best to use a more specific error, e.g. [`UpstreamServiceError`](#upstreamserviceerror), if one exists that suits your needs. So review the docs here to find the most suitable error.

`OperationalError` can work in the same way as a normal error, expecting a message:

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

You can also combine these two ways of constructing errors, passing in both a message as well as additional options. This applies to all error types:

```js
throw new OperationalError('example message', {
    code: 'EXAMPLE_CODE'
});
```

You may also pass additional properties into an error object, these will be collected and stored on a `data` property on the error:

```js
const error = new OperationalError({
    message: 'example message',
    code: 'EXAMPLE_CODE',
    article: 'd92acacb-ac53-4505-aa88-eae4b42de994'
});

error.data.article // d92acacb-ac53-4505-aa88-eae4b42de994
```


#### `OperationalError.relatesToSystems`

The `relatesToSystems` property of an operational error stores a list of [FT systems](https://biz-ops.in.ft.com/list/Systems) which are related to the error that you're throwing.

This array could include:

- dependencies which have returned an HTTP error status code
- data stores which haven't provided the expected data

#### `OperationalError.cause`

The `cause` property of an operational error stores the root cause error instance, e.g. an error that has been caught as part of a `try`/`catch` block. It allows the operational error to include the diagnostic information captured by the root cause error.

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

### `DataStoreError`

The `DataStoreError` class extends `OperationalError` and represents an error which occurred while accessing a data store, e.g. MongoDB, PostgreSQL, or Redis. It has all of the features of operational errors, you can construct with just a message:

```js
throw new DataStoreError('Could not connect to Redis');
```

You can alternatively construct a data store error with a data object. You can use any of the properties defined in [`OperationalError`](#operationalerror):

```js
throw new DataStoreError({
    code: 'REDIS_CONNECTION_FAILED',
    message: 'Could not connect to Redis',
});
```

### `UpstreamServiceError`

The `UpstreamServiceError` class extends `HttpError` and represents an error which occurred while connecting to an upstream service, e.g. an FT or third-party API. It has all of the features of operational and HTTP errors, you can construct with just a message:

```js
throw new UpstreamServiceError('Content could not be fetched');
```

The HTTP status code defaults to a [502](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/502). This indicates that while connecting to an upstream service, your system has received a response that it cannot serve to an end user.

You can alternatively construct an upstream service error with a data object. You can use any of the properties defined in [`HttpError`](#httperror) and [`OperationalError`](#operationalerror):

```js
throw new UpstreamServiceError({
    code: 'CONTENT_PIPELINE_FAILED',
    message: 'Content could not be fetched, the content pipeline is responding with a 503 status',
    statusCode: 503,
    relatesToSystems: ['cp-content-pipeline-graphql']
});
```

### `UserInputError`

The `UserInputError` class extends `HttpError` and represents an error which occurred based on invalid user input, e.g. they inputted a malformed email address into a form. It has all of the features of operational and HTTP errors but defaults to a `400` status code. You can construct with just a message:

```js
throw new UserInputError('An invalid email address was input');
```

You can alternatively construct a user input error with a data object. You can use any of the properties defined in [`HttpError`](#httperror) and [`OperationalError`](#operationalerror):

```js
throw new UserInputError({
    code: 'REGISTRATION_INFO_INVALID',
    message: 'An invalid email address was input'
});
```

### `BaseError`

Our getting started guide talks about [Operational vs Programmer errors](../../docs/getting-started/throwing-errors.md#types-of-error). The rest of the errors in this library provide operational errors, but they all extend a base class named `BaseError`. This class offers up some of the conveniences of `OperationalError` but it's marked as non-operational:

```js
const error = new BaseError('This is an error');
error.isOperational === false; // true;
```

This allows you to use Reliability Kit errors in library code, where it doesn't make sense to throw an operational error. The `code`, `message`, and `cause` properties work in the same way as an `OperationalError`:

```js
throw new BaseError({
    message: 'example message',
    code: 'EXAMPLE_CODE',
    cause: new TypeError('example cause')
});
```


## Migrating

Consult the [Migration Guide](./docs/migration.md) if you're trying to migrate to a later major version of this package.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
