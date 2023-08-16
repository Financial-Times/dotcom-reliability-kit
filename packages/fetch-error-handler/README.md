
## @dotcom-reliability-kit/fetch-error-handler

Properly handle fetch errors and avoid a lot of boilerplate in your app. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

> [!WARNING]  
> This package is in beta and hasn't been tested extensively in production yet. Feel free to use, and any feedback is greatly appreciated.

  * [Usage](#usage)
    * [Errors thrown](#errors-thrown)
      * [Client errors](#client-errors)
      * [Server errors](#server-errors)
      * [Unknown errors](#unknown-errors)
    * [Creating your own handler](#creating-your-own-handler)
    * [`createFetchErrorHandler` configuration options](#createfetcherrorhandler-configuration-options)
      * [`options.upstreamSystemCode`](#optionsupstreamsystemcode)
  * [Contributing](#contributing)
  * [License](#license)


## Usage

Install `@dotcom-reliability-kit/fetch-error-handler` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/fetch-error-handler
```

Include in your code:

```js
import { handleFetchErrors } from '@dotcom-reliability-kit/fetch-error-handler';
// or
const { handleFetchErrors } = require('@dotcom-reliability-kit/fetch-error-handler');
```

You can use this function with any `fetch` call to throw appropriate errors based on the [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) that you get back.

There are many ways to use it, as long as it is `await`ed and is called with either a `Response` object or a `Promise` that resolves to a `Response`. The function is asynchronous and resolves with the `Response` that it was called with:

```js
// Pass the function into the `then` function of a `fetch`.
// Note: this must be `then` and not `catch`
const response = await fetch('https://httpbin.org/status/500').then(handleFetchErrors);

// Wrap the fetch function. You can do this safely without
// awaiting the fetch itself
const response = await handleFetchErrors(
    fetch('https://httpbin.org/status/500')
);

// Pass in a response manually:
const response = await fetch('https://httpbin.org/status/500');
await handleFetchErrors(response);
```

If the reponse `ok` property is `false`, i.e. when the status code is `400` or greater, then errors will be thrown.

### Errors thrown

We throw different errors depending on the status code we get back from the `fetch` call.

#### Client errors

If the URL you fetched responds with a status code in the range of `400–499` then this normally indicates that  something is wrong with the _current_ system. Maybe we're sending data in an invalid format or our API key is invalid. For this we throw a generic `500` error to indicate an issue with _our_ system. It'll be an [`HTTPError`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#httperror). This error will have the following properties to help you debug:

```js
error.statusCode // 500
error.code // FETCH_CLIENT_ERROR
error.data.upstreamUrl // The URL that was fetched
error.data.upstreamStatusCode // The status code that the URL responded with
```

#### Server errors

If the URL you fetched responds with a status code in the range of `500–599` then this indicates something is wrong with the _upstream_ system. For this we can output an [`UpstreamServiceError`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#httperror) and attribute it to the system we're fetching from. This error will have the following properties to help you debug:

```js
error.statusCode // 502
error.code // FETCH_SERVER_ERROR
error.data.upstreamUrl // The URL that was fetched
error.data.upstreamStatusCode // The status code that the URL responded with
```

#### Unknown errors

If the URL you fetched responds with an `ok` property of `false` and a status code outside of the `400–599` range, then it's unclear what's happened but we reject with an error anyway to make sure we're able to debug. We output an [`HTTPError`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#httperror):

```js
error.statusCode // 500
error.code // FETCH_UNKNOWN_ERROR
error.data.upstreamUrl // The URL that was fetched
error.data.upstreamStatusCode // The status code that the URL responded with
```

### Creating your own handler

You can customise the thrown errors by creating your own fetch handler and passing in [options](#createfetcherrorhandler-configuration-options).

Include in your code:

```js
import { createFetchErrorHandler } from '@dotcom-reliability-kit/fetch-error-handler';
// or
const { createFetchErrorHandler } = require('@dotcom-reliability-kit/fetch-error-handler');
```

Create and use your own handler (the handler supports all the same usage methods as [outlined here](#usage)):

```js
const handleFetchErrors = createFetchErrorHandler({
    upstreamSystemCode: 'httpbin'
});
const response = await fetch('https://httpbin.org/status/500').then(handleFetchErrors);
```

If you want a custom handler just for one `fetch` call, then you can shorten the above example to:

```js
const response = await fetch('https://httpbin.org/status/500').then(createFetchErrorHandler({
    upstreamSystemCode: 'httpbin'
}))
```

### `createFetchErrorHandler` configuration options

Config options can be passed into the `createFetchErrorHandler` function to change the behaviour of the handler.

#### `options.upstreamSystemCode`

Attribute any fetch errors to a given [Biz Ops system](https://biz-ops.in.ft.com/list/Systems). This allows you to easily spot in your logs when an upstream system is the cause of an error. This must be a `String` and a valid [system code](https://tech.in.ft.com/tech-topics/operability/biz-ops/unique-identifiers).

```js
const handleFetchErrors = createFetchErrorHandler({
    upstreamSystemCode: 'next-navigation-api'
});
```

When this is set, any errors thrown by `handleFetchErrors` will have a [`relatesToSystems` property](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#operationalerrorrelatestosystems) which includes the given system code.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2023, The Financial Times Ltd.
