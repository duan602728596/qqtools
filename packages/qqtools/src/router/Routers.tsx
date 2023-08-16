import type { ReactElement } from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import Index from '../pages/Index/index';
import Login from '../pages/Login/index';
import Options from '../pages/Options/index';
import MiraiLogin from '../pages/MiraiLogin/index';
import CodeEditor from '../pages/CodeEditor/index';
import Agreement from '../pages/Agreement/index';
import { needToReadPowerLoader } from '../pages/Agreement/function/helper';

function Routers(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    {
      path: '/',
      Component(): ReactElement {
        if (needToReadPowerLoader()) {
          return <Navigate to="/Agreement/Power?read=1" />;
        }

        return <Index />;
      }
    },
    { path: 'Login', element: <Login /> },
    { path: 'Options/*', element: <Options /> },
    { path: 'MiraiLogin/*', element: <MiraiLogin /> },
    { path: 'CodeEditor', element: <CodeEditor /> },
    { path: 'Agreement/*', element: <Agreement /> }
  ]);

  return routes;
}

export default Routers;