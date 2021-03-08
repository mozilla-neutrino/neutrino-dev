const moduleAlias = require('module-alias');

module.exports = function pnp(settings = {}) {
  return function pnpMiddleware(neutrino) {
    const { pluginId = 'pnp' } = settings;
    const projectPath = process.cwd();
    const environmentIsPnP = Boolean(process.versions.pnp);

    if (environmentIsPnP) {
      // solve the issue with the linked middleware outside of the project root
      // https://github.com/yarnpkg/berry/issues/693
      moduleAlias.addAlias(
        'pnpapi',
        require.resolve('pnpapi', { paths: [projectPath] }),
      );
    }

    // eslint-disable-next-line global-require -- Have to import this after `require` alias is applied
    const PnpWebpackPlugin = require(`pnp-webpack-plugin`);

    function PnpPlugin() {
      // create new instance of Plugin config
      return { ...PnpWebpackPlugin };
    }
    function PnpLoaderPlugin() {
      return PnpWebpackPlugin.moduleLoader(module);
    }

    neutrino.config.resolve
      .plugin(pluginId)
      .use(PnpPlugin)
      .end()
      .end()
      .resolveLoader.plugin(pluginId)
      .use(PnpLoaderPlugin)
      .end()
      .end();
  };
};
