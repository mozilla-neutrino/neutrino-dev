const lint = require('@neutrinojs/eslint');
const { rules: standardRules } = require('eslint-config-standard');

module.exports = ({ eslint = {}, ...opts } = {}) => (neutrino) => {
  const baseConfig = eslint.baseConfig || {};
  const usedPlugins = ['react', 'import', 'node', 'promise', 'standard'];
  const usedResolvers = { node: {} };

  neutrino.use(
    lint({
      ...opts,
      eslint: {
        ...eslint,
        baseConfig: {
          ...baseConfig,
          extends: [
            require.resolve('eslint-config-standard'),
            require.resolve('eslint-config-standard-react'),
            ...(baseConfig.extends || []),
          ],
          rules: {
            // Disable rules for which there are eslint-plugin-babel replacements:
            // https://github.com/babel/eslint-plugin-babel#rules
            'new-cap': 'off',
            'no-invalid-this': 'off',
            'object-curly-spacing': 'off',
            semi: 'off',
            'no-unused-expressions': 'off',
            // Ensure the replacement rules use the options set by eslint-config-standard rather than ESLint defaults.
            'babel/new-cap': standardRules['new-cap'],
            // eslint-config-standard doesn't currently have an explicit value for no-invalid-this, so
            // it defaults to off. The fallback is not added to the other rules, so changes in the
            // preset configuration layout doesn't silently cause rules to be disabled.
            'babel/no-invalid-this': standardRules['no-invalid-this'] || 'off',
            'babel/object-curly-spacing': standardRules['object-curly-spacing'],
            'babel/semi': standardRules.semi,
            'babel/no-unused-expressions':
              standardRules['no-unused-expressions'],
            ...baseConfig.rules,
          },
        },
      },
    }),
  );

  lint.aliasPlugins(
    {
      plugins: usedPlugins,
    },
    __filename,
  );
  lint.aliasImportResolvers(
    {
      settings: {
        'import/resolver': usedResolvers,
      },
    },
    __filename,
  );
};
