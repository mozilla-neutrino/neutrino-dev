# Neutrino Web Preset

`@neutrinojs/web` is a Neutrino preset that supports building generic
applications for the web.

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url]

## Features

- Zero upfront configuration necessary to start developing and building a web
  app
- Modern Babel compilation supporting ES modules, last 2 major browser versions,
  async functions, and dynamic imports
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

`@neutrinojs/web` can be installed via the Yarn or npm clients. Inside your
project, make sure that the dependencies below are installed as development
dependencies.

#### Yarn

```bash
❯ yarn add --dev neutrino @neutrinojs/web webpack webpack-cli webpack-dev-server
```

#### npm

```bash
❯ npm install --save-dev neutrino @neutrinojs/web webpack webpack-cli webpack-dev-server
```

After that, add a new directory named `src` in the root of the project, with a
single JS file named `index.js` in it.

```bash
❯ mkdir src && touch src/index.js
```

This Web preset exposes an element in the page with an ID of `root` to which you
can mount your application. Edit your `src/index.js` file with the following:

```js
const app = document.createElement('main');
const text = document.createTextNode('Hello world!');

app.appendChild(text);
document.getElementById('root').appendChild(app);
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
const web = require('@neutrinojs/web');

module.exports = {
  use: [web()],
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

`@neutrinojs/web` follows the standard
[project layout](https://neutrinojs.org/project-layout/) specified by Neutrino.
This means that by default all project source code should live in a directory
named `src` in the root of the project. This includes JavaScript files, CSS
stylesheets, images, and any other assets that would be available to your
compiled project.

## Building

`@neutrinojs/web` builds static assets to the `build` directory by default when
running `yarn build`. You can either serve or deploy the contents of this
`build` directory as a static site.

## Static assets

If you wish to copy files to the build directory that are not imported from
application code, use the
[@neutrinojs/copy](https://neutrinojs.org/packages/copy/) preset alongside this
one.

## Deployment Path

By default `@neutrinojs/web` assumes that your application will be deployed at
the root of a domain (eg: `https://www.my-app.com/`), and so sets webpack's
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
options to easily affect how this preset builds. You can modify Web preset
settings from `.neutrinorc.js` by overriding with an options object. The
following shows how you can pass an options object to the Web preset and
override its options:

```js
const web = require('@neutrinojs/web');

module.exports = {
  use: [
    web({
      // Enables and configures `EnvironmentPlugin`. See below for example usage.
      env: false,

      // Enables Hot Module Replacement. Set to false to disable
      hot: true,

      // Controls webpack's `output.publicPath` setting.
      // See the "Deployment Path" section above for more info.
      publicPath: '/',

      // Change options for @neutrinojs/style-loader
      style: {},

      // Change options for @neutrinojs/font-loader
      font: {},

      // Change options for @neutrinojs/image-loader
      image: {},

      minify: {
        // Javascript minification occurs only in production by default.
        // To change uglify-es options or switch to another minifier, see below.
        source: process.env.NODE_ENV === 'production',
      },

      // Change options related to generating the HTML document
      // See @neutrinojs/html-template for the defaults
      // used by the Web preset
      html: {},

      // Control which source map types are enabled for each NODE_ENV
      devtool: {
        development: 'eval-cheap-module-source-map',
        production: undefined,
        test: 'source-map',
      },

      // Change options related to starting a webpack-dev-server
      devServer: {
        // Disabling options.hot will also disable devServer.hot
        hot: options.hot,
        // Proxy requests that don't match a known file to the specified backend.
        proxy: 'https://localhost:8000/api/',
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

_Example: Disable Hot Module Replacement and change the page title:_

```js
const web = require('@neutrinojs/web');

