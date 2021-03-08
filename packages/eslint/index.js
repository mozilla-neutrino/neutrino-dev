const { ConfigurationError, DuplicateRuleError } = require('neutrino/errors');
const aliasPlugins = require('./alias-plugins');
const aliasImportResolvers = require('./alias-import-resolvers');

const arrayToObject = (array) =>
  array.reduce((obj, item) => Object.assign(obj, { [item]: true }), {});

// Return an ESLint config object matching the schema here:
// https://github.com/eslint/eslint/blob/v6.3.0/conf/config-schema.js
const eslintrc = (neutrino) => {
  const options = neutrino.config.module
    .rule('lint')
    .use('eslint')
    .get('options');

  if (options.useEslintrc) {
    throw new ConfigurationError(
      'The @neutrinojs/eslint preset option `useEslintrc` has been set to `true`, ' +
        'which is intended for projects that use their own non-generated .eslintrc.js. ' +
        'If you wish to use the Neutrino .eslintrc() generator leave `useEslintrc` unset.',
    );
  }

  const baseConfig = options.baseConfig || {};

  return {
    // ESLint's CLIEngine (and thus eslint-loader) supports being passed a `baseConfig`
    // object which is roughly equivalent to the contents of an eslintrc config.
    // However `baseConfig` isn't supported in eslintrc so must be flattened.
    ...baseConfig,
    // In addition, the following top-level CLIEngine's options are equivalent to
    // options found inside `baseConfig`, and take precedence when using eslint-loader,
    // so we have to emulate that here by merging them in after `baseConfig`.
    // All other options must be ignored, since they are eslint-loader/CLIEngine specific.
    // Note: The top level `envs` and `globals` options are of type array, however their
    // baseConfig/eslintrc equivalents must be objects (!?), so we have to convert first.
    env: {
      ...baseConfig.env,
      ...(options.envs && arrayToObject(options.envs)),
    },
    globals: {
      ...baseConfig.globals,
      ...(options.globals && arrayToObject(options.globals)),
    },
    parser: options.parser || baseConfig.parser,
    parserOptions: {
      ...baseConfig.parserOptions,
      ...options.parserOptions,
    },
    plugins: (baseConfig.plugins || []).concat(options.plugins || []),
    rules: {
      ...baseConfig.rules,
      ...options.rules,
    },
  };
};

const validLoaderOptions = [
  // Used by eslint-loader itself. See:
  // https://github.com/webpack-contrib/eslint-loader/blob/v3.0.0/src/options.json
  'cache',
  'emitError',
  'emitWarning',
  'eslintPath',
  'failOnError',
  'failOnWarning',
  'fix',
  'formatter',
  'outputReport',
  'quiet',
  // Used by CLIEngine. See:
  // https://eslint.org/docs/developer-guide/nodejs-api#cliengine
  // https://github.com/eslint/eslint/blob/v6.3.0/lib/cli-engine/cli-engine.js#L54-L76
  // Excluding the cache options (since eslint-loader handles that),
  // and any that are not applicable to `CLIEngine.executeOnText()`.
  'allowInlineConfig',
  'baseConfig',
  'configFile',
  'cwd',
  'envs',
  'fixTypes',
  'globals',
  'ignore',
  'ignorePath',
  'ignorePattern',
  'parser',
  'parserOptions',
  'plugins',
  'reportUnusedDisableDirectives',
  'resolvePluginsRelativeTo',
  'rulePaths',
  'rules',
  'useEslintrc',
];

module.exports = ({ test, include, exclude, eslint = {} } = {}) => {
  // Neither eslint-loader nor ESLint's `CLIEngine` fully validate passed options,
  // so we do so here to make it easier to work out why settings seemingly aren't
  // taking effect. This is particularly important given that the configuration
  // options are inconsistently named between CLIEngine and the eslintrc schema.
  // Upstream issues for adding validation:
  // https://github.com/webpack-contrib/eslint-loader/issues/252
  // https://github.com/eslint/eslint/issues/10272
  const invalidOptions = Object.keys(eslint).filter(
    (option) => !validLoaderOptions.includes(option),
  );

  if (invalidOptions.length) {
    throw new ConfigurationError(
      `Unrecognised 'eslint' option(s): ${invalidOptions.join(', ')}\n` +
        `Valid options are: ${validLoaderOptions.sort().join(', ')}\n` +
        'If trying to set `extends`, `overrides` or `settings`, they must be ' +
        'defined under the `baseConfig` key and not as a top-level option. ' +
        'See: https://neutrinojs.org/packages/eslint/#usage',
    );
  }

  return (neutrino) => {
    if (neutrino.config.module.rules.has('compile')) {
      throw new ConfigurationError(
        'Lint presets must be defined prior to any other presets in .neutrinorc.js.',
      );
    }

    if (neutrino.config.module.rules.has('lint')) {
      throw new DuplicateRuleError('@neutrinojs/eslint', 'lint');
    }

    const baseConfig = eslint.baseConfig || {};
    const usedPlugins = ['babel'];
    const loaderOptions = {
      // For supported options, see:
      // https://github.com/webpack-contrib/eslint-loader#options
      // https://eslint.org/docs/developer-guide/nodejs-api#cliengine
      cache: true,
      cwd: neutrino.options.root,
      // Downgrade errors to warnings when in development, to reduce the noise in
      // the webpack-dev-server overlay (which defaults to showing errors only),
      // and to also ensure hot reloading isn't prevented.
      emitWarning: process.env.NODE_ENV === 'development',
      // Make errors fatal for 'production' and 'test'.
      // However note that even when `false` webpack still fails the build:
      // https://github.com/webpack-contrib/eslint-loader/issues/257
      failOnError: process.env.NODE_ENV !== 'development',
      // Can be the name of a built-in ESLint formatter or the module/path of an external one.
      formatter: 'codeframe',
      useEslintrc: false,
      ...eslint,
      // The options under `baseConfig` correspond to those that can be used in `.eslintrc.*`.
      // Projects that want to use a non-generated .eslintrc can set `useEslintrc: true`,
      // which will tell eslint-loader to actually read in their config file. However in
      // that case we must only set the eslint-loader specific options above, and not the
      // values below that overlap with the available eslintrc options - since otherwise
      // the lint config will be inconsistent between standalone lint and eslint-loader.
      baseConfig: eslint.useEslintrc
        ? {}
        : {
            parser: require.resolve('babel-eslint'),
            root: true,
            ...baseConfig,
            env: {
              es6: true,
              ...baseConfig.env,
            },
            globals: {
              process: true,
              ...baseConfig.globals,
            },
            parserOptions: {
              ecmaVersion: 2018,
              sourceType: 'module',
              ...baseConfig.parserOptions,
            },
            // Unfortunately we can't `require.resolve('eslint-plugin-babel')` due to:
            // https://github.com/eslint/eslint/issues/6237
            // ...so we have no choice but to rely on it being hoisted.
            plugins: [...usedPlugins, ...(baseConfig.plugins || [])],
          },
    };

    aliasPlugins({ plugins: usedPlugins });

    neutrino.config.module
      .rule('lint')
      .test(test || neutrino.regexFromExtensions())
      .pre()
      .include.merge(
        include || [neutrino.options.source, neutrino.options.tests],
      )
      .end()
      .when(exclude, (rule) => rule.exclude.merge(exclude))
      .use('eslint')
      .loader(require.resolve('eslint-loader'))
      .options(loaderOptions);

    neutrino.register('eslintrc', eslintrc);
  };
};

module.exports.aliasPlugins = aliasPlugins;
module.exports.aliasImportResolvers = aliasImportResolvers;
