const path = require('path');
const process = require('process');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  frame: 'react',
  dll: [
    'react',
    'prop-types',
    'react-dom',
    'react-router-dom',
    'redux',
    'react-redux',
    'redux-thunk',
    'redux-actions',
    'immutable',
    'redux-immutable',
    'reselect',
    'indexeddb-tools',
    'indexeddb-tools-redux',
    'moment'
  ],
  entry: {
    index: [path.join(__dirname, 'src/index.js')]
  },
  externals: {
    jquery: 'window.jQuery',
    SDK: 'window.SDK',
    Go: 'global.Go'
  },
  resolve: {
    alias: {
      'indexeddb-tools': 'indexeddb-tools/build/indexedDB-tools.js'
    }
  },
  rules: [
    {
      test: /(appInit\.js|jquery|NIM_Web_SDK|wasm_exec)/,
      use: [{
        loader: 'file-loader',
        options: {
          name: isDevelopment ? '[name]_[hash:5].[ext]' : '[hash:15].[ext]',
          outputPath: 'scripts/'
        }
      }]
    }
  ],
  js: {
    ecmascript: true,
    plugins: [['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]],
    exclude: /(appInit\.js|jquery|wasm_exec|node_modules)/
  },
  sass: { include: /src/ },
  css: {
    modules: false,
    modifyVars: {
      // https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
      '@primary-color': '#52c41a',
      '@layout-body-background': '#fff',
      '@layout-header-background': '@primary-color'
    },
    include: /node_modules[\\/]antd/
  },
  html: [{ template: path.join(__dirname, 'src/index.pug') }],
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: path.join(__dirname, 'src/components/coolQ/a.wasm') }]
    })
  ]
};
