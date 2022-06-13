// IMPORTANT: This app isn't an example of how to correctly
// set up a Financial Times Express application – it's used
// to illustrate how to integrate Reliability Kit into an
// express app with as little boilerplate code as possible.

const app = require('./app');
app.listen(Number(process.env.PORT) || 3000);
