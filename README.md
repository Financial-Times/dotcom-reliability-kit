
<h1 align="center">
    <img alt="FT.com Reliability Kit" width="400" src="https://raw.githubusercontent.com/Financial-Times/dotcom-reliability-kit/main/resources/logos/src/reliability-kit-color.svg" />
</h1>

Reliability Kit is a well tested suite of tools designed to help FT.com applications be more reliable and measurable.

## Usage guide

We maintain documentation in this repo:

  * **The [getting started guide](./docs/getting-started/#readme)** is the best place to begin, it guides you through good error handling practices and how you can use Reliability Kit to improve your app's error handling

  * **The package README files** in this monorepo contain technical documentation. They can be found in the [`packages` folder](./packages/). A brief outline of what each package does is listed here:

    * **[@dotcom-reliability-kit/app-info](./packages/app-info/#readme):**<br/>
      A utility to get application information (e.g. the system code) in a consistent way

    * **[@dotcom-reliability-kit/crash-handler](./packages/crash-handler/#readme):**<br/>
      A method to bind an uncaught exception handler to ensure that fatal application errors are logged. It is a replacement for Sentry fatal error logging.

    * **[@dotcom-reliability-kit/errors](./packages/errors/#readme):**<br/>
      A suite of error classes which help you throw the most appropriate error in any situation

    * **[@dotcom-reliability-kit/log-error](./packages/log-error/#readme):**<br/>
      A method to consistently log error object with optional request information

    * **[@dotcom-reliability-kit/logger](./packages/logger/#readme):**<br/>
      A simple and fast logger based on [Pino](https://getpino.io/), with FT preferences baked in

    * **[@dotcom-reliability-kit/middleware-log-errors](./packages/middleware-log-errors/#readme):**<br/>
      Express middleware to consistently log errors

    * **[@dotcom-reliability-kit/middleware-render-error-info](./packages/middleware-render-error-info/#readme):**<br/>
      Express middleware to render error information in a browser in a way that makes local debugging easier

    * **[@dotcom-reliability-kit/serialize-error](./packages/serialize-error/#readme):**<br/>
      A utility function to serialize an error object in a way that's friendly to loggers, view engines, and converting to JSON

    * **[@dotcom-reliability-kit/serialize-request](./packages/serialize-request/#readme):**<br/>
      A utility function to serialize a request object in a way that's friendly to loggers, view engines, and converting to JSON

  * **Example projects** illustrate more real-world examples of how to use Reliability Kit. These live in separate repositories:

    * **[Express example](https://github.com/Financial-Times/reliability-kit-example-express#readme):**<br/>
      An example of how to use Reliability Kit with an [Express](https://expressjs.com/)-based application

    * **[Serverless example](https://github.com/Financial-Times/reliability-kit-example-serverless#readme):**<br/>
      An example of how to use Reliability Kit with a [Serverless](https://www.serverless.com/) application

## Design

To understand the design decisions we made when building this project, [read the design guide here](docs/design.md).


## Contributing

[The contributing guide is available here](docs/contributing.md). You can find a [roadmap with planned work here](https://github.com/orgs/Financial-Times/projects/111).


## Support

[The support that we aim to offer is available here](docs/support.md).


## License

Licensed under the [MIT](LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
