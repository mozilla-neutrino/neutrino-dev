# Neutrino ESLint Middleware

`@neutrinojs/eslint` is Neutrino middleware for linting source code using ESLint
and eslint-loader.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Requirements

- Node.js 10+
- Yarn v1.2.1+, or npm v5.4+
- Neutrino 9 and one of the Neutrino build presets
- webpack 4
- ESLint 6 or 7

## Installation

`@neutrinojs/eslint` can be installed via the Yarn or npm clients. Inside your
project, make sure `@neutrinojs/eslint` and `eslint` are development
dependencies. You will also be using another Neutrino preset for building your
application source code.

#### Yarn

```bash
❯ yarn add --dev @neutrinojs/eslint eslint
```

#### npm

```bash
❯ npm install --save-dev @neutrinojs/eslint eslint
```

## Usage

`@neutrinojs/eslint` can be consumed from the Neutrino API, middleware, or
presets. Require this package and plug it into Neutrino:

```js
const eslint = require('@neutrinojs/eslint');

// Usage shows default values
neutrino.use(
  eslint({
    // Uses extensions from neutrino.options.extensions
    test: neutrino.regexFromExtensions(),
    include: [neutrino.options.source, neutrino.options.tests],
    exclude: [],
    eslint: {
      // For supported options, see:
      // https://github.com/webpack-contrib/eslint-loader#options
      // https://eslint.org/docs/developer-guide/nodejs-api#cliengine
      cache: true,
      // Downgrade errors to warnings when in development, to reduce the noise in
      // the webpack-dev-server overlay (which defaults to showing errors only),
      // and to also ensure hot reloading isn't prevented.
      emitWarning: process.env.NODE_ENV === 'development',
      // Make errors fatal for 'production' and 'test'.
      // However note that even when `false` webpack still fails the build:
      // https://github.com/webpack-contrib/eslint-loader/issues/257
      failOnError: process.env.NODE_ENV !== 'development',
      cwd: neutrino.options.root,
      useEslintrc: false,
      // Can be the name of a built-in ESLint formatter
      // or the module/path of an external one.
      formatter: 'codeframe',
      // The options under `baseConfig` correspond to those
      // that can be used in an `.eslintrc.*` file.
      baseConfig: {
        env: {
          es6: true,
        },
        extends: [],
        globals: {
          process: true,
        },
        overrides: [],
        parser: require.resolve('babel-eslint'),
        parserOptions: {
          ecmaVersion: 2018,
          sourceType: 'module',
        },
        plugins: ['babel'],
        root: true,
        settings: {},
      },
    },
  }),
);
```

