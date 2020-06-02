const { createBabelPlugins } = require('@sweet-milktea/milktea/lib/config/babelConfig');

module.exports = function(api) {
  api.cache(true);

  return {
    presets: ['@babel/preset-react'],
    plugins: createBabelPlugins()
  };
};