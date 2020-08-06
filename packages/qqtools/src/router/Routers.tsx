import * as React from 'react';
import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Index from '../pages/Index/index';
import Options from '../pages/Options/index';

function Routers(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: '//*', element: <Index /> },
    { path: '/Options/*', element: <Options /> }
  ]);

  return routes;
}

export default Routers;