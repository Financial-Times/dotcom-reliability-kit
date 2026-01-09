
# @dotcom-reliability-kit/biome-config

A [Biome](https://biomejs.dev/) configuration focused on resolving code quality and reliability issues without making any code style decisions. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

* [Usage](#usage)
* [Contributing](#contributing)
* [License](#license)


## Usage

Install `@dotcom-reliability-kit/biome-config` as a development dependency as well as Biome itself:

```sh
npm install --save-dev @biomejs/biome @dotcom-reliability-kit/biome-config
```

Reference the shared configuration in your repository's own `biome.json` file:

```json
{
    "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
    "extends": ["./node_modules/@dotcom-reliability-kit/biome-config/config.json"]
}
```


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2026, The Financial Times Ltd.
