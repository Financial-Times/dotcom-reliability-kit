# Changelog

## [4.2.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v4.1.0...app-info-v4.2.0) (2025-05-08)


### Features

* add support for Node.js 24 ([1274a12](https://github.com/Financial-Times/dotcom-reliability-kit/commit/1274a128049a49111fb59be8ca162ce213dcd539))

## [4.1.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v4.0.0...app-info-v4.1.0) (2025-03-25)


### Features

* set cloud provider to AWS for Hako apps ([70c4f94](https://github.com/Financial-Times/dotcom-reliability-kit/commit/70c4f947f83361d02cf5b6728a78fbe6d2ec4659))

## [4.0.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v3.3.1...app-info-v4.0.0) (2025-01-20)


### ⚠ BREAKING CHANGES

* drop support for Node.js 18

### Documentation Changes

* add migration guides for new major versions ([610c171](https://github.com/Financial-Times/dotcom-reliability-kit/commit/610c17189f0564051b793a0d590a6c9721b41a53))


### Miscellaneous

* drop support for Node.js 18 ([3efb889](https://github.com/Financial-Times/dotcom-reliability-kit/commit/3efb8896bc49424d3745753e0a57b06c6ede8165))

## [3.3.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v3.3.0...app-info-v3.3.1) (2024-11-26)


### Bug Fixes

* remove npm engines pinning ([9f51dab](https://github.com/Financial-Times/dotcom-reliability-kit/commit/9f51dab7374e05431de236445c6706dbc1fd3172))

## [3.3.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v3.2.0...app-info-v3.3.0) (2024-07-02)


### Features

* allow setting the deployment environment ([3933189](https://github.com/Financial-Times/dotcom-reliability-kit/commit/39331898a32241630720490e62c460d399d5e5c0)), closes [#1111](https://github.com/Financial-Times/dotcom-reliability-kit/issues/1111)

## [3.2.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v3.1.0...app-info-v3.2.0) (2024-06-19)


### Features

* add a service ID property ([3571259](https://github.com/Financial-Times/dotcom-reliability-kit/commit/35712597c7bc0582c96d34b584ca4e0944e5b626))
* add semantic convention aliases ([ae585fc](https://github.com/Financial-Times/dotcom-reliability-kit/commit/ae585fc4ff164007a149a7f4224f4d9842e0af6d))
* pull the release version from package.json ([f32cc27](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f32cc27c2eb65cdfd938ec3110fc763bebec18ef))


### Bug Fixes

* always use a UUID for instance ID ([88db1fb](https://github.com/Financial-Times/dotcom-reliability-kit/commit/88db1fb255a701536beac86d1d16211168724517))
* default semantic attributes to undefined ([b43aab0](https://github.com/Financial-Times/dotcom-reliability-kit/commit/b43aab043c1db4dbac27397f435525ccfa22bb49))
* export the SemanticConventions type ([6cfaca0](https://github.com/Financial-Times/dotcom-reliability-kit/commit/6cfaca0edbf023d4577377ad59cbe908c7ae7e27))

## [3.1.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v3.0.2...app-info-v3.1.0) (2024-04-29)


### Features

* add support for Node.js 22 ([e083794](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e083794c2b4901a055de9fce483bcbab03b8e522))

## [3.0.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v3.0.1...app-info-v3.0.2) (2024-02-19)


### Bug Fixes

* add manual types for app-info ([e36bb9e](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e36bb9ee20e7a75c5301bfcceb15018242caaaf4))
* correct the types for the app-info package ([86cd542](https://github.com/Financial-Times/dotcom-reliability-kit/commit/86cd54280fdfa3482a1ca81a5474301714031f63))

## [3.0.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v3.0.0...app-info-v3.0.1) (2024-01-09)


### Bug Fixes

* add official support for npm 10 ([f7c4f2f](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f7c4f2f4c9358389be7bbcbd3609081eec2246b5))

## [3.0.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v2.3.0...app-info-v3.0.0) (2024-01-08)


### ⚠ BREAKING CHANGES

* drop support for Node.js 16 and npm 7

### Documentation Changes

* add migration guides for all packages ([f6233b8](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f6233b8ac802a32cad321e43b63420fe6fd979c0))


### Miscellaneous

* drop support for Node.js 16 and npm 7 ([016096e](https://github.com/Financial-Times/dotcom-reliability-kit/commit/016096eab022fa426159ec649a4e32c24eedd568))

## [2.3.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v2.2.0...app-info-v2.3.0) (2023-12-05)


### Features

* add herokuAppId and herokuDynoID properties ([ca28b38](https://github.com/Financial-Times/dotcom-reliability-kit/commit/ca28b38425cfc951c2641702f4982a9d9c4c9e12))

## [2.2.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v2.1.0...app-info-v2.2.0) (2023-11-07)


### Features

* add cloudProvider as exported property for appInfo ([ae28f2b](https://github.com/Financial-Times/dotcom-reliability-kit/commit/ae28f2bcb5c364c9eb82a5ac0fbad6dc17a65806))

## [2.1.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v2.0.1...app-info-v2.1.0) (2023-05-02)


### Features

* add support for npm 9 ([a51cd4f](https://github.com/Financial-Times/dotcom-reliability-kit/commit/a51cd4fa717c4ec8b5057be694dc99d5459df7db))

## [2.0.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v2.0.0...app-info-v2.0.1) (2023-04-24)


### Bug Fixes

* start running builds on Node.js 20 ([62491a6](https://github.com/Financial-Times/dotcom-reliability-kit/commit/62491a60b07dfd044a90bb4adeece33c6be00c20))

## [2.0.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v1.2.1...app-info-v2.0.0) (2023-04-18)


### ⚠ BREAKING CHANGES

* drop support for Node.js 14

### Miscellaneous

* drop support for Node.js 14 ([e5d3920](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e5d392023e23b105049d8b09403b3db7699a37a1))

## [1.2.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v1.2.0...app-info-v1.2.1) (2023-04-05)


### Bug Fixes

* correct manually published versions ([5a014f1](https://github.com/Financial-Times/dotcom-reliability-kit/commit/5a014f1b0b6b6ad741253d1215b630d418a196eb))

## [1.2.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v1.1.0...app-info-v1.2.0) (2023-04-04)


### Features

* add processType property to app-info ([ca65f00](https://github.com/Financial-Times/dotcom-reliability-kit/commit/ca65f00f3ae7173899989d6a178233fe9996182f))

## [1.1.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v1.0.3...app-info-v1.1.0) (2022-12-22)


### Features

* use AWS environment variables in app-info ([d5cd535](https://github.com/Financial-Times/dotcom-reliability-kit/commit/d5cd535cdf678366ec885f99d33e01b6268db4b2))


### Bug Fixes

* use GIT_COMMIT_LONG ([f4fb427](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f4fb427b50302ae6d25b800d9688a4c6013f5752))

## [1.0.3](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v1.0.2...app-info-v1.0.3) (2022-10-12)


### Bug Fixes

* include TypeScript types in the build ([65d8fb2](https://github.com/Financial-Times/dotcom-reliability-kit/commit/65d8fb29f0a4e469a2d766ae2f92a67b221c1436))

## [1.0.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v1.0.1...app-info-v1.0.2) (2022-10-12)


### Bug Fixes

* add the [@readonly](https://github.com/readonly) tag to appInfo properties ([8ea488a](https://github.com/Financial-Times/dotcom-reliability-kit/commit/8ea488afa3e8a6a5e9c78adc194e1b226409d6f1))

## [1.0.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/app-info-v1.0.0...app-info-v1.0.1) (2022-09-28)


### Bug Fixes

* make sure that ESM + TypeScript works ([cc71ede](https://github.com/Financial-Times/dotcom-reliability-kit/commit/cc71eded6475d73b05771603df0946258600f50e))

## 1.0.0 (2022-08-22)


### Bug Fixes

* refactor to centralise environment variables ([d8837f5](https://github.com/Financial-Times/dotcom-reliability-kit/commit/d8837f57289266438f9e23e3adbaf60a0018bb08))
