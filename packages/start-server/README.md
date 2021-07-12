# Neutrino Start Server Middleware

`@neutrinojs/start-server` is Neutrino middleware for starting a Node.js server
for a file upon completion of a build.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Requirements

- Node.js 10+
- Yarn v1.2.1+, or npm v5.4+
- neutrino 10
- webpack 5

## Installation

`@neutrinojs/start-server` can be installed via the Yarn or npm clients.

#### Yarn

```bash
❯ yarn add --dev @neutrinojs/start-server
```

#### npm

```bash
❯ npm install --save-dev @neutrinojs/start-server
```

## Usage

`@neutrinojs/start-server` can be consumed from the Neutrino API, middleware, or
presets. Require this package and plug it into Neutrino:

```js
const startServer = require('@neutrinojs/start-server');

// Use with default options, starting the server
// for the main entry point, defaults to neutrino.options.mains.index
neutrino.use(startServer());

// Usage with custom server file to start
neutrino.use(
  startServer({
    name: 'custom.js',
    // Override pluginId to add an additional start-server plugin instance
    pluginId: 'start-server',
  }),
);
```

```js
// Using in .neutrinorc.js
const startServer = require('@neutrinojs/start-server');

// Use with default options, starting the server
// for the main entry point, defaults to neutrino.options.mains.index
module.exports = {
  use: [startServer()],
};

// Usage with custom server file to start
module.exports = {
  use: [
    startServer({
      name: 'custom.js',
      // Override pluginId to add an additional start-server plugin instance
      pluginId: 'start-server',
    }),
  ],
};
```

By default this middleware will start a server with the first main entry point
configured in Neutrino, by default `src/index`. This middleware optionally
accepts an object with a `name` property for a path to a module which to start
the server.

## Customization

`@neutrinojs/start-server` creates some conventions to make overriding the
configuration easier once you are ready to make changes.

### Plugins

The following is a list of plugins and their identifiers which can be
overridden:

| Name           | Description                                                                  | NODE_ENV |
| -------------- | ---------------------------------------------------------------------------- | -------- |
| `start-server` | Start a Node.js for the first configured main entry point or specified file. | all      |

### Debugging

You can start the Node.js server in `inspect` mode to debug the process by
setting `neutrino.options.debug` to `true`.

## Contributing

This middleware is part of the
[neutrino](https://github.com/neutrinojs/neutrino) repository, a monorepo
containing all resources for developing Neutrino and its core presets and
middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/start-server.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/start-server.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/start-server
