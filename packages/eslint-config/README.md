# @dotcom-reliability-kit/eslint-config

A linting config, specifically focussed on enhancing code quality and proactively catching errors/bugs before they make it into production. This is not a replacement for the [@financial-times/eslint-config-next](https://github.com/Financial-Times/eslint-config-next), but it can be installed alongside it or as an extension in it's config. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

- [Usage](#usage)
  - [Static Code Analysis](#static-code-analysis)
- [Migrating](#migrating)
- [Contributing](#contributing)
- [License](#license)

## Usage

Install @dotcom-reliability-kit/eslint-config as a development dependency:

```
npm install --save-dev @dotcom-reliability-kit/eslint-config
```

Reference the shared configuration in your repository's own .eslintrc.js like so:

```
module.exports = {
extends: ['@dotcom-reliability-kit/eslint-config']
}
```

> [!TIP]
> If you're using this package with TypeScript, we recommend using the following settings in your `tsconfig.json` file to avoid type errors:
>
> ```json
> {
>     "esModuleInterop": true,
>     "module": "nodenext",
>     "moduleResolution": "nodenext"
> }
> ```

Avoid using .eslintrc file format (without a file extension), as [this has been depracated](https://eslint.org/docs/latest/use/configure/configuration-files#configuration-file-formats).

### Static Code Analysis

Add the following command to the `scripts` object in your repository's package.json:

```
"lint:js": "eslint ."
```

Run that command in your terminal to lint your files (either cd into the relevant directory or run from root). Any linting errors found by the config will be displayed in your terminal, with helpful suggestions on how to resolve them.


## Migrating

Consult the [Migration Guide](./docs/migration.md) if you're trying to migrate to a later major version of this package.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).

## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.

Copyright © 2023, The Financial Times Ltd.
