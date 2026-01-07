
# Migration guide for @dotcom-reliability-kit/eslint-config

This document outlines how to migrate to the latest version of the Reliability Kit eslint-config package. Throughout this guide we use the following emoji and labels to indicate the level of change required:

Emoji           | Label             | Meaning
----------------|:------------------|:-------
:red_circle:    | Breaking          | A breaking change which will likely require code or config changes to resolve
:orange_circle: | Possibly Breaking | A breaking change that is unlikely to require code changes but things outside of the code (e.g. logs) may have changed

* [Migrating from v1 to v2](#migrating-from-v1-to-v2)
  * [Additional default ESLint rules added (v2)](#additional-default-eslint-rules-added-v2)
* [Migrating from v2 to v3](#migrating-from-v2-to-v3)
  * [Node.js 16 is no longer supported](#nodejs-16-is-no-longer-supported)
* [Migrating from v3 to v4](#migrating-from-v3-to-v4)
  * [Node.js 18 is no longer supported](#nodejs-18-is-no-longer-supported)
* [Migrating from v4 to v5](#migrating-from-v4-to-v5)
  * [Node.js 20 is no longer supported](#nodejs-20-is-no-longer-supported)


## Migrating from v1 to v2

### Additional default ESLint rules added (v2)

**:orange_circle: Possibly Breaking:** this version adds a few new ESLint rules to the default configuration, the following rules now error:

* [eqeqeq](https://eslint.org/docs/latest/rules/eqeqeq)
* [no-extend-native](https://eslint.org/docs/latest/rules/no-extend-native)
* [no-irregular-whitespace](https://eslint.org/docs/latest/rules/no-irregular-whitespace)
* [no-undef](https://eslint.org/docs/latest/rules/no-undef)
* [no-unused-vars](https://eslint.org/docs/latest/rules/no-unused-vars)

You may need to make changes to your code if these linting errors are found.


## Migrating from v2 to v3

### Node.js 16 is no longer supported

**:red_circle: Breaking:** this version drops support for Node.js v16. If your app is already using Node.js v18 or above then you can migrate with no code changes.


## Migrating from v3 to v4

### Node.js 18 is no longer supported

**:red_circle: Breaking:** this version drops support for Node.js v18. If your app is already using Node.js v20 or above then you can migrate with no code changes.


## Migrating from v4 to v5

### Node.js 20 is no longer supported

**:red_circle: Breaking:** this version drops support for Node.js v20. If your app is already using Node.js v22 then you may be able to migrate without code changes.
