# Neutrino Dev Server Middleware

`@neutrinojs/dev-server` is Neutrino middleware for starting a webpack Dev
Server for fast development cycles.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Requirements

- Node.js 10+
- Yarn v1.2.1+, or npm v5.4+
- neutrino 10
- webpack 5
- webpack-dev-server 3

## Installation

`@neutrinojs/dev-server` can be installed via the Yarn or npm clients.

#### Yarn

```bash
❯ yarn add --dev @neutrinojs/dev-server
```

#### npm

```bash
❯ npm install --save-dev @neutrinojs/dev-server
```

## Usage

`@neutrinojs/dev-server` can be consumed from the Neutrino API, middleware, or
presets. Require this package and plug it into Neutrino:

```js
const devServer = require('@neutrinojs/dev-server');

// Usage with default options
neutrino.use(devServer());

// Usage with custom options (default options are shown)
neutrino.use(
  devServer({
    port: 5000,
    hot: true,
    // Redirect 404s to index.html, so that apps that use the HTML 5 History API work.
    historyApiFallback: true,
    // Only display compile duration and errors/warnings, to reduce noise when rebuilding.
    stats: {
      all: false,
      errors: true,
      timings: true,
      warnings: true,
    },
  }),
);
```

```js
// Using in .neutrinorc.js
const devServer = require('@neutrinojs/dev-server');

// Usage with default options
module.exports = {
  use: [devServer()],
};

// Usage with custom options (default options are shown)
module.exports = {
  use: [
    devServer({
      port: 5000,
      hot: true,
      // Redirect 404s to index.html, so that apps that use the HTML 5 History API work.
      historyApiFallback: true,
      // Only display compile duration and errors/warnings, to reduce noise when rebuilding.
      stats: {
        all: false,
        errors: true,
        timings: true,
        warnings: true,
      },
    }),
  ],
};
```

By default this middleware will start a development server with Hot Module
Replacement support on `http://localhost:5000`. To enable HMR with your
application, read the documentation of corresponding Neutrino preset or
middleware.

## Middleware options

`@neutrinojs/dev-server` optionally accepts an object with several options to
override the default behavior. This object, as seen used above, can accept any
[property that is accepted by webpack Dev Server](https://webpack.js.org/configuration/dev-server/).

## Contributing

This middleware is part of the
[neutrino](https://github.com/neutrinojs/neutrino) repository, a monorepo
containing all resources for developing Neutrino and its core presets and
middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/dev-server.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/dev-server.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/dev-server
