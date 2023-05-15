import * as process from 'node:process';
import * as path from 'node:path';
// @ts-ignore
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// @ts-ignore
import CopyPlugin from 'copy-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
// @ts-ignore
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import type { Options as HtmlMinifierOptions } from 'html-minifier-terser';

const isDev: boolean = process.env.NODE_ENV === 'development';
const analyzer: boolean = process.env.ANALYZER === 'true';

// html代码压缩配置
const htmlWebpackPluginMinify: boolean | HtmlMinifierOptions = isDev ? false : {
  collapseWhitespace: true,
  keepClosingSlash: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: {
    module: true,
    ecma: 2020,
    safari10: true
  }
};

/**
 * 模块使用node的commonjs的方式引入
 * @param { Array<string> } node: node模块名称
 */
function nodeExternals(node: Array<string>): { [k: string]: string } {
  const result: { [k: string]: string } = {};

  for (const name of node) {
    result[name] = `globalThis.require('${ name }')`;
  }

  return result;
}

/**
 * 为node原生模块添加"node:"
 * @param { Array<string> } node: node模块名称
 */
function nodeModules(node: Array<string>): Array<string> {
  return node.concat(node.map((o: string): string => `node:${ o }`));
}

const externalsName: Array<string> = nodeModules([
  'child_process',
  'crypto',
  'events',
  'fs',
  'fs/promises',
  'http',
  'net',
  'os',
  'path',
  'process',
  'timers',
  'util'
]).concat([
  'antd',
  'electron',
  'fs-extra',
  'got',
  'iconv-lite',
  'js-yaml',
  'node-schedule',
  'nunjucks',
  'ws'
]);

export default function(info: object): { [key: string]: any } {
  const plugins: Array<any> = [
    '@babel/plugin-syntax-import-assertions',
    !isDev && ['transform-react-remove-prop-types', { mode: 'remove', removeImport: true }],
    [require.resolve(path.join(__dirname, '../babel-plugin-delay-require')), { moduleNames: externalsName, idle: true }]
  ].filter(Boolean);

  const config: { [key: string]: any } = {
    frame: 'react',
    dll: [
      '@indexeddb-tools/indexeddb',
      '@indexeddb-tools/indexeddb-redux',
      '@yxim/nim-web-sdk/dist/SDK/NIM_Web_SDK.js',
      'classnames',
      'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK',
      'nim-web-sdk-ng/dist/NIM_BROWSER_SDK',
      'react',
      'react-dom/client',
      'prop-types',
      '@reduxjs/toolkit',
      'react-redux',
      'reselect',
      'react-router-dom'
    ],
    entry: {
      index: [path.join(__dirname, 'src/index.tsx')]
    },
    html: [{ template: path.join(__dirname, 'src/index.pug'), minify: htmlWebpackPluginMinify }],
    externals: nodeExternals(externalsName),
    javascript: {
      ecmascript: true,
      plugins,
      exclude: /node_modules|Signer\.js|XiaoHongShu\.js/i
    },
    typescript: {
      configFile: isDev ? 'tsconfig.json' : 'tsconfig.prod.json',
      plugins,
      exclude: /node_modules|Signer\.js|XiaoHongShu\.js/i
    },
    sass: {
      include: /src/
    },
    less: {
      include: /node_modules[\\/](_?antd|monaco-editor)/,
      exclude: /tailwindcss/i
    },
    rules: [
      {
        test: /\.tailwindcss\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      }
    ],
    plugins: [
      new CopyPlugin({
        patterns: [{
          from: path.join(__dirname, 'src/QQ/sdk/1'),
          to: path.join(__dirname, 'dist')
        }]
      }),
      new MonacoWebpackPlugin({
        languages: ['json', 'yaml', 'javascript']
      }),
      analyzer && new BundleAnalyzerPlugin()
    ].filter(Boolean)
  };

  return config;
}