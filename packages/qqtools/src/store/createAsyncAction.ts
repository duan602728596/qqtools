import type { Dispatch, Action, ActionCreator } from 'redux';

type Func = Function | CallArgs;
type CallArgs = [any, Function]

/**
 * 创建异步的action
 * @param { Function } func: 异步的函数
 */
function createAsyncAction(func: Function): ActionCreator<any> {
  return function(...args: Array<any>): Function {
    return function(dispatch: Dispatch, getState: Function): any {
      // 封装常用的函数
      const _: { [key: string]: Function } = {
        // 执行函数
        call(fn: Func, ...args: Array<any>): any {
          const [context, runFn]: CallArgs = Array.isArray(fn) ? fn : [undefined, fn];

          return runFn.call(context, ...args);
        },

        // 执行函数
        apply(fn: Func, ...args: Array<any>): any {
          const [context, runFn]: CallArgs = Array.isArray(fn) ? fn : [undefined, fn];

          return runFn.apply(context, args);
        },

        // 执行action
        put(action: Action): any {
          return dispatch(action);
        },

        // 获取值
        select(): any {
          return getState();
        },

        // 延迟执行
        delay(time: number, value: any): any {
          return new Promise((resolve: Function, reject: Function): void => {
            setTimeout((): void => {
              resolve(value);
            }, time);
          });
        }
      };

      return func.call(undefined, _, ...args);
    };
  };
}

export default createAsyncAction;