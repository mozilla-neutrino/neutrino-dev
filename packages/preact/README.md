# Neutrino Preact Preset

`@neutrinojs/preact` is a Neutrino preset that supports building Preact web
applications.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Features

- Zero upfront configuration necessary to start developing and building a Preact
  web app
- Modern Babel compilation adding JSX, object rest spread syntax, and class
  properties.
- Write JSX in .js or .jsx files
- Compatibility and pre-configured aliasing for React-based modules and packages
- Extends from [@neutrinojs/web](https://neutrinojs.org/packages/web/)
  - Modern Babel compilation supporting ES modules, last 2 major browser
    versions, async functions, and dynamic imports
  - webpack loaders for importing HTML, CSS, images, icons, and fonts
  - webpack Dev Server during development
  - Automatic creation of HTML pages, no templating necessary
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

`@neutrinojs/preact` can be installed via the Yarn or npm clients. Inside your
project, make sure that the Neutrino and webpack related dependencies below are
installed as development dependencies. You will also need `preact` for actual
Preact development.

#### Yarn

```bash
❯ yarn add --dev neutrino @neutrinojs/preact webpack webpack-cli webpack-dev-server
❯ yarn add preact
```

#### npm

```bash
❯ npm install --save-dev neutrino @neutrinojs/preact webpack webpack-cli webpack-dev-server
❯ npm install --save preact
```

After that, add a new directory named `src` in the root of the project, with a
single JS file named `index.js` in it.

```bash
❯ mkdir src && touch src/index.js
```

This Preact preset exposes an element in the page with an ID of `root` to which
you can mount your application. Edit your `src/index.js` file with the
following:

```jsx
import { render } from 'preact';

render(<h1>Hello world!</h1>, document.getElementById('root'));
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
const preact = require('@neutrinojs/preact');

module.exports = {
  use: [preact()],
};
```

And create a `webpack.config.js` file, that uses the Neutrino API to access the
generated webpack config:

```js
const neutrino = require('neutrino');

module.exports = neutrino().webpack();
```

Start the app, then open a browser to the address in the console:

#### Yarn

```bash
❯ yarn start
```

#### npm

```bash
❯ npm start
```

## Project Layout

`@neutrinojs/preact` follows the standard
[project layout](https://neutrinojs.org/project-layout/) specified by Neutrino.
This means that by default all project source code should live in a directory
named `src` in the root of the project. This includes JavaScript files, CSS
stylesheets, images, and any other assets that would be available to import your
compiled project.

## Building

`@neutrinojs/preact` builds static assets to the `build` directory by default
when running `yarn build`. You can either serve or deploy the contents of this
`build` directory as a static site.

## Static assets

If you wish to copy files to the build directory that are not imported from
application code, use the
[@neutrinojs/copy](https://neutrinojs.org/packages/copy/) preset alongside this
one.

## Deployment Path

By default `@neutrinojs/preact` assumes that your application will be deployed
at the root of a domain (eg: `https://www.my-app.com/`), and so sets webpack's
[`output.publicPath`](https://webpack.js.org/configuration/output/#output-publicpath)
to `'/'`, which means assets will be loaded from the site root using absolute
paths.

If your app is instead deployed within a subdirectory, you will need to adjust
the `publicPath` [preset option](#preset-options). For example if your app is
hosted at `https://my-username.github.io/my-app/`, you will need to set
`publicPath` to `'/my-app/'`.

Alternatively, if you would like your app to be able to be served from any
location, and are not using the HTML5 pushState history API or client-side
routing, then you can set `publicPath` to the empty string, which will cause
relative asset paths to be used instead.

## Preset options

You can provide custom options and have them merged with this preset's default
options to easily affect how this preset builds. You can modify Preact preset
settings from `.neutrinorc.js` by overriding with an options object. The
following shows how you can pass an options object to the Preact preset and
override its options. See the
[Web documentation](https://neutrinojs.org/packages/web/#preset-options) for
specific options you can override with this object.

```js
const preact = require('@neutrinojs/preact');

module.exports = {
  use: [
    preact({
      /* preset options */

      // Example: disable Hot Module Replacement
      hot: false,

      // Controls webpack's `output.publicPath` setting.
      // See the "Deployment Path" section above for more info.
      publicPath: '/',

      // Example: change the page title
      html: {
        title: 'Epic Preact App',
      },

      // Target specific browsers with @babel/preset-env
      targets: {
        browsers: ['last 1 Chrome versions', 'last 1 Firefox versions'],
      },

      // Add additional Babel plugins, presets, or env options
      babel: {
        // Override options for @babel/preset-env:
        presets: [
          [
            '@babel/preset-env',
            {
              useBuiltIns: 'usage',
            },
          ],
        ],
      },
    }),
  ],
};
```

## Customizing

To override the build configuration, start with the documentation on
[customization](https://neutrinojs.org/customization/). `@neutrinojs/preact`
does not use any additional named rules, loaders, or plugins that aren't already
in use by the Web preset. See the
[Web documentation customization](https://neutrinojs.org/packages/web/#customizing)
for preset-specific configuration to override.

For details on merging and overriding Babel configuration, such as supporting
decorator syntax, read more about using the
[`compile-loader` `merge`](https://neutrinojs.org/packages/compile-loader/#advanced-merging)
once you are comfortable customizing your build.

If the need arises, you can also compile `node_modules` by referring to the
relevant
[`compile-loader` documentation](https://neutrinojs.org/packages/compile-loader/#compiling-node_modules).

### Advanced configuration

By following the [customization guide](https://neutrinojs.org/customization/)
and knowing the rule, loader, and plugin IDs from `@neutrinojs/web`, you can
override and augment the build by providing a function to your `.neutrinorc.js`
use array. You can also make these changes from the Neutrino API in custom
middleware.

By default Neutrino, and therefore this preset, creates a single **main**
`index` entry point to your application, and this maps to the `index.*` file in
the `src` directory. The extension is resolved by webpack. This value is
provided by `neutrino.options.mains` at `neutrino.options.mains.index`.

If you wish to output multiple pages, you can configure them like so:

```js
const preact = require('@neutrinojs/preact');

module.exports = {
  options: {
    mains: {
      index: {
        // outputs index.html from src/index.*
        entry: 'index',
        // Additional options are passed to html-webpack-plugin, and override
        // any defaults set via the preset's `html` option.
        title: 'Site Homepage',
      },
      admin: {
        // outputs admin.html from src/admin.*
        entry: 'admin',
        title: 'Admin Dashboard',
      },
      account: {
        // outputs account.html from src/user.* using a custom HTML template.
        entry: 'user',
        inject: true,
        template: 'my-custom-template.html',
      },
    },
  },
  use: [preact()],
};
```

#### Vendoring

External dependencies are automatically split into separate chunks from the
application code, by the new webpack
[SplitChunksPlugin](https://webpack.js.org/plugins/split-chunks-plugin/).

_Example: The splitChunks settings can be adjusted like so:_

```js
const preact = require('@neutrinojs/preact');

module.exports = {
  use: [
    preact(),
    (neutrino) => {
      neutrino.config.optimization.merge({
        splitChunks: {
          // Decrease the minimum size before extra chunks are created, to 10KB
          minSize: 10000,
        },
      });
    },
  ],
};
```

## Hot Module Replacement

While `@neutrinojs/preact` supports Hot Module Replacement, it does require some
application-specific changes in order to operate.

- Perform the application render in a reusable function for initial load and
  subsequent reloads.
- Add the `hot` acceptance to call this function.

For example:

```jsx
import { render } from 'preact';
import App from './App';

let mount;
const root = document.getElementById('root');
const load = (App) => {
  mount = render(<App />, root, mount);
};

if (module.hot) {
  module.hot.accept('./App', () => requestAnimationFrame(() => {
    load(require('./App').default);
  ));
}

load(App);
```

## Preact Devtools

To use the React Devtools for your Preact project, require the preact devtools
during the `development` environment within your main entry file (typically
`src/index`):

```js
if (process.env.NODE_ENV === 'development') {
  require('preact/devtools');
}
```

## Contributing

This preset is part of the [neutrino](https://github.com/neutrinojs/neutrino)
repository, a monorepo containing all resources for developing Neutrino and its
core presets and middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/preact.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/preact.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/preact
