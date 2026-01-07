
# @dotcom-reliability-kit/client-metrics-web

A lightweight client for sending operational metrics events from the browser to the [Customer Products Client Metrics Server](https://github.com/Financial-Times/cp-client-metrics-server/tree/main). This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

> [!WARNING]
> This Reliability Kit module is intended for use in client-side JavaScript. Importing it into a Node.js app will result in errors being thrown.

> [!IMPORTANT]
>  Remember that this library is intended for sending _operational_ metrics - metrics that help us understand whether your system is operating as expected. For analytics data you should still be using Spoor (or another solution common to your team).

> [!CAUTION]
> This Reliability Kit module is considered experimental, we're rolling out to systems in a controlled manner and may introduce breaking changes. Please speak to the Reliability team if you have a use-case.

* [Usage (systems)](#usage-systems)
  * [`MetricsClient`](#metricsclient)
    * [`client.recordEvent()`](#clientrecordevent)
    * [`client.enable()`](#clientenable)
    * [`client.disable()`](#clientdisable)
    * [`client.isEnabled`](#clientisenabled)
    * [`client.isAvailable`](#clientisavailable)
  * [Event-based API](#event-based-api)
  * [Error handling](#error-handling)
  * [Configuration options](#configuration-options)
    * [`options.systemCode`](#optionssystemcode)
    * [`options.systemVersion`](#optionssystemversion)
    * [`options.environment`](#optionsenvironment)
* [Usage (shared libraries)](#usage-shared-libraries)
* [Usage (infrastructure)](#usage-infrastructure)
* [Migrating](#migrating)
* [Contributing](#contributing)
* [License](#license)


## Usage (systems)

Systems that want to send metrics from the client should import and construct a metrics client as part of their client-side JavaScript. If you're writing code that's shared across multiple systems **do not import and construct a metrics client**. See [the usage guide for shared libraries](#usage-shared-libraries).

Install `@dotcom-reliability-kit/client-metrics-web` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/client-metrics-web
```

Include in your client-side code:

```js
import { MetricsClient } from '@dotcom-reliability-kit/client-metrics-web';
// or
const { MetricsClient } = require('@dotcom-reliability-kit/client-metrics-web');
```

### `MetricsClient`

The MetricsClient sends events to the Client Metrics Server, using POST to the following endpoint `/api/v1/ingest`.

The correct environment (production vs test) is automatically selected based on the browser hostname.
If your hostname has `test`, `staging` or `local`, the events will be sent to our test server. Else, it will send the metrics to the production server.

The class should only ever be constructed once or you'll end up sending duplicate metrics.
You should construct the metrics client as early as possible in the loading of the page. For the required options, see [configuration options](#configuration-options).

```js
const client = new MetricsClient({
    // Options go here
});
```

This will bind some global event handlers:

  * `ft.clientMetric` - records a custom metric based on details found in the event ([see documentation below](#event-based-api))

#### `client.recordEvent()`

Send a metrics event:

```js
client.recordEvent('namespace.event', {
    // Any event details you want to send can go here as key/value pairs
});
```

The event namespace must be comprised of alphanumeric characters, underscores, and hyphens, possibly separated by periods.
Other than the above, the event namespace is free-form for now. A later major version of the client may lock down the top-level namespace further.

#### `client.enable()`

Enable the client. This is called by default during instantiation but you may need to call this if the client is ever disabled.

```js
client.enable();
```

#### `client.disable()`

Disable the client, preventing any metrics from being sent. Global event handlers are also unbound.

```js
client.disable();
```

#### `client.isEnabled`

A boolean indicating whether the client is currently enabled.

#### `client.isAvailable`

A boolean indicating whether the client was correctly configured and set up. If this is `false` then it's not possible for events to be sent to AWS CloudWatch RUM.

### Event-based API

Passing around a single client instance may not be easy or preferable in your system, depending on complexity. For this we also bind a listener on `window` for the `ft.clientMetric` event.

This allows you to send metric events from anywhere in your system, even if you don't have access to the client. You need to emit a custom event, either on window:

```js
window.dispatchEvent(
    new CustomEvent('ft.clientMetric', {
        detail: {
            namespace: 'namespace.event',
            // Any event details you want to send can go here as key/value pairs
        }
    }
));
```

or from another element on the page, as long as you bubble the event:

```js
const element = document.getElementById('my-component');
element.dispatchEvent(
    new CustomEvent('ft.clientMetric', {
        bubbles: true,
        detail: {
            namespace: 'namespace.event',
            // Any event details you want to send can go here as key/value pairs
        }
    }
));
```

When sending metrics in this way, the `detail` object can have any number of properties. These properties will be extracted into the final metrics event and sent to the client metrics server. For example:

```js
window.dispatchEvent(
    new CustomEvent('ft.clientMetric', {
        detail: { namespace: 'snack.consumed', fruit: 'banana' }
    }
));

// is equivalent to:

client.recordEvent('snack.consumed', { fruit: 'banana' });
```

### Error handling

If something goes wrong with the configuration of the metrics client _or_ the sending of an event, we don't throw an error - this could result in an infinite loop where we try to record the thrown error and that throws another error.

Instead of throwing an error, we log a warning to the console. If you're not seeing metrics in AWS  then check the browser console for these warnings. It's also a good idea to check for them in local development before pushing any changes.

### Configuration options

Config options can be passed into the `MetricsClient` function as an object with any of the keys below.

```js
new MetricsClient({
    // Config options go here
});
```

#### `options.systemCode`

**Required** `String`. The [Biz Ops system code](https://biz-ops.in.ft.com/list/Systems) you're sending metrics for.

```js
new MetricsClient({ systemCode: 'my-system' });
```

The system code has to be a combination of alphanumerical characters, possibly separated by hyphens.

> [!IMPORTANT]
>  If the systemCode is not set properly, the client will fail to be constructed and it will not be possible to send any events. Attempting to use `recordEvent` will fail and log a warning `Client not initialised properly, cannot record an event.`

#### `options.systemVersion`

**Optional** `String`. The version number of the currently running system, which helps us to spot issues in new versions. This could be a version number or a git commit hash. Defaults to `0.0.0`.

```js
new MetricsClient({ systemVersion: '1.2.3' });
```

#### `options.environment`

**Optional** `Enum`. Can be `production` or `test`. This is used to defined what server to send the metrics to. If not set, the client will use the hostname to best guess where to send the metrics. If your hostname has `test`, `staging` or `local`, the test server will be used. Else, we will send the metrics to production. If this does not work for your use case, use the `environment` option to override that behaviour.

```js
new MetricsClient({ environment: 'production' });
```


## Usage (shared libraries)

If you want to record operational metrics from another library that's shared between systems, **do not** install this module as a dependency. Instead you should rely solely on [the event-based API](#event-based-api).

This ensures that:

  * We don't end up with duplicate global event handlers
  * The system installing your library does not have to inject the metrics client and manage the instance
  * We don't end up with systems and libraries using different incompatible versions of the metrics client (dependency hell)

We recommend that your library decides on a top-level namespace that all other events live under. E.g.

```
my-library.success
my-library.failure
```

## Usage (infrastructure)

As well as a client you'll need to add a namespace on the [Client Metrics Server](https://github.com/Financial-Times/cp-client-metrics-server/tree/main/config/namespace) to send events to. You can set this up yourselves following the script in the repo. This should set you up to send logs to Splunk and metrics to CloudWatch. You can then use your CloudWatch metrics to create graphs and alerts in Grafana.


## Migrating

Consult the [Migration Guide](./docs/migration.md) if you're trying to migrate to a later major version of this package.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2025, The Financial Times Ltd.
