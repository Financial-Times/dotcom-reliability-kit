
## @dotcom-reliability-kit/middleware-render-error-info

Express middleware to render error information in a browser in a way that makes local debugging easier. This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
    * [`renderErrorInfoPage`](#rendererrorinfopage)
  * [Contributing](#contributing)
  * [License](#license)


## Usage

Install `@dotcom-reliability-kit/middleware-render-error-info` as a dependency:

```bash
npm install --save @dotcom-reliability-kit/middleware-render-error-info
```

Include in your code:

```js
import renderErrorInfoPage from '@dotcom-reliability-kit/middleware-render-error-info';
// or
const renderErrorInfoPage = require('@dotcom-reliability-kit/middleware-render-error-info');
```

### `renderErrorInfoPage`

The `renderErrorInfoPage` function can be used to generate Express middleware which renders an error debugging page. The error page will only ever display in a non-production environment, that is when the `NODE_ENV` environment variable is either **empty** or set to **`"development"`**.

> **Warning**
> This middleware **must** be added to your Express app _after_ all your application routes – you won't get rendered errors for any routes which are mounted after this middleware.

```js
const app = express();
// App routes go here
app.use(renderErrorInfoPage());
```

> **Note**
> If you're using [@dotcom-reliability-kit/middleware-log-errors](https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/middleware-log-errors#readme) in your app, it's best to mount the error page middleware _after_ the logging middleware. Otherwise the error will never be logged in local development, which may cause some confusion.

Once you've mounted the middleware, if you're working locally you should now see a detailed error page when you encounter an error in your app (assuming you're [relying on the Express error handler to serve errors](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/getting-started/handling-errors.md#bubbling-up-in-express)):

![Reliability Kit Error Info Page](https://user-images.githubusercontent.com/138944/183625949-fff25554-5c7e-4616-b717-963d472e5d35.png)


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md).


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
