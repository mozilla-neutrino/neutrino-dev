const htmlLoader = require('@neutrinojs/html-loader');
const styleLoader = require('@neutrinojs/style-loader');
const fontLoader = require('@neutrinojs/font-loader');
const imageLoader = require('@neutrinojs/image-loader');
const compileLoader = require('@neutrinojs/compile-loader');
const htmlTemplate = require('@neutrinojs/html-template');
const clean = require('@neutrinojs/clean');
const devServer = require('@neutrinojs/dev-server');
const pnp = require('@neutrinojs/pnp');
const babelMerge = require('babel-merge');
const merge = require('deepmerge');
const { ConfigurationError } = require('neutrino/errors');

module.exports = (opts = {}) => (neutrino) => {
  if (neutrino.config.module.rules.has('compile')) {
    throw new ConfigurationError(
      '@neutrinojs/web is being used when a `compile` rule already exists, ' +
        'which would overwrite the existing configuration. If you are including ' +
        'this preset manually to customise rules configured by another preset, ' +
        "instead use that preset's own options to do so.",
    );
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const options = merge(
    {
      // Default to an absolute public path, so pushState API sites work.
      // Apps deployed to a subdirectory will need to override this.
      // https://webpack.js.org/configuration/output/#output-publicpath
      publicPath: '/',
      env: false,
      hot: true,
      html: {},
      devtool: {
        development: 'cheap-module-eval-source-map',
        production: undefined,
        test: 'source-map',
      },
      devServer: {
        hot: opts.hot !== false,
      },
      style: {},
      minify: {
        source: isProduction,
      },
      babel: {},
      targets: {},
      font: {},
      image: {},
    },
    opts,
  );

  if ('babel' in options.minify) {
    throw new ConfigurationError(
      'The minify.babel option has been removed. See the web preset docs for how to customise source minification.',
    );
  }

  if ('image' in options.minify) {
    throw new ConfigurationError(
      'The minify.image option has been removed. See: https://github.com/neutrinojs/neutrino/issues/1104',
    );
  }

  if ('style' in options.minify) {
    throw new ConfigurationError(
      'The minify.style option has been removed. To enable style minification use the @neutrinojs/style-minify preset.',
    );
  }

  if ('polyfills' in options) {
    throw new ConfigurationError(
      'The polyfills option has been removed, since polyfills are no longer included by default.',
    );
  }

  if ('hotEntries' in options) {
    throw new ConfigurationError(
      'The hotEntries option has been removed. See the "neutrino.options.mains" ' +
        'docs for how to add custom hot entries to your bundle without importing.',
    );
  }

  if ('manifest' in options) {
    throw new ConfigurationError(
      'The manifest option has been removed. See the v8 to v9 migration guide ' +
        'for how to generate a manifest manually.',
    );
  }

  if (typeof options.devServer.proxy === 'string') {
    throw new ConfigurationError(
      'The shorthand of setting `devServer.proxy` to a string is no longer supported. ' +
        'Use an object and the options listed here instead: ' +
        'https://webpack.js.org/configuration/dev-server/#devserver-proxy',
    );
  }

  if (
    typeof options.devtool === 'string' ||
    typeof options.devtool === 'boolean'
  ) {
    options.devtool = {
      development: options.devtool,
      production: options.devtool,
      test: options.devtool,
    };
  }

  if (options.style && options.style.extract === true) {
    throw new ConfigurationError(
      'Setting `style.extract` to `true` is no longer supported. Override `style.extract.enabled` instead.',
    );
  }

  // Force @babel/preset-env default behavior (.browserslistrc)
  if (options.targets === false) {
    options.targets = {};
  } else if (!options.targets.node && !options.targets.browsers) {
    options.targets.browsers = [
      'last 2 Chrome versions',
      'last 2 Firefox versions',
      'last 2 Edge versions',
      'last 2 Opera versions',
      'last 2 Safari versions',
      'last 2 iOS versions',
    ];
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

  if (options.env) {
    neutrino.config
      .plugin('env')
      .use(require.resolve('webpack/lib/EnvironmentPlugin'), [options.env]);
  }

  const devtool = options.devtool[process.env.NODE_ENV];

  if (devtool !== undefined) {
    neutrino.config.devtool(devtool);
  }

  neutrino.use(pnp());
  neutrino.use(htmlLoader());
  neutrino.use(
    compileLoader({
      include: [neutrino.options.source, neutrino.options.tests],
      babel: options.babel,
    }),
  );

  Object.entries(neutrino.options.mains).forEach(([name, config]) => {
    const { entry, ...htmlTemplateConfig } = config;
    neutrino.config.entry(name).add(entry);

    if (options.html) {
      neutrino.use(
        htmlTemplate(
          merge.all([
            {
              pluginId: `html-${name}`,
              filename: `${name}.html`,
              chunks: [name],
            },
            options.html,
            htmlTemplateConfig,
          ]),
        ),
      );
    }
  });

  neutrino.config.optimization
    .minimize(options.minify.source)
    .splitChunks({
      // By default SplitChunksPlugin only splits out the async chunks (to avoid the
      // ever-changing file list breaking users who don't auto-generate their HTML):
      // https://webpack.js.org/plugins/split-chunks-plugin/#optimization-splitchunks-chunks-all
      // https://github.com/webpack/webpack/issues/7064
      chunks: 'all',
      // Override the default limit of 3 chunks per entrypoint in production, since
      // it speeds up builds and the greater number of requests is mitigated by use
      // of long term caching (and a non-issue if using HTTP2).
      maxInitialRequests: isProduction ? 5 : Infinity,
      // By default the generated files use names that reference the chunk names, eg:
      // `vendors~index~page2.b694ee99.js`. Setting to `false` causes them to use the
      // chunk ID instead (eg `1.ceddedc0.js`), which prevents cache-busting when a
      // new page is added with the same shared vendor dependencies.
      name: !isProduction,
    })
    // Create a separate chunk for the webpack runtime, so it can be cached separately
    // from the more frequently-changing entrypoint chunks.
    .runtimeChunk('single')
    .end()
    .when(options.style, () => neutrino.use(styleLoader(options.style)))
    .when(options.font, () => neutrino.use(fontLoader(options.font)))
    .when(options.image, () => neutrino.use(imageLoader(options.image)))
    .target('web')
    .context(neutrino.options.root)
    .output.path(neutrino.options.output)
    .publicPath(options.publicPath)
    .filename(
      isProduction ? 'assets/[name].[contenthash:8].js' : 'assets/[name].js',
    )
    .end()
    .resolve.extensions // Based on the webpack defaults:
    // https://webpack.js.org/configuration/resolve/#resolve-extensions
    // Keep in sync with the options in the node and library presets.
    .merge([
      '.wasm',
      ...neutrino.options.extensions.map((ext) => `.${ext}`),
      '.json',
    ])
    .end()
    .end()
    .node.set('Buffer', false)
    .set('fs', 'empty')
    .set('tls', 'empty')
    .end()
    // The default output is too noisy, particularly with multiple entrypoints.
    .stats({
      children: false,
      entrypoints: false,
      modules: false,
    })
    .when(process.env.NODE_ENV === 'development', (config) => {
      neutrino.use(devServer(options.devServer));
      config.when(options.hot, (config) => {
        config
          .plugin('hot')
          .use(require.resolve('webpack/lib/HotModuleReplacementPlugin'));
      });
    })
    .when(isProduction, (config) => {
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
                  browser: true,
                  commonjs: true,
                },
              },
            }),
    );
  }
};
