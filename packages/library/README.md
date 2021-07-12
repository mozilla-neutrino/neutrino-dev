# Neutrino Library Preset

`@neutrinojs/library` is a Neutrino preset that supports creating JS libraries
for Web or Node.js targets.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Features

- Zero upfront configuration necessary to start developing and building a
  JavaScript library
- Modern Babel compilation supporting ES modules, async functions, and dynamic
  imports
- Compiles to ES5 to support major browsers, publishing to npm, and library
  interoperability
- Defaults to UMD-based output for consumption in a variety of environments
- Supports automatically-wired sourcemaps
- Tree-shaking to create smaller bundles
- Automatically marks dependencies as external
- Easily extensible to customize your library as needed

**Important! If you need polyfills in your code, consider including `core-js` in
your `package.json`. This is will configure `@babel/present-env` to
automatically include polyfills based on usage. More details
[here](https://babeljs.io/docs/en/babel-preset-env#usebuiltins).**

## Requirements

- Node.js 10+
- Yarn v1.2.1+, or npm v5.4+
- neutrino 10
- webpack 5
- webpack-cli 4

## Quickstart

The fastest way to get started is by using the `create-project` scaffolding
tool. Don’t want to use the CLI helper? No worries, we have you covered with the
[manual installation](#manual-installation).

### create-project

Run the following command to start the process. Substitute `<directory-name>`
with the directory name you wish to create for this project.

#### Yarn

```
❯ yarn create @neutrinojs/project <directory-name>
```

_Note: The `create` command is a shorthand that helps you do two things at once.
See the [Yarn create docs](https://yarnpkg.com/lang/en/docs/cli/create/) for
more details._

#### npm/npx

[`npx`](https://github.com/zkat/npx) comes pre-installed with `npm`. If you’re
running an older version of `npm`, then `npm install -g npm` to update to the
latest version.

```
❯ npx @neutrinojs/create-project <directory-name>
```

The CLI helper will prompt for the project to scaffold, and will offer to set up
a test runner as well as linting to your project. Refer to the
[Create new project](https://neutrinojs.org/installation/create-new-project/)
section for details on all available options.

### Manual Installation

`@neutrinojs/library` can be installed via the Yarn or npm clients. Inside your
project, make sure that the dependencies below are installed as development
dependencies.

#### Yarn

```bash
❯ yarn add --dev neutrino @neutrinojs/library webpack webpack-cli
```

#### npm

```bash
❯ npm install --save-dev neutrino @neutrinojs/library webpack webpack-cli
```

If you want to have automatically wired sourcemaps added to your project, add
`source-map-support`:

#### Yarn

```bash
❯ yarn add source-map-support
```

#### npm

```bash
❯ npm install --save source-map-support
```

After that, add a new directory named `src` in the root of the project, with a
single JS file named `index.js` in it.

```bash
❯ mkdir src && touch src/index.js
```

Edit your `src/index.js` file with the following:

```js
// Create a simple logger library that only logs when
// debug mode is enabled, and logs to the appropriate level
export default class Logger {
  constructor(level, debug = true) {
    this.level = level;
    this.debug = debug;
  }

  log(...args) {
    if (this.debug) {
      console[level](...args);
    }
  }
}
```

Now edit your project's `package.json` to add commands for building the library:

```json
{
  "name": "super-logger",
  "scripts": {
    "build": "webpack --mode production"
  }
}
```

Then create a `.neutrinorc.js` file alongside `package.json`, which contains
your Neutrino configuration:

```js
const library = require('@neutrinojs/library');

module.exports = {
  use: [
    library({
      name: 'Logger',
    }),
  ],
};
```

And create a `webpack.config.js` file, that uses the Neutrino API to access the
generated webpack config:

```js
const neutrino = require('neutrino');

module.exports = neutrino().webpack();
```

You can now build your library!

#### Yarn

```bash
❯ yarn build
```

#### npm

```bash
❯ npm start
```

## Project Layout

`@neutrinojs/library` follows the standard
[project layout](https://neutrinojs.org/project-layout/) specified by Neutrino.
This means that by default all library source code should live in a directory
named `src` in the root of the project. This includes JavaScript files that
would be available to your compiled project.

## Building

`@neutrinojs/library` builds assets to the `build` directory by default when
running `yarn build`. You should specify a `main` property in your package.json
pointing to your primary built main entry point. Also when publishing your
project to npm, consider excluding your `src` directory by using the `files`
property to whitelist `build`, or via `.npmignore` to blacklist `src`.

```json
{
  "name": "super-logger",
  "main": "build/index.js",
  "files": ["build"]
}
```

Your built library can now be consumed with ES imports, CJS require, AMD
require, or even script tags:

```js
// ES imports
import Logger from 'super-logger';

// CJS require
const Logger = require('super-logger');

// AMD require
require(['super-logger'], (Logger) => {
  // ...
});
```

```html
<!-- script tags -->
<script src="/path/to/super-logger"></script>

<!--
  once published to npm, you can even use a script tag
  to point to unpkg
-->
<script src="https://unpkg.com/super-logger"></script>
```

## Preset options

You can provide custom options and have them merged with this preset's default
options to easily affect how this preset builds. You can modify Library preset
settings from `.neutrinorc.js` by overriding with an options object. The
following shows how you can pass an options object to the Library preset and
override its options, showing the defaults where applicable:

```js
const library = require('@neutrinojs/library');

module.exports = {
  use: [
    library({
      // REQUIRED. Sets the name of the library, along with its
      // output filename.
      name: '<YOUR_LIBRARY_NAME>',

      // Compile the library for use in a specific environment.
      // Defaults to 'web', but can be switched to 'node' as well
      target: 'web',

      // Configure how the library will be exposed. Keeping this set
      // to 'umd' ensures compatibility with a large number of module
      // systems, but you can override if you want to produce a smaller
      // bundle targeted to specific module systems like 'commonjs2' (CJS).
      libraryTarget: 'umd',

      // Override options passed to webpack-node-externals,
      // such as whitelisting dependencies for bundling.
      externals: {},

      // Disable cleaning the output build directory
      clean: false,

      // Target specific browsers or Node.js versions with @babel/preset-env
      targets: {},

      // Add additional Babel plugins, presets, or env options
      babel: {
        // Override options for @babel/preset-env
        presets: [
          [
            '@babel/preset-env',
            {
              debug: neutrino.options.debug,
              useBuiltIns: 'usage',
            },
          ],
        ],
      },
    }),
  ],
};
```

_Example: Override the library to output a commonjs2 module:_

```js
const library = require('@neutrinojs/library');

module.exports = {
  use: [
    library({
      name: 'Logger',
      target: 'node',
      libraryTarget: 'commonjs2',
    }),
  ],
};
```

### Targets

Using the `targets` option, you can target specific browsers or Node.js versions
to compile to with `@babel/preset-env`. By default, this preset does not set any
targets and will compile to an ES5 baseline.

_Example: Override the library Babel compilation target to Node.js v6:_

```js
const library = require('@neutrinojs/library');

module.exports = {
  use: [
    library({
      name: 'Logger',
      target: 'node',
      targets: {
        node: '6.0',
      },
    }),
  ],
};
```

Setting to `false` will override Neutrino's default targets and allow
`@babel/preset-env` to read targets from a
[`.browserslistrc` file](https://babeljs.io/docs/en/babel-preset-env#browserslist-integration).

```js
const library = require('@neutrinojs/library');

module.exports = {
  use: [
    library({
      name: 'Logger',
      target: 'node',
      targets: false,
    }),
  ],
};
```

When using a `.browserslistrc` file, be aware that file changes may not
invalidate cache as expected: https://github.com/babel/babel-loader/issues/690

See [`@babel/preset-env`](https://babeljs.io/docs/en/babel-preset-env#targets)
for all other available settings.

## Customizing

To override the build configuration, start with the documentation on
[customization](https://neutrinojs.org/customization/). `@neutrinojs/library`
creates some conventions to make overriding the configuration easier once you
are ready to make changes.

By default Neutrino, and therefore this preset, creates a single **main**
`index` entry point to your library, and this maps to the `index.*` file in the
`src` directory. This means that this preset is optimized toward a single main
entry to your library. Code not imported in the hierarchy of the `index` entry
will not be output to the bundle. To overcome this you must either define more
mains via [`options.mains`](https://neutrinojs.org/customization/#optionsmains),
import the code path somewhere along the `index` hierarchy, or define multiple
configurations in your `.neutrinorc.js`.

If the need arises, you can also compile `node_modules` by referring to the
relevant
[`compile-loader` documentation](https://neutrinojs.org/packages/compile-loader/#compiling-node_modules).

### External dependencies

This preset automatically marks all dependencies as external to your library,
meaning that any dependencies you import **will not be bundled** with your
library. This helps prevent your library from bloating, but means users of your
library will be installing or using your dependencies as defined in
package.json. You can override this in the library preset options by passing
further options to the `externals` property. This accepts an options object
format defined by
[webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals#configuration),
to which you can provide a `whitelist` value.

_The whitelist will override which dependencies are **bundled** in your library.
Any dependency not matched by this whitelist is considered a peer of your
library, and will **not be bundled**._

_Example: The following example library `redux-example` has the following
package.json, marking `redux` and `mitt` as dependencies, but only lists `mitt`
in whitelist. This bundles `mitt` along with the library, so the library
consumer does not need to explicitly import/require/script it prior. The `redux`
dependency is not in the whitelist, so it will not be bundled, and is considered
a peer of `redux-example`._

```json
{
  "name": "redux-example",
  "version": "1.0.0",
  "main": "build/reduxExample.js",
  "scripts": {
    "build": "webpack --mode production"
  },
  "dependencies": {
    "mitt": "*",
    "redux": "*"
  },
  "devDependencies": {
    "neutrino": "*",
    "@neutrinojs/library": "*"
  }
}
```

```js
const library = require('@neutrinojs/library');

module.exports = {
  use: [
    library({
      name: 'reduxExample',
      externals: {
        whitelist: ['mitt'],
      },
    }),
  ],
};
```

```js
// ES imports
import { createStore } from 'redux';
import reduxExample from 'redux-example';

// CJS require
const { createStore } = require('redux');
const reduxExample = require('redux-example');

// AMD require
require(['redux', 'redux-example'], ({ createStore }, reduxExample) => {
  // ...
});
```

```html
<!-- script tags -->
<script src="/path/to/redux"></script>
<script src="/path/to/redux-example"></script>
<script>
  const { createStore } = window.redux;
  window.reduxExample; // ...
</script>

<!--
  once published to npm, you can even use a script tag
  to point to unpkg
-->
<script src="https://unpkg.com/redux"></script>
<script src="https://unpkg.com/redux-example"></script>
<script>
  const { createStore } = window.redux;
  window.reduxExample; // ...
</script>
```

### Source minification

By default script sources are minified in production only, using webpack's
default of
[terser-webpack-plugin](https://github.com/webpack-contrib/terser-webpack-plugin).
To customise the options passed to `TerserPlugin` or even use a different
minifier, override `optimization.minimizer`.

_Example: Adjust the `terser` minification settings:_

```js
const library = require('@neutrinojs/library');

module.exports = {
  use: [
    library({ name: 'reduxExample' }),
    (neutrino) => {
      // Whilst the minimizer is only used when the separate `minimize` option is true
      // (ie in production), the conditional avoids the expensive require() in development.
      if (process.env.NODE_ENV === 'production') {
        neutrino.config.optimization
          .minimizer('terser')
          .use(require.resolve('terser-webpack-plugin'), [
            {
              // Default options used by webpack:
              // https://github.com/webpack/webpack/blob/v4.26.0/lib/WebpackOptionsDefaulter.js#L308-L315
              cache: true,
              parallel: true,
              sourceMap:
                neutrino.config.devtool &&
                /source-?map/.test(neutrino.config.devtool),
              // Pass custom options here.
              // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
              // https://github.com/terser-js/terser#minify-options
              terserOptions: {
                // eg disable mangling of names
                mangle: false,
              },
            },
          ]);
      }
    },
  ],
};
```

## Generating multiple builds

A library can be built multiple times from a `webpack.config.js` file in order
to generate multiple library outputs when building. This is done by exporting an
array of Neutrino outputs rather than a single output.

```js
// .neutrinorc.js
const library = require('@neutrinojs/library');

module.exports = {
  use: [
    library({
      name: 'Logger',
      clean: false,
    }),
  ],
};
```

```js
// webpack.config.js
const neutrino = require('neutrino');

const config = neutrino().webpack();

module.exports = [config, { ...config, libraryTarget: 'commonjs2' }];
```

### Rules

The following is a list of rules and their identifiers which can be overridden:

| Name      | Description                                                                                    | NODE_ENV |
| --------- | ---------------------------------------------------------------------------------------------- | -------- |
| `compile` | Compiles JS files from the `src` directory using Babel. Contains a single loader named `babel` | all      |

### Plugins

The following is a list of plugins and their identifiers which can be
overridden:

_Note: Some plugins are only available in certain environments. To override
them, they should be modified conditionally._

| Name     | Description                                                                                                                                        | NODE_ENV                                    |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `banner` | Injects source-map-support into the main entry points of your application if detected in `dependencies` or `devDependencies` of your package.json. | Only when `source-map-support` is installed |
| `clean`  | Clean or remove the `build` directory prior to building. From `@neutrinojs/clean`.                                                                 | `'production'`                              |

### Override configuration

By following the [customization guide](https://neutrinojs.org/customization/)
and knowing the rule, loader, and plugin IDs above, you can override and augment
the build by by providing a function to your `.neutrinorc.js` use array. You can
also make these changes from the Neutrino API in custom middleware.

_Example: Allow importing modules with a `.esm` extension._

```js
const library = require('@neutrinojs/library');

module.exports = {
  use: [
    library({
      /* ... */
    }),
    (neutrino) => {
      neutrino.config.resolve.extensions.add('.esm');
    },
  ],
};
```

## Contributing

This preset is part of the [neutrino](https://github.com/neutrinojs/neutrino)
repository, a monorepo containing all resources for developing Neutrino and its
core presets and middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/library.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/library.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/library
