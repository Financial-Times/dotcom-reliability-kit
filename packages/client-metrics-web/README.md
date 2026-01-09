
# @dotcom-reliability-kit/client-metrics-web

A client for sending operational metrics events to [AWS CloudWatch RUM](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-RUM.html) from the web. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

> [!WARNING]
> This Reliability Kit module is intended for use in client-side JavaScript. Importing it into a Node.js app will result in errors being thrown.

> [!IMPORTANT]
>  Remember that this library is intended for sending _operational_ metrics - metrics that help us understand whether your system is operating as expected. For analytics data you should still be using Spoor (or another solution common to your team).

> [!CAUTION]
> This Reliability Kit module is considered experimental, we're rolling out to systems in a controlled manner and may introduce breaking changes. Please speak to the Reliability team if you have a use-case.

* [Usage (systems)](#usage-systems)
  * [`MetricsClient`](#metricsclient)
    * [`client.recordEvent()`](#clientrecordevent)
    * [`client.recordError()`](#clientrecorderror)
    * [`client.enable()`](#clientenable)
    * [`client.disable()`](#clientdisable)
    * [`client.isEnabled`](#clientisenabled)
    * [`client.isAvailable`](#clientisavailable)
  * [Event-based API](#event-based-api)
  * [Error handling](#error-handling)
  * [Configuration options](#configuration-options)
    * [`options.allowedHostnamePattern`](#optionsallowedhostnamepattern)
    * [`options.awsAppMonitorId`](#optionsawsappmonitorid)
    * [`options.awsAppMonitorRegion`](#optionsawsappmonitorregion)
    * [`options.awsIdentityPoolId`](#optionsawsidentitypoolid)
    * [`options.samplePercentage`](#optionssamplepercentage)
    * [`options.systemCode`](#optionssystemcode)
    * [`options.systemVersion`](#optionssystemversion)
* [Usage (shared libraries)](#usage-shared-libraries)
* [Usage (infrastructure)](#usage-infrastructure)
  * [Customer Products Client Metrics](#customer-products-client-metrics)
  * [Running your own infrastructure](#running-your-own-infrastructure)
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

The `MetricsClient` class wraps an AWS CloudWatch RUM client with some FT-specific configurations and limitations. This class should only ever be constructed once or you'll end up sending duplicate metrics.

You should construct the metrics client as early as possible in the loading of the page. For the required options, see [configuration options](#configuration-options).

```js
const client = new MetricsClient({
    // Options go here
});
```

This will bind some global event handlers:

  * `error` - records an error for uncaught errors thrown on the page
  * `unhandledrejection` - records an error for unhandled promise rejections on the page
  * `ft.clientMetric` - records a custom metric based on details found in the event ([see documentation below](#event-based-api))

#### `client.recordEvent()`

Record an event in AWS CloudWatch RUM:

```js
client.recordEvent('namespace.event', {
    // Any event details you want to send can go here as key/value pairs
});
```

The event namespace **MUST** include a period (`.`). It must be comprised of alphanumeric characters, underscores, and hyphens, separated by periods. When we record the event in AWS CloudWatch RUM we automatically prefix with `com.ft.`.

Other than the above, the event namespace is free-form for now. A later major version of the client may lock down the top-level namespace further.

#### `client.recordError()`

> [!WARNING]  
> Errors in AWS CloudWatch RUM are unstructured so they're not as useful as sending appropriately-namespaced events, [please do this if possible](#clientrecordevent). If we see heavy use of errors from your system then we may work with you to move to metrics.

If you need to record an error manually then you can do so with this method. It accepts an error object:

```js
client.recordError(new Error('oops'));
```

You'd normally do this in a try/catch block:

```js
try {
    // Do something that might throw an error
} catch (error) {
    client.recordError(error);
}
```

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

When sending metrics in this way, the `detail` object can have any number of properties. These properties will be extracted into the final metrics event and sent to AWS CloudWatch RUM. For example:

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

Instead of throwing an error, we log a warning to the console. If you're not seeing metrics in AWS CloudWatch RUM then check the browser console for these warnings. It's also a good idea to check for them in local development before pushing any changes.

### Configuration options

Config options can be passed into the `MetricsClient` function as an object with any of the keys below.

```js
new MetricsClient({
    // Config options go here
});
```


#### `options.allowedHostnamePattern`

**Optional** `RegExp`. A pattern to match against the current window's hostname. If the window hostname matches this regular expression then the client will be set up successfully, otherwise it will fail with a warning. Defaults to `/\.ft\.com$/`.

This is to avoid sending metrics from local or test environments. It should match your [app monitor's domain](https://docs.aws.amazon.com/cloudwatchrum/latest/APIReference/API_AppMonitor.html). (see [infrastructure for information on where to get this value](#usage-infrastructure)).

```js
// Allows the metrics client to work only on mydomain.com and subdomains
new MetricsClient({ allowedHostnamePattern: /\.mydomain\.com$/ });
```

#### `options.awsAppMonitorId`

**Required** `String`. The ID of the [App Monitor](https://docs.aws.amazon.com/cloudwatchrum/latest/APIReference/API_AppMonitor.html) you want to send metrics to (see [infrastructure for information on where to get this value](#usage-infrastructure)).

> [!TIP]
> This is not a secret, it's safe to be visible in client-side code.

```js
new MetricsClient({ awsAppMonitorId: '0990f36b-1af0-47d1-a155-873e6e566b0c' });
```

#### `options.awsAppMonitorRegion`

**Required** `String`. The AWS region the [App Monitor](https://docs.aws.amazon.com/cloudwatchrum/latest/APIReference/API_AppMonitor.html) you want to send metrics to runs in (see [infrastructure for information on where to get this value](#usage-infrastructure)).

```js
new MetricsClient({ awsAppMonitorRegion: 'eu-west-1' });
```

#### `options.awsIdentityPoolId`

**Required** `String`. The ID of the [Identity Pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html) your metrics client uses for authentication (see [infrastructure for information on where to get this value](#usage-infrastructure)).

> [!TIP]
> This is not a secret, it's safe to be visible in client-side code.

```js
new MetricsClient({ awsIdentityPoolId: 'eu-west-1:3b48b1c1-b286-4459-a755-f7074f4c8356' });
```

#### `options.samplePercentage`

**Optional** `Number`. The percentage of requests to send metrics for. Sampling is important to keep our costs down - never set this to `100` for systems dealing with any amount of production traffic. Defaults to `5`.

```js
new MetricsClient({ samplePercentage: 25 });
```

#### `options.systemCode`

**Required** `String`. The [Biz Ops system code](https://biz-ops.in.ft.com/list/Systems) you're sending metrics for.

```js
new MetricsClient({ systemCode: 'my-system' });
```

#### `options.systemVersion`

**Optional** `String`. The version number of the currently running system, which helps us to spot issues in new versions. This could be a version number or a git commit hash. Defaults to `0.0.0`.

```js
new MetricsClient({ systemVersion: '1.2.3' });
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

As well as a client you'll need an AWS CloudWatch AppMonitor to send events to. You can set this up yourselves or, if you're in Customer Products, you can use one provided to you by the Reliability team.

### Customer Products Client Metrics

We maintain a system called [Customer Products Client Metrics](https://biz-ops.in.ft.com/System/cp-client-metrics). You can find all required options in Doppler under `cp-shared.prod`, look for those prefixed with `CLIENT_METRICS_`. Speak to the Reliability team about how to access the data once you're recording metrics.

To get these shared configurations to the client side, we recommend referencing the shared secrets in your own Doppler project and using [dotcom-ui-data-embed](https://github.com/Financial-Times/dotcom-page-kit/tree/main/packages/dotcom-ui-data-embed) to pass them to the client side.

If you want your events to be available as CloudWatch metrics and in Grafana then you'll need to add filters to the AppMonitor's `MetricDestinations`. Speak to the Reliability team about how to do this.

### Running your own infrastructure

If you want to set up your own AppMonitor to collect metrics, you can do so with the following CloudFormation:

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: A system to record RUM data
Parameters:
  SystemCode:
    Type: String
    Description: The system code to associate with the stack

Resources:
  RumIdentityPool:
    Type: AWS::Cognito::IdentityPool
    Properties:
      IdentityPoolName: !Sub ${SystemCode}-${AWS::Region}-id-pool
      AllowUnauthenticatedIdentities: true

  RumIdentityPoolRoles:
    Type: AWS::Cognito::IdentityPoolRoleAttachment
    Properties:
      IdentityPoolId: !Ref RumIdentityPool
      Roles:
        unauthenticated: !GetAtt RumClientRole.Arn

  RumClientRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: !Sub ${SystemCode}-${AWS::Region}-unauth
      Description: Unauthenticated Role for AWS RUM Clients
      AssumeRolePolicyDocument:
        Version: 2012-10-17
        Statement:
          - Effect: Allow
            Principal:
              Federated:
                - cognito-identity.amazonaws.com
            Action:
              - sts:AssumeRoleWithWebIdentity
            Condition:
              StringEquals:
                cognito-identity.amazonaws.com:aud: !Ref RumIdentityPool
              ForAnyValue:StringLike: 
                cognito-identity.amazonaws.com:amr: unauthenticated
      Path: /
      Policies:
        - PolicyName: AWSRumClientPut
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: Allow
                Action:
                  - "rum:PutRumEvents"
                Resource: !Sub arn:aws:rum:${AWS::Region}:${AWS::AccountId}:appmonitor/${SystemCode}

  RumAppMonitor:
    Type: AWS::RUM::AppMonitor
    Properties:
      Name: !Ref SystemCode
      CustomEvents:
        Status: ENABLED
      Domain: '*.ft.com' # Change to the domain(s) you want to collect metrics on
      AppMonitorConfiguration:
        GuestRoleArn: !GetAtt RumClientRole.Arn
        IdentityPoolId: !Ref RumIdentityPool
        SessionSampleRate: 1 # 0 = 0%, 1 = 100%
        Telemetries:
          - errors
```


## Migrating

Consult the [Migration Guide](./docs/migration.md) if you're trying to migrate to a later major version of this package.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2025, The Financial Times Ltd.
