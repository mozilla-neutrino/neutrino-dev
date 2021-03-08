const merge = require('deepmerge');
const omit = require('lodash.omit');
const { basename, isAbsolute, join, relative } = require('path');
const { media, style } = require('neutrino/extensions');
const { aliasPlugins } = require('@neutrinojs/eslint');

module.exports = (options = {}) => (neutrino) => {
  const lintRule = neutrino.config.module.rules.get('lint');
  if (lintRule) {
    aliasPlugins({ plugins: ['jest'] }, __filename);
    lintRule.use('eslint').tap(
      // Don't adjust the lint configuration for projects using their own .eslintrc.
      (lintOptions) =>
        lintOptions.useEslintrc
          ? lintOptions
          : merge(lintOptions, {
              baseConfig: {
                extends: ['plugin:jest/recommended'],
              },
            }),
    );
  }

  neutrino.register('jest', (neutrino) => {
    const babelLoaderOptionsNames = [
      'cacheDirectory',
      'cacheCompression',
      'cacheIdentifier',
      'customize',
    ];
    const compileRule = neutrino.config.module.rules.get('compile');
    const babelOptions = compileRule
      ? omit(compileRule.use('babel').get('options'), babelLoaderOptionsNames)
      : {};
    // Any parts of the babel config that are not serializable will be omitted, however
    // that also occurs when passing to the custom transformer using `globals` instead.
    process.env.JEST_BABEL_OPTIONS = JSON.stringify(babelOptions);

    const getFinalPath = (path) => {
      if (isAbsolute(path)) {
        return path;
      }

      return path.startsWith('.') ? join('<rootDir>', path) : path;
    };
    const extensionsToNames = (extensions) => `\\.(${extensions.join('|')})$`;
    const { extensions, source, tests, root, debug } = neutrino.options;
    const modulesConfig = neutrino.config.resolve.modules.values();
    const aliases = neutrino.config.resolve.alias.entries() || {};
    const moduleFileExtensions = neutrino.config.resolve.extensions
      .values()
      // Jest does not yet support ES6 modules, see:
      // https://github.com/facebook/jest/issues/4842
      .filter((ext) => ext !== '.mjs')
      .map((extension) => extension.replace('.', ''));

    return merge(
      {
        rootDir: root,
        moduleDirectories: modulesConfig.length
          ? modulesConfig
          : ['node_modules'],
        ...(moduleFileExtensions.length && { moduleFileExtensions }),
        moduleNameMapper: Object.keys(aliases).reduce(
          (mapper, key) => ({
            ...mapper,
            [`^${key}$`]: `${getFinalPath(aliases[key])}`,
          }),
          {
            ...options.moduleNameMapper,
            [extensionsToNames(media)]: require.resolve('./file-mock'),
            [extensionsToNames(style)]: require.resolve('./style-mock'),
          },
        ),
        bail: true,
        collectCoverageFrom: [
          join(relative(root, source), `**/*.{${extensions.join(',')}}`),
        ],
        testEnvironment:
          neutrino.config.get('target') === 'node' ? 'node' : 'jsdom',
        testRegex: `${basename(
          tests,
        )}/.*(_test|_spec|\\.test|\\.spec)\\.(${extensions.join('|')})$`,
        verbose: debug,
        transform: {
          // neutrino.options.extensions should be used instead of
          // neutrino.regexFromExtensions() because transformNames is used as a
          // property name where a Regex object will cause issues. e.g.:
          // https://github.com/neutrinojs/neutrino/issues/638.
          [extensionsToNames(extensions)]: require.resolve('./transformer'),
        },
      },
      options,
    );
  });
};
