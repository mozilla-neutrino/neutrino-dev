# Neutrino Banner Middleware

`@neutrinojs/banner` is Neutrino middleware for injecting string content into
source code files.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Requirements

- Node.js 10+
- Yarn v1.2.1+, or npm v5.4+
- neutrino 10
- webpack 5

## Installation

`@neutrinojs/banner` can be installed via the Yarn or npm clients.

#### Yarn

```bash
❯ yarn add --dev @neutrinojs/banner
```

#### npm

```bash
❯ npm install --save-dev @neutrinojs/banner
```

## Usage

`@neutrinojs/banner` can be consumed from the Neutrino API, middleware, or
presets. Require this package and plug it into Neutrino:

```js
const banner = require('@neutrinojs/banner');

// Use with default options
neutrino.use(banner());

// Also accepts options for webpack's BannerPlugin
// https://webpack.js.org/plugins/banner-plugin/

// Usage shows the default values of this middleware:
neutrino.use(
  banner({
    banner: `require('source-map-support').install();`,
    test: neutrino.regexFromExtensions(),
    raw: true,
    entryOnly: true,
    // Override pluginId to add an additional banner plugin instance
    pluginId: 'banner',
  }),
);
```

```js
// Using in .neutrinorc.js
const banner = require('@neutrinojs/banner');

// Use with default options
module.exports = {
  use: [banner()],
};

// Also accepts options for webpack's BannerPlugin
// https://webpack.js.org/plugins/banner-plugin/

// Usage shows the default values of this middleware:
module.exports = {
  use: [
    banner({
      banner: `require('source-map-support').install();`,
      test: neutrino.regexFromExtensions(),
      raw: true,
      entryOnly: true,
      // Override pluginId to add an additional banner plugin instance
      pluginId: 'banner',
    }),
  ],
};
```

## Customization

`@neutrinojs/banner` creates some conventions to make overriding the
configuration easier once you are ready to make changes.

### Plugins

The following is a list of plugins and their identifiers which can be
overridden:

| Name     | Description                                          | NODE_ENV |
| -------- | ---------------------------------------------------- | -------- |
| `banner` | Injects string content into application source code. | all      |

## Contributing

This middleware is part of the
[neutrino](https://github.com/neutrinojs/neutrino) repository, a monorepo
containing all resources for developing Neutrino and its core presets and
middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/banner.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/banner.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/banner
