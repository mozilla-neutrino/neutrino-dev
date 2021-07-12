# Neutrino Style Minify Middleware

`@neutrinojs/style-minify` is Neutrino middleware for minifying styles using
[`OptimizeCssAssetsPlugin`](https://www.npmjs.com/package/optimize-css-assets-webpack-plugin).
This middleware is usually only added during production builds.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Requirements

- Node.js 10+
- Yarn v1.2.1+, or npm v5.4+
- neutrino 10
- webpack 5

## Installation

`@neutrinojs/style-minify` can be installed via the Yarn or npm clients.

#### Yarn

```bash
❯ yarn add --dev @neutrinojs/style-minify
```

#### npm

```bash
❯ npm install --save-dev @neutrinojs/style-minify
```

## Usage

`@neutrinojs/style-minify` can be consumed from the Neutrino API, middleware, or
presets. Require this package and plug it into Neutrino:

```js
const styleMinify = require('@neutrinojs/style-minify');

// Use with default options
neutrino.use(styleMinify());

// Usage showing overriding options
neutrino.use(
  styleMinify({
    pluginId: 'optimize-css',
    plugin: {
      assetNameRegExp: /\.css$/g,
      cssProcessorOptions: {},
      canPrint: true,
    },
  }),
);
```

```js
// Using in .neutrinorc.js
const styleMinify = require('@neutrinojs/style-minify');

// Use with default options
module.exports = {
  use: [styleMinify()],
};

// Usage showing overriding options
module.exports = {
  use: [
    styleMinify({
      pluginId: 'optimize-css',
      plugin: {
        assetNameRegExp: /\.css$/g,
        cssProcessorOptions: {},
        canPrint: true,
      },
    }),
  ],
};
```

The `plugin` property is passed to
[optimize-css-assets-webpack-plugin](https://github.com/NMFR/optimize-css-assets-webpack-plugin#configuration).

## Customization

`@neutrinojs/style-minify` creates some conventions to make overriding the
configuration easier once you are ready to make changes.

### Plugins

The following is a list of plugins and their identifiers which can be
overridden:

| Name           | Description                                   | NODE_ENV |
| -------------- | --------------------------------------------- | -------- |
| `optimize-css` | Minifies css using `OptimizeCssAssetsPlugin`. | all      |

## Contributing

This middleware is part of the
[neutrino](https://github.com/neutrinojs/neutrino) repository, a monorepo
containing all resources for developing Neutrino and its core presets and
middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/style-minify.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/style-minify.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/style-minify
