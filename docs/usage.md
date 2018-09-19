# Usage

Neutrino is a configuration management tool for the webpack ecosystem that supports building, testing,
linting, and developing JavaScript projects based on shared configuration presets and middleware.
You can use Neutrino within your project alongside webpack, ESLint, Jest, Karma, and more of your
favorite CLI tools, preferably using scripts defined in your project's `package.json`.

## Setup

After completing the [installation](./installation/index.md) of Neutrino and any Neutrino presets or
middleware, you will need to create a `.neutrinorc.js` file to control its options and tell your project
which middleware to load when building and performing various related tasks. The recommended approach
is to export an object with a root directory option and the middleware you have installed.

_Example: create a baseline `.neutrinorc.js` file for a React project:_

```js
// .neutrinorc.js
module.exports = {
  options: {
    root: __dirname
  },
  use: [
    '@neutrinojs/react'
  ]
};
```

Next you will want to define some scripts in your project's `package.json` in order to more
easily interact with your project. In a typical project:

- `scripts.start` would be the command you wish to run during development
- `scripts.build` would be the command you wish to run to create a production bundle
- `scripts.test` would be the command you wish to run to execute tests

Using these script targets may not be suitable for every project. They are only the
typical recommendations for script target names. You may choose different names if desired.

## Building for development

Webpack's CLI tools provide commands for creating or starting a bundle during development, any vary
depending on whether you are targeting a browser or Node.js. For example, if working on a web project,
you would typically install `webpack`, `webpack-cli`, and `webpack-dev-server` and call the latter during
development. For Node.js, you would typically install `webpack` and `webpack-cli`, and call `webpack` from
scripts during development. Check the documentation of your preset for details on the recommended installation
instructions to build your project for development.

Example usage:

```bash
webpack-dev-server --mode development
```

Putting this into your `package.json` will allow you to build your project using either
`yarn start` or `npm start`.

```json
{
  "scripts": {
    "start": "webpack-dev-server --mode development"
  }
}
```

To tell `webpack` or `webpack-dev-server` to load Neutrino middleware or presets for
its configuration, create a `webpack.config.js` in the root of the project with the
following:

```js
// webpack.config.js
const neutrino = require('neutrino');

module.exports = neutrino().webpack();
```

This will cause Neutrino to load all middleware and options defined in the project's
`.neutrinorc.js` file then turn it into a configuration format suitable for consumption
by webpack.

## Building for production

TODO
Neutrino provides the command `neutrino build` for creating a bundle for production deployment.
Using `neutrino build` by default sets the Node.js environment to `production` using the `NODE_ENV` environment variable,
which is available in your project source code. See the documentation for your preset for details regarding additional
steps after your build is completed.

```bash
# PRESET_MODULE is the name of the preset to build with, e.g. @neutrinojs/react
neutrino build --use PRESET_MODULE
```

Putting this into your `package.json` will allow you to build your project using either
`yarn build` or `npm run build`. Using `@neutrinojs/react` as an example:

```json
{
  "scripts": {
    "build": "neutrino build --use @neutrinojs/react"
  }
}
```

## Building and running tests

TODO
Neutrino provides the command `neutrino test` for invoking a set of tests included in your project.
Using `neutrino test` by default sets the Node.js environment variable to `test` using the `NODE_ENV` environment
variable, which is available in your project source code. How your source code is built and consumed from tests
is determined by the middleware you are using. Running suites that are built the same as source files is encouraged by
using Neutrino-compatible middleware. Neutrino currently provides three core testing presets: Karma, Jest, and Mocha.

```bash
# PRESET_MODULE is the name of the preset to build with, e.g. @neutrinojs/react
# TESTING_MODULE is the name of another middleware to build with, e.g. @neutrinojs/karma
neutrino test --use PRESET_MODULE TESTING_MODULE
```

Putting this into your `package.json` will allow you to test your project using either
`yarn test` or `npm test`. Using `@neutrinojs/react` and `@neutrinojs/karma` as an example:

```json
{
  "scripts": {
    "test": "neutrino test --use @neutrinojs/react @neutrinojs/karma"
  }
}
```

Using the command `neutrino test` will execute every test file located in your
[testing directory](./project-layout.md#testing). You may also provide to this command the specific test files you wish
to run individually. It is important to note that when combined with the `--use` parameter, you should use two
dashes after the last middleware to denote the end of the middleware and the beginning of the test files.

```bash
neutrino test --use PRESET_A PRESET_B -- a_test.js b_test.js
```

## Using multiple presets

TODO
All Neutrino commands support the `--use` command line parameter, but having to specify this for each script target
can be cumbersome and verbose, especially if you have many middleware or presets. Fortunately, Neutrino also supports
specifying presets using the `use` property in a `.neutrinorc.js` file. By omitting the `--use`
flag and specifying a `use` array, every call to a Neutrino command will look up which middleware
are configured in your in `.neutrinorc.js`.

This is the recommended approach when using more than one preset/middleware.

```js
// package.json
{
  "scripts": {
    "start": "neutrino start",
    "build": "neutrino build",
    "test": "neutrino test"
  }
}
```

```js
// .neutrinorc.js
module.exports = {
  use: [
    '@neutrinojs/react',
    '@neutrinojs/karma'
  ]
}
```

## Inspecting the generated webpack config

The `neutrino --inspect` command can be used to write out a stringified version of the generated
webpack configuration to stdout. Use the `--mode` flag or the `NODE_ENV` environment variable to
control which variation of the configuration is output.

For example:

```bash
neutrino --inspect --mode {production,development}
```

Or:

```bash
NODE_ENV={production,development,test} neutrino --inspect
```

As of Neutrino 9, the `--inspect` output when using the official presets is now sufficiently
self-contained that it can be passed to webpack with no additional changes required.

For example:

```bash
echo "module.exports = $(yarn neutrino --inspect --mode production);" > exported-config.js
yarn webpack --config exported-config.js
```
