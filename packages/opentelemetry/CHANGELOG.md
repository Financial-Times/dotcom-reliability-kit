# Changelog

## [1.1.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/opentelemetry-v1.1.1...opentelemetry-v1.1.2) (2024-05-17)


### Bug Fixes

* add log-error as dependency of opentelemetry ([1e9fb75](https://github.com/Financial-Times/dotcom-reliability-kit/commit/1e9fb758726507c8bc8eaf334dc69dd191abda1d))

## [1.1.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/opentelemetry-v1.1.0...opentelemetry-v1.1.1) (2024-05-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/logger bumped from ^3.1.0 to ^3.1.1

## [1.1.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/opentelemetry-v1.0.3...opentelemetry-v1.1.0) (2024-04-29)


### Features

* add support for Node.js 22 ([e083794](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e083794c2b4901a055de9fce483bcbab03b8e522))


### Bug Fixes

* update all OpenTelemetry packages ([1a52e1a](https://github.com/Financial-Times/dotcom-reliability-kit/commit/1a52e1a0a6d7ddb017dbe2e4ff7b509649ea93b1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^3.0.2 to ^3.1.0
    * @dotcom-reliability-kit/errors bumped from ^3.0.1 to ^3.1.0
    * @dotcom-reliability-kit/logger bumped from ^3.0.6 to ^3.1.0

## [1.0.3](https://github.com/Financial-Times/dotcom-reliability-kit/compare/opentelemetry-v1.0.2...opentelemetry-v1.0.3) (2024-04-22)


### Bug Fixes

* update all the OpenTelemetry packages ([0d11391](https://github.com/Financial-Times/dotcom-reliability-kit/commit/0d11391560f90ac23c5e6def475925d9e75494c2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/logger bumped from ^3.0.5 to ^3.0.6

## [1.0.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/opentelemetry-v1.0.1...opentelemetry-v1.0.2) (2024-03-22)


### Bug Fixes

* bump all OpenTelemetry packages ([92ee099](https://github.com/Financial-Times/dotcom-reliability-kit/commit/92ee099e130f64e648a49475cac9d54f99c108ab))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/logger bumped from ^3.0.4 to ^3.0.5

## [1.0.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/opentelemetry-v1.0.0...opentelemetry-v1.0.1) (2024-02-19)


### Bug Fixes

* bump @opentelemetry/auto-instrumentations-node ([48418fa](https://github.com/Financial-Times/dotcom-reliability-kit/commit/48418faa415ce9242a0664ab9ec682a224d501d4))
* handle invalid URLs in the request filter ([ade80ff](https://github.com/Financial-Times/dotcom-reliability-kit/commit/ade80ff8c9ab622d6eb911891870d85923a0c6d9))
* update all OpenTelemetry packages ([bf460e5](https://github.com/Financial-Times/dotcom-reliability-kit/commit/bf460e5d69804decffc7bc3b650a1acd79581a25))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^3.0.1 to ^3.0.2
    * @dotcom-reliability-kit/logger bumped from ^3.0.3 to ^3.0.4

## [1.0.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/opentelemetry-v0.2.1...opentelemetry-v1.0.0) (2024-01-22)


### ⚠ BREAKING CHANGES

* mark as stable

### Features

* ignore commonly polled URLs ([c207c37](https://github.com/Financial-Times/dotcom-reliability-kit/commit/c207c378869d41a9f8d73f411a4784041d689253))


### Documentation Changes

* add a full local development example ([0dd33c6](https://github.com/Financial-Times/dotcom-reliability-kit/commit/0dd33c6d5fef6f31bafa71c0e02becb86bc5588e))
* add running instructions ([e936cee](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e936cee7b1f1cfcae7e2e0b7a559056eb84c5ece))
* mark as stable ([4f8c924](https://github.com/Financial-Times/dotcom-reliability-kit/commit/4f8c92425d53035d4b80a6b8539d8181bf4e0e44))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/logger bumped from ^3.0.2 to ^3.0.3

## [0.2.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/opentelemetry-v0.2.0...opentelemetry-v0.2.1) (2024-01-19)


### Features

* log OpenTelemetry success as info ([af5fce9](https://github.com/Financial-Times/dotcom-reliability-kit/commit/af5fce92fb26bc4f52d8421fe5b93c0ffd758770))

## [0.2.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/opentelemetry-v0.1.1...opentelemetry-v0.2.0) (2024-01-18)


### ⚠ BREAKING CHANGES

* add the ability to sample traces
* move tracing config into a separate object

### Features

* add a warning against otel environment vars ([491069a](https://github.com/Financial-Times/dotcom-reliability-kit/commit/491069a5bf6665e9b18d47d6b429cdc80967da37))
* add the ability to sample traces ([03e3f5b](https://github.com/Financial-Times/dotcom-reliability-kit/commit/03e3f5b46948fe958dcffaea07fdf399b0e3cfc4))
* move tracing config into a separate object ([f96a90f](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f96a90f3e311d35ca3ed1eee493dd6de4578a5e6))
* send a custom user-agent with otel requests ([efce3fe](https://github.com/Financial-Times/dotcom-reliability-kit/commit/efce3feb0367a803252da4b78f9345a12dc1da24))

## [0.1.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/opentelemetry-v0.1.0...opentelemetry-v0.1.1) (2024-01-17)


### Documentation Changes

* add a README for the opentelemetry package ([0ab4dd2](https://github.com/Financial-Times/dotcom-reliability-kit/commit/0ab4dd246e07747d5c57b9ff08bebb78e24037e2))

## 0.1.0 (2024-01-16)


### Features

* allow setting an authorization header ([6e89e7e](https://github.com/Financial-Times/dotcom-reliability-kit/commit/6e89e7ec40dd611fbe0120b9bed4e53ef5b0113b))
* created new opentelemetry package with tracing functionality ([0871914](https://github.com/Financial-Times/dotcom-reliability-kit/commit/08719146f487d4040949556faf3985c7f461e952))
* expose the type for OpenTelemetry options ([6d1bbde](https://github.com/Financial-Times/dotcom-reliability-kit/commit/6d1bbdeecb17462a61a0322a1e1769069a783242))


### Bug Fixes

* bump @dotcom-reliability-kit/app-info in /packages/opentelemetry ([eb87cce](https://github.com/Financial-Times/dotcom-reliability-kit/commit/eb87ccefdde6c7dcd1074097821d1c378e1344e1))
* bump @dotcom-reliability-kit/logger in /packages/opentelemetry ([062095a](https://github.com/Financial-Times/dotcom-reliability-kit/commit/062095a08a0818b9b499752fb55126066cf56ec1))
* bump @opentelemetry/exporter-trace-otlp-proto ([8b2dd87](https://github.com/Financial-Times/dotcom-reliability-kit/commit/8b2dd87d5fbdd97fe361ba1917a3984070b54e11))
* bump @opentelemetry/sdk-node in /packages/opentelemetry ([e29fc79](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e29fc79fb8f1cf1d528d2841ac58eea6ac1efe71))
* bump @opentelemetry/semantic-conventions from 1.19.0 to 1.20.0 ([2aabf59](https://github.com/Financial-Times/dotcom-reliability-kit/commit/2aabf59b84f9d521c19cd0eaaba880702dea3848))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/logger bumped from ^3.0.1 to ^3.0.2
