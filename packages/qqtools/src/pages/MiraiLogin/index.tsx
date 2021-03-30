import type { ReactElement } from 'react';
import style from './index.sass';
import Header from './Header/Header';

/* 启动mirai */
function Index(props: {}): ReactElement {
  return (
    <div className={ style.content }>
      <Header />
    </div>
  );
}

export default Index;