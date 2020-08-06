module.exports = function(api) {
  api.cache(true);

  return {
    presets: [
      ['@babel/preset-typescript', {
        isTSX: true,
        jsxPragma: 'React',
        allExtensions: true,
        allowNamespaces: true
      }]
    ]
  };
};