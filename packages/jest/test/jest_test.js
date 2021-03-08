import path from 'path';
import test from 'ava';
import airbnbPreset from '../../airbnb';
import eslintPreset from '../../eslint';
import reactPreset from '../../react';
import compileMiddleware from '../../compile-loader';
import Neutrino from '../../neutrino/Neutrino';
import neutrino from '../../neutrino';

const mw = (...args) => require('..')(...args);
const originalNodeEnv = process.env.NODE_ENV;

test.afterEach(() => {
  // Restore the original NODE_ENV after each test (which Ava defaults to 'test').
  process.env.NODE_ENV = originalNodeEnv;
  process.env.JEST_BABEL_OPTIONS = undefined;
});

test('loads middleware', (t) => {
  t.notThrows(() => require('..'));
});

test('uses middleware', (t) => {
  const api = new Neutrino();

  t.notThrows(() => {
    api.use(mw());
  });
});

test('instantiates', (t) => {
  const api = new Neutrino();
  api.use(mw());

  t.notThrows(() => api.config.toConfig());
});

test('instantiates in development', (t) => {
  process.env.NODE_ENV = 'development';
  const api = new Neutrino();
  api.use(mw());

  t.notThrows(() => api.config.toConfig());
});

test('instantiates in production', (t) => {
  process.env.NODE_ENV = 'production';
  const api = new Neutrino();
  api.use(mw());

  t.notThrows(() => api.config.toConfig());
});

test('exposes jest output handler', (t) => {
  const api = new Neutrino();
  api.use(mw());

  const handler = api.outputHandlers.get('jest');

  t.is(typeof handler, 'function');
});

test('exposes jest config from output', (t) => {
  const config = neutrino(mw()).output('jest');

  t.is(typeof config, 'object');
});

test('exposes jest method', (t) => {
  t.is(typeof neutrino(mw()).jest, 'function');
});

test('exposes jest config from method', (t) => {
  t.is(typeof neutrino(mw()).jest(), 'object');
});

test('uses middleware with options', (t) => {
  const config = neutrino(mw({ testEnvironment: 'node' })).jest();

  t.is(config.testEnvironment, 'node');
});

test('updates lint config by default', (t) => {
  const api = new Neutrino();
  api.use(airbnbPreset());
  api.use(mw());
  const options = api.config.module.rule('lint').use('eslint').get('options');
  t.deepEqual(options.baseConfig.extends, [
    require.resolve('eslint-config-airbnb'),
    require.resolve('eslint-config-airbnb/hooks'),
    'plugin:jest/recommended',
  ]);
});

test('does not update lint config if useEslintrc true', (t) => {
  const api = new Neutrino();
  api.use(eslintPreset({ eslint: { useEslintrc: true } }));
  api.use(mw());
  const options = api.config.module.rule('lint').use('eslint').get('options');
  t.deepEqual(options.baseConfig, {});
});

test('configures moduleFileExtensions correctly', (t) => {
  const api = new Neutrino();
  api.use(reactPreset());
  api.use(mw());
  const config = api.outputHandlers.get('jest')(api);
  t.deepEqual(config.moduleFileExtensions, [
    'web.jsx',
    'web.js',
    'wasm',
    'jsx',
    'js',
    'json',
  ]);
});

test('configures default moduleFileExtensions', (t) => {
  const api = new Neutrino();
  api.use(mw());
  const config = api.outputHandlers.get('jest')(api);

  t.false('moduleFileExtensions' in config);
});

test('exposes babel config', (t) => {
  const api = new Neutrino();
  api.use(
    compileMiddleware({
      cacheDirectory: true,
      cacheCompression: false,
      cacheIdentifier: false,
      customize: true,
    }),
  );
  api.use(mw());

  const babelOptions = JSON.parse(process.env.JEST_BABEL_OPTIONS);
  t.truthy(babelOptions);
});

test('exposes babel config without babel-loader specific options', (t) => {
  const api = new Neutrino();
  api.use(
    compileMiddleware({
      babel: {
        cacheDirectory: true,
        cacheCompression: false,
        cacheIdentifier: false,
        customize: true,
      },
    }),
  );
  api.use(mw());

  const babelOptions = JSON.parse(process.env.JEST_BABEL_OPTIONS);
  t.false('cacheDirectory' in babelOptions);
  t.false('cacheCompression' in babelOptions);
  t.false('cacheIdentifier' in babelOptions);
  t.false('customize' in babelOptions);
});

test('configures absolute webpack aliases in moduleNameMapper correctly', (t) => {
  const api = new Neutrino();
  const reactPath = path.resolve(path.join('node_modules', 'react'));
  api.use(reactPreset());
  api.use(mw());
  api.config.resolve.alias.set('react', reactPath);
  const config = api.outputHandlers.get('jest')(api);

  t.true(
    Object.entries(config.moduleNameMapper).some(([key, alias]) => {
      return key === '^react$' && alias === reactPath;
    }),
  );
});

test('configures package webpack aliases in moduleNameMapper correctly', (t) => {
  const api = new Neutrino();
  api.use(mw());
  api.config.resolve.alias.set('_', 'lodash');
  const config = api.outputHandlers.get('jest')(api);

  t.true(
    Object.entries(config.moduleNameMapper).some(([key, alias]) => {
      return key === '^_$' && alias === 'lodash';
    }),
  );
});

test('configures relative webpack aliases in moduleNameMapper correctly', (t) => {
  const api = new Neutrino();
  api.use(mw());
  api.config.resolve.alias.set('images', './src/images');
  const config = api.outputHandlers.get('jest')(api);

  t.true(
    Object.entries(config.moduleNameMapper).some(([key, alias]) => {
      const urlAlias = alias.replace(/\\/g, '/'); // consider OS difference
      return key === '^images$' && urlAlias === '<rootDir>/src/images';
    }),
  );
});

test('gives custom moduleNameMapper entries priority over default entries', (t) => {
  const api = new Neutrino();
  api.use(mw({ moduleNameMapper: { foo: 'bar' } }));
  const config = api.outputHandlers.get('jest')(api);
  const moduleNameMapper = Object.entries(config.moduleNameMapper);

  t.true(moduleNameMapper.length > 1);
  t.deepEqual(moduleNameMapper[0], ['foo', 'bar']);
});
