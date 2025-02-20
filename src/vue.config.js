const { VantResolver } = require('@vant/auto-import-resolver');
const AutoImport = require('unplugin-auto-import/webpack');
const Components = require('unplugin-vue-components/webpack');

module.exports = {
  configureWebpack: {
    plugins: [
		AutoImport.default({
			resolvers: [VantResolver()],
			}),
			Components.default({ resolvers: [VantResolver()] }),
		],
  },
};
