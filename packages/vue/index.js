const web = require('@neutrinojs/web');
const merge = require('deepmerge');
const { aliasPlugins } = require('@neutrinojs/eslint');

const applyUse = (from) => (to) => {
  from.uses.values().forEach((use) => {
    to.use(use.name).merge(use.entries());
  });
};

// vue-loader needs CSS files to be parsed with vue-style-loader instead of
// style-loader, so we replace the loader with the one vue wants.
// This is only required when using style-loader and not when extracting CSS.
const replaceStyleLoader = (rule) => {
  if (rule.uses.has('style')) {
    rule.use('style').loader(require.resolve('vue-style-loader'));
  }
};

module.exports = (opts = {}) => (neutrino) => {
  const options = merge(
    {
      style: {
        ruleId: 'style',
      },
    },
    opts,
  );

  // Add vue extension as a higher priority than JS files.
  // Since neutrino.options.extensions is always a copy of a Set,
  // this splice operation is always mutation-safe.
  const { extensions } = neutrino.options;
  const index = extensions.indexOf('js');

  extensions.splice(index, 0, 'vue');

  neutrino.options.extensions = extensions; // eslint-disable-line no-param-reassign
  neutrino.use(web(options));

  // Vue component oneOfs are prepended to our style rule so they match first.
  // The test from the "normal" oneOf is also applied.
  const styleRule = neutrino.config.module.rules.get(options.style.ruleId);
  const styleTest = styleRule.oneOf('normal').get('test');
  const styleModulesEnabled = styleRule.oneOfs.has('modules');

  if (styleRule) {
    styleRule
      .when(styleModulesEnabled, (rule) => {
        rule
          .oneOf('vue-modules')
          .before('modules')
          .test(styleTest)
          .resourceQuery(/module/)
          .batch(applyUse(styleRule.oneOf('modules')))
          .batch(replaceStyleLoader);
      })
      .when(styleRule.oneOf('normal'), (rule) => {
        rule
          .oneOf('vue-normal')
          .before(styleModulesEnabled ? 'modules' : 'normal')
          .test(styleTest)
          .resourceQuery(/\?vue/)
          .batch(applyUse(styleRule.oneOf('normal')))
          .batch(replaceStyleLoader);
      });
  }

  neutrino.config.module
    .rule('vue')
    .test(neutrino.regexFromExtensions(['vue']))
    .use('vue')
    .loader(require.resolve('vue-loader'));

  neutrino.config.plugin('vue').use(require.resolve('vue-loader/lib/plugin'));

  if (neutrino.config.module.rules.has('compile')) {
    // We need to remove vue files from being parsed by Babel since the
    // vue-loader/VueLoaderPlugin will break down a vue file into its component
    // part files. For example, the <script> in a vue file becomes a JS file,
    // which will then be parsed by Babel, so no need for a double parse.
    neutrino.config.module
      .rule('compile')
      .test(
        neutrino.regexFromExtensions(
          neutrino.options.extensions.filter((ext) => ext !== 'vue'),
        ),
      );
  }

  const lintRule = neutrino.config.module.rules.get('lint');
  if (lintRule) {
    aliasPlugins({ plugins: ['vue'] }, __filename);
    // We need to re-set the extension list used by the eslint settings
    // since when it was generated it didn't include the vue extension.
    lintRule.test(neutrino.regexFromExtensions());

    lintRule.use('eslint').tap(
      // Don't adjust the lint configuration for projects using their own .eslintrc.
      (lintOptions) =>
        lintOptions.useEslintrc
          ? lintOptions
          : merge(lintOptions, {
              baseConfig: {
                extends: ['plugin:vue/base'],
                parser: require.resolve('vue-eslint-parser'),
                parserOptions: {
                  parser: require.resolve('babel-eslint'),
                },
                plugins: ['vue'],
              },
            }),
    );
  }
};
