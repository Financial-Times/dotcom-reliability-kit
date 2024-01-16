
# @dotcom-reliability-kit/opentelemetry

An [OpenTelemetry](https://opentelemetry.io/docs/what-is-opentelemetry/) client that's preconfigured for drop-in use in FT apps. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

> [!WARNING]<br />
> This package is in beta and hasn't been tested extensively in production yet. Feel free to use, and any feedback is greatly appreciated.

* [Usage](#usage)
  * [Automated setup with `--require`](#automated-setup-with---require)
  * [Automated setup with `require()`](#automated-setup-with-require)
  * [Manual setup](#manual-setup)
  * [Configuration options](#configuration-options)
    * [`options.authorizationHeader`](#optionsauthorizationheader)
    * [`options.tracesEndpoint`](#optionstracesendpoint)
    * [`OTEL_` environment variables](#otel_-environment-variables)
* [Contributing](#contributing)
* [License](#license)


## Usage

Install `@dotcom-reliability-kit/opentelemetry` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/opentelemetry
```

You can set up OpenTelemetry in a number of ways, each has pros and cons which we'll outline in the sections below.

### Automated setup with `--require`

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

### Automated setup with `require()`

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

### Manual setup

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

Set the [`Authorization` HTTP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization) in requests to the OpenTelemetry collector. Defaults to `null`.

**Environment variable:** `OPENTELEMETRY_AUTHORIZATION_HEADER`<br/>
**Option:** `authorizationHeader` (`String`)

#### `options.tracesEndpoint`

A URL to send OpenTelemetry traces to. E.g. `http://localhost:4318/v1/traces`. Defaults to `null` which means that OpenTelemetry traces will not be sent.

**Environment variable:** `OPENTELEMETRY_TRACES_ENDPOINT`<br/>
**Option:** `tracesEndpoint` (`String`)

#### `OTEL_` environment variables

OpenTelemetry itself can be configured through `OTEL_`-prefixed environment variables ([documentation](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/)).

> [!CAUTION]
> We strongly advise against using these. The power of this module is consistency and any application-specific changes should be considered. If you use these environment variables we won't offer support if things break.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2024, The Financial Times Ltd.
