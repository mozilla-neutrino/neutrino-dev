const banner = require('@neutrinojs/banner');
const compileLoader = require('@neutrinojs/compile-loader');
const clean = require('@neutrinojs/clean');
const startServer = require('@neutrinojs/start-server');
const pnp = require('@neutrinojs/pnp');
const babelMerge = require('babel-merge');
const nodeExternals = require('webpack-node-externals');
const { basename, parse, format } = require('path');
const merge = require('deepmerge');
const omit = require('lodash.omit');
const { ConfigurationError } = require('neutrino/errors');

const getOutputForEntry = (entry) =>
  basename(format(merge(omit(parse(entry), ['base']), { ext: '.js' })));

module.exports = (opts = {}) => {
  if ('polyfills' in opts) {
    throw new ConfigurationError(
      'The polyfills option has been removed, since polyfills are no longer included by default.',
    );
  }

  return (neutrino) => {
    const pkg = neutrino.options.packageJson;
    const sourceMap =
      (pkg && pkg.dependencies && pkg.dependencies['source-map-support']) ||
      (pkg &&
        pkg.devDependencies &&
        pkg.devDependencies['source-map-support']) ||
      false;
    const options = merge(
      {
        hot: true,
        targets: {
          // Targets the version of Node.js used to run webpack.
          node: 'current',
        },
      },
      opts,
    );
    const coreJsVersion = neutrino.getDependencyVersion('core-js');

    neutrino.use(pnp());
    neutrino.use(
      compileLoader({
        include: [neutrino.options.source, neutrino.options.tests],
        babel: babelMerge(
          {
            plugins: [require.resolve('@babel/plugin-syntax-dynamic-import')],
            presets: [
              [
                require.resolve('@babel/preset-env'),
                {
                  debug: neutrino.options.debug,
                  targets: options.targets,
                  shippedProposals: true,
                  useBuiltIns: coreJsVersion ? 'usage' : false,
                  ...(coreJsVersion && { corejs: coreJsVersion.major }),
                },
              ],
            ],
          },
          options.babel,
        ),
      }),
    );

    Object.entries(neutrino.options.mains).forEach(([name, config]) =>
      neutrino.config.entry(name).add(config.entry),
    );

    neutrino.config
      .when(sourceMap, () => neutrino.use(banner()))
      .target('node')
      .node.set('__filename', false)
      .set('__dirname', false)
      .end()
      .devtool('source-map')
      .externals([nodeExternals({ whitelist: [/^webpack/] })])
      .context(neutrino.options.root)
      .output.path(neutrino.options.output)
      .libraryTarget('commonjs2')
      .end()
      .resolve.extensions // Based on the webpack defaults:
      // https://webpack.js.org/configuration/resolve/#resolve-extensions
      // Keep in sync with the options in the web and library presets.
      .merge([
        '.wasm',
        ...neutrino.options.extensions.map((ext) => `.${ext}`),
        '.json',
      ])
      .end()
      .end()
      // The default output is too noisy, particularly with multiple entrypoints.
      .stats({
        children: false,
        entrypoints: false,
        modules: false,
      })
      .when(process.env.NODE_ENV === 'development', (config) => {
        const mainKeys = Object.keys(neutrino.options.mains);

        neutrino.use(
          startServer({
            name: getOutputForEntry(neutrino.options.mains[mainKeys[0]].entry),
          }),
        );
        config
          .devtool('inline-sourcemap')
          .output.devtoolModuleFilenameTemplate('[absolute-resource-path]')
          .end()
          .when(options.hot, (config) => {
            config
              .plugin('hot')
              .use(require.resolve('webpack/lib/HotModuleReplacementPlugin'));
            mainKeys.forEach((key) => {
              config
                .entry(key)
                .add(`${require.resolve('webpack/hot/poll')}?1000`);
            });
          });
      })
      .when(process.env.NODE_ENV === 'production', (config) => {
        config.when(options.clean !== false, () =>
          neutrino.use(clean(options.clean)),
        );
      });
  };
};
