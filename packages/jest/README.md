# Neutrino Jest Preset

`@neutrinojs/jest` is a Neutrino preset that supports testing JavaScript
projects with the Jest test runner.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Features

- Zero upfront configuration necessary to start testing
- Babel compilation that compiles your tests using the same Babel options used
  by your source code
- Source watching for re-running of tests on change
- Collecting test coverage information and generating report
- Easily extensible to customize your testing as needed

## Requirements

- Node.js 10+
- Yarn v1.2.1+, or npm v5.4+
- neutrino 10 and one of the Neutrino build presets
- webpack 5
- Jest 24-26

## Quickstart

The fastest way to get started is by using the `create-project` scaffolding
tool. See the
[Create new project](https://neutrinojs.org/installation/create-new-project/)
docs for more details.

Don’t want to use the CLI helper? No worries, we have you covered with the
[manual installation](#manual-installation).

## Manual Installation

First follow the manual installation instructions for your chosen build preset.

`@neutrinojs/jest` can be installed via the Yarn or npm clients. Inside your
project, make sure `@neutrinojs/jest` and `jest` are development dependencies.
You will also be using another Neutrino preset for building your application
source code.

#### Yarn

```bash
❯ yarn add --dev @neutrinojs/jest jest
```

#### npm

```bash
❯ npm install --save-dev @neutrinojs/jest jest
```

### Installation: React Testing

Jest is often used in the testing of React components. If you are using this
preset in a React application, which most likely means you are using
`@neutrinojs/react`, you should also consider adding React's TestUtils and
potentially a higher-level abstraction such as Airbnb's Enzyme. These should be
development dependencies of your project.

#### Yarn

```bash
❯ yarn add --dev react-addons-test-utils enzyme
```

#### npm

```bash
❯ npm install --save-dev react-addons-test-utils enzyme
```

See the
[React's Test Utils documentation](https://reactjs.org/docs/test-utils.html) for
specifics on React testing with this approach.

After that, add a new directory named `test` in the root of the project, with a
single JS file named `simple_test.js` in it.

```bash
❯ mkdir test && touch test/simple_test.js
```

Edit your `test/simple_test.js` file with the following:

```js
describe('simple', () => {
  it('should be sane', () => {
    expect(false).not.toBe(true);
  });
});
```

Now update your project's `.neutrinorc.js` to add the `@neutrinojs/jest` preset.
In this example, let's pretend this is a Node.js project:

```js
const node = require('@neutrinojs/node');
const jest = require('@neutrinojs/jest');

module.exports = {
  use: [node(), jest()],
};
```

Create a `jest.config.js` file in the root of the project, that will be used by
the Jest CLI:

```js
// jest.config.js
const neutrino = require('neutrino');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

module.exports = neutrino().jest();
```

Then add these scripts entries to your `package.json` to simplify running Jest:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

Run the tests, and view the results in your console:

#### Yarn

```bash
❯ yarn test

 PASS  test/simple_test.js

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        3.265s
Ran all test suites.
```

#### npm

```bash
❯ npm test

 PASS  test/simple_test.js

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        3.265s
Ran all test suites.
```

To run tests against files from your source code, simply import them:

```js
import thingToTest from '../src/thing';
```

For more details on specific Jest usage, please refer to their
[documentation](https://jestjs.io/).

## Project Layout

`@neutrinojs/jest` follows the standard
[project layout](https://neutrinojs.org/project-layout/) specified by Neutrino.
This means that by default all project test code should live in a directory
named `test` in the root of the project. Test files end in either `_test.js`,
`.test.js`, `_test.jsx`, or `.test.jsx`.

## Executing single tests

By default this preset will execute every test file located in your test
directory ending in the appropriate file extension. Pass specific test filenames
to the Jest CLI to override this.

## Watching for changes

`@neutrinojs/jest` can watch for changes on your source directory and
subsequently re-run tests. Simply pass `--watch` to the Jest CLI (for example by
using the `test:watch` scripts entry above).

## Coverage reporting

Jest has an integrated coverage reporter, which requires no configuration. To
collect test coverage information and generate a report, use the CLI's
`--coverage` option.

## Additional CLI options

See the
[Jest CLI options documentation](https://jestjs.io/docs/en/cli#running-from-the-command-line).

## Preset options

You can provide custom options and have them merged with this preset's default
options, which are subsequently passed to Jest. You can modify Jest settings
from `.neutrinorc.js` by overriding with any options Jest accepts. In a
standalone Jest project this is typically done in the package.json file, but
`@neutrinojs/jest` allows configuration through this mechanism as well. This
accepts the same configuration options as outlined in the
[Jest documentation](https://jestjs.io/docs/en/configuration).

_Example: Turn off bailing on test failures._

```js
const jest = require('@neutrinojs/jest');

module.exports = {
  use: [jest({ bail: false })],
};
```

You might need to instruct Jest to load some setup scripts (e.g. when you use
Enzyme).

_Example: Jest setup scripts_

```js
const jest = require('@neutrinojs/jest');

module.exports = {
  use: [
    jest({
      // setup script for the framework
      setupTestFrameworkScriptFile: '<rootDir>/test-setup.js',
      // and / or shims
      setupFiles: ['<rootDir>/shim.js'],
    }),
  ],
};
```

<details>
  <summary>test-setup.js and shim.js</summary>

_test-setup.js for the example above_

```js
const Enzyme = require('enzyme');
const EnzymeAdapter = require('enzyme-adapter-react-16');

// Setup enzyme's react adapter
Enzyme.configure({ adapter: new EnzymeAdapter() });
```

_shim.js for the example above_

```js
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};
```

</details>

## Customizing

To override the test configuration, start with the documentation on
[customization](https://neutrinojs.org/customization/). `@neutrinojs/jest`
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
const jest = require('@neutrinojs/jest');

module.exports = {
  use: [
    jest(),
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

## Contributing

This preset is part of the [neutrino](https://github.com/neutrinojs/neutrino)
repository, a monorepo containing all resources for developing Neutrino and its
core presets and middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/jest.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/jest.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/jest
