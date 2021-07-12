# Neutrino Clean Middleware

`@neutrinojs/clean` is Neutrino middleware for removing or cleaning build
directories.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

By default, this plugin will remove all files inside webpack's `output.path`
directory, as well as all unused webpack assets after every successful rebuild.

## Requirements

- Node.js 10+
- Yarn v1.2.1+, or npm v5.4+
- neutrino 10
- webpack 5

## Installation

`@neutrinojs/clean` can be installed via the Yarn or npm clients.

#### Yarn

```bash
❯ yarn add --dev @neutrinojs/clean
```

#### npm

```bash
❯ npm install --save-dev @neutrinojs/clean
```

## Usage

`@neutrinojs/clean` can be consumed from the Neutrino API, middleware, or
presets. Require this package and plug it into Neutrino:

```js
const clean = require('@neutrinojs/clean');

// Use with default options
neutrino.use(clean());

// Usage shows the default values of this middleware:
neutrino.use(
  clean({
    verbose: neutrino.options.debug,
    // Override pluginId to add an additional clean plugin instance
    pluginId: 'clean',
  }),
);
```

```js
// Using in .neutrinorc.js
const clean = require('@neutrinojs/clean');

// Use with default options
module.exports = {
  use: [clean()],
};

// Usage shows the default values of this middleware:
module.exports = {
  use: [
    clean({
      verbose: neutrino.options.debug,
      // Override pluginId to add an additional banner plugin instance
      pluginId: 'clean',
    }),
  ],
};
```

Additional options can be specified to control the behavior of the underlying
`clean-webpack-plugin`. See
[`CleanWebpackPlugin`'s documentation](https://github.com/johnagan/clean-webpack-plugin)
for available options.

## Clean external directories

Pass the `dangerouslyAllowCleanPatternsOutsideProject: true` option to remove
directories outside of the project root. This is disabled by default to prevent
deletion of unintended directories.

```js
module.exports = {
  use: [
    clean({
      dangerouslyAllowCleanPatternsOutsideProject: true,
    }),
  ],
};
```

## Customization

`@neutrinojs/clean` creates some conventions to make overriding the
configuration easier once you are ready to make changes.

### Plugins

The following is a list of plugins and their identifiers which can be
overridden:

| Name    | Description                          | NODE_ENV |
| ------- | ------------------------------------ | -------- |
| `clean` | Removes directories before building. | all      |

## Contributing

This middleware is part of the
[neutrino](https://github.com/neutrinojs/neutrino) repository, a monorepo
containing all resources for developing Neutrino and its core presets and
middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/clean.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/clean.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/clean
