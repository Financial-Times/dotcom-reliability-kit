# Changelog

## [3.1.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v3.1.1...logger-v3.1.2) (2024-06-19)


### Bug Fixes

* bump pino from 9.0.0 to 9.1.0 ([3732e3b](https://github.com/Financial-Times/dotcom-reliability-kit/commit/3732e3ba6dff33a75cbe215e12028d7de40347da))
* bump pino from 9.1.0 to 9.2.0 ([5d2f4fb](https://github.com/Financial-Times/dotcom-reliability-kit/commit/5d2f4fb7a313574810d504a7af93814fd8be0be5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^3.1.0 to ^3.2.0

## [3.1.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v3.1.0...logger-v3.1.1) (2024-05-02)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/serialize-error bumped from ^3.1.0 to ^3.2.0

## [3.1.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v3.0.6...logger-v3.1.0) (2024-04-29)


### Features

* add support for Node.js 22 ([e083794](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e083794c2b4901a055de9fce483bcbab03b8e522))


### Bug Fixes

* bump pino from 8.21.0 to 9.0.0 in /packages/logger ([9384e05](https://github.com/Financial-Times/dotcom-reliability-kit/commit/9384e05cd0c2bda8990dd2b30d2ad8777e81b87d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^3.0.2 to ^3.1.0
    * @dotcom-reliability-kit/serialize-error bumped from ^3.0.2 to ^3.1.0

## [3.0.6](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v3.0.5...logger-v3.0.6) (2024-04-22)


### Bug Fixes

* bump pino from 8.19.0 to 8.20.0 ([2b9cf3d](https://github.com/Financial-Times/dotcom-reliability-kit/commit/2b9cf3d7af0a886db0e1daee78c80b078d08c07e))

## [3.0.5](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v3.0.4...logger-v3.0.5) (2024-03-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/serialize-error bumped from ^3.0.1 to ^3.0.2

## [3.0.4](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v3.0.3...logger-v3.0.4) (2024-02-19)


### Bug Fixes

* bump pino from 8.17.2 to 8.19.0 ([9c80a44](https://github.com/Financial-Times/dotcom-reliability-kit/commit/9c80a447b1a5c3e6820c03afb48ef68e2d1c728b))
* get the types working with most modules ([0323c02](https://github.com/Financial-Times/dotcom-reliability-kit/commit/0323c0236edabe72ef31c5e91dbb0dc76fce396a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^3.0.1 to ^3.0.2

## [3.0.3](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v3.0.2...logger-v3.0.3) (2024-01-22)


### Documentation Changes

* fix typo in Tranform -&gt; Transform ([dab3539](https://github.com/Financial-Times/dotcom-reliability-kit/commit/dab3539a13504b29600318c29119653485df66eb))

## [3.0.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v3.0.1...logger-v3.0.2) (2024-01-16)


### Bug Fixes

* switch back to using a pino-pretty transport ([3a90c1e](https://github.com/Financial-Times/dotcom-reliability-kit/commit/3a90c1efec01f4d8e7df7b934ce692785de241bd))

## [3.0.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v3.0.0...logger-v3.0.1) (2024-01-09)


### Bug Fixes

* add official support for npm 10 ([f7c4f2f](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f7c4f2f4c9358389be7bbcbd3609081eec2246b5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^3.0.0 to ^3.0.1
    * @dotcom-reliability-kit/serialize-error bumped from ^3.0.0 to ^3.0.1

## [3.0.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.4.2...logger-v3.0.0) (2024-01-08)


### ⚠ BREAKING CHANGES

* always log ISO datetime
* drop support for Node.js 16 and npm 7

### Bug Fixes

* bump pino from 8.17.1 to 8.17.2 ([fa74a45](https://github.com/Financial-Times/dotcom-reliability-kit/commit/fa74a450a0aa60d019ea32d8caba874a786c9c03))


### Documentation Changes

* add a missing table-of-contents link ([20fe3e9](https://github.com/Financial-Times/dotcom-reliability-kit/commit/20fe3e99db01132fdb40c57ad95785adb1e7a4a3))
* add migration guides for all packages ([f6233b8](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f6233b8ac802a32cad321e43b63420fe6fd979c0))
* replace node 16 references with node 18 ([8196a95](https://github.com/Financial-Times/dotcom-reliability-kit/commit/8196a954beebe89a720d3440041fd673e895c61b))


### Miscellaneous

* always log ISO datetime ([e12ab9a](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e12ab9a22d078e58e17b934eca3edb20d302d7ae))
* drop support for Node.js 16 and npm 7 ([016096e](https://github.com/Financial-Times/dotcom-reliability-kit/commit/016096eab022fa426159ec649a4e32c24eedd568))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^2.3.0 to ^3.0.0
    * @dotcom-reliability-kit/serialize-error bumped from ^2.2.1 to ^3.0.0

## [2.4.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.4.1...logger-v2.4.2) (2023-12-21)


### Bug Fixes

* bump pino from 8.16.2 to 8.17.1 ([433e70d](https://github.com/Financial-Times/dotcom-reliability-kit/commit/433e70d49bd4206b725b5d171ad325c86c8808cc))


### Documentation Changes

* fix the markdown note/warning blocks ([c7f69f2](https://github.com/Financial-Times/dotcom-reliability-kit/commit/c7f69f20a8b000f4a40c4cd25be23fcee2ecd85d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/serialize-error bumped from ^2.2.0 to ^2.2.1

## [2.4.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.4.0...logger-v2.4.1) (2023-12-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^2.2.0 to ^2.3.0

## [2.4.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.3.1...logger-v2.4.0) (2023-11-23)


### Features

* add useIsoTimeFormat option to format log timestamps ([d22e24a](https://github.com/Financial-Times/dotcom-reliability-kit/commit/d22e24a811e6bf4baef8adfcd8401330436a405f))

## [2.3.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.3.0...logger-v2.3.1) (2023-11-21)


### Bug Fixes

* bump pino from 8.15.1 to 8.16.2 ([c7a51d6](https://github.com/Financial-Times/dotcom-reliability-kit/commit/c7a51d6dbece443e5881f7a76f1aca521a4bc51c))
* switch to using streams for prettification ([7abae5a](https://github.com/Financial-Times/dotcom-reliability-kit/commit/7abae5a92a012b835a009e4df983bc401223e134))

## [2.3.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.2.10...logger-v2.3.0) (2023-11-15)


### Features

* add a fingerprint to serialized errors ([dab223f](https://github.com/Financial-Times/dotcom-reliability-kit/commit/dab223fb64a85d38561e1a4509bf508aac5e3e77))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/serialize-error bumped from ^2.1.0 to ^2.2.0

## [2.2.10](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.2.9...logger-v2.2.10) (2023-11-07)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^2.1.0 to ^2.2.0

## [2.2.9](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.2.8...logger-v2.2.9) (2023-09-19)


### Bug Fixes

* bump pino from 8.15.0 to 8.15.1 ([2f3bfcb](https://github.com/Financial-Times/dotcom-reliability-kit/commit/2f3bfcbdcd5a0e9c11013d47ec2424050a3923d3))


### Documentation Changes

* add a note on testing with Jest ([5a2d24c](https://github.com/Financial-Times/dotcom-reliability-kit/commit/5a2d24c78e1efe274b7f53d1877c8b386c91dbb5))

## [2.2.8](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.2.7...logger-v2.2.8) (2023-08-29)


### Bug Fixes

* bump pino from 8.14.1 to 8.15.0 ([05a11f8](https://github.com/Financial-Times/dotcom-reliability-kit/commit/05a11f85eaad1d33bd18a71ea4f453b15773da2a))

## [2.2.7](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.2.6...logger-v2.2.7) (2023-08-07)


### Bug Fixes

* correct types for the logger ([1158153](https://github.com/Financial-Times/dotcom-reliability-kit/commit/11581532a27543bd1031e218515c586c32f1dc44))

## [2.2.6](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.2.5...logger-v2.2.6) (2023-07-25)


### Bug Fixes

* allow log methods to be called without `this` ([28f3cd7](https://github.com/Financial-Times/dotcom-reliability-kit/commit/28f3cd7992b48a431de3123d8f71fb5b5745128f))

## [2.2.5](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.2.4...logger-v2.2.5) (2023-07-10)


### Bug Fixes

* address logging infinite recursion issue ([1eed362](https://github.com/Financial-Times/dotcom-reliability-kit/commit/1eed3620dd3674559bf61056f6f822abaa5f8993))
* properly clone error instances ([f73c985](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f73c985529dc3466c9f5f9abd61fb7493ce84c59))
* throw an error when log level is not a string ([b148699](https://github.com/Financial-Times/dotcom-reliability-kit/commit/b148699decd2c2a45adffe8c6c465b1046f22cdf))

## [2.2.4](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.2.3...logger-v2.2.4) (2023-06-23)


### Documentation Changes

* link to the CloudWatch documentation ([86d1a7a](https://github.com/Financial-Times/dotcom-reliability-kit/commit/86d1a7ae0dd4b75ea9d2de74dcdb6ae440d7c768))

## [2.2.3](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.2.2...logger-v2.2.3) (2023-05-15)


### Bug Fixes

* bump pino from 8.12.1 to 8.14.1 ([41060ff](https://github.com/Financial-Times/dotcom-reliability-kit/commit/41060ff6203abfc0c6153c7232b925a61880411b))

## [2.2.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.2.1...logger-v2.2.2) (2023-05-04)


### Bug Fixes

* widen the pino-pretty version range ([b28d25b](https://github.com/Financial-Times/dotcom-reliability-kit/commit/b28d25b9ed9f360b4129f4661894057cf58ac2a7))

## [2.2.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.2.0...logger-v2.2.1) (2023-05-04)


### Bug Fixes

* bump @ungap/structured-clone from 1.0.2 to 1.2.0 ([e9115b0](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e9115b0649c38cbb9cd33a2ba001d2965eed1adf))
* bump pino from 8.12.0 to 8.12.1 ([2dcafdd](https://github.com/Financial-Times/dotcom-reliability-kit/commit/2dcafddec62339952fcd5b5c11c52131afb1bf31))

## [2.2.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.1.0...logger-v2.2.0) (2023-05-03)


### Features

* allow disabling log prettification ([338b914](https://github.com/Financial-Times/dotcom-reliability-kit/commit/338b914842d582c0f9eb1cae1d8405a647dd1888))
* serialize errors passed to the logger as error objects ([15ad0ae](https://github.com/Financial-Times/dotcom-reliability-kit/commit/15ad0aec85e6d7a01446c88811558eea00ec9445))


### Bug Fixes

* bump pino from 8.11.0 to 8.12.0 ([df3aaa7](https://github.com/Financial-Times/dotcom-reliability-kit/commit/df3aaa74da412344c2f83fb943584b4bac79ada5))
* introduce pino-pretty as a peer dependency ([c5ea655](https://github.com/Financial-Times/dotcom-reliability-kit/commit/c5ea655fa35515923973cd3d86dcf936b5af2b0f))


### Documentation Changes

* clarified sub-property serilization explanation ([551ec8d](https://github.com/Financial-Times/dotcom-reliability-kit/commit/551ec8d13046acf5c273aae4b7d4f9bb0db00bc6))
* removed extra whitespace ([e3d4b21](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e3d4b21e74ca9b55b543a689b99ac2a17115488e))

## [2.1.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.0.1...logger-v2.1.0) (2023-05-02)


### Features

* add support for npm 9 ([a51cd4f](https://github.com/Financial-Times/dotcom-reliability-kit/commit/a51cd4fa717c4ec8b5057be694dc99d5459df7db))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^2.0.1 to ^2.1.0
    * @dotcom-reliability-kit/serialize-error bumped from ^2.0.1 to ^2.1.0

## [2.0.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v2.0.0...logger-v2.0.1) (2023-04-24)


### Bug Fixes

* start running builds on Node.js 20 ([62491a6](https://github.com/Financial-Times/dotcom-reliability-kit/commit/62491a60b07dfd044a90bb4adeece33c6be00c20))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^2.0.0 to ^2.0.1
    * @dotcom-reliability-kit/serialize-error bumped from ^2.0.0 to ^2.0.1

## [2.0.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v1.1.3...logger-v2.0.0) (2023-04-18)


### ⚠ BREAKING CHANGES

* drop support for Node.js 14

### Miscellaneous

* drop support for Node.js 14 ([e5d3920](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e5d392023e23b105049d8b09403b3db7699a37a1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^1.2.1 to ^2.0.0
    * @dotcom-reliability-kit/serialize-error bumped from ^1.1.4 to ^2.0.0

## [1.1.3](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v1.1.2...logger-v1.1.3) (2023-04-17)


### Documentation Changes

* add details on end-to-end tests ([3375171](https://github.com/Financial-Times/dotcom-reliability-kit/commit/3375171da18c7b0a1508ec38de397f7e5a3e5378))
* explain incompatibilities with proxy objects ([b968832](https://github.com/Financial-Times/dotcom-reliability-kit/commit/b96883237046fd23996a80e93086bf7b7180d749))

## [1.1.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v1.1.1...logger-v1.1.2) (2023-04-05)


### Bug Fixes

* correct manually published versions ([5a014f1](https://github.com/Financial-Times/dotcom-reliability-kit/commit/5a014f1b0b6b6ad741253d1215b630d418a196eb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^1.2.0 to ^1.2.1

## [1.1.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v1.1.0...logger-v1.1.1) (2023-04-04)


### Bug Fixes

* match n-logger's function serialization ([5f9b493](https://github.com/Financial-Times/dotcom-reliability-kit/commit/5f9b4930b3882512d88160f4a7156c9197aca3b8))


### Documentation Changes

* add a note on function serialization ([9997836](https://github.com/Financial-Times/dotcom-reliability-kit/commit/99978367eb7296dc695d45b80587f3e95f1c0fc5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^1.1.0 to ^1.2.0

## [1.1.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v1.0.3...logger-v1.1.0) (2023-04-03)


### Features

* allow for NODE_ENV that is not "production" or "development" ([b34a053](https://github.com/Financial-Times/dotcom-reliability-kit/commit/b34a05323c873b71b33376fdfb986f423a7f06ca))

## [1.0.3](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v1.0.2...logger-v1.0.3) (2023-03-10)


### Bug Fixes

* bump pino from 8.10.0 to 8.11.0 ([c5f1abb](https://github.com/Financial-Times/dotcom-reliability-kit/commit/c5f1abbbc6116eec8e4c3fcaed69414ac14b7bbc))

## [1.0.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v1.0.1...logger-v1.0.2) (2023-02-15)


### Bug Fixes

* bump @ungap/structured-clone from 1.0.1 to 1.0.2 ([c5a3628](https://github.com/Financial-Times/dotcom-reliability-kit/commit/c5a3628a8bfef8e28aa0d381aeed8e74fe530426))
* bump pino from 8.9.0 to 8.10.0 ([f1f8692](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f1f8692eabd541c9aa81eb99a3a1a59c8a1f362d))

## [1.0.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v1.0.0...logger-v1.0.1) (2023-02-07)


### Bug Fixes

* bump pino from 8.8.0 to 8.9.0 ([f877e27](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f877e271c78cb3a187b0b202f7719d4cf9e9a507))


### Documentation Changes

* fix typo in readme ([7753ac1](https://github.com/Financial-Times/dotcom-reliability-kit/commit/7753ac108eac995445eb14d29159829bf6c13b3f))

## [1.0.0](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v0.1.5...logger-v1.0.0) (2023-01-25)


### Features

* mark the logger package as stable ([57c5f65](https://github.com/Financial-Times/dotcom-reliability-kit/commit/57c5f65272692bf416c7f1777b240f2276e02e9d))

## [0.1.5](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v0.1.4...logger-v0.1.5) (2022-12-22)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @dotcom-reliability-kit/app-info bumped from ^1.0.3 to ^1.1.0

## [0.1.4](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v0.1.3...logger-v0.1.4) (2022-12-16)


### Bug Fixes

* bump pino from 8.7.0 to 8.8.0 ([d91e1e6](https://github.com/Financial-Times/dotcom-reliability-kit/commit/d91e1e614320dd29a1348dcd1d0968109ce48b95))

## [0.1.3](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v0.1.2...logger-v0.1.3) (2022-11-03)


### Bug Fixes

* add proper types for the default logger ([e9b8682](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e9b86825a21d64d42dfaf9c14c7480c73e870520))

## [0.1.2](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v0.1.1...logger-v0.1.2) (2022-10-28)


### Features

* add a mask transform ([e46c5b1](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e46c5b155345cbb8a78e853e37b889a5b0869e26))
* add prettification to logs in local dev ([f1ac445](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f1ac44583c1964380821cc0088daef407cbf9a5a))

## [0.1.1](https://github.com/Financial-Times/dotcom-reliability-kit/compare/logger-v0.1.0...logger-v0.1.1) (2022-10-26)


### Features

* add the ability to transform log data ([db3087b](https://github.com/Financial-Times/dotcom-reliability-kit/commit/db3087becd29339f34982cb2205cae0a7f725dd0))

## 0.1.0 (2022-10-25)


### Features

* add an experimental logger package ([c5cef3d](https://github.com/Financial-Times/dotcom-reliability-kit/commit/c5cef3d09f42d21d168a956fd13568e173f38b6c))


### Bug Fixes

* bump pino from 8.6.1 to 8.7.0 ([914d13e](https://github.com/Financial-Times/dotcom-reliability-kit/commit/914d13ec063d433ddb7dbde3356b7b0c5d7a9b14))


### Documentation Changes

* document how log data is serialized ([f43d24a](https://github.com/Financial-Times/dotcom-reliability-kit/commit/f43d24a099ce336eabe285699549ec5c90e7fa83))
* remove an example we don't want to be copied ([e2cb01b](https://github.com/Financial-Times/dotcom-reliability-kit/commit/e2cb01b1c285167d646e57d84f124ac4d1d826dc))
