
# Migration guide for @dotcom-reliability-kit/client-metrics-web

This document outlines how to migrate to the latest version of the Reliability Kit client-metrics-web package. Throughout this guide we use the following emoji and labels to indicate the level of change required:

Emoji           | Label             | Meaning
----------------|:------------------|:-------
:red_circle:    | Breaking          | A breaking change which will likely require code or config changes to resolve
:orange_circle: | Possibly Breaking | A breaking change that is unlikely to require code changes but things outside of the code (e.g. logs) may have changed
:yellow_circle: | Deprecation       | A deprecated feature which will require code changes in the future

* [Migrating from v0 to v1](#migrating-from-v0-to-v1)
  * [Node.js 20 is no longer supported](#nodejs-20-is-no-longer-supported)
  * [Node.js 22.11 is no longer supported](#nodejs-2211-is-no-longer-supported)


## Migrating from v0 to v1

### Node.js 20 is no longer supported

**:red_circle: Breaking:** this version drops support for Node.js v20. If your app is already using Node.js v22 then you may be able to migrate without code changes.

### Node.js 22.11 is no longer supported

**:red_circle: Breaking:** this version drops support for Node.js v22.11 or lower. If your app is already using Node.js v22.12 then you may be able to migrate without code changes. This is so that we can publish native ESM modules without requiring complex changes in our consuming applications. [See #1479 for more information](https://github.com/Financial-Times/dotcom-reliability-kit/issues/1479).
