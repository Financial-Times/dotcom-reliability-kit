
## @dotcom-reliability-kit/app-info

A utility to get application information (e.g. the system code) in a consistent way. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [`appInfo.commitHash`](#appinfocommithash)
    * [`appInfo.environment`](#appinfoenvironment)
    * [`appInfo.region`](#appinforegion)
    * [`appInfo.releaseDate`](#appinforeleasedate)
    * [`appInfo.releaseVersion`](#appinforeleaseversion)
    * [`appInfo.systemCode`](#appinfosystemcode)
    * [`appInfo.processType`](#appinfoprocesstype)
  * [Contributing](#contributing)
  * [License](#license)


## Usage

Install `@dotcom-reliability-kit/app-info` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/app-info
```

Include in your code:

```js
import appInfo from '@dotcom-reliability-kit/app-info';
// or
const appInfo = require('@dotcom-reliability-kit/app-info');
```

The `appInfo` object has several properties which can be used to access application information.

### `appInfo.commitHash`

Get the commit hash that the application last deployed. This will be a string (if `process.env.HEROKU_SLUG_COMMIT`, `process.env.GIT_COMMIT_LONG`, or `process.env.GIT_COMMIT` is defined) or `null` otherwise.

For Heroku, this relies on the [Dyno Metadata labs feature](https://devcenter.heroku.com/articles/dyno-metadata) and will not be present in local development.

For AWS Lambda, you can use a plugin like [serverless-plugin-git-variables](https://www.npmjs.com/package/serverless-plugin-git-variables) to provide this data or set the `GIT_COMMIT` environment variable during deployment.

### `appInfo.environment`

Get the application environment, normally either `development` or `production`. This will be a string, using `process.env.NODE_ENV` and defaulting to `development`.

### `appInfo.region`

Get the region that the application is running in. This will be a string (if `process.env.REGION` or `process.env.AWS_REGION` is defined) or `null` otherwise.

### `appInfo.releaseDate`

Get the application Heroku release date. This will be a string (if `process.env.HEROKU_RELEASE_CREATED_AT` is defined) or `null` otherwise.

For Heroku, this relies on the [Dyno Metadata labs feature](https://devcenter.heroku.com/articles/dyno-metadata) and will not be present in local development.

### `appInfo.releaseVersion`

Get the application Heroku release version. This will be a string (if `process.env.HEROKU_RELEASE_VERSION` or `process.env.AWS_LAMBDA_FUNCTION_VERSION` is defined) or `null` otherwise.

For Heroku, this relies on the [Dyno Metadata labs feature](https://devcenter.heroku.com/articles/dyno-metadata) and will not be present in local development.

### `appInfo.systemCode`

Get the application's [Biz Ops](https://biz-ops.in.ft.com/) system code. This will be a string (if `process.env.SYSTEM_CODE` is defined), if not then it will be read from the `name` property of `$CWD/package.json`, if neither of these exist then it will be set to `null`.

If the system code is read from the application's `package.json` file then it will be stripped of any `"ft-"` prefix – this is a legacy name and our app system codes do not begin with it.

### `appInfo.processType`

Get the type of the running process, which is the name for the current process within an application.

For AWS Lambda, this is the name of the function, read from `process.env.AWS_LAMBDA_FUNCTION_NAME`.

For Heroku, this is derived from the first part of `process.env.DYNO`, which is set to by Heroku, e.g. a dyno called `web.1` will have `processType` set to `web`. The process types in an application are defined by the application's `Procfile`.

If neither `process.env.AWS_LAMBDA_FUNCTION_NAME` or `process.env.DYNO` are set, this property will be `null`

## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
