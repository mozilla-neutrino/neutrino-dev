import test from 'ava';
import { validate } from 'webpack';
import lint from '../../eslint';
import Neutrino from '../../neutrino/Neutrino';

const mw = (...args) => require('..')(...args);
const originalNodeEnv = process.env.NODE_ENV;
const expectedExtensions = ['.wasm', '.mjs', '.jsx', '.vue', '.js', '.json'];

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

  t.is(validate(config), undefined);
  t.deepEqual(config.resolve.extensions, expectedExtensions);
});

test('valid preset development', (t) => {
  process.env.NODE_ENV = 'development';
  const api = new Neutrino();
  api.use(mw());
  const config = api.config.toConfig();

  t.is(validate(config), undefined);
  t.deepEqual(config.resolve.extensions, expectedExtensions);
});

test('updates lint config by default', (t) => {
  const api = new Neutrino();
  api.use(lint());
  api.use(mw());

  const lintRule = api.config.module.rule('lint');
  t.deepEqual(lintRule.get('test'), /\.(mjs|jsx|vue|js)$/);
  t.deepEqual(lintRule.use('eslint').get('options').baseConfig, {
    env: {
      browser: true,
      commonjs: true,
      es6: true,
    },
    extends: ['plugin:vue/base'],
    globals: {
      process: true,
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
      ecmaVersion: 2018,
      parser: 'babel-eslint',
      sourceType: 'module',
    },
    plugins: ['babel', 'vue'],
    root: true,
  });
});

test('does not update lint config if useEslintrc true', (t) => {
  const api = new Neutrino();
  api.use(lint({ eslint: { useEslintrc: true } }));
  api.use(mw());
  const options = api.config.module.rule('lint').use('eslint').get('options');
  t.deepEqual(options.baseConfig, {});
});

test('adds style oneOfs in order', (t) => {
  const api = new Neutrino();
  api.use(mw());
  const { oneOfs } = api.config.module.rule('style');
  t.deepEqual(
    oneOfs.values().map((oneOf) => oneOf.name),
    ['vue-modules', 'vue-normal', 'modules', 'normal'],
  );
});

test('replaces style-loader with vue-style-loader in development', (t) => {
  process.env.NODE_ENV = 'development';
  const api = new Neutrino();
  api.use(mw());

  api.config.module
    .rule('style')
    .oneOfs.values()
    .filter((oneOf) => oneOf.name.startsWith('vue-'))
    .forEach((oneOf) => {
      t.is(
        oneOf.use('style').get('loader'),
        require.resolve('vue-style-loader'),
      );
    });
});
