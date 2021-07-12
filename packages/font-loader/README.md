# Neutrino Font Loader Middleware

`@neutrinojs/font-loader` is Neutrino middleware for loading and importing font
files from modules.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Requirements

- Node.js 10+
- Yarn v1.2.1+, or npm v5.4+
- neutrino 10
- webpack 5

## Installation

`@neutrinojs/font-loader` can be installed via the Yarn or npm clients.

#### Yarn

```bash
❯ yarn add --dev @neutrinojs/font-loader
```

#### npm

```bash
❯ npm install --save-dev @neutrinojs/font-loader
```

## Usage

`@neutrinojs/font-loader` can be consumed from the Neutrino API, middleware, or
presets. Require this package and plug it into Neutrino:

```js
const fonts = require('@neutrinojs/font-loader');

// Use with default options
neutrino.use(fonts());

// Usage showing default options
neutrino.use(
  fonts({
    name:
      process.env.NODE_ENV === 'production'
        ? 'assets/[name].[hash:8].[ext]'
        : 'assets/[name].[ext]',
  }),
);
```

```js
// Using in .neutrinorc.js
const fonts = require('@neutrinojs/font-loader');

// Use with default options
module.exports = {
  use: [fonts()],
};

// Usage showing default options
module.exports = {
  use: [
    fonts({
      name:
        process.env.NODE_ENV === 'production'
          ? 'assets/[name].[hash:8].[ext]'
          : 'assets/[name].[ext]',
    }),
  ],
};
```

- `name`: The template used by `file-loader` to determine the output filename.

## Customization

`@neutrinojs/font-loader` creates some conventions to make overriding the
configuration easier once you are ready to make changes.

### Rules

The following is a list of rules and their identifiers which can be overridden:

| Name   | Description                                                                                               | NODE_ENV |
| ------ | --------------------------------------------------------------------------------------------------------- | -------- |
| `font` | Allows importing EOT, TTF, WOFF and WOFF2 font files from modules. Contains a single loader named `file`. | all      |

## Contributing

This middleware is part of the
[neutrino](https://github.com/neutrinojs/neutrino) repository, a monorepo
containing all resources for developing Neutrino and its core presets and
middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/font-loader.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/font-loader.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/font-loader
