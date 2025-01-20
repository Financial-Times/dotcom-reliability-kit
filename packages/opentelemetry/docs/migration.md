
# Migration guide for @dotcom-reliability-kit/opentelemetry

This document outlines how to migrate to the latest version of the Reliability Kit opentelemetry package. Throughout this guide we use the following emoji and labels to indicate the level of change required:

Emoji           | Label             | Meaning
----------------|:------------------|:-------
:red_circle:    | Breaking          | A breaking change which will likely require code or config changes to resolve
:orange_circle: | Possibly Breaking | A breaking change that is unlikely to require code changes but things outside of the code (e.g. logs) may have changed
:yellow_circle: | Deprecation       | A deprecated feature which will require code changes in the future

* [Migrating from v1 to v2](#migrating-from-v1-to-v2)
  * [JavaScript API changes](#javascript-api-changes)
* [Migrating from v2 to v3](#migrating-from-v2-to-v3)
  * [Node.js 18 is no longer supported](#nodejs-18-is-no-longer-supported)


## Migrating from v1 to v2

### JavaScript API changes

**:red_circle: Breaking:** If you're using the manual setup of OpenTelemetry via the JavaScript API, the setup method is no longer a default export. Instead, use a named `setup` export:

```diff
- import setupOpenTelemetry from '@dotcom-reliability-kit/opentelemetry';
+ import * as opentelemetry from '@dotcom-reliability-kit/opentelemetry';
// or
- const setupOpenTelemetry = require('@dotcom-reliability-kit/opentelemetry');
+ const opentelemetry = require('@dotcom-reliability-kit/opentelemetry');

- setupOpenTelemetry({ /* ... */ });
+ opentelemetry.setup({ /* ... */ });
```

If you're using the `--require` method or importing `@dotcom-reliability-kit/opentelemetry/setup` then this is not a breaking change.


## Migrating from v2 to v3

### Node.js 18 is no longer supported

**:red_circle: Breaking:** this version drops support for Node.js v18. If your app is already using Node.js v20 or above then you can migrate with no code changes.
