# Neutrino Plug'n'Play Middleware

`@neutrinojs/pnp` is Neutrino middleware for Plug'n'Play support.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Requirements

- Node.js 10+
- Yarn v1.2.1+, or npm v5.4+
- Neutrino 9
- Webpack 4

## Installation

`@neutrinojs/pnp` can be installed via the Yarn or npm clients.

#### Yarn

```bash
❯ yarn add --dev @neutrinojs/pnp
```

#### npm

```bash
❯ npm install --save-dev @neutrinojs/pnp
```

## Usage

`@neutrinojs/pnp` can be consumed from the Neutrino API, middleware, or presets.
Require this package and plug it into Neutrino:

```js
const pnp = require('@neutrinojs/pnp');

// Use with default options
neutrino.use(pnp());

// Usage shows the default values of this middleware:
neutrino.use(pnp({ pluginId: 'pnp' }));
```

```js
// Using in .neutrinorc.js
const pnp = require('@neutrinojs/pnp');

// Use with default options
module.exports = {
  use: [pnp()],
};

// Usage shows the default values of this middleware:
module.exports = {
  use: [pnp({ pluginId: 'pnp' })],
};
```

- `pluginId`: The plugin identifier. Override this to add an additional copy
  plugin instance.

## Customization

`@neutrinojs/pnp` creates some conventions to make overriding the configuration
easier once you are ready to make changes.

### Plugins

The following is a list of plugins and their identifiers which can be
overridden:

| Name  | Description                                               | NODE_ENV |
| ----- | --------------------------------------------------------- | -------- |
| `pnp` | Resolve modules considering Plug and Play feature of Yarn | all      |

## Contributing

This middleware is part of the
[neutrino](https://github.com/neutrinojs/neutrino) repository, a monorepo
containing all resources for developing Neutrino and its core presets and
middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/pnp.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/pnp.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/pnp
