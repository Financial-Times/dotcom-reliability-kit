
## @dotcom-reliability-kit/errors

A suite of error classes which help you throw the most appropriate error in any situation, and identify when errors are known vs unknown. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [`OperationalError`](#operationalerror)
      * [`.isErrorMarkedAsOperational`](#operationalerroriserrormarkedasoperational)
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

You can alternatively construct an operational error with a data object. Currently this accepts a `code` property, which must be set to a unique identifier for the type of error which is occurring, and a `message` property which contains a human-readable message:

```js
throw new OperationalError({
    message: 'example message',
    code: 'EXAMPLE_CODE'
});
```

Error codes are normalized to be uppercase, alphanumeric, and underscore-delimited.

#### `OperationalError.isErrorMarkedAsOperational()`

You can test whether an error is operational (known about) either by using the `isErrorMarkedAsOperational` method. It accepts an error object of any kind and will return `true` if that error has a truthy `isOperational` property and `false` otherwise:

```js
OperationalError.isErrorMarkedAsOperational(new OperationalError('example message')); // true
OperationalError.isErrorMarkedAsOperational(new Error('example message')); // false
```


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
