const moduleAlias = require('module-alias');

function toFullName(pluginName) {
  const ESLINT_PREFIX = 'eslint-plugin-';
  const ORGANIZATION_EXPRESSION = /^(@[\d.A-z-]+)\/(.+)$/;
  const nameIsFull = pluginName.indexOf(ESLINT_PREFIX) === 0;
  const nameIsOrganization = ORGANIZATION_EXPRESSION.test(pluginName);

  if (nameIsOrganization) {
    const [, organizationName, name] = pluginName.match(
      ORGANIZATION_EXPRESSION,
    );

    return `${organizationName}/${toFullName(name)}`;
  }

  return nameIsFull ? pluginName : `${ESLINT_PREFIX}${pluginName}`;
}

function aliasModuleFrom(baseFilename = __filename) {
  return function aliasPlugin(pluginName) {
    const resolvedPluginPath = require.resolve(pluginName, {
      paths: [baseFilename],
    });

    moduleAlias.addAlias(pluginName, resolvedPluginPath);
  };
}

module.exports = function aliasPlugins(eslintConfig, baseFilename) {
  const { plugins = [] } = eslintConfig;

  plugins.map(toFullName).forEach(aliasModuleFrom(baseFilename));
};
