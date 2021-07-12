# Neutrino Karma Preset

`@neutrinojs/karma` is a Neutrino preset that supports testing web applications
using the Karma test runner.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Features

- Zero upfront configuration necessary to start testing on real browsers with
  Karma, Mocha, and Chrome Headless
- Babel compilation that compiles your tests using the same Babel options used
  by your source code
- Source watching for re-running of tests on change
- Out-of-the-box support for running in CI
- Easily extensible to customize your testing as needed

## Requirements

- Node.js 10+
- Yarn v1.2.1+, or npm v5.4+
- neutrino 10 and one of the Neutrino build presets
- webpack 5
- Karma 4 or 5 and Karma CLI 2
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

`@neutrinojs/karma` can be installed via the Yarn or npm clients. Inside your
project, make sure the dependencies below are installed as development
dependencies. You will also be using another Neutrino preset for building your
application source code.

#### Yarn

```bash
❯ yarn add --dev @neutrinojs/karma karma karma-cli mocha
```

#### npm

```bash
❯ npm install --save-dev @neutrinojs/karma karma karma-cli mocha
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

Now update your project's `.neutrinorc.js` to add the `@neutrinojs/karma`
preset. In this example, let's pretend this is a React project:

```js
const react = require('@neutrinojs/react');
const karma = require('@neutrinojs/karma');

module.exports = {
  use: [react(), karma()],
};
```

Create a `karma.conf.js` file in the root of the project, that will be used by
the Karma CLI:

```js
// karma.conf.js
const neutrino = require('neutrino');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

module.exports = neutrino().karma();
```

Then add these scripts entries to your `package.json` to simplify running Karma:

```json
{
  "scripts": {
    "test": "karma start --single-run",
    "test:watch": "karma start"
  }
}
```

Run the tests, and view the results in your console:

#### Yarn

```bash
❯ yarn test

# Karma output removed for brevity

  simple
    ✔ should be sane

Finished in 0.005 secs / 0 secs @ 06:56:40 GMT-0600 (CST)

SUMMARY:
✔ 1 test completed
```

#### npm

```bash
❯ npm test

# Karma output removed for brevity

  simple
    ✔ should be sane

Finished in 0.005 secs / 0 secs @ 06:56:40 GMT-0600 (CST)

SUMMARY:
✔ 1 test completed
```

To run tests against files from your source code, simply import them:

```js
import thingToTest from '../src/thing';
```

For more details on specific Karma usage, please refer to their
[documentation](https://karma-runner.github.io/2.0/index.html).

## Project Layout

`@neutrinojs/karma` follows the standard
[project layout](https://neutrinojs.org/project-layout/) specified by Neutrino.
This means that by default all project test code should live in a directory
named `test` in the root of the project. Test files end in `_test.js` by
default.

## Executing single tests

By default this preset will execute every test file located in your test
directory ending in the appropriate file extension. Pass specific test filenames
to the Karma CLI to override this.

## Watching for changes

`@neutrinojs/karma` can watch for changes on your source directory and
subsequently re-run tests. Simply omit the `--single-run` argument when running
the Karma CLI (for example by using the `test:watch` scripts entry above).

## Preset options

You can provide custom options and have them merged with this preset's default
options, which are subsequently passed to Karma. You can modify Karma settings
from `.neutrinorc.js` by overriding with any options Karma accepts. In a
standalone Karma project this is typically done in a `karma.conf.js` or similar
file, but `@neutrinojs/karma` allows configuration through `.neutrinorc.js` as
well. This accepts the same configuration options as outlined in the
[Karma documentation](https://karma-runner.github.io/2.0/config/configuration-file.html).

_Example: Change the duration Karma waits for a browser to reconnect (in ms)._

```js
const karma = require('@neutrinojs/karma');

module.exports = {
  use: [karma({ browserDisconnectTimeout: 5000 })],
};
```

## Using from CI

`@neutrinojs/karma` needs no additional configuration to run your tests in CI
infrastructure when using Chrome Headless. If you decide to use a browser with a
display, you will need to ensure your CI can actually run the tests similar to a
headless mode. This usually means having a display emulator and access to the
browsers you are testing against.

For an example using Travis-CI and normal Chrome, you will need to add the
following to your `.travis.yml` file:

```yaml
before_install:
  - export CHROME_BIN=chromium-browser
  - export DISPLAY=:99.0
  - sh -e /etc/init.d/xvfb start
```

You may also need to pass additional options to the Karma preset to change its
behavior in CI, using standard Chrome as an example instead of Chrome Headless:

```js
const karma = require('@neutrinojs/karma');

module.exports = {
  use: [
    karma({
      browsers: [process.env.CI ? 'ChromeCI' : 'Chrome'],
      customLaunchers: {
        ChromeCI: {
          base: 'Chrome',
          flags: ['--no-sandbox'],
        },
      },
    }),
  ],
};
```

## Contributing

This preset is part of the [neutrino](https://github.com/neutrinojs/neutrino)
repository, a monorepo containing all resources for developing Neutrino and its
core presets and middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/karma.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/karma.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/karma
