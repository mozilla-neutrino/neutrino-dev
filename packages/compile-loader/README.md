# Neutrino Compile Loader Middleware

`@neutrinojs/compile-loader` is Neutrino middleware for compiling source code
with Babel.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Requirements

- Node.js 10+
- Yarn v1.2.1+, or npm v5.4+
- neutrino 10
- webpack 5

## Installation

`@neutrinojs/compile-loader` can be installed via the Yarn or npm clients.

#### Yarn

```bash
❯ yarn add --dev @neutrinojs/compile-loader
```

#### npm

```bash
❯ npm install --save-dev @neutrinojs/compile-loader
```

## Usage

`@neutrinojs/compile-loader` can be consumed from the Neutrino API, middleware,
or presets. Require this package and plug it into Neutrino:

```js
const compileLoader = require('@neutrinojs/compile-loader');

neutrino.use(
  compileLoader({
    test: neutrino.regexFromExtensions(),
    include: [],
    exclude: [],
    babel: {},
    ruleId: 'compile',
    useId: 'babel',
  }),
);
```

```js
// Using in .neutrinorc.js
const compileLoader = require('@neutrinojs/compile-loader');

module.exports = {
  use: [
    compileLoader({
      test: neutrino.regexFromExtensions(),
      include: [],
      exclude: [],
      babel: {},
      ruleId: 'compile',
      useId: 'babel',
    }),
  ],
};
```

- `include` should be an array of paths to include in the compilation. Maps to
  webpack's
  [`Rule.include`](https://webpack.js.org/configuration/module/#rule-include)
- `exclude` should be an array of paths to exclude from the compilation. Maps to
  webpack's
  [`Rule.exclude`](https://webpack.js.org/configuration/module/#rule-exclude)
- `babel` is a [Babel configuration object](https://babeljs.io/docs/en/options),
  consumed by babel-loader. Use this to set properties such as `presets`,
  `plugins`, and `env`.
- `ruleId` is the identifier to the compiler loader rule. Override this to add
  an additional compile-loader instance
- `useId` is the identifier for the babel loader. Override this to change the
  identifier.

## Merging Babel Configuration

To correctly merge Babel configurations use the
[babel-merge](https://www.npmjs.com/package/babel-merge) package.

```js
const babelMerge = require('babel-merge');

const together = babelMerge(
  {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['latest 1 Chrome'],
          },
        },
      ],
    ],
  },
  {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['latest 1 Firefox'],
          },
        },
      ],
    ],
  },
);

console.log(together);

// Logs:
{
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['latest 1 Chrome', 'latest 1 Firefox'],
        },
      },
    ],
  ];
}
```

### Advanced merging

Should you need to do merging of Babel configuration that is more advanced than
this, such as re-ordering the options, you will need to `tap` into the existing
Babel options to do so. This still involves using `babel-merge`.

_Example: enable current decorator syntax in the compile loader:_

```js
const babelMerge = require('babel-merge');

// Decorators generally need to be enabled *before* other
// syntax which exists in both normal plugins, and
// development environment plugins.
// Tap into the existing Babel options and merge our
// decorator options *before* the rest of the existing
// Babel options
config.module
  .rule('compile')
  .use('babel')
  .tap((options) =>
    babelMerge(
      {
        plugins: [
          require.resolve('@babel/plugin-proposal-decorators'),
          require.resolve('@babel/plugin-proposal-class-properties'),
        ],
      },
      options,
    ),
  );
```

### Compiling node_modules

Neutrino does not compile `node_modules` by default, since packages should be
compiling down to ES5 themselves (even when using the `module` property in
`package.json`) to maximize ecosystem compatibility. If you encounter packages
that need to be compiled from `node_modules`, you can write an override after
the inclusion of `compile-loader` or a dependent preset:

_Example: compile `node_modules` after including React preset._

```js
// .neutrinorc.js
const react = require('@neutrinojs/react');
const { join } = require('path');

module.exports = {
  use: [
    react(),
    (neutrino) => {
      neutrino.config.module
        .rule('compile')
        .include.add(join(__dirname, 'node_modules'));
    },
  ],
};
```

## babel.config.js

Should you wish to use the Babel configuration outside of webpack, create a
`babel.config.js` file in the root of the project, containing the following:

```js
const neutrino = require('neutrino');

module.exports = neutrino().babel();
```

## Customization

`@neutrinojs/compile-loader` creates some conventions to make overriding the
configuration easier once you are ready to make changes.

### Rules

The following is a list of rules and their identifiers which can be overridden:

| Name      | Description                                                                                             | NODE_ENV |
| --------- | ------------------------------------------------------------------------------------------------------- | -------- |
| `compile` | Compiles JS and JSX files from the `src` directory using Babel. Contains a single loader named `babel`. | all      |

## Contributing

This middleware is part of the
[neutrino](https://github.com/neutrinojs/neutrino) repository, a monorepo
containing all resources for developing Neutrino and its core presets and
middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/compile-loader.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/compile-loader.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/compile-loader
