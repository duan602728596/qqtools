import type { ReactElement } from 'react';
import { useRoutes } from 'react-router';
import Options from './Options/index';
import EditV2 from './EditV2/index';

/* options routers */
function Index(props: {}): ReactElement | null {
  const routers: ReactElement | null = useRoutes([
    { path: '/', element: <Options /> },
    { path: 'EditV2', element: <EditV2 /> },
    { path: 'EditV2/:id', element: <EditV2 /> }
  ]);

  return routers;
}

export default Index;