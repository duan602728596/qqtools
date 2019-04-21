const path = require('path');
const process = require('process');

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
    app: [path.join(__dirname, 'src/app.js')]
  },
  externals: {
    jquery: 'window.jQuery'
  },
  resolve: {
    alias: {
      'indexeddb-tools': 'indexeddb-tools/build/indexedDB-tools.js'
    }
  },
  rules: [
    {
      test: /(appInit\.js|jquery)/,
      use: [{
        loader: 'file-loader',
        options: {
          name: isDevelopment ? '[name].[hash:5].[ext]' : '[hash:5].[ext]',
          outputPath: 'script/'
        }
      }]
    }
  ],
  js: {
    ecmascript: true,
    plugins: [['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]],
    exclude: /(appInit\.js|jquery|node_modules)/
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
  html: [{ template: path.join(__dirname, 'src/index.pug') }]
};
