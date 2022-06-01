
<h1 align="center">:rock: FT.com Reliability Kit</h1>

Reliability Kit is a well tested suite of tools designed to help FT.com applications be more reliable and measurable.

**:warning: The packages in this repo are a work in progress and will likely change a lot before being considered stable.**

## Usage guide

We maintain documentation in this repo:

  * **The [getting started guide](./docs/getting-started/#readme)** is the best place to begin, it guides you through good error handling practices and how you can use Reliability Kit to improve your app's error handling

  * **The package README files** in this monorepo contain technical documentation. They can be found in the [`packages` folder](./packages/). A brief outline of what each package does is listed here:

    * **[@dotcom-reliability-kit/errors](./packages/errors/#readme):**<br/>
      A suite of error classes which help you throw the most appropriate error in any situation

    * **[@dotcom-reliability-kit/log-error](./packages/log-error/#readme):**<br/>
      A method to consistently log error object with optional request information

    * **[@dotcom-reliability-kit/middleware-log-errors](./packages/middleware-log-errors/#readme):**<br/>
      Express middleware to consistently log errors

    * **[@dotcom-reliability-kit/serialize-error](./packages/serialize-error/#readme):**<br/>
      A utility function to serialize an error object in a way that's friendly to loggers, view engines, and converting to JSON

    * **[@dotcom-reliability-kit/serialize-request](./packages/serialize-request/#readme):**<br/>
      A utility function to serialize a request object in a way that's friendly to loggers, view engines, and converting to JSON


## Design

To understand the design decisions we made when building this project, [read the design guide here](docs/design.md).


## Contributing

[The contributing guide is available here](docs/contributing.md).


## License

This library is intended for use by engineers in Customer Products, a group of engineers at The Financial Times. We don't actively support use of this library outside of Customer Products.

Licensed under the [MIT](LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
