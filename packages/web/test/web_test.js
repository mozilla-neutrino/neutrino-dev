import { resolve } from 'path';

import test from 'ava';
import { validate } from 'webpack';

import lint from '../../eslint';
import Neutrino from '../../neutrino/Neutrino';

const mw = (...args) => require('..')(...args);
const expectedExtensions = ['.wasm', '.mjs', '.jsx', '.js', '.json'];
const originalNodeEnv = process.env.NODE_ENV;

test.afterEach(() => {
  // Restore the original NODE_ENV after each test (which Ava defaults to 'test').
  process.env.NODE_ENV = originalNodeEnv;
});

test('loads preset', (t) => {
  t.notThrows(() => require('..'));
});

test('uses preset', (t) => {
  t.notThrows(() => new Neutrino().use(mw()));
});

test('valid preset production', (t) => {
  process.env.NODE_ENV = 'production';
  const api = new Neutrino();
  api.use(mw());
  const config = api.config.toConfig();

  // Common
  t.is(config.target, 'web');
  t.deepEqual(config.resolve.extensions, expectedExtensions);
  t.is(config.optimization.runtimeChunk, 'single');
  t.is(config.optimization.splitChunks.chunks, 'all');
  t.deepEqual(config.stats, {
    children: false,
    entrypoints: false,
    modules: false,
  });

  // NODE_ENV/command specific
  t.true(config.optimization.minimize);
  t.is(config.output.publicPath, '/');
  t.is(config.devtool, undefined);
  t.is(config.devServer, undefined);

  t.is(validate(config), undefined);
});

test('valid preset development', (t) => {
  process.env.NODE_ENV = 'development';
  const api = new Neutrino();
  api.use(mw());
  const config = api.config.toConfig();

  // Common
  t.is(config.target, 'web');
  t.deepEqual(config.resolve.extensions, expectedExtensions);
  t.is(config.optimization.runtimeChunk, 'single');
  t.is(config.optimization.splitChunks.chunks, 'all');
  t.is(config.output.publicPath, '/');
  t.deepEqual(config.stats, {
    children: false,
    entrypoints: false,
    modules: false,
  });

  // NODE_ENV/command specific
  t.false(config.optimization.minimize);
  t.is(config.devtool, 'eval-cheap-module-source-map');
  t.deepEqual(config.devServer, {
    historyApiFallback: true,
    hot: true,
    overlay: true,
    port: 5000,
    stats: {
      all: false,
      errors: true,
      timings: true,
      warnings: true,
    },
  });

  t.is(validate(config), undefined);
});

test('valid preset test', (t) => {
  process.env.NODE_ENV = 'test';
  const api = new Neutrino();
  api.use(mw());
  const config = api.config.toConfig();

  // Common
  t.is(config.target, 'web');
  t.deepEqual(config.resolve.extensions, expectedExtensions);
  t.is(config.optimization.runtimeChunk, 'single');
  t.is(config.optimization.splitChunks.chunks, 'all');
  t.is(config.output.publicPath, '/');
  t.deepEqual(config.stats, {
    children: false,
    entrypoints: false,
    modules: false,
  });

  // NODE_ENV/command specific
  t.false(config.optimization.minimize);
  t.is(config.devtool, 'source-map');
  t.is(config.devServer, undefined);

  t.is(validate(config), undefined);
});

test('devtool string option production', (t) => {
  process.env.NODE_ENV = 'production';
  const api = new Neutrino();
  api.use(mw({ devtool: 'source-map' }));
  const config = api.config.toConfig();

  t.is(config.devtool, 'source-map');
});

test('devtool object option production', (t) => {
  process.env.NODE_ENV = 'production';
  const api = new Neutrino();
  api.use(
    mw({
      devtool: {
        production: 'source-map',
      },
    }),
  );
  const config = api.config.toConfig();

  t.is(config.devtool, 'source-map');
});

test('devtool string option development', (t) => {
  process.env.NODE_ENV = 'development';
  const api = new Neutrino();
  api.use(mw({ devtool: 'source-map' }));
  const config = api.config.toConfig();

  t.is(config.devtool, 'source-map');
});

test('devtool object option development', (t) => {
  process.env.NODE_ENV = 'development';
  const api = new Neutrino();
  api.use(
    mw({
      devtool: {
        development: 'source-map',
      },
    }),
  );
  const config = api.config.toConfig();

  t.is(config.devtool, 'source-map');
});

test('devtool string option test', (t) => {
  process.env.NODE_ENV = 'test';
  const api = new Neutrino();
  api.use(mw({ devtool: 'cheap-eval-source-map' }));
  const config = api.config.toConfig();

  t.is(config.devtool, 'cheap-eval-source-map');
});

