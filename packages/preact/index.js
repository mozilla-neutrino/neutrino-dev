const babelMerge = require('babel-merge');
const web = require('@neutrinojs/web');
const merge = require('deepmerge');
const { aliasPlugins } = require('@neutrinojs/eslint');

module.exports = (opts = {}) => (neutrino) => {
  const options = {
    hot: true,
    ...opts,
    babel: babelMerge(
      {
        plugins: [
          [
            require.resolve('@babel/plugin-transform-react-jsx'),
            { pragma: 'h', pragmaFrag: 'Fragment' },
          ],
        ],
      },
      opts.babel || {},
    ),
  };

  neutrino.use(web(options));

  neutrino.config.resolve.alias
    .set('react', 'preact/compat')
    .set('react-dom/test-utils', 'preact/test-utils')
    // Must be after test-utils
    .set('react-dom', 'preact/compat');

  const lintRule = neutrino.config.module.rules.get('lint');
  if (lintRule) {
    aliasPlugins({ plugins: ['react'] }, __filename);
    lintRule.use('eslint').tap(
      // Don't adjust the lint configuration for projects using their own .eslintrc.
      (lintOptions) =>
        lintOptions.useEslintrc
          ? lintOptions
          : merge(lintOptions, {
              baseConfig: {
                plugins: ['react'],
                settings: {
                  react: {
                    pragma: 'h',
                  },
                },
              },
            }),
    );
  }
};
