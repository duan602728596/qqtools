import * as React from 'react';
import { useMemo, FunctionComponent, ReactElement } from 'react';
import type { ReducersMapObject } from 'redux';

interface ModuleProps {
  injectReducers: Function;
}

/**
 * 异步注入reducer的修饰器
 * @param { ReducersMapObject } models
 */
function loadModels(models: ReducersMapObject): Function {
  let injectModels: boolean = true; // models是否需要注入

  /**
   * @param { FunctionComponent } Module: 需要修饰的模块
   */
  return function(Module: FunctionComponent): FunctionComponent<ModuleProps> {
    return function(props: ModuleProps): ReactElement {
      useMemo(function(): void {
        if (injectModels) {
          props.injectReducers?.(models);
          injectModels = false;
        }
      }, []);

      return <Module />;
    };
  };
}

export default loadModels;