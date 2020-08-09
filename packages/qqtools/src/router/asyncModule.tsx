import * as React from 'react';
import { lazy, Suspense, LazyExoticComponent, ReactElement } from 'react';
import { injectReducers } from '../store/store';

type Loader<T = any> = () => Promise<{ default: T }>;

/**
 * 异步加载、注入模块和reducer
 * @param { Function } loader: 需要异步注入的模块
 */
function asyncModule(loader: Loader): () => ReactElement {
  const Module: LazyExoticComponent<any> = lazy(loader);

  return (): ReactElement => (
    <Suspense fallback={ null }>
      <Module injectReducers={ injectReducers } />
    </Suspense>
  );
}

export default asyncModule;