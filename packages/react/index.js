const web = require('@neutrinojs/web');
const babelMerge = require('babel-merge');
const merge = require('deepmerge');
const { aliasPlugins } = require('@neutrinojs/eslint');

module.exports = (opts = {}) => (neutrino) => {
  const options = merge(
    {
      hot: true,
      babel: {},
    },
    opts,
  );
  let reactHotLoader = false;

  try {
    // Attempt to load react-hot-loader from the user's installation.
    reactHotLoader = require.resolve('react-hot-loader/babel');
  } catch (err) {} // eslint-disable-line no-empty

  Object.assign(options, {
    babel: babelMerge(
      {
        plugins: [
          // The RHL plugin is enabled in production too since it removes the `hot(module)(...)`
          // wrapper, allowing webpack to use its concatenate modules optimization.
          options.hot && reactHotLoader,
          process.env.NODE_ENV === 'production' && [
            require.resolve('babel-plugin-transform-react-remove-prop-types'),
            {
              removeImport: true,
            },
          ],
        ].filter(Boolean),
        presets: [
          [
            require.resolve('@babel/preset-react'),
            {
              // Enable development helpers both in development and testing.
              development: process.env.NODE_ENV !== 'production',
              // When spreading props, use inline object with spread elements directly instead of
              // Babel's extend helper or Object.assign. @babel/env will still transpile these down
              // if required for the target browsers.
              useSpread: true,
            },
          ],
        ],
      },
      options.babel,
    ),
  });

  neutrino.use(web(options));

  const lintRule = neutrino.config.module.rules.get('lint');
  if (lintRule) {
    aliasPlugins({ plugins: ['react', 'react-hooks'] }, __filename);
    lintRule.use('eslint').tap(
      // Don't adjust the lint configuration for projects using their own .eslintrc.
      (lintOptions) =>
        lintOptions.useEslintrc
          ? lintOptions
          : merge(lintOptions, {
              baseConfig: {
                plugins: ['react', 'react-hooks'],
                rules: {
                  // Enforces the rules of hooks:
                  // https://reactjs.org/docs/hooks-rules.html
                  'react-hooks/rules-of-hooks': 'error',
                  'react-hooks/exhaustive-deps': 'warn',
                },
                settings: {
                  react: {
                    version: 'detect',
                  },
                },
              },
            }),
    );
  }

  neutrino.config.resolve.alias
    .set('react-native', 'react-native-web')
    .end()
    .extensions.prepend('.web.js')
    .prepend('.web.jsx');
};