- `test`: Test which files should be linted.
- `include`: An array of paths to include in linting. Maps to webpack's
  [`Rule.include`](https://webpack.js.org/configuration/module/#rule-include)
- `exclude`: An array of paths to exclude from linting. Maps to webpack's
  [`Rule.exclude`](https://webpack.js.org/configuration/module/#rule-exclude)
- `eslint`: An object containing
  [eslint-loader options](https://github.com/webpack-contrib/eslint-loader#options),
  which includes options passed to ESLint's
  [CLIEngine](https://eslint.org/docs/developer-guide/nodejs-api#cliengine).

## Exposing generated lint configuration via `.eslintrc.js`

`@neutrinojs/eslint`, provides an `.eslintrc()` output handler for generating
the ESLint configuration in a format suitable for use in an `.eslintrc.js` file.
This allows the ESLint CLI to be used outside of building the project, and for
IDEs and text editors to provide linting hints/fixes.

Create a `.eslintrc.js` file in the root of the project, containing:

```js
// .eslintrc.js
const neutrino = require('neutrino');

module.exports = neutrino().eslintrc();
```

This `.eslintrc.js` configuration will be automatically used when running the
ESLint CLI. For convenience a `lint` script alias can be added to your
`package.json`, allowing linting to be run via `yarn lint` or `npm run lint`:

```json
{
  "scripts": {
    "lint": "eslint --cache --format codeframe --ext mjs,jsx,js src"
  }
}
```

Projects may face a problem when their editor or IDE lints all files and
highlights errors that were normally excluded from source, i.e. Neutrino's
`include` and `exclude` options. This is because the ESLint CLI does not have a
way to specify included and excluded files from the `.eslintrc.js`
configuration. Instead you will need to create an
[.eslintignore](https://eslint.org/docs/user-guide/configuring#ignoring-files-and-directories)
file that controls which files should be excluded from linting.

## Using your own `.eslintrc.*`

If instead you would prefer to use your own non-generated `.eslintrc.*` file,
set `useEslintrc` to `true`. This will cause `@neutrinojs/eslint` to only set
the loader-specific configuration defaults, and leave all other linting
configuration to be managed by the standalone `.eslintrc.*` file.

For example:

```js
neutrino.use(
  eslint({
    eslint: {
      // Use own `.eslintrc.*` file for configuration instead.
      useEslintrc: true,
    },
  }),
);
```

```js
// .eslintrc.js (or any of the other filetypes supported by ESLint)
module.exports = {
  // Configure as you would normally when not using Neutrino:
  // https://eslint.org/docs/user-guide/configuring
  root: true,
  extends: 'eslint-config-airbnb',
  parser: 'babel-eslint',
  settings: {
    // ...
  },
  rules: {
    // ...
  },
};
```

## Customization

`@neutrinojs/eslint` creates some conventions to make overriding the
configuration easier once you are ready to make changes.

### Rules

The following is a list of rules and their identifiers which can be overridden:

| Name   | Description                                                                                                                     | NODE_ENV |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `lint` | By default, lints JS and JSX files from the `src` and `test` directories using ESLint. Contains a single loader named `eslint`. | all      |

## Utility functions

### Plugins aliasing

When developing your custom ESLint preset, you may face a problem with sharable
ESLint configs and plugins. This is due to ESLint plugins resolving system which
searches for plugins packages in the project root. This may fail in some
environments, especially in Plug'n'Play. This module provides `aliasPlugins()`
function to resolve this issue in your package providing aliases from package
names to absolute paths. You can import it in 2 ways:
`require('@neutrinojs/eslint/alias-plugins')` or
`require('@neutrinojs/eslint').aliasPlugins`. Example:

```js
const eslint = require('@neutrinojs/eslint');
const eslintBaseConfig = { plugins: ['node'] };

neutrino.use(
  eslint({
    eslint: {
      baseConfig: eslintBaseConfig,
    },
  }),
);

lint.aliasPlugins(
  // ESLint config that contains used plugins
  eslintBaseConfig,
  // Path to the current module file, so aliases can be correctly resolved from your package
  // In most cases it is always `__filename`
  __filename,
);
```

If you use 3rd party configs, plugins will not be present in the configuration.
So you have to list them manually just for aliasing. For example:

```js
const eslint = require('@neutrinojs/eslint');
const usedPlugins = ['react', 'react-hooks', 'jsx-a11y', 'import'];
const eslintBaseConfig = {
  extends: [
    require.resolve('eslint-config-airbnb'),
    require.resolve('eslint-config-airbnb/hooks'),
  ],
};

neutrino.use(
  eslint({
    eslint: {
      baseConfig: eslintBaseConfig,
    },
  }),
);

lint.aliasPlugins(
  // ESLint config that contains only used plugins
  { plugins: usedPlugins },
  // Path to the current module file, so aliases can be correctly resolved from your package
  // In most cases it is always `__filename`
  __filename,
);
```

**Important! Make sure all aliased plugins are present in your dependencies in
package.json**

```json
{
  "dependencies": {
    "eslint-plugin-import": "latest",
    "eslint-plugin-jsx-a11y": "latest",
    "eslint-plugin-react": "latest",
    "eslint-plugin-react-hooks": "latest"
  }
}
```

### Import resolvers aliasing

Also you may have problems with allocation of import resolvers when
`eslint-plugin-import` is used. This can happen in some environments, especially
in Plug'n'Play. This module provides `aliasImportResolvers()` function to
resolve this issue in your package providing aliases from package names to
absolute paths. You can import it in 2 ways:
`require('@neutrinojs/eslint/alias-import-resolvers')` or
`require('@neutrinojs/eslint').aliasImportResolvers`. Example:

```js
const eslint = require('@neutrinojs/eslint');
const eslintBaseConfig = {
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.json'],
      },
    },
  },
};

neutrino.use(
  eslint({
    eslint: {
      baseConfig: eslintBaseConfig,
    },
  }),
);

lint.aliasImportResolvers(
  // ESLint config that contains settings
  eslintBaseConfig,
  // Path to the current module file, so aliases can be correctly resolved from your package
  // In most cases it is always `__filename`
  __filename,
);
```

If you use 3rd party configs, settings will not be present in the configuration.
So you have to imitate them manually just for aliasing. For example:

```js
const eslint = require('@neutrinojs/eslint');
const usedResolvers = { node: {} };
const eslintBaseConfig = {
  extends: [require.resolve('eslint-config-standard')],
};

neutrino.use(
  eslint({
    eslint: {
      baseConfig: eslintBaseConfig,
    },
  }),
);

lint.aliasPlugins(
  // ESLint config that contains only used resolvers
  {
    settings: {
      'import/resolver': usedResolvers,
    },
  },
  // Path to the current module file, so aliases can be correctly resolved from your package
  // In most cases it is always `__filename`
  __filename,
);
```

**Important! Make sure all aliased import resolvers are present in your
dependencies in package.json**

```json
{
  "dependencies": {
    "eslint-import-resolver-node": "latest"
  }
}
```

## Contributing

This middleware is part of the
[neutrino](https://github.com/neutrinojs/neutrino) repository, a monorepo
containing all resources for developing Neutrino and its core presets and
middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/eslint.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/eslint.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/eslint
