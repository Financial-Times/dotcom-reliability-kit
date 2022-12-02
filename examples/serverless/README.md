
## Reliability Kit Serverless Example

Reliability Kit works in a serverless context like AWS Lambda.

While our middlewares are designed for Express applications (which will generally have a long-lived process), the error classes that we provide are useful in almost any situation, including serverless.

This is a [Serverless framework](https://www.serverless.com) application which includes [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

The code for this example app is in [`handler.js`](./handler.js). It's important to remember that this app isn't an example of how to correctly set up a Financial Times serverless application – it's used to illustrate how to integrate Reliability Kit into an app with as little boilerplate code as possible.

You can invoke the Lambda with:

```
npm run invoke
```

or from the root of this repo with:

```
npm run -w examples/serverless invoke
```

## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
