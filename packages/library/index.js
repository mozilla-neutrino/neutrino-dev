const banner = require('@neutrinojs/banner');
const compileLoader = require('@neutrinojs/compile-loader');
const clean = require('@neutrinojs/clean');
const babelMerge = require('babel-merge');
const merge = require('deepmerge');
const nodeExternals = require('webpack-node-externals');
const { ConfigurationError } = require('neutrino/errors');

module.exports = (opts = {}) => {
  if (!opts.name) {
    throw new ConfigurationError(
      'Missing required preset option "name". You must specify a library name when using this preset.',
    );
  }

  if ('polyfills' in opts) {
    throw new ConfigurationError(
      'The polyfills option has been removed, since polyfills are no longer included by default.',
    );
  }

  return (neutrino) => {
    const options = merge(
      {
        target: 'web',
        libraryTarget: 'umd',
        babel: {},
        externals: {},
        targets: {},
      },
      opts,
    );

    if (options.targets === false) {
      Object.assign(options, { targets: {} });
    }

    const coreJsVersion = neutrino.getDependencyVersion('core-js');

    Object.assign(options, {
      babel: babelMerge(
        {
          plugins: [require.resolve('@babel/plugin-syntax-dynamic-import')],
          presets: [
            [
              require.resolve('@babel/preset-env'),
              {
                debug: neutrino.options.debug,
                useBuiltIns: coreJsVersion ? 'usage' : false,
                shippedProposals: true,
                targets: options.targets,
                ...(coreJsVersion && { corejs: coreJsVersion.major }),
              },
            ],
          ],
        },
        options.babel,
      ),
    });

    const pkg = neutrino.options.packageJson;
    const hasSourceMap =
      (pkg.dependencies && 'source-map-support' in pkg.dependencies) ||
      (pkg.devDependencies && 'source-map-support' in pkg.devDependencies);

    neutrino.use(
      compileLoader({
        include: [neutrino.options.source, neutrino.options.tests],
        babel: options.babel,
      }),
    );

    Object.entries(neutrino.options.mains).forEach(([name, config]) =>
      neutrino.config.entry(name).add(config.entry),
    );

    neutrino.config
      .when(
        options.externals !== false && process.env.NODE_ENV !== 'test',
        (config) => config.externals([nodeExternals(options.externals)]),
      )
      .when(hasSourceMap, () => neutrino.use(banner()))
      .devtool('source-map')
      .target(options.target)
      .context(neutrino.options.root)
      .output.path(neutrino.options.output)
      .library(options.name)
      .libraryTarget(options.libraryTarget)
      .when(options.libraryTarget === 'umd', (output) =>
        output.umdNamedDefine(true),
      )
      .end()
      .resolve.extensions // Based on the webpack defaults:
      // https://webpack.js.org/configuration/resolve/#resolve-extensions
      // Keep in sync with the options in the node and web presets.
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
      .when(process.env.NODE_ENV === 'production', (config) => {
        config.when(options.clean !== false, () =>
          neutrino.use(clean(options.clean)),
        );
      });

    const lintRule = neutrino.config.module.rules.get('lint');
    if (lintRule) {
      lintRule.use('eslint').tap(
        // Don't adjust the lint configuration for projects using their own .eslintrc.
        (lintOptions) =>
          lintOptions.useEslintrc
            ? lintOptions
            : merge(lintOptions, {
                baseConfig: {
                  env: {
                    ...(options.target === 'web' && { browser: true }),
                    commonjs: true,
                  },
                },
              }),
      );
    }
  };
};
