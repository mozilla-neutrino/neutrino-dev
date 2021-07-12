import test from 'ava';
import { validate } from 'webpack';
import Neutrino from '../../neutrino/Neutrino';

const mw = (...args) => require('..')(...args);
const originalNodeEnv = process.env.NODE_ENV;

test.afterEach(() => {
  // Restore the original NODE_ENV after each test (which Ava defaults to 'test').
  process.env.NODE_ENV = originalNodeEnv;
});

test('loads preset', (t) => {
  t.notThrows(() => require('..'));
});

test('uses preset', (t) => {
  const api = new Neutrino({ root: __dirname });

  t.notThrows(() => api.use(mw({ name: 'alpha' })));
});

test('valid preset production', (t) => {
  process.env.NODE_ENV = 'production';
  const api = new Neutrino({ root: __dirname });

  api.use(mw());
  const config = api.config.toConfig();

  // Common
  t.is(config.target, 'web');
  t.is(config.optimization.runtimeChunk, false);
  t.is(config.optimization.splitChunks, false);

  // NODE_ENV/command specific
  t.true(config.optimization.minimize);
  t.is(config.devtool, 'source-map');
  t.is(config.devServer, undefined);

  t.notThrows(() => validate(config));
});

test('valid preset development', (t) => {
  process.env.NODE_ENV = 'development';
  const api = new Neutrino({ root: __dirname });

  api.use(mw());
  const config = api.config.toConfig();

  // Common
  t.is(config.target, 'web');
  t.is(config.optimization.runtimeChunk, 'single');
  t.is(config.optimization.splitChunks.chunks, 'all');

  t.notThrows(() => validate(config));
});