module.exports = {
  use: [
    web({
      /* preset options */

      // Example: disable Hot Module Replacement
      hot: false,

      // Example: disable image-loader, style-loader, font-loader
      image: false,
      style: false,
      font: false,

      // Disable javascript minification entirely
      minify: {
        source: false,
      },

      // Disable cleaning the output build directory
      clean: false,

      // Example: change the page title
      html: {
        title: 'Epic Web App',
      },

      // Example: Proxy webpack-dev-server requests to http://localhost:3000
      devServer: {
        proxy: 'http://localhost:3000',
      },
    }),
  ],
};
```

### Environment variables

To use environment variables at compile time, use the `env` setting to enable
and configure
[EnvironmentPlugin](https://webpack.js.org/plugins/environment-plugin/) (`env`
accepts the same options as the plugin). There is no need to specify `NODE_ENV`,
since webpack defines it automatically. The environment variables can then be
used via `process.env.<NAME>`.

For example:

```js
web({
  env: [
    // webpack will output a warning if these are not defined in the environment.
    'VAR_ONE',
    'VAR_TWO',
  ],
});
```

Or to set default values, use the object form:

```js
web({
  env: {
    VAR_ONE: 'foo',
    VAR_TWO: 'bar',
  },
});
```

### Dev Server Proxy

If you are handling requests with a server, you may want to set up a proxy for
development. See webpack's
[`devServer.proxy`](https://webpack.js.org/configuration/dev-server/#devserver-proxy)
for all available options.

For example:

```js
web({
  devServer: {
    proxy: {
      '**': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### Source Maps

By default, the `'eval-cheap-module-source-map'` source map is enabled when
`NODE_ENV` is `'development'`, `'source-map'` for `'test'` and no source maps
for `'production'`.

To customise this, use the preset's `devtool` option, for example:

```js
web({
  devtool: {
    // Enable source-maps in production
    production: 'source-map',
  },
});
```

For the differences between each source map type, see the
[webpack devtool docs](https://webpack.js.org/configuration/devtool/).

### Targets

```js
web({
  // Use targets from a .browserslistrc file.
  targets: false,
});
```

Setting to `false` will override Neutrino's default targets and allow
`@babel/preset-env` to read targets from a
[`.browserslistrc` file](https://babeljs.io/docs/en/babel-preset-env#browserslist-integration).

When using a `.browserslistrc` file, be aware that file changes may not
invalidate cache as expected: https://github.com/babel/babel-loader/issues/690

See [`@babel/preset-env`](https://babeljs.io/docs/en/babel-preset-env#targets)
for all other available settings.

## Hot Module Replacement

While `@neutrinojs/web` supports Hot Module Replacement your app, it does
require some application-specific changes in order to operate. Your application
should define split points for which to accept modules to reload using
`module.hot`:

For example:

```js
import app from './app';

document.getElementById('root').appendChild(app('Hello world!'));

if (module.hot) {
  module.hot.accept('./app');
}
```

Or for all paths:

```js
import app from './app';

document.getElementById('root').appendChild(app('Hello world!'));

if (module.hot) {
  module.hot.accept();
}
```

Using dynamic imports with `import()` will automatically create split points and
hot replace those modules upon modification during development.

## Customizing

To override the build configuration, start with the documentation on
[customization](https://neutrinojs.org/customization/). `@neutrinojs/web`
creates some conventions to make overriding the configuration easier once you
are ready to make changes.

By default Neutrino, and therefore this preset, creates a single **main**
`index` entry point to your application, and this maps to the `index.*` file in
the `src` directory. The extension is resolved by webpack. This value is
provided by `neutrino.options.mains` at `neutrino.options.mains.index`.

If you wish to output multiple pages, you can configure them like so:

```js
const web = require('@neutrinojs/web');

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
  use: [web()],
};
```

If the need arises, you can compile `node_modules` by referring to the relevant
[`compile-loader` documentation](https://neutrinojs.org/packages/compile-loader/#compiling-node_modules).

### Rules

The following is a list of rules and their identifiers which can be overridden:

| Name      | Description                                                                                                                                   | NODE_ENV |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `compile` | Compiles JS files from the `src` directory using Babel. Contains a single loader named `babel`. From `@neutrinojs/compile-loader`.            | all      |
| `html`    | Allows importing HTML files from modules. Contains a single loader named `html`. From `@neutrinojs/html-loader`.                              | all      |
| `style`   | A parent rule containing `oneOf` rules for importing stylesheets. From `@neutrinojs/style-loader`.                                            | all      |
| `image`   | Allows importing ICO, JPEG, PNG, GIF, SVG and WEBP files from modules. Contains a single loader named `url`. From `@neutrinojs/image-loader`. | all      |
| `font`    | Allows importing EOT, TTF, WOFF and WOFF2 font files from modules. Contains a single loader named `file`. From `@neutrinojs/font-loader`.     | all      |

### Plugins

The following is a list of plugins and their identifiers which can be
overridden:

_Note: Some plugins are only available in certain environments. To override
them, they should be modified conditionally._

| Name               | Description                                                                                                                                                                                                                                                      | NODE_ENV        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `env`              | Inject environment variables into source code at `process.env`, using `EnvironmentPlugin`.                                                                                                                                                                       | all             |
| `extract`          | Extracts CSS from JS bundle into a separate stylesheet file. From `@neutrinojs/style-loader`.                                                                                                                                                                    | `'production'`  |
| `html-{MAIN_NAME}` | Automatically generates HTML files for configured entry points. `{MAIN_NAME}` corresponds to the entry point of each page. By default, there is only a single `index` main, so this would generate a plugin named `html-index`. From `@neutrinojs/html-template` | all             |
| `hot`              | Enables Hot Module Replacement.                                                                                                                                                                                                                                  | `'development'` |
| `clean`            | Clean or remove the `build` directory prior to building. From `@neutrinojs/clean`.                                                                                                                                                                               | `'production'`  |

### Override configuration

By following the [customization guide](https://neutrinojs.org/customization/)
and knowing the rule, loader, and plugin IDs above, you can override and augment
the build by by providing a function to your `.neutrinorc.js` use array. You can
also make these changes from the Neutrino API in custom middleware.

#### Vendoring

External dependencies are automatically split into separate chunks from the
application code, by the new webpack
[SplitChunksPlugin](https://webpack.js.org/plugins/split-chunks-plugin/).

_Example: The splitChunks settings can be adjusted like so:_

```js
const web = require('@neutrinojs/web');

module.exports = {
  use: [
    web(),
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

#### Source minification

By default script sources are minified in production only, using webpack's
default of
[terser-webpack-plugin](https://github.com/webpack-contrib/terser-webpack-plugin).
To customise the options passed to `TerserPlugin` or even use a different
minifier, override `optimization.minimizer`.

_Example: Adjust the `terser` minification settings:_

```js
const web = require('@neutrinojs/web');

module.exports = {
  use: [
    web(),
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

## Contributing

This preset is part of the [neutrino](https://github.com/neutrinojs/neutrino)
repository, a monorepo containing all resources for developing Neutrino and its
core presets and middleware. Follow the
[contributing guide](https://neutrinojs.org/contributing/) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/web.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/web.svg
[npm-url]: https://www.npmjs.com/package/@neutrinojs/web
