import * as process from 'process';
import * as path from 'path';

const isDev: boolean = process.env.NODE_ENV === 'development';

export default function(info: object): { [key: string]: any } {
  const plugins: Array<any> = [['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]];

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
    js: {
      ecmascript: true,
      plugins,
      exclude: /node_modules/
    },
    ts: {
      plugins,
      exclude: /node_modules/
    },
    sass: {
      include: /src/
    },
    css: {
      modifyVars: {
        // https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
        '@primary-color': '#f5222d'
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