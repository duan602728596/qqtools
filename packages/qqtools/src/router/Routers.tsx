import type { ReactElement } from 'react';
import { useRoutes, Navigate } from 'react-router';
import Index from '../pages/Index/Index';
import Login from '../pages/Login/Index';
import Options from '../pages/Options/Index';
import CodeEditor from '../pages/CodeEditor/Index';
import Agreement from '../pages/Agreement/Index';
import { needToReadPower } from '../pages/Agreement/function/helper';

function Routers(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    {
      path: '/',
      Component(): ReactElement {
        if (needToReadPower()) {
          return <Navigate to="/Agreement/Power?read=1" />;
        }

        return <Index />;
      }
    },
    { path: 'Login', element: <Login /> },
    { path: 'Options/*', element: <Options /> },
    { path: 'CodeEditor', element: <CodeEditor /> },
    { path: 'Agreement/*', element: <Agreement /> }
  ]);

  return routes;
}

export default Routers;