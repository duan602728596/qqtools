import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Index from '../pages/Index/index';
import Login from '../pages/Login/index';
import Options from '../pages/Options/index';
import MiraiLogin from '../pages/MiraiLogin/index';

function Routers(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: '//*', element: <Index /> },
    { path: '/Login', element: <Login /> },
    { path: '/Options/*', element: <Options /> },
    { path: '/MiraiLogin/*', element: <MiraiLogin /> }
  ]);

  return routes;
}

export default Routers;