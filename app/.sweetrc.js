import path from 'path';
import process from 'process';

const isDevelopment: boolean = process.env.NODE_ENV === 'development';

export default {
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
  output: {
    path: path.join(__dirname, 'build'),
    filename: isDevelopment ? 'script/[name].js' : 'script/[chunkhash:5].js',
    chunkFilename: isDevelopment ? 'script/[name].js' : 'script/[chunkhash:5].js'
  },
  externals: {
    jquery: 'window.jQuery'
  },
  loaders: {
    svg: {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      use: [
        { loader: 'babel-loader' },
        {
          loader: '@svgr/webpack',
          options: {
            babel: false,
            icon: true,
          }
        }
      ]
    }
  },
  rules: [
    {
      test: /(dll\.js|appInit\.js|jquery)/,
      use: [{
        loader: 'file-loader',
        options: {
          name: isDevelopment ? '[name].[ext]' : '[hash:5].[ext]',
          outputPath: 'script/'
        }
      }]
    }
  ],
  js: {
    ecmascript: true,
    plugins: [['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]],
    exclude: /(dll\.js|appInit\.js|jquery|node_modules)/
  },
  sass: {
    include: /src/,
    publicPath: '../'
  },
  css: {
    modules: false,
    modifyVars: {
      // https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
      '@primary-color': '#f5222d',
      '@layout-body-background': '#fff',
      '@layout-header-background': '@primary-color'
    },
    include: /node_modules[\\/]antd/,
    publicPath: '../'
  },
  html: [{ template: path.join(__dirname, 'src/index.pug') }]
};