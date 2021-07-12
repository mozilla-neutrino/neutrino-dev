# Neutrino Mocha Preset

`@neutrinojs/mocha` is a Neutrino preset that supports testing JavaScript
projects with the Mocha test runner.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Features

- Zero upfront configuration necessary to start testing
- Babel compilation that compiles your tests using the same Babel options used
  by your source code
- Easily extensible to customize your testing as needed

## Requirements

- Node.js 10+
- Yarn v1.2.1+, or npm v5.4+
- neutrino 10 and one of the Neutrino build presets
- webpack 5
- Mocha 6 or 7

## Quickstart

The fastest way to get started is by using the `create-project` scaffolding
tool. See the
[Create new project](https://neutrinojs.org/installation/create-new-project/)
docs for more details.

Don’t want to use the CLI helper? No worries, we have you covered with the
[manual installation](#manual-installation).

## Manual Installation

First follow the manual installation instructions for your chosen build preset.

`@neutrinojs/mocha` can be installed via the Yarn or npm clients. Inside your
project, make sure `@neutrinojs/mocha` and `mocha` are development dependencies.
You will also be using another Neutrino preset for building your application
source code.

#### Yarn

```bash
❯ yarn add --dev @neutrinojs/mocha mocha
```

#### npm

```bash
❯ npm install --save-dev @neutrinojs/mocha mocha
```

After that, add a new directory named `test` in the root of the project, with a
single JS file named `simple_test.js` in it.

```bash
❯ mkdir test && touch test/simple_test.js
```

Edit your `test/simple_test.js` file with the following:

```js
import assert from 'assert';

describe('simple', () => {
  it('should be sane', () => {
    assert.equal(true, !false);
  });
});
```

Now update your project's `.neutrinorc.js` to add the `@neutrinojs/mocha`
preset. In this example, let's pretend this is a Node.js project:

```js
const node = require('@neutrinojs/node');
const mocha = require('@neutrinojs/mocha');

module.exports = {
  use: [node(), mocha()],
};
```

Create a `.mocharc.js` file in the root of the project, that will be used by the
Mocha CLI:

```js
// .mocharc.js
const neutrino = require('neutrino');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

module.exports = neutrino().mocha();
```

Then add these scripts entries to your `package.json` to simplify running Mocha:

```json
{
  "scripts": {
    "test": "mocha",
    "test:watch": "mocha --watch"
  }
}
```

Run the tests, and view the results in your console:

#### Yarn

```bash
❯ yarn test

  simple
    ✓ should be sane


  1 passing (426ms)
```

#### npm

```bash
❯ npm test

  simple
    ✓ should be sane


  1 passing (409ms)
```

To run tests against files from your source code, simply import them:

```js
import thingToTest from '../src/thing';
```

For more details on specific Mocha usage, please refer to their
[documentation](https://mochajs.org/).

## Project Layout

`@neutrinojs/mocha` follows the standard
[project layout](https://neutrinojs.org/project-layout/) specified by Neutrino.
This means that by default all project test code should live in a directory
named `test` in the root of the project. Test files end in `_test.js` by
default.

## Executing single tests

By default this preset will execute every test file located in your test
directory ending in `_test.js`. Pass specific test filenames to the Mocha CLI to
override this.

## Watching for changes

`@neutrinojs/mocha` can watch for changes on your source directory and
subsequently re-run tests. Simply pass `--watch` to the Mocha CLI (for example
by using the `test:watch` scripts entry above).

## Preset options

You can provide custom options and have them merged with this preset's default
options, which are subsequently passed to Mocha. You can modify Mocha settings
from `.neutrinorc.js` by overriding with any options Mocha accepts. In a
standalone Mocha project this is done in the `.mocharc.js` file, but
`@neutrinojs/mocha` allows configuration through this mechanism as well. This
accepts the same configuration options as outlined in the
[Mocha documentation](https://mochajs.org/).

_Example: Enable bailing on test failures._

```js
module.exports = {
  use: [
    mocha({
      bail: true,
    }),
  ],
};
```

## Customizing

To override the test configuration, start with the documentation on
[customization](https://neutrinojs.org/customization/). `@neutrinojs/mocha`
creates some conventions to make overriding the configuration easier once you
are ready to make changes.

### Rules

The following is a list of rules and their identifiers which can be overridden:

| Name      | Description                                                                                                                                | NODE_ENV |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| `compile` | Compiles JS files from the `test` directory using adopted Babel settings from other build presets. Contains a single loader named `babel`. | all      |

### Override configuration

By following the [customization guide](https://neutrinojs.org/customization/)
and knowing the rule, and loader IDs above, you can override and augment testing
by providing a function to your `.neutrinorc.js` use array. You can also make
this change from the Neutrino API when using the `use` method.

_Example: Add a custom Babel plugin when testing:_

```js
const mocha = require('@neutrinojs/mocha');

module.exports = {
  use: [
    mocha(),
    (neutrino) => {
      if (process.env.NODE_ENV === 'test') {
        neutrino.config.module
          .rule('compile')
          .use('babel')
          .tap((options) =>
            merge(options, {
              env: {
                test: {
                  plugins: ['custom-babel-plugin'],
                },
              },
            }),
          );
      }
    },
  ],
};
```

## Webstorm Mocha Runner

Webstorm has a mocha runner that enables running mocha tests within the IDE. The
Mocha runner also allows for debugging of Mocha tests in Webstorm. Basic setup
can be found at
[Webstorm's Mocha Run/Debug documentation](https://www.jetbrains.com/help/webstorm/run-debug-configuration-mocha.html).

- Create a mocha runner using
  [Webstorm's Mocha Run/Debug documentation](https://www.jetbrains.com/help/webstorm/run-debug-configuration-mocha.html).
  The defaults should be fine with the following exceptions:
- choose `File patterns` radio button
- `Test file patterns:` `./test/*_test.js` (or whichever pattern you need for
  your tests)

Now you should be able to `run` your tests or add a breakpoint to your tests and
`debug` them.

## Contributing

This preset is part of the [neutrino](https://github.com/neutrinojs/neutrino)
repository, a monorepo containing all resources for developing Neutrino and its
core presets and middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/mocha.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/mocha.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/mocha
