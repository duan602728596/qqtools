import { render } from 'react-dom';
import App from './App';

/* app */
render(
  <App />,
  document.getElementById('app')
);

declare const module: any;

if (module.hot) {
  module.hot.accept();
}