test('devtool object option test', (t) => {
  process.env.NODE_ENV = 'test';
  const api = new Neutrino();
  api.use(
    mw({
      devtool: {
        test: 'cheap-eval-source-map',
      },
    }),
  );
  const config = api.config.toConfig();

  t.is(config.devtool, 'cheap-eval-source-map');
});

test('supports env option using array form', (t) => {
  const api = new Neutrino();

  const env = ['VAR1', 'VAR2'];
  api.use(mw({ env }));
  t.deepEqual(api.config.plugin('env').get('args'), [env]);
});

test('supports env option using object form', (t) => {
  const api = new Neutrino();

  const env = { VAR: 'default-value' };
  api.use(mw({ env }));
  t.deepEqual(api.config.plugin('env').get('args'), [env]);
});

test('supports multiple mains with custom html-webpack-plugin options', (t) => {
  const mains = {
    index: './index',
    admin: {
      entry: './admin',
      title: 'Admin Dashboard',
    },
  };
  const api = new Neutrino({ mains });

  api.use(mw({ html: { title: 'Default Title', minify: false } }));

  const templatePath = resolve(__dirname, '../../html-template/template.ejs');

  t.deepEqual(api.config.plugin('html-index').get('args'), [
    {
      appMountId: 'root',
      chunks: ['index'],
      filename: 'index.html',
      lang: 'en',
      meta: {
        viewport: 'width=device-width, initial-scale=1',
      },
      minify: false,
      template: templatePath,
      title: 'Default Title',
    },
  ]);

  t.deepEqual(api.config.plugin('html-admin').get('args'), [
    {
      appMountId: 'root',
      chunks: ['admin'],
      filename: 'admin.html',
      lang: 'en',
      meta: {
        viewport: 'width=device-width, initial-scale=1',
      },
      minify: false,
      template: templatePath,
      title: 'Admin Dashboard',
    },
  ]);
});

test('throws when used twice', (t) => {
  const api = new Neutrino();
  api.use(mw());
  t.throws(
    () => api.use(mw()),
    /@neutrinojs\/web is being used when a `compile` rule already exists/,
  );
});

test('throws when minify.babel defined', (t) => {
  const api = new Neutrino();
  t.throws(
    () => api.use(mw({ minify: { babel: false } })),
    /The minify\.babel option has been removed/,
  );
});

test('throws when minify.image defined', (t) => {
  const api = new Neutrino();
  t.throws(
    () => api.use(mw({ minify: { image: true } })),
    /The minify\.image option has been removed/,
  );
});

test('throws when minify.style defined', (t) => {
  const api = new Neutrino();
  t.throws(
    () => api.use(mw({ minify: { style: false } })),
    /The minify\.style option has been removed/,
  );
});

test('throws when polyfills defined', (t) => {
  const api = new Neutrino();
  t.throws(
    () => api.use(mw({ polyfills: {} })),
    /The polyfills option has been removed/,
  );
});

test('throws when manifest defined', (t) => {
  const api = new Neutrino();
  t.throws(
    () => api.use(mw({ manifest: {} })),
    /The manifest option has been removed/,
  );
});

test('throws when hotEntries defined', (t) => {
  const api = new Neutrino();
  t.throws(
    () => api.use(mw({ hotEntries: [] })),
    /The hotEntries option has been removed/,
  );
});

test('throws when devServer.proxy is the deprecated string shorthand', (t) => {
  const api = new Neutrino();
  t.throws(
    () => api.use(mw({ devServer: { proxy: 'foo' } })),
    /setting `devServer.proxy` to a string is no longer supported/,
  );
});

test('throws when style.extract is true', (t) => {
  const api = new Neutrino();
  t.throws(
    () => api.use(mw({ style: { extract: true } })),
    /Setting `style.extract` to `true` is no longer supported/,
  );
});

test('targets option test', (t) => {
  const api = new Neutrino();
  const targets = {
    browsers: ['last 2 iOS versions'],
  };
  api.use(mw({ targets }));

  t.deepEqual(
    api.config.module.rule('compile').use('babel').get('options').presets[0][1]
      .targets,
    targets,
  );
});

test('targets false option test', (t) => {
  const api = new Neutrino();
  api.use(mw({ targets: false }));

  t.deepEqual(
    api.config.module.rule('compile').use('babel').get('options').presets[0][1]
      .targets,
    {},
  );
});

test('updates lint config by default', (t) => {
  const api = new Neutrino();
  api.use(lint());
  api.use(mw());
  const options = api.config.module.rule('lint').use('eslint').get('options');
  t.deepEqual(options.baseConfig.env, {
    browser: true,
    commonjs: true,
    es6: true,
  });
});

test('does not update lint config if useEslintrc true', (t) => {
  const api = new Neutrino();
  api.use(lint({ eslint: { useEslintrc: true } }));
  api.use(mw());
  const options = api.config.module.rule('lint').use('eslint').get('options');
  t.deepEqual(options.baseConfig, {});
});
