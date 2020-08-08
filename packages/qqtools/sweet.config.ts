import * as process from 'process';
import * as path from 'path';

const isDev: boolean = process.env.NODE_ENV === 'development';

function nodeExternals(node: Array<string>): { [k: string]: string } {
  const result: { [k: string]: string } = {};

  for (const name of node) {
    result[name] = `global.require('${ name }')`;
  }

  return result;
}

export default function(info: object): { [key: string]: any } {
  const plugins: Array<any> = [
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
    ['import', { libraryName: 'lodash', libraryDirectory: '', camel2DashComponentName: false }, 'lodash']
  ];

  if (!isDev) {
    plugins.unshift(['transform-react-remove-prop-types', { mode: 'remove', removeImport: true }]);
  }

  const config: { [key: string]: any } = {
    frame: 'react',
    dll: [
      'react',
      'react-dom',
      'prop-types',
      'react-router',
      'react-router-dom',
      'history',
      'redux',
      'react-redux',
      'redux-actions',
      'redux-thunk',
      'immutable',
      'reselect'
    ],
    entry: {
      index: [path.join(__dirname, 'src/index.tsx')]
    },
    externals: {
      SDK: 'window.SDK',
      ...nodeExternals(['got'])
    },
    js: {
      ecmascript: true,
      plugins,
      exclude: /node_modules|NIM_Web_SDK/i
    },
    ts: {
      plugins,
      exclude: /node_modules/
    },
    rules: [
      {
        test: /NIM_Web_SDK/,
        use: [{
          loader: 'file-loader',
          options: {
            name: isDev ? '[name]_[hash:5].[ext]' : '[hash:15].[ext]'
          }
        }]
      }
    ],
    sass: {
      include: /src/
    },
    css: {
      modifyVars: {
        // https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
        '@primary-color': '#eb2f96'
      },
      include: /node_modules[\\/]_?antd/
    },
    html: [{ template: path.join(__dirname, 'src/index.pug') }]
  };

  if (isDev) {
    config.resolve = {
      alias: {
        'react-dom': '@hot-loader/react-dom'
      }
    };
  }

  return config;
}