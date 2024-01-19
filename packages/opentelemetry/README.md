
# @dotcom-reliability-kit/opentelemetry

An [OpenTelemetry](https://opentelemetry.io/docs/what-is-opentelemetry/) client that's preconfigured for drop-in use in FT apps. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

> [!TIP]<br />
> OpenTelemetry is an open source observability framework that supports sending metrics, traces, and logs to a large variety of backends via a shared protocol. We try to abstract some of these concepts away with this module, but [understanding OpenTelemetry will help you get it set up](https://opentelemetry.io/docs/what-is-opentelemetry/).

> [!WARNING]<br />
> This package is in beta and hasn't been tested extensively in production yet. Feel free to use, and any feedback is greatly appreciated.

* [Usage](#usage)
  * [Setup](#setup)
    * [Automated setup with `--require`](#automated-setup-with---require)
    * [Automated setup with `require()`](#automated-setup-with-require)
    * [Manual setup](#manual-setup)
  * [Running in production](#running-in-production)
  * [Running locally](#running-locally)
    * [Running a backend](#running-a-backend)
    * [Sending traces to your local backend](#sending-traces-to-your-local-backend)
  * [Configuration options](#configuration-options)
    * [`options.authorizationHeader`](#optionsauthorizationheader)
    * [`options.tracing`](#optionstracing)
    * [`options.tracing.endpoint`](#optionstracingendpoint)
    * [`options.tracing.samplePercentage`](#optionstracingsamplepercentage)
    * [`OTEL_` environment variables](#otel_-environment-variables)
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
            </ul>
        </td>
    </tr>
</table>

#### Manual setup

If you'd like to customise the OpenTelemetry config more and have control over what runs, you can include in your code:

```js
import setupOpenTelemetry from '@dotcom-reliability-kit/opentelemetry';
// or
const setupOpenTelemetry = require('@dotcom-reliability-kit/opentelemetry');
```

Call the function, passing in [configuration options](#configuration-options):

> [!WARNING]<br />
> This **must** be the first function called in your application for OpenTelemetry to be set up correctly (including before other `import`/`require` statements).

```js
setupOpenTelemetry({ /* ... */ });
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
                <li>You need to manage config options yourself which may result in inconsistencies between apps</li>
            </ul>
        </td>
    </tr>
</table>

### Running in production

To use this package in production you'll need a [Collector](https://opentelemetry.io/docs/collector/) that can receive traces over HTTP. This could be something you run (e.g. the [AWS Distro for OpenTelemetry](https://aws.amazon.com/otel/)) or a third-party service.

Having traces collected centrally will give you a good view of how your production application is performing, allowing you to debug issues more effectively.

OpenTelemetry can generate a huge amount of data which, depending on where you send it, can become very expensive. In production environments where you don't have control over the traffic volume of your app, you'll likely need to sample your traces. This package automatically samples traces ([at 5% by default](#optionstracingsamplepercentage)).

### Running locally

If you want to debug specific performance issues then setting up a local Collector can help you. You shouldn't be sending traces in local development to your production backend as this could make it harder to debug real production issues. You probably also don't want to sample traces in local development – you'll want to collect all traffic because the volume will be much lower.

#### Running a backend

To view traces locally, you'll need a backend for them to be sent to. In this example we'll be using [Jaeger](https://www.jaegertracing.io/) via [Docker](https://www.docker.com/). You'll need Docker (or a compatible [alternative](https://podman.io/)) to be set up first.

[Jaeger maintains a useful guide for this](https://www.jaegertracing.io/docs/1.53/getting-started/#all-in-one).

#### Sending traces to your local backend

Once your backend is running you'll need to make some configuration changes.

You'll need to set the [tracing endpoint](#optionstracingendpoint) to use Jaeger's tracing endpoint on port `4318` ([OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp)). E.g. `http://localhost:4318/v1/traces`.

You'll also need to disable sampling by [configuring it](#optionstracingsamplepercentage) to `100`.

Assuming you're using one of the [automated setups](#automated-setup-with---require), environment variables could be set like this:

```
OPENTELEMETRY_TRACING_ENDPOINT=http://localhost:4318/v1/traces \
OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE=100 \
npm start
```

Run your application and perform some actions. Open up the Jaeger interface (`http://localhost:16686`). You should start to see traces appear.


### Configuration options

Depending on the way you set up OpenTelemetry, you can either configure it via environment variables or options passed into an object.

For automated setups ([here](#automated-setup-with---require) and [here](#automated-setup-with-require)) you'll need to use environment variables, e.g.

```sh
EXAMPLE=true npm start
```

For the [manual setup](#manual-setup), you'll need to use an options object, e.g.

```js
setupOpenTelemetry({
    example: true
});
```

#### `options.authorizationHeader`

Set the [`Authorization` HTTP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization) in requests to the OpenTelemetry collector. Defaults to `undefined`.

**Environment variable:** `OPENTELEMETRY_AUTHORIZATION_HEADER`<br/>
**Option:** `authorizationHeader` (`String`)

#### `options.tracing`

An object containing other tracing-specific configurations. Defaults to `undefined` which means that OpenTelemetry traces will not be sent.

#### `options.tracing.endpoint`

A URL to send OpenTelemetry traces to. E.g. `http://localhost:4318/v1/traces`. Defaults to `undefined` which means that OpenTelemetry traces will not be sent.

**Environment variable:** `OPENTELEMETRY_TRACING_ENDPOINT`<br/>
**Option:** `tracing.endpoint` (`String`)

#### `options.tracing.samplePercentage`

The percentage of traces to send to the exporter. Defaults to `5` which means that 5% of traces will be exported.

**Environment variable:** `OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE`<br/>
**Option:** `tracing.samplePercentage` (`Number`)

#### `OTEL_` environment variables

OpenTelemetry itself can be configured through `OTEL_`-prefixed environment variables ([documentation](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/)).

> [!CAUTION]
> We strongly advise against using these. The power of this module is consistency and any application-specific changes should be considered. If you use these environment variables we won't offer support if things break.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2024, The Financial Times Ltd.
