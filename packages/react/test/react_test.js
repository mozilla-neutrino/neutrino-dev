import test from 'ava';
import { validate } from 'webpack';
import lint from '../../eslint';
import Neutrino from '../../neutrino/Neutrino';

const mw = (...args) => require('..')(...args);
const newExtensions = ['.web.jsx', '.web.js'];
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
  t.deepEqual(
    config.resolve.extensions.slice(0, newExtensions.length),
    newExtensions,
  );

  t.notThrows(() => validate(config));
});

test('valid preset development', (t) => {
  process.env.NODE_ENV = 'development';
  const api = new Neutrino();
  api.use(mw());
  const config = api.config.toConfig();

  // Common
  t.deepEqual(
    config.resolve.extensions.slice(0, newExtensions.length),
    newExtensions,
  );

  t.notThrows(() => validate(config));
});

test('valid preset test', (t) => {
  process.env.NODE_ENV = 'test';
  const api = new Neutrino();
  api.use(mw());
  const config = api.config.toConfig();

  // Common
  t.deepEqual(
    config.resolve.extensions.slice(0, newExtensions.length),
    newExtensions,
  );

  t.notThrows(() => validate(config));
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
  t.deepEqual(options.baseConfig.plugins, ['babel', 'react', 'react-hooks']);
  t.deepEqual(options.baseConfig.settings, {
    react: {
      version: 'detect',
    },
  });
});

test('does not update lint config if useEslintrc true', (t) => {
  const api = new Neutrino();
  api.use(lint({ eslint: { useEslintrc: true } }));
  api.use(mw());
  const options = api.config.module.rule('lint').use('eslint').get('options');
  t.deepEqual(options.baseConfig, {});
});
