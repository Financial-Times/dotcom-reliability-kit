
## @dotcom-reliability-kit/fetch-error-handler

Properly handle fetch errors and avoid a lot of boilerplate in your app. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

> [!WARNING]<br />
> This package is in beta and hasn't been tested extensively in production yet. Feel free to use, and any feedback is greatly appreciated.

  * [Usage](#usage)
    * [Wrap the fetch function](#wrap-the-fetch-function)
    * [Handle errors with `.then`](#handle-errors-with-then)
    * [Handle the response object](#handle-the-response-object)
    * [Errors thrown](#errors-thrown)
      * [Client errors](#client-errors)
      * [Server errors](#server-errors)
      * [DNS errors](#dns-errors)
      * [Abort and timeout errors](#abort-and-timeout-errors)
      * [Socket errors](#socket-errors)
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

There are several ways to use it, as long as it is `await`ed and is called with either a `Response` object or a `Promise` that resolves to a `Response`.

Some of the options below result in more errors being caught, you can weigh this up when implementing in your own code.

In all of the APIs below, if the response `ok` property is `false`, i.e. when the status code is `400` or greater, then errors will be thrown.

### Wrap the fetch function

This is the recommended API as this will allow you to handle the most errors (even DNS and timeout errors) correctly:

```js
const response = await handleFetchErrors(
    fetch('https://httpbin.org/status/500')
);
```

You **must not** `await` the `fetch` call itself if you want to handle DNS and timeout errors. This is safe to do and will not result in unhandled promise rejections – `handleFetchErrors` takes care of them all.

### Handle errors with `.then`

This API allows you to handle most errors based on the HTTP response, but it will not allow you to handle errors which occur _before_  a valid response is returned, e.g. DNS or timeout errors.

```js
const response = await fetch('https://httpbin.org/status/500').then(handleFetchErrors);
```

### Handle the response object

This API is for when you already have an HTTP response object, but it will not allow you to handle errors which occur _before_  a valid response is returned, e.g. DNS or timeout errors.

```js
const response = await fetch('https://httpbin.org/status/500');
await handleFetchErrors(response);
```

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

#### DNS errors

If the hostname of the URL you fetched cannot be resolved, a DNS error will be thrown, it'll be an [`OperationalError`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#operationalerror). This error will have the following properties to help you debug:

```js
error.code // FETCH_DNS_LOOKUP_ERROR
error.cause // The underlying DNS error that was caught
```

> [!IMPORTANT]<br />
> This type of error will only be thrown if you use the ["wrap the fetch function"](#wrap-the-fetch-function) API.

#### Abort and timeout errors

If the request times out or is aborted via [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal), _or_ the non-standard `timeout` option in [node-fetch](https://github.com/node-fetch/node-fetch) is used, then we throw an [`OperationalError`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#operationalerror). This error will have the following properties to help you debug:

```js
error.code // FETCH_ABORT_ERROR or FETCH_TIMEOUT_ERROR
error.cause // The underlying abort or timeout error that was caught
```

> [!IMPORTANT]<br />
> This type of error will only be thrown if you use the ["wrap the fetch function"](#wrap-the-fetch-function) API.

#### Socket errors

If the connection is closed early by the server then we throw an [`UpstreamServiceError`](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#upstreamserviceerror). This error will have the following properties to help you debug:

```js
error.code // FETCH_SOCKET_HANGUP_ERROR
error.cause // The underlying socket error that was caught
```

> [!IMPORTANT]<br />
> This type of error will only be thrown if you use the ["wrap the fetch function"](#wrap-the-fetch-function) API.

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
const response = await handleFetchErrors(fetch('https://httpbin.org/status/500'));
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
