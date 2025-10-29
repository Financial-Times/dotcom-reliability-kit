
# @dotcom-reliability-kit/opentelemetry

An [OpenTelemetry](https://opentelemetry.io/docs/what-is-opentelemetry/) client that's preconfigured for drop-in use in FT apps. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

> [!TIP]<br />
> OpenTelemetry is an open source observability framework that supports sending metrics, traces, and logs to a large variety of backends via a shared protocol. We try to abstract some of these concepts away with this module, but [understanding OpenTelemetry will help you get it set up](https://opentelemetry.io/docs/what-is-opentelemetry/).

* [Usage](#usage)
  * [Setup](#setup)
    * [Automated setup with `--require`](#automated-setup-with---require)
    * [Automated setup with `require()`](#automated-setup-with-require)
    * [Manual setup](#manual-setup)
  * [Sending custom metrics](#sending-custom-metrics)
  * [Running in production](#running-in-production)
    * [Production metrics](#production-metrics)
    * [Production tracing](#production-tracing)
  * [Running locally](#running-locally)
  * [Implementation details](#implementation-details)
  * [Configuration options](#configuration-options)
    * [`options.authorizationHeader`](#optionsauthorizationheader)
    * [`options.logInternals`](#optionsloginternals)
    * [`options.metrics`](#optionsmetrics)
    * [`options.metrics.endpoint`](#optionsmetricsendpoint)
    * [`options.metrics.apiGatewayKey`](#optionsmetricsapigatewaykey)
    * [`options.tracing`](#optionstracing)
    * [`options.tracing.endpoint`](#optionstracingendpoint)
    * [`options.tracing.authorizationHeader`](#optionstracingauthorizationheader)
    * [`options.tracing.samplePercentage`](#optionstracingsamplepercentage)
    * [`options.views`](#optionsviews)
    * [`options.views.httpClientDurationBuckets`](#optionsviewshttpclientdurationbuckets)
    * [`options.views.httpServerDurationBuckets`](#optionsviewshttpserverdurationbuckets)
    * [`OTEL_` environment variables](#otel_-environment-variables)
* [Migrating](#migrating)
* [Contributing](#contributing)
* [License](#license)


## Usage

Install `@dotcom-reliability-kit/opentelemetry` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/opentelemetry
```

### Setup

You can set up OpenTelemetry in a number of ways, each has pros and cons which we'll outline in the sections below.

#### Automated setup with `--require`

You can completely avoid code changes by setting up OpenTelemetry using the Node.js [`--require` command-line option](https://nodejs.org/api/cli.html#-r---require-module):

```sh
node --require @dotcom-reliability-kit/opentelemetry/setup ./my-app.js
```

This will import our setup script _before_ any of your code. OpenTelemetry will be [configured](#configuration-options) with environment variables.

For environments where you can't modify the `node` command directly (e.g. AWS Lambda) you'll need to specify this using the `NODE_OPTIONS` environment variable set to `--require @dotcom-reliability-kit/opentelemetry/setup`.

<table>
    <tr>
        <th>Pros</th>
        <th>Cons</th>
    </tr>
    <tr>
        <td>
            <ul>
                <li>You don't need to consider placement in your JavaScript</li>
                <li>No application code needs to be modified</li>
                <li>Config options are managed for you through environment variables</li>
            </ul>
        </td>
        <td>
            <ul>
                <li>It may be easy to accidentally remove the `--require`</li>
            </ul>
        </td>
    </tr>
</table>

#### Automated setup with `require()`

If you can't use `--require`, e.g. because your tooling won't allow it, then you can include the setup script directly in your code:

```js
import '@dotcom-reliability-kit/opentelemetry/setup';
// or
require('@dotcom-reliability-kit/opentelemetry/setup');
```

OpenTelemetry will be [configured](#configuration-options) with environment variables.

> [!WARNING]<br />
> This **must** be the first `import`/`require` statement in your application for OpenTelemetry to be set up correctly.

<table>
    <tr>
        <th>Pros</th>
        <th>Cons</th>
    </tr>
    <tr>
        <td>
            <ul>
                <li>Very little application code needs to be modified</li>
                <li>Config options are managed for you through environment variables</li>
            </ul>
        </td>
        <td>
            <ul>
                <li>It could be easy to accidentally import something else before OpenTelemetry</li>
                <li>Some code may not be instrumented correctly if the instrumentation is done asynchronously</li>
            </ul>
        </td>
    </tr>
</table>

#### Manual setup

If you'd like to customise the OpenTelemetry config more and have control over what runs, you can include in your code:

```js
import * as opentelemetry from '@dotcom-reliability-kit/opentelemetry';
// or
const opentelemetry = require('@dotcom-reliability-kit/opentelemetry');
```

Call the function, passing in [configuration options](#configuration-options):

> [!WARNING]<br />
> This **must** be the first function called in your application for OpenTelemetry to be set up correctly (including before other `import`/`require` statements).

```js
opentelemetry.setup({ /* ... */ });
```

<table>
    <tr>
        <th>Pros</th>
        <th>Cons</th>
    </tr>
    <tr>
        <td>
            <ul>
                <li>You have more full control over the configuration</li>
            </ul>
        </td>
        <td>
            <ul>
                <li>It could be easy to accidentally add code above the function call, before OpenTelemetry has been set up</li>
                <li>Some code may not be instrumented correctly if the instrumentation is done asynchronously</li>
                <li>You need to manage config options yourself which may result in inconsistencies between apps</li>
            </ul>
        </td>
    </tr>
</table>

This method returns any SDK instances created during setup. Calling this method a second time will return the same instances without rerunning setup.

### Sending custom metrics

Many metrics are taken care of by OpenTelemetry's auto-instrumentation (e.g. HTTP request data), but you sometimes need to send your own metrics. We expose the OpenTelemetry `getMeter` method ([documentation](https://opentelemetry.io/docs/languages/js/instrumentation/#acquiring-a-meter)) which allows you to do this.

In your code, load in the `getMeter` function:

```js
import { getMeter } from '@dotcom-reliability-kit/opentelemetry';
// or
const { getMeter } = require('@dotcom-reliability-kit/opentelemetry');
```

You can now use it in the same way as the built-in OpenTelemetry equivalent. For more information, see the [OpenTelemetry Meter documentation](https://opentelemetry.io/docs/specs/otel/metrics/api/#meter).

```js
// Assumes that `app` is an Express application instance
const meter = getMeter('my-app');
const hitCounter = meter.createCounter('my-app.hits');

app.get('/', (request, response) => {
    hitCounter.add(1);
    response.send('Thanks for visiting');
});
```

### Running in production

#### Production metrics

To send metrics in production, you'll need an API Gateway key and the URL of the FT's official metrics collector. [You can find this information in Tech Hub](https://tech.in.ft.com/tech-topics/observability/opentelemetry).

See [configuration options](#configuration-options) for information on how to pass the keys and URL into your app via environment variables.

#### Production tracing

> [!WARNING]<br />
> Tracing is not supported centrally yet and these instructions assume your team or group will be setting up their own collector.

To use this package in production you'll need a [Collector](https://opentelemetry.io/docs/collector/) that can receive traces over HTTP. This could be something you run (e.g. the [AWS Distro for OpenTelemetry](https://aws.amazon.com/otel/)) or a third-party service.

Having traces collected centrally will give you a good view of how your production application is performing, allowing you to debug issues more effectively.

OpenTelemetry can generate a huge amount of data which, depending on where you send it, can become very expensive. In production environments where you don't have control over the traffic volume of your app, you'll likely need to sample your traces. This package automatically samples traces ([at 5% by default](#optionstracingsamplepercentage)).

### Running locally

To try out metrics and tracing locally, you'll need a backend for them to be sent to. In this example we'll be running [Grafana OTEL-LGTM](https://github.com/grafana/docker-otel-lgtm#readme) via [Docker](https://www.docker.com/).

This will give us a running OpenTelemetry collector as well as a Grafana interface to view our metrics and traces in:

```sh
docker run -p 8080:3000 -p 4318:4318 --rm -ti grafana/otel-lgtm
```

This means you'll be able to configure your locally-running application with the following environment variables (also removing sampling and adding debug logs):

```
OPENTELEMETRY_LOG_INTERNALS=true
OPENTELEMETRY_METRICS_ENDPOINT=http://localhost:4318/v1/metrics
OPENTELEMETRY_TRACING_ENDPOINT=http://localhost:4318/v1/traces
OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE=100
```

Once your app is running with the above configuration, open Grafana at <http://localhost:8080/>.

### Implementation details

Some details about how we're implementing OpenTelemetry. This is to help avoid any gotchas and to document some of the decisions we made:

  * We don't send traces for paths that we frequently poll or that will create unnecessary noise/cost. We ignore paths like `/__gtg`, `/__health`, and `/favicon.ico`. For the full list, visit [`lib/index.js`](./lib/index.js).

  * We don't instrument file system operations because we don't find these useful. If you would like traces for file system operations then let us know and we can add a configuration.

  * It's less of _our_ implementation detail and more a note on the [OpenTelemetry Node.js SDK](https://github.com/open-telemetry/opentelemetry-js). Native ES Modules cannot be auto-instrumented without the `--experimental-loader` Node.js option. [Documentation is here](https://www.npmjs.com/package/@opentelemetry/instrumentation?activeTab=readme#instrumentation-for-es-modules-in-nodejs-experimental).

### Configuration options

Depending on the way you set up OpenTelemetry, you can either configure it via environment variables or options passed into an object.

For automated setups ([here](#automated-setup-with---require) and [here](#automated-setup-with-require)) you'll need to use environment variables, e.g.

```sh
EXAMPLE=true npm start
```

For the [manual setup](#manual-setup), you'll need to use an options object, e.g.

```js
opentelemetry.setup({
    example: true
});
```

#### `options.authorizationHeader`

**Deprecated**. This will still work but has been replaced with [`options.tracing.authorizationHeader`](#optionstracingauthorizationheader), which is now the preferred way to set this option.

#### `options.logInternals`

Boolean indicating whether to log internal OpenTelemetry warnings and errors. Defaults to `false`.

**Environment variable:** `OPENTELEMETRY_LOG_INTERNALS`<br/>
**Option:** `logInternals` (`Boolean`)

#### `options.metrics`

An object containing other metrics-specific configurations. Defaults to `undefined` which means that OpenTelemetry metrics will not be sent.

#### `options.metrics.endpoint`

A URL to send OpenTelemetry metrics to. E.g. `http://localhost:4318/v1/metrics`. Defaults to `undefined` which means that OpenTelemetry metrics will not be sent.

**Environment variable:** `OPENTELEMETRY_METRICS_ENDPOINT`<br/>
**Option:** `metrics.endpoint` (`String`)

#### `options.metrics.apiGatewayKey`

Set the `X-OTel-Key` HTTP header in requests to the central API-Gateway-backed OpenTelemetry metrics collector. Defaults to `undefined`.

**Environment variable:** `OPENTELEMETRY_API_GATEWAY_KEY`<br/>
**Option:** `metrics.apiGatewayKey` (`String`)

#### `options.tracing`

An object containing other tracing-specific configurations. Defaults to `undefined` which means that OpenTelemetry traces will not be sent.

#### `options.tracing.endpoint`

A URL to send OpenTelemetry traces to. E.g. `http://localhost:4318/v1/traces`. Defaults to `undefined` which means that OpenTelemetry traces will not be sent.

**Environment variable:** `OPENTELEMETRY_TRACING_ENDPOINT`<br/>
**Option:** `tracing.endpoint` (`String`)

#### `options.tracing.authorizationHeader`

Set the [`Authorization` HTTP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization) in requests to the OpenTelemetry tracing collector. Defaults to `undefined`.

**Environment variable:** `OPENTELEMETRY_AUTHORIZATION_HEADER`<br/>
**Option:** `tracing.authorizationHeader` (`String`)

#### `options.tracing.samplePercentage`

The percentage of traces to send to the exporter. Defaults to `5` which means that 5% of traces will be exported.

**Environment variable:** `OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE`<br/>
**Option:** `tracing.samplePercentage` (`Number`)

#### `options.views`

An object containing views-specific configurations. Defaults to `undefined` which means that OpenTelemetry defaults will be used for metric views.

#### `options.views.httpClientDurationBuckets`

The buckets to use for HTTP duration in client requests, [see documentation](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/http/http-metrics.md#http-client). Defaults to `undefined` which means OpenTelemetry defaults will be used.

**Environment variable:** `OPENTELEMETRY_VIEWS_HTTP_CLIENT_DURATION_BUCKETS` (split on commas and parsed as an array of numbers)<br/>
**Option:** `views.httpClientDurationBuckets` (`Number[]`)

#### `options.views.httpServerDurationBuckets`

The buckets to use for HTTP duration in server requests, [see documentation](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/http/http-metrics.md#http-server). Defaults to `undefined` which means OpenTelemetry defaults will be used.

**Environment variable:** `OPENTELEMETRY_VIEWS_HTTP_SERVER_DURATION_BUCKETS` (split on commas and parsed as an array of numbers)<br/>
**Option:** `views.httpServerDurationBuckets` (`Number[]`)

#### `OTEL_` environment variables

OpenTelemetry itself can be configured through `OTEL_`-prefixed environment variables ([documentation](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/)).

> [!CAUTION]
> We strongly advise against using these. The power of this module is consistency and any application-specific changes should be considered. If you use these environment variables we won't offer support if things break.


## Migrating

Consult the [Migration Guide](./docs/migration.md) if you're trying to migrate to a later major version of this package.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2024, The Financial Times Ltd.
