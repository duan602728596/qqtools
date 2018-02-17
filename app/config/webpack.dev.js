/* 开发环境 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./webpack.config');

/* 合并配置 */
module.exports = config({
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'script/[name].js',
    chunkFilename: 'script/[name]_chunk.js'
  },
  module: {
    rules: [
      { // pug
        test: /^.*\.pug$/,
        use: [
          {
            loader: 'pug-loader',
            options: {
              pretty: true,
              name: '[name].html'
            }
          },
          {
            loader: 'nwjs-webpack-hot-loader/loader',
            options: {
              buildFile: './build',
              rootFile: 'script/app.js',
              type: 'pug'
            }
          }
        ]
      }
    ]
  },
  devtool: 'cheap-module-source-map',
  plugins: [
    // html模板
    new HtmlWebpackPlugin({
      inject: true,
      hash: true,
      template: path.join(__dirname, '../src/index.pug')
    })
  ]
});