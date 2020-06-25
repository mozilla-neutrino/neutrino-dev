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
  const api = new Neutrino();

  t.notThrows(() => api.use(mw({ name: 'alpha' })));
});

test('throws when missing library name', (t) => {
  const api = new Neutrino();

  t.throws(() => api.use(mw()), /You must specify a library name/);
});

test('throws when polyfills defined', (t) => {
  const api = new Neutrino();

  t.throws(
    () => api.use(mw({ name: 'alpha', polyfills: {} })),
    /The polyfills option has been removed/,
  );
});

test('valid preset production', (t) => {
  process.env.NODE_ENV = 'production';
  const api = new Neutrino();

  api.use(mw({ name: 'alpha' }));
  const config = api.config.toConfig();

  // Common
  t.is(config.target, 'web');
  t.deepEqual(config.resolve.extensions, expectedExtensions);
  t.is(config.optimization, undefined);
  t.is(config.devServer, undefined);
  t.deepEqual(config.stats, undefined);

  // NODE_ENV/command specific
  t.is(config.devtool, 'source-map');
  t.not(config.externals, undefined);

  t.is(validate(config), undefined);
});

test('valid preset development', (t) => {
  process.env.NODE_ENV = 'development';
  const api = new Neutrino();

  api.use(mw({ name: 'alpha' }));
  const config = api.config.toConfig();

  // Common
  t.is(config.target, 'web');
  t.deepEqual(config.resolve.extensions, expectedExtensions);
  t.is(config.optimization, undefined);
  t.is(config.devServer, undefined);
  t.deepEqual(config.stats, undefined);

  // NODE_ENV/command specific
  t.is(config.devtool, 'source-map');
  t.not(config.externals, undefined);

  t.is(validate(config), undefined);
});

test('removes webpack externals when NODE_ENV=test', (t) => {
  process.env.NODE_ENV = 'test';

  const api = new Neutrino();

  api.use(mw({ name: 'alpha' }));

  const config = api.config.toConfig();

  t.is(config.externals, undefined);
});

test('valid preset Node.js target', (t) => {
  const api = new Neutrino();
  api.use(mw({ name: 'alpha', target: 'node' }));

  t.is(validate(api.config.toConfig()), undefined);
});

test('valid preset commonjs2 libraryTarget', (t) => {
  const api = new Neutrino();
  api.use(mw({ name: 'alpha', libraryTarget: 'commonjs2' }));

  t.is(validate(api.config.toConfig()), undefined);
});

test('targets option test', (t) => {
  const api = new Neutrino();
  const targets = {
    browsers: ['last 2 iOS versions'],
  };

  api.use(mw({ name: 'alpha', targets }));

  t.deepEqual(
    api.config.module.rule('compile').use('babel').get('options').presets[0][1]
      .targets,
    targets,
  );
});

test('targets false option test', (t) => {
  const api = new Neutrino();
  api.use(mw({ name: 'alpha', targets: false }));

  t.deepEqual(
    api.config.module.rule('compile').use('babel').get('options').presets[0][1]
      .targets,
    {},
  );
});

test('updates lint config by default when target is web', (t) => {
  const api = new Neutrino();
  api.use(lint());
  api.use(mw({ name: 'alpha', target: 'web' }));
  const options = api.config.module.rule('lint').use('eslint').get('options');
  t.deepEqual(options.baseConfig.env, {
    browser: true,
    commonjs: true,
    es6: true,
  });
});

test('updates lint config by default when target is node', (t) => {
  const api = new Neutrino();
  api.use(lint());
  api.use(mw({ name: 'alpha', target: 'node' }));
  const options = api.config.module.rule('lint').use('eslint').get('options');
  t.deepEqual(options.baseConfig.env, {
    commonjs: true,
    es6: true,
  });
});

test('does not update lint config if useEslintrc true', (t) => {
  const api = new Neutrino();
  api.use(lint({ eslint: { useEslintrc: true } }));
  api.use(mw({ name: 'alpha' }));
  const options = api.config.module.rule('lint').use('eslint').get('options');
  t.deepEqual(options.baseConfig, {});
});
