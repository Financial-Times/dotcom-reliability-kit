
# Migration guide for @dotcom-reliability-kit/fetch-error-handler

This document outlines how to migrate to the latest version of the Reliability Kit fetch-error-handler package. Throughout this guide we use the following emoji and labels to indicate the level of change required:

Emoji           | Label             | Meaning
----------------|:------------------|:-------
:red_circle:    | Breaking          | A breaking change which will likely require code or config changes to resolve
:orange_circle: | Possibly Breaking | A breaking change that is unlikely to require code changes but things outside of the code (e.g. logs) may have changed
:yellow_circle: | Deprecation       | A deprecated feature which will require code changes in the future

* [Migrating from v1 to v2](#migrating-from-v1-to-v2)
  * [Node.js 20 is no longer supported](#nodejs-20-is-no-longer-supported)


## Migrating from v1 to v2

### Node.js 20 is no longer supported

**:red_circle: Breaking:** this version drops support for Node.js v20. If your app is already using Node.js v22 then you may be able to migrate without code changes.
