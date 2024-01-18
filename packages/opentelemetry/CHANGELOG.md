# Changelog

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
