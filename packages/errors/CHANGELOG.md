# Changelog

## [1.2.5](https://github.com/Financial-Times/dotcom-reliability-kit/compare/errors-v1.2.4...errors-v1.2.5) (2022-10-12)


### Bug Fixes

* **errors:** removes readonly JDoc property from getter ([7e16b3f](https://github.com/Financial-Times/dotcom-reliability-kit/commit/7e16b3fe0234785ff39574958ccacb4dc244f71b))

## [1.2.4](https://github.com/Financial-Times/dotcom-reliability-kit/compare/errors-v1.2.3...errors-v1.2.4) (2022-10-12)


### Bug Fixes

* include TypeScript types in the build ([65d8fb2](https://github.com/Financial-Times/dotcom-reliability-kit/commit/65d8fb29f0a4e469a2d766ae2f92a67b221c1436))

## [1.2.3](https://github.com/Financial-Times/dotcom-reliability-kit/compare/errors-v1.2.2...errors-v1.2.3) (2022-10-12)


### Bug Fixes

* correct property and method privacy JSDoc ([1b52fee](https://github.com/Financial-Times/dotcom-reliability-kit/commit/1b52fee58f8bd37600f51c93580c0e48765f0d2a))
* use module.exports for consistency ([8cdd4d7](https://github.com/Financial-Times/dotcom-reliability-kit/commit/8cdd4d74afe44c51504ddf0f9a3219db3ad2654a))

## [1.2.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/errors-v1.2.1...errors-v1.2.2) (2022-09-28)


### Bug Fixes

* make sure that ESM + TypeScript works ([cc71ede](https://github.com/Financial-Times/dotcom-reliability-kit/commit/cc71eded6475d73b05771603df0946258600f50e))

## [1.2.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/errors-v1.2.0...errors-v1.2.1) (2022-08-17)


### Bug Fixes

* default UpstreamServiceError to HTTP 502 ([42b5be9](https://github.com/Financial-Times/dotcom-reliability-kit/commit/42b5be9e1d754c3c6ed7aa013ab7dd2957cc1ce9))

## [1.2.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/errors-v1.1.2...errors-v1.2.0) (2022-08-16)


### Features

* add new more specific error classes ([82b006c](https://github.com/Financial-Times/dotcom-reliability-kit/commit/82b006c5eacc9a9d2eec4947ba4331b03e46f19d))

## [1.1.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/errors-v1.1.1...errors-v1.1.2) (2022-08-16)


### Bug Fixes

* correct type hinting for HTTP errors ([246877c](https://github.com/Financial-Times/dotcom-reliability-kit/commit/246877c529088121e29c6781ab2cfb0cce9690f9))

## [1.1.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/errors-v1.1.0...errors-v1.1.1) (2022-08-05)


### Miscellaneous

* additional relatesToSystems documentation and tests ([63f094d](https://github.com/Financial-Times/dotcom-reliability-kit/commit/63f094d59576f789597274444ce0e14db2c3599e))

## [1.1.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/errors-v1.0.1...errors-v1.1.0) (2022-08-04)


### Features

* add OperationalError cause property ([9505f6f](https://github.com/Financial-Times/dotcom-reliability-kit/commit/9505f6f21f24bf4893f2f0ff81257318ed6d2acb))

## [1.0.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/errors-v1.0.0...errors-v1.0.1) (2022-08-01)


### Documentation Changes

* apply documentation amends ([9d83857](https://github.com/Financial-Times/dotcom-reliability-kit/commit/9d838573d58644b98888b3e2bbb48b330e37a011))
* update 'chore' definition ([383730a](https://github.com/Financial-Times/dotcom-reliability-kit/commit/383730a43fe00dbc9ef3c2cfcd776ee5cbd7d3ed))

## [1.0.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/errors-v0.1.2...errors-v1.0.0) (2022-07-05)


### Miscellaneous

* add label filter to package bug pages ([05e7285](https://github.com/Financial-Times/dotcom-reliability-kit/commit/05e7285c87ecbad909d86414579e970173af344f))

### [0.1.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/errors-v0.1.1...errors-v0.1.2) (2022-05-25)


### Features

* add property relatesToSystems to errors ([2869396](https://github.com/Financial-Times/dotcom-reliability-kit/commit/2869396ef42d5e1bf5693082c63098909a206570))

### [0.1.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/errors-v0.1.0...errors-v0.1.1) (2022-05-12)


### Features

* add a code property to operational errors ([14a771e](https://github.com/Financial-Times/dotcom-reliability-kit/commit/14a771e20b97f283cf30303b6e029f99fabf97b5))
* add an HTTP error class ([9e7f123](https://github.com/Financial-Times/dotcom-reliability-kit/commit/9e7f1239d8590be76fd2ebb366d6c0fbbe072d94))
* allow additional error properties ([dfd2121](https://github.com/Financial-Times/dotcom-reliability-kit/commit/dfd212191cb00eed5cf958fac914e7cd53b34987))


### Bug Fixes

* error.data should allow any value ([f62fba9](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f62fba9a137a23ab445b79e008b3c715926c5518))
* properly document the data param in errors ([eb4f515](https://github.com/Financial-Times/dotcom-reliability-kit/commit/eb4f51595114bab0cace7fc7408d1b53111a4b46))


### Documentation Changes

* link to Joyent's Error Handling documentation ([eadc390](https://github.com/Financial-Times/dotcom-reliability-kit/commit/eadc390d083ebb6ce270e8756ea6be3ae1e2e45b))


### Miscellaneous

* add JSDoc linting ([20a14ce](https://github.com/Financial-Times/dotcom-reliability-kit/commit/20a14ceb4b2489f8d69c6dd80e58bd36b5036bb7))
* define types before they're used ([c1531d6](https://github.com/Financial-Times/dotcom-reliability-kit/commit/c1531d609e4904b1c1f55cd538192596a19857dd))
* fix JSDoc based on ESLint errors ([7ff7c36](https://github.com/Financial-Times/dotcom-reliability-kit/commit/7ff7c368fba2816c0968cc74d2d98f6326becd80))

## 0.1.0 (2022-05-04)


### Features

* add a method to check for operational errors ([6a1e9ac](https://github.com/Financial-Times/dotcom-reliability-kit/commit/6a1e9aca8b2c9ef47acc2bae8b292e587b9d39dd))
* initial bootstrapping of the errors package ([ae787a0](https://github.com/Financial-Times/dotcom-reliability-kit/commit/ae787a0a8954d733b12d2bd1d0dec90c42e1fbe2))
