const htmlLoader = require('neutrino-middleware-html-loader');
const styleLoader = require('neutrino-middleware-style-loader');
const fontLoader = require('neutrino-middleware-font-loader');
const imageLoader = require('neutrino-middleware-image-loader');
const compileLoader = require('neutrino-middleware-compile-loader');
const env = require('neutrino-middleware-env');
const hot = require('neutrino-middleware-hot');
const htmlTemplate = require('neutrino-middleware-html-template');
const chunk = require('neutrino-middleware-chunk');
const copy = require('neutrino-middleware-copy');
const clean = require('neutrino-middleware-clean');
const minify = require('neutrino-middleware-minify');
const loaderMerge = require('neutrino-middleware-loader-merge');
const devServer = require('neutrino-middleware-dev-server');
const { join, dirname, basename } = require('path');
const merge = require('deepmerge');
const ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin');

const MODULES = join(__dirname, 'node_modules');

module.exports = (neutrino, opts = {}) => {
  const options = merge({
    hot: true,
    html: {},
    devServer: {
      hot: opts.hot !== false
    },
    polyfills: {
      async: true,
      babel: true
    },
    babel: {
      plugins: [
        !opts.polyfills || opts.polyfills.async !== false ?
          [require.resolve('fast-async'), { useRuntimeModule: true }] :
          {},
        require.resolve('babel-plugin-syntax-dynamic-import')
      ],
      presets: [
        [require.resolve('babel-preset-env'), merge({
          targets: {
            browsers: [
              'last 2 Chrome versions',
              'last 2 Firefox versions',
              'last 2 Edge versions',
              'last 2 Opera versions',
              'last 2 Safari versions',
              'last 2 iOS versions'
            ]
          },
          modules: false,
          useBuiltIns: true,
          exclude: !opts.polyfills || opts.polyfills.async !== false ?
            ['transform-regenerator', 'transform-async-to-generator'] :
            []
        }, opts.presetEnv || {})]
      ]
    }
  }, opts);

  neutrino.use(env);
  neutrino.use(htmlLoader);
  neutrino.use(styleLoader);
  neutrino.use(fontLoader);
  neutrino.use(imageLoader);
  neutrino.use(htmlTemplate, options.html);
  neutrino.use(compileLoader, {
    include: [
      neutrino.options.source,
      neutrino.options.tests,
      ...(options.polyfills.babel ? [require.resolve('./polyfills.js')] : [])
    ],
    exclude: [neutrino.options.static],
    babel: options.babel
  });

  neutrino.config
    .when(process.env.NODE_ENV !== 'test', () => neutrino.use(chunk))
    .target('web')
    .context(neutrino.options.root)
    .when(options.polyfills.babel, config => config
      .entry('polyfill')
        .add(require.resolve('./polyfills.js')))
    .when(options.polyfills.async, config => config
      .entry('index')
        .add(require.resolve('nodent-runtime')))
    .entry('index')
      .add(require.resolve('nodent-runtime'))
      .add(neutrino.options.entry)
      .end()
    .output
      .path(neutrino.options.output)
      .publicPath('./')
      .filename('[name].js')
      .chunkFilename('[name].[chunkhash].js')
      .end()
    .resolve
      .alias
        // Make sure 2 versions of "core-js" always match in package.json and babel-polyfill/package.json
        .set('core-js', dirname(require.resolve('core-js')))
        .end()
      .modules
        .add('node_modules')
        .add(neutrino.options.node_modules)
        .add(MODULES)
        .end()
      .extensions
        .add('.js')
        .add('.json')
        .end()
      .end()
    .resolveLoader
      .modules
        .add(neutrino.options.node_modules)
        .add(MODULES)
        .end()
      .end()
    .node
      .set('console', false)
      .set('global', true)
      .set('process', true)
      .set('Buffer', false)
      .set('__filename', 'mock')
      .set('__dirname', 'mock')
      .set('setImmediate', true)
      .set('fs', 'empty')
      .set('tls', 'empty')
      .end()
    .plugin('script-ext')
      .use(ScriptExtHtmlPlugin, [{ defaultAttribute: 'defer' }])
      .end()
    .when(neutrino.config.module.rules.has('lint'), () => neutrino
      .use(loaderMerge('lint', 'eslint'), {
        envs: ['browser', 'commonjs']
      }))
    .when(process.env.NODE_ENV === 'development', (config) => {
      neutrino.use(devServer, options.devServer);

      config
        .devtool('source-map')
        .when(options.hot, () => neutrino.use(hot));
    }, (config) => {
      neutrino.use(hashedModuleIds);
      neutrino.use(clean, { paths: [neutrino.options.output] });
      neutrino.use(minify);
      neutrino.use(copy, {
        patterns: [{
          context: neutrino.options.static,
          from: '**/*',
          to: basename(neutrino.options.static)
        }]
      });
      config.output.filename('[name].[chunkhash].js');
    });
};
