# Neutrino React Components Preset

`@neutrinojs/react-components` is a Neutrino preset that supports creating
generic React components. Plays nicely with other Neutrino middleware, so you
can build, test, and publish multiple React components from a single repository.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Features

- Extends partially from
  [@neutrinojs/react](https://neutrinojs.org/packages/react/)
- Zero upfront configuration necessary to start developing and building React
  components.
- Modern Babel compilation adding JSX, object rest spread syntax, and class
  properties.
- Support for React Hot Loader
- Write JSX in .js or .jsx files
- Compiles to ES5 to support major browsers, publishing to npm, and library
  interoperability
- Extends partially from [@neutrinojs/web](https://neutrinojs.org/packages/web/)
  - Modern Babel compilation supporting ES modules, async functions, and dynamic
    imports
  - webpack loaders for importing HTML, CSS, images, icons, and fonts
  - webpack Dev Server during development
  - Automatic stylesheet extraction; importing stylesheets into modules creates
    bundled external stylesheets
  - Pre-configured to support CSS Modules via `*.module.css` file extensions
  - Hot Module Replacement support including CSS
  - Tree-shaking to create smaller bundles
  - Production-optimized bundles with minification, easy chunking, and
    scope-hoisted modules for faster execution
  - Easily extensible to customize your project as needed

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
- webpack-dev-server 3

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

`@neutrinojs/react-components` can be installed via the Yarn or npm clients.
Inside your project, make sure that the Neutrino and webpack related
dependencies below are installed as development dependencies. You will also need
React and React DOM for actual component development.

#### Yarn

```bash
❯ yarn add --dev neutrino @neutrinojs/react-components webpack webpack-cli webpack-dev-server
❯ yarn add react react-dom
```

#### npm

```bash
❯ npm install --save-dev neutrino @neutrinojs/react-components webpack webpack-cli webpack-dev-server
❯ npm install --save react react-dom
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
single JS file named `index.js` in it. This `index` file can be used to render
any components you wish to the browser to preview and.

```bash
❯ mkdir src && touch src/index.js
```

Your components will go in a `components` directory inside `src`:

```bash
❯ mkdir src/components
```

Edit your `src/index.js` file with the following:

```js
import React from 'react';
import { render } from 'react-dom';
import YourCustomComponent from './components/YourCustomComponent';

const root = document.getElementById('root');

render(<YourCustomComponent />, root);
```

Now edit your project's `package.json` to add commands for starting and building
the application:

```json
{
  "scripts": {
    "start": "webpack-dev-server --mode development --open",
    "build": "webpack --mode production"
  }
}
```

Then create a `.neutrinorc.js` file alongside `package.json`, which contains
your Neutrino configuration:

```js
const reactComponents = require('@neutrinojs/react-components');

module.exports = {
  use: [reactComponents()],
};
```

And create a `webpack.config.js` file, that uses the Neutrino API to access the
generated webpack config:

```js
const neutrino = require('neutrino');

module.exports = neutrino().webpack();
```

Start the app, then open a browser to the address in the console to preview your
components:

#### Yarn

```bash
❯ yarn start
```

#### npm

```bash
❯ npm start
```

## Project Layout

`@neutrinojs/react-components` follows the standard
[project layout](https://neutrinojs.org/project-layout/) specified by Neutrino.
This means that by default all project source code should live in a directory
named `src` in the root of the project. This includes JavaScript files that
would be available to your compiled project.

All components should be their own module within a directory named `components`
inside the source directory.

## Building

`@neutrinojs/react-components` builds components to the `build` directory by
default when running `yarn build`. You can then publish these components to npm.
When publishing your project to npm, consider excluding your `src` directory in
`package.json` by using the `files` property to whitelist `build`, or via
`.npmignore` to blacklist `src`. Components are generated as UMD named modules,
with the name corresponding to the component file name. e.g.
`src/components/Custom/index.js` maps to `Custom`, as well as
`src/components/Custom.js` mapping to `Custom`.

These modules are ES-compatible modules, so they can be `import`ed as expected.
If you want to use them with CJS `require`, you'll need to use the `.default`
property to access the default exports:

```js
const YourCustomComponent = require('your-custom-component').default;
```

By default this preset creates an individual entry point for every top-level
component found in `src/components`. These are set and accessible via the API at
[`neutrino.options.mains`](https://neutrinojs.org/api/#optionsmains).

## Hot Module Replacement

While `@neutrinojs/react-components` supports Hot Module Replacement for your
app, it does require some changes to the preview app in order to operate. The
preview app should define split points for which to accept modules (Components)
to reload using `module.hot`. See the
[React preset docs](https://neutrinojs.org/packages/react/#hot-module-replacement)
for guidance.

## Customizing

To override the build configuration, start with the documentation on
[customization](https://neutrinojs.org/customization/).
`@neutrinojs/react-components` uses a few rules and plugins in addition to the
ones in use by the React and Web presets. See the
[Web documentation customization](https://neutrinojs.org/packages/web/#customizing)
for preset-specific configuration to override.

By default this preset creates an individual entry point for every top-level
component found in `src/components`. These are set and accessible via the API at
[`neutrino.options.mains`](https://neutrinojs.org/api/#optionsmains).

If the need arises, you can also compile `node_modules` by referring to the
relevant
[`compile-loader` documentation](https://neutrinojs.org/packages/compile-loader/#compiling-node_modules).

### Rules

This plugin does not define any additional rules or loaders in addition to those
already used by `@neutrinojs/web` and `@neutrinojs/react`.

### Plugins

The following is a list of plugins and their identifiers which can be overridden
(in addition to the plugins used by the React/Web presets):

_Note: Some plugins are only available in certain environments. To override
them, they should be modified conditionally._

| Name     | Description                                                                                                                                           | Environments          |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `banner` | Injects source-map-support into the mains (entry points) of your application if detected in `dependencies` or `devDependencies` of your package.json. | all but `development` |

By following the [customization guide](https://neutrinojs.org/customization/)
and knowing the rule, loader, and plugin IDs above, you can override and augment
the build by by providing a function to your `.neutrinorc.js` use array. You can
also make these changes from the Neutrino API in custom middleware.

_Example: Change the name of the components directory:_

```js
const reactComponents = require('@neutrinojs/react-components');

module.exports = {
  use: [
    reactComponents({
      components: 'react-stuff', // now you can put your components in src/react-stuff/
    }),
  ],
};
```

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/react-components.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/react-components.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/react-components
