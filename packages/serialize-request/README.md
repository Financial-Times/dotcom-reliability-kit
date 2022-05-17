
## @dotcom-reliability-kit/serialize-request

A utility function to serialize a request object ([Express](https://expressjs.com/en/4x/api.html#req) or [IncomingMessage](https://nodejs.org/api/http.html#class-httpincomingmessage)) in a way that's friendly to loggers, view engines, and converting to JSON. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [`serializeRequest`](#serializerequest)
    * [configuration options](#configuration-options)
      * [`includeHeaders`](#optionsincludeheaders)
    * [`SerializedRequest` type](#serializedrequest-type)
      * [`SerializedRequest.method`](#serializedrequestmethod)
      * [`SerializedRequest.url`](#serializedrequesturl)
      * [`SerializedRequest.headers`](#serializedrequestheaders)
      * [`SerializedRequest.route`](#serializedrequestroute)
  * [Contributing](#contributing)
  * [License](#license)


## Usage

Install `@dotcom-reliability-kit/serialize-request` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/serialize-request
```

Include in your code:

```js
import serializeRequest from '@dotcom-reliability-kit/serialize-request';
// or
const serializeRequest = require('@dotcom-reliability-kit/serialize-request');
```

### `serializeRequest`

The `serializeRequest` function accepts a request-like object (e.g. an instance of `Express.Request` or an object with `method` and `url` properties) and returns a plain JavaScript object (conforming to the [`SerializedRequest` type](#serializedrequest-type)) which contains the relevant properties. The example below assumes that `app` is an Express application:

```js
app.get('/fruit/:fruitId', (request, response, next) => {
	console.log(serializeRequest(request));
	next();
});
// {
//     method: 'GET',
//     url: '/fruit/feijoa',
//     headers: {
//         accept: '*/*'
//     },
//     route: {
//         path: '/fruit/:fruitId',
//         params: { fruitId: 'feijoa' }
//     }
// }
```

You can also pass in a plain object if you already have one that looks like a request:

```js
serializeRequest({
	method: 'get',
    url: '/hello'
});
```

### Configuration options

Config options can be passed into the `serializeRequest` function as a second argument. It expects an object with any of the keys below.

```js
serializeRequest(request, {
    // Config options go here
});
```

#### `options.includeHeaders`

An array of request headers to include in the serialized request object. This must be an `Array` of `String`s, with each string being a header name. It's important that you do not include headers which include personally-identifiable-information, API keys, or other privileged information. This defaults to `['accept', 'content-type']`.

```js
serializeRequest(request, {
    includeHeaders: [
        'accept',
        'content-length',
        'content-type',
        'user-agent'
    ]
});
```

### `SerializedRequest` type

The `SerializedRequest` type documents the return value of the [`serializeRequest` function](#serializerequest). It will have the following properties, extracting them from a given request object.

#### `SerializedRequest.method`

This is extracted from the `request.method` property and is always cast to a `String` and switched to uppercase. It defaults to `"-"`.

#### `SerializedRequest.url`

This is extracted from the `request.url` property and is always cast to a `String`. It defaults to `"/"`.

#### `SerializedRequest.headers`

This is extracted from the `request.headers` property and is filtered to only include the headers specified in the [`includeHeaders` option](#optionsincludeheaders). It defaults to an empty object.

#### `SerializedRequest.route`

This is an object extracted from `request.route.path` (string) and `request.params` (object) if they are present and conform to the same properties on an [Express Request object](https://expressjs.com/en/4x/api.html#req). It defaults to `undefined`.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
