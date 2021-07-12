# Neutrino Airbnb Preset

`@neutrinojs/airbnb` is a Neutrino preset that supports linting React projects
with Airbnb's ESLint config, following the
[Airbnb styleguide](https://github.com/airbnb/javascript).

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Features

- Zero upfront configuration necessary to start linting your React project
- Modern Babel knowledge supporting ES modules, JSX, and more
- Highly visible during development, fails compilation when building for
  production
- Easily extensible to customize your project as needed

## Requirements

- Node.js 10+
- Yarn v1.2.1+, or npm v5.4+
- neutrino 10 and one of the Neutrino build presets
- webpack 5
- ESLint 6 or 7

## Quickstart

The fastest way to get started is by using the `create-project` scaffolding
tool. See the
[Create new project](https://neutrinojs.org/installation/create-new-project/)
docs for more details.

Don’t want to use the CLI helper? No worries, we have you covered with the
[manual installation](#manual-installation).

## Manual Installation

First follow the manual installation instructions for your chosen build preset.

`@neutrinojs/airbnb` can be installed via the Yarn or npm clients. Inside your
project, make sure `@neutrinojs/airbnb` and `eslint` are development
dependencies. You will also be using another Neutrino preset for building your
application source code.

#### Yarn

```bash
❯ yarn add --dev @neutrinojs/airbnb eslint
```

#### npm

```bash
❯ npm install --save-dev @neutrinojs/airbnb eslint
```

After that, edit your project's `.neutrinorc.js` to add the preset for linting
**before** your build preset. For example, when building your project using
`@neutrinojs/react`:

```js
const airbnb = require('@neutrinojs/airbnb');
const react = require('@neutrinojs/react');

module.exports = {
  options: {
    root: __dirname,
  },
  use: [airbnb(), react()],
};
```

Start the app, then check your console for any linting errors. If everything is
successful, you should see no errors in the console. ESLint errors visible
during development are reported, but will still continue to build and serve your
project. ESLint errors during build will not build the project, and will cause
the command to fail.

#### Yarn

```bash
❯ yarn start

ERROR in ./src/index.js
Module Error (from ./node_modules/eslint-loader/index.js):

error: Missing semicolon (semi) at src/index.js:35:51:
  33 |
  34 |
> 35 | const MOUNT_NODE = document.getElementById("root")
     |                                                   ^
  36 |
  37 |
  38 |

1 error found.
1 error potentially fixable with the `--fix` option.
```

#### npm

```bash
❯ npm start

ERROR in ./src/index.js
Module Error (from ./node_modules/eslint-loader/index.js):

error: Missing semicolon (semi) at src/index.js:35:51:
  33 |
  34 |
> 35 | const MOUNT_NODE = document.getElementById("root")
     |                                                   ^
  36 |
  37 |
  38 |

1 error found.
1 error potentially fixable with the `--fix` option.
```

## Project Layout

`@neutrinojs/airbnb` follows the standard
[project layout](https://neutrinojs.org/project-layout/) specified by Neutrino.
This means that by default all project source code should live in a directory
named `src` in the root of the project.

## Building

`@neutrinojs/airbnb` will cause errors to **fail your build** when `NODE_ENV` is
not `'development'`. If you want to ease introduction of this linting preset to
your project, consider only adding it to your `use` list during development
until all linting errors have been resolved.

```bash
❯ yarn build

ERROR in ./src/index.js
Module Error (from ./node_modules/eslint-loader/index.js):

error: Missing semicolon (semi) at src/index.js:35:51:
  33 |
  34 |
> 35 | const MOUNT_NODE = document.getElementById("root")
     |                                                   ^
  36 |
  37 |
  38 |

1 error found.
1 error potentially fixable with the `--fix` option.
```

_Example: ease linting into project by only enabling when `NODE_ENV=development`
(ie: `--mode development`):_

```js
const airbnb = require('@neutrinojs/airbnb');
const react = require('@neutrinojs/react');

module.exports = {
  options: {
    root: __dirname,
  },
  use: [process.env.NODE_ENV === 'development' ? airbnb() : false, react()],
};
```

## Middleware options

This preset uses the same middleware options as
[@neutrinojs/eslint](https://neutrinojs.org/packages/eslint/#usage). If you wish
to customize what is included, excluded, or any ESLint options, you can provide
an options object with the middleware and this will be merged with our internal
defaults for this preset. Pass the options as an argument to the middleware
function.

By default the preset configures `eslint-plugin-react` to target the latest
version of React. If using an older version, you must explicitly pass it as in
the example below.

_Example: Extend from a custom configuration (it will be applied after Airbnb),
turn off semicolons from being required, and set a specific React version._

```js
const airbnb = require('@neutrinojs/airbnb');

module.exports = {
  options: {
    root: __dirname,
  },
  use: [
    airbnb({
      eslint: {
        // For supported options, see:
        // https://github.com/webpack-contrib/eslint-loader#options
        // https://eslint.org/docs/developer-guide/nodejs-api#cliengine
        // The options under `baseConfig` correspond to those
        // that can be used in an `.eslintrc.*` file.
        baseConfig: {
          extends: ['my-custom-config'],
          rules: {
            'babel/semi': 'off',
          },
          settings: {
            react: {
              version: '16.5',
            },
          },
        },
      },
    }),
  ],
};
```

## Exposing generated lint configuration via `.eslintrc.js`

`@neutrinojs/eslint`, from which this preset inherits, provides an `.eslintrc()`
output handler for generating the ESLint configuration in a format suitable for
use in an `.eslintrc.js` file. This allows the ESLint CLI to be used outside of
building the project, and for IDEs and text editors to provide linting
hints/fixes.

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
set `useEslintrc` to `true`. This will cause `@neutrinojs/airbnb` to only set
the loader-specific configuration defaults, and leave all other linting
configuration to be managed by the standalone `.eslintrc.*` file.

See the `@neutrinojs/eslint`
[documentation](https://neutrinojs.org/packages/eslint/#using-your-own-eslintrc)
for more details.

## Customizing

To override the lint configuration, start with the documentation on
[customization](https://neutrinojs.org/customization/). `@neutrinojs/airbnb`
creates some conventions to make overriding the configuration easier once you
are ready to make changes.

### Rules

The following is a list of rules and their identifiers which can be overridden:

| Name   | Description                                                                                                                                                                  | NODE_ENV |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `lint` | By default, lints JS and JSX files from the `src` and `test` directories using ESLint. Contains a single loader named `eslint`. This is inherited from `@neutrinojs/eslint`. | all      |

## Contributing

This preset is part of the [neutrino](https://github.com/neutrinojs/neutrino)
repository, a monorepo containing all resources for developing Neutrino and its
core presets and middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/airbnb.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/airbnb.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/airbnb
