const moduleAlias = require('module-alias');

function toFullName(pluginName) {
  const ESLINT_PREFIX = 'eslint-import-resolver-';
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
  return function aliasImportResolver(importResolverName) {
    const resolvedImportResolverPath = require.resolve(importResolverName, {
      paths: [baseFilename],
    });

    moduleAlias.addAlias(importResolverName, resolvedImportResolverPath);
  };
}

module.exports = function aliasImportResolvers(eslintConfig, baseFilename) {
  const { settings = {} } = eslintConfig;
  const resolver = settings['import/resolver'] || {};
  const resolversNames = Object.keys(resolver);

  resolversNames.map(toFullName).forEach(aliasModuleFrom(baseFilename));
};
