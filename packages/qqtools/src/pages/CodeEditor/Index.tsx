import { useEffect, type ReactElement } from 'react';
import style from './index.sass';
import Editor from './Editor/Editor';

/* 文本编辑器 */
function Index(props: {}): ReactElement {
  useEffect(function(): () => void {
    document.getElementById('app')!.classList.add(style.app);

    return function(): void {
      document.getElementById('app')!.classList.remove(style.app);
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <Editor />
    </div>
  );
}

export default Index;