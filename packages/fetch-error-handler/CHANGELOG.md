# Changelog

## [1.3.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v1.2.0...fetch-error-handler-v1.3.0) (2025-12-04)


### Features

* catch the expections from response.text() ([b3d0dd1](https://github.com/Financial-Times/dotcom-reliability-kit/commit/b3d0dd1827ea7d25ba236af9ce213089df0f4763))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/errors bumped from ^4.1.0 to ^4.2.0

## [1.2.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v1.1.1...fetch-error-handler-v1.2.0) (2025-11-05)


### Features

* add check for incorrect JSON ([41c48ff](https://github.com/Financial-Times/dotcom-reliability-kit/commit/41c48ffe0e00671a4f1c389acf7ec4996f6ac0e9))
* add more e2e tests ([812e1bc](https://github.com/Financial-Times/dotcom-reliability-kit/commit/812e1bc935f318103422d0a85da4087089e2ad2c))
* add unit tests for the new cases ([f7cfb6c](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f7cfb6cc0f0015069eae343e70e39d9d03f0b16b))
* adds e2e test for error handling refactor ([2d8d6f2](https://github.com/Financial-Times/dotcom-reliability-kit/commit/2d8d6f26d31bd1e4ccdaf8a86d9d7d026d1ddade))
* adds the body of the response to errors ([adb31fd](https://github.com/Financial-Times/dotcom-reliability-kit/commit/adb31fdebd230dd00daacdde0eca04452412815e))


### Bug Fixes

* in final throw check if response is an object ([bbe5fb3](https://github.com/Financial-Times/dotcom-reliability-kit/commit/bbe5fb38d893d889cb13664b0a93f8f716eac1d9))


### Documentation Changes

* add new error details in the readme ([465191a](https://github.com/Financial-Times/dotcom-reliability-kit/commit/465191aca479876e10f0f98f3ed8ada253097a0d))

## [1.1.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v1.1.0...fetch-error-handler-v1.1.1) (2025-10-13)


### Bug Fixes

* **fetch-error-handler:** don't treat 304 responses as errors ([767109a](https://github.com/Financial-Times/dotcom-reliability-kit/commit/767109a8fac4671fab4796144a3d0bfda0256ebd))

## [1.1.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v1.0.0...fetch-error-handler-v1.1.0) (2025-05-08)


### Features

* add support for Node.js 24 ([1274a12](https://github.com/Financial-Times/dotcom-reliability-kit/commit/1274a128049a49111fb59be8ca162ce213dcd539))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/errors bumped from ^4.0.0 to ^4.1.0

## [1.0.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v0.3.0...fetch-error-handler-v1.0.0) (2025-01-30)


### Miscellaneous

* mark fetch-error-handler as stable ([f1d50ce](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f1d50ce0cd37c1517ddeed84dd6a55cc59935ba2))

## [0.3.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v0.2.6...fetch-error-handler-v0.3.0) (2025-01-20)


### ⚠ BREAKING CHANGES

* drop support for Node.js 18

### Miscellaneous

* drop support for Node.js 18 ([3efb889](https://github.com/Financial-Times/dotcom-reliability-kit/commit/3efb8896bc49424d3745753e0a57b06c6ede8165))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/errors bumped from ^3.1.2 to ^4.0.0

## [0.2.6](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v0.2.5...fetch-error-handler-v0.2.6) (2024-11-26)


### Bug Fixes

* remove npm engines pinning ([9f51dab](https://github.com/Financial-Times/dotcom-reliability-kit/commit/9f51dab7374e05431de236445c6706dbc1fd3172))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/errors bumped from ^3.1.1 to ^3.1.2

## [0.2.5](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v0.2.4...fetch-error-handler-v0.2.5) (2024-07-01)


### Bug Fixes

* add type declarations for fetch-error-handler ([36490d1](https://github.com/Financial-Times/dotcom-reliability-kit/commit/36490d10c820abdd8017422b8f47c3a045e43170))

## [0.2.4](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v0.2.3...fetch-error-handler-v0.2.4) (2024-06-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/errors bumped from ^3.1.0 to ^3.1.1

## [0.2.3](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v0.2.2...fetch-error-handler-v0.2.3) (2024-05-01)


### Bug Fixes

* make FetchResponse type compatible with a native Response object ([00fb83d](https://github.com/Financial-Times/dotcom-reliability-kit/commit/00fb83d477a864a26dc59c698e5d2471181ea1eb))

## [0.2.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v0.2.1...fetch-error-handler-v0.2.2) (2024-04-29)


### Features

* add support for Node.js 22 ([e083794](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e083794c2b4901a055de9fce483bcbab03b8e522))


### Bug Fixes

* handle node-fetch memory leak ([6716eca](https://github.com/Financial-Times/dotcom-reliability-kit/commit/6716eca8b4fe0a49431d5bdc77bdf0ed2f7742ce))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/errors bumped from ^3.0.1 to ^3.1.0

## [0.2.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v0.2.0...fetch-error-handler-v0.2.1) (2024-01-09)


### Bug Fixes

* add official support for npm 10 ([f7c4f2f](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f7c4f2f4c9358389be7bbcbd3609081eec2246b5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/errors bumped from ^3.0.0 to ^3.0.1

## [0.2.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v0.1.2...fetch-error-handler-v0.2.0) (2024-01-08)


### ⚠ BREAKING CHANGES

* drop support for Node.js 16 and npm 7

### Miscellaneous

* drop support for Node.js 16 and npm 7 ([016096e](https://github.com/Financial-Times/dotcom-reliability-kit/commit/016096eab022fa426159ec649a4e32c24eedd568))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/errors bumped from ^2.2.0 to ^3.0.0

## [0.1.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v0.1.1...fetch-error-handler-v0.1.2) (2023-12-21)


### Documentation Changes

* fix the markdown note/warning blocks ([c7f69f2](https://github.com/Financial-Times/dotcom-reliability-kit/commit/c7f69f20a8b000f4a40c4cd25be23fcee2ecd85d))
* revise the note/warning levels ([917abc6](https://github.com/Financial-Times/dotcom-reliability-kit/commit/917abc60a0891f3a9110bafca96fe924a5b76a80))

## [0.1.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/fetch-error-handler-v0.1.0...fetch-error-handler-v0.1.1) (2023-09-19)


### Features

* handle common errors thrown by fetch ([5828192](https://github.com/Financial-Times/dotcom-reliability-kit/commit/58281920f0651cf69d4d8b742625a3224bdc8d5c))


### Bug Fixes

* correct a typo in the tests ([050bf7c](https://github.com/Financial-Times/dotcom-reliability-kit/commit/050bf7c3c7403bc50371fd321fa89296237a33e0))


### Documentation Changes

* fix a typo ([3e1d185](https://github.com/Financial-Times/dotcom-reliability-kit/commit/3e1d185df652fc757454fad5d24e4a4772a8ef4e))

## 0.1.0 (2023-08-18)


### Features

* add a fetch-error-handler package ([a2ed348](https://github.com/Financial-Times/dotcom-reliability-kit/commit/a2ed3489cbc5363e84d16b7c5b33554f837788fa))


### Documentation Changes

* add comment to explain ignored error ([b1eb05d](https://github.com/Financial-Times/dotcom-reliability-kit/commit/b1eb05d8ca1b70932ce0deef919f80d0ebc1ee2d))
* fix a couple of typos ([84ad151](https://github.com/Financial-Times/dotcom-reliability-kit/commit/84ad151a95542c5085a2c16006ecc425b500784d))
