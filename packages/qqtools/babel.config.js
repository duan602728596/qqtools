module.exports = function(api) {
  api.cache(true);

  return {
    presets: [
      [
        '@babel/preset-env',
        { modules: 'commonjs' }
      ],
      ['@babel/preset-typescript']
    ]
  };
